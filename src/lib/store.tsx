"use client";

/* Site store — layout portofolio web + tema Minecraft.
   State: options (music/sfx/particles/day-night), advancement discovery,
   toast queue, dialog proyek terbuka. Persist localStorage. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { ADVANCEMENTS } from "./data";
import { sound } from "./sound";

export type Options = {
  musicOn: boolean;
  sfx: number; // 0..1
  particles: "all" | "minimal" | "off";
  time: "day" | "night";
};

export type ToastItem = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  kind: "advancement" | "info";
};

type State = {
  options: Options;
  unlocked: string[];
  visitedProjects: string[];
  toasts: ToastItem[];
  openProjectId: string | null;
  loaded: boolean; // localStorage hydrated
};

type Action =
  | {
      type: "HYDRATE";
      options?: Partial<Options>;
      unlocked?: string[];
      visitedProjects?: string[];
    }
  | { type: "ADVANCE"; id: string }
  | { type: "VISIT_PROJECT"; id: string }
  | { type: "OPEN_PROJECT"; id: string | null }
  | { type: "DISMISS_TOAST"; id: number }
  | { type: "PUSH_TOAST"; toast: ToastItem }
  | { type: "OPTIONS"; patch: Partial<Options> };

const LS_KEY = "lunarjjo-portfolio-v2";

const DEFAULT_OPTIONS: Options = {
  musicOn: false,
  sfx: 0.9,
  particles: "all",
  time: "day",
};

const initial: State = {
  options: DEFAULT_OPTIONS,
  unlocked: [],
  visitedProjects: [],
  toasts: [],
  openProjectId: null,
  loaded: false,
};

let toastId = 1;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "HYDRATE":
      return {
        ...s,
        loaded: true,
        options: { ...s.options, ...(a.options ?? {}) },
        unlocked: a.unlocked ?? s.unlocked,
        visitedProjects: a.visitedProjects ?? s.visitedProjects,
      };
    case "ADVANCE": {
      if (s.unlocked.includes(a.id)) return s;
      const adv = ADVANCEMENTS.find((x) => x.id === a.id);
      if (!adv) return s;
      const toast: ToastItem = {
        id: toastId++,
        icon: adv.icon,
        title: adv.title,
        desc: adv.desc,
        kind: "advancement",
      };
      return { ...s, unlocked: [...s.unlocked, a.id], toasts: [...s.toasts, toast] };
    }
    case "VISIT_PROJECT":
      if (s.visitedProjects.includes(a.id)) return s;
      return { ...s, visitedProjects: [...s.visitedProjects, a.id] };
    case "OPEN_PROJECT":
      return { ...s, openProjectId: a.id };
    case "PUSH_TOAST":
      return { ...s, toasts: [...s.toasts, a.toast] };
    case "DISMISS_TOAST":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "OPTIONS":
      return { ...s, options: { ...s.options, ...a.patch } };
    default:
      return s;
  }
}

type Ctx = {
  state: State;
  advance: (id: string) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  setOptions: (patch: Partial<Options>) => void;
  dismissToast: (id: number) => void;
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  level: number;
  xpFraction: number;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const saveRef = useRef(0);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const j = JSON.parse(raw) as Partial<{
          options: Partial<Options>;
          unlocked: string[];
          visitedProjects: string[];
        }>;
        dispatch({
          type: "HYDRATE",
          options: j.options,
          unlocked: j.unlocked,
          visitedProjects: j.visitedProjects,
        });
      } else {
        dispatch({ type: "HYDRATE" });
      }
    } catch {
      dispatch({ type: "HYDRATE" });
    }
  }, []);

  // persist (debounced)
  useEffect(() => {
    if (!state.loaded) return;
    window.clearTimeout(saveRef.current);
    saveRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({
            options: state.options,
            unlocked: state.unlocked,
            visitedProjects: state.visitedProjects,
          })
        );
      } catch {
        /* storage full/blocked */
      }
    }, 250);
  }, [state.loaded, state.options, state.unlocked, state.visitedProjects]);

  // options → sound engine
  useEffect(() => {
    if (!state.loaded) return;
    sound?.setSfxVolume(state.options.sfx);
    sound?.setMusicVolume(state.options.musicOn ? 0.35 : 0);
  }, [state.loaded, state.options.musicOn, state.options.sfx]);

  // first gesture unlock (autoplay policy)
  useEffect(() => {
    const unlock = () => sound?.ensureUnlocked();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // toast auto-dismiss + sound
  useEffect(() => {
    if (!state.toasts.length) return;
    const t = state.toasts[0];
    sound?.play(t.kind === "advancement" ? "toast" : "pop");
    const timer = setTimeout(() => dispatch({ type: "DISMISS_TOAST", id: t.id }), 4200);
    return () => clearTimeout(timer);
  }, [state.toasts]);

  // auto-advance sound_of_music once bgm really started
  useEffect(() => {
    if (!state.loaded) return;
    if (!state.options.musicOn) return;
    sound?.notifyMusicStart(() => {
      dispatch({ type: "ADVANCE", id: "sound_of_music" });
    });
  }, [state.loaded, state.options.musicOn]);

  // Serious Dedication when everything else unlocked
  const allButFinal = ADVANCEMENTS.length - 1;
  useEffect(() => {
    if (state.unlocked.length >= allButFinal && !state.unlocked.includes("serious_dedication")) {
      dispatch({ type: "ADVANCE", id: "serious_dedication" });
    }
  }, [state.unlocked, allButFinal]);

  const advance = useCallback((id: string) => dispatch({ type: "ADVANCE", id }), []);

  const openProject = useCallback((id: string) => {
    dispatch({ type: "OPEN_PROJECT", id });
    dispatch({ type: "VISIT_PROJECT", id });
    sound?.play("door_open");
    dispatch({ type: "ADVANCE", id: "getting_wood" });
    if (id === "pondok") dispatch({ type: "ADVANCE", id: "diamonds" });
    if (id === "hadir") dispatch({ type: "ADVANCE", id: "upgrade" });
  }, []);

  // taking_inventory saat 7 proyek terkunjungi
  useEffect(() => {
    if (state.visitedProjects.length >= 7) {
      dispatch({ type: "ADVANCE", id: "taking_inventory" });
    }
  }, [state.visitedProjects]);

  const closeProject = useCallback(() => {
    dispatch({ type: "OPEN_PROJECT", id: null });
    sound?.play("door_close");
  }, []);

  const setOptions = useCallback(
    (patch: Partial<Options>) => dispatch({ type: "OPTIONS", patch }),
    []
  );
  const dismissToast = useCallback((id: number) => dispatch({ type: "DISMISS_TOAST", id }), []);
  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    dispatch({ type: "PUSH_TOAST", toast: { ...toast, id: toastId++ } });
  }, []);

  const level = state.unlocked.length;
  const xpFraction = state.unlocked.length / Math.max(1, ADVANCEMENTS.length);

  const value = useMemo<Ctx>(
    () => ({
      state,
      advance,
      openProject,
      closeProject,
      setOptions,
      dismissToast,
      pushToast,
      level,
      xpFraction,
    }),
    [state, advance, openProject, closeProject, setOptions, dismissToast, pushToast, level, xpFraction]
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite outside provider");
  return ctx;
}
