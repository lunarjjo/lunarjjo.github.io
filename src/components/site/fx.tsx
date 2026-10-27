"use client";

/* FX: intro veil (loading merah ala Mojang, sekali per pengunjung),
   advancement toast (tekstur toasts.png asli; teks advancement
   di-resolve dari kamus aktif saat render — toast hanya menyimpan ID),
   click-burst partikel (crop tekstur block asli — seperti partikel
   block pecah di game). */

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/store";
import { useI18n } from "@/lib/i18n-context";
import { ItemIcon, PixelImg } from "@/components/mc";

/* ---------------- Intro veil ---------------- */
const INTRO_KEY = "lunarjjo-intro-v2";

export function IntroVeil({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [pct, setPct] = useState(0);
  // tip acak — lazy init; SSR/client bisa beda, diredam suppressHydrationWarning
  const [tip] = useState(() => t.loadingTips[Math.floor(Math.random() * t.loadingTips.length)]);
  // init lazy dari localStorage: saat pengunjung berganti bahasa
  // (navigasi SPA), veil TIDAK berkedip sama sekali — langsung hidden.
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* private mode */
    }
    setShow(false);
    onDone();
  };

  useEffect(() => {
    if (!show) {
      // defer agar tidak setState sinkron di body effect (aturan React Compiler)
      const t = setTimeout(finish, 0);
      return () => clearTimeout(t);
    }
    const start = performance.now();
    let raf = 0;
    const loop = (tm: number) => {
      const p = Math.min(100, ((tm - start) / 1300) * 100);
      setPct(Math.floor(p));
      if (p < 100) raf = requestAnimationFrame(loop);
      else finish();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center"
      style={{ background: "#ef323d" }}
      onClick={finish}
      role="button"
      aria-label={t.ui.intro.skip}
    >
      <div className="mc-font mc-sh text-[42px] text-white sm:text-[64px]">LUNAR</div>
      <div className="mc-font mt-2 text-[12px] text-[#ffd6d9]">{t.ui.intro.loading}</div>
      <div className="mt-8 w-[min(420px,80vw)]">
        <div className="h-[10px] w-full border-2 border-white/70 bg-[#ffffff26] p-[2px]">
          <div className="h-full bg-white transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
        <div className="mc-font mt-2 text-right text-[12px] text-[#ffe9ea]">{pct}%</div>
      </div>
      {tip && (
        <div suppressHydrationWarning className="mc-font mt-6 max-w-[80vw] text-center text-[11px] text-[#ffe9ea]">
          {tip}
        </div>
      )}
    </div>
  );
}

/* ---------------- Advancement toast ---------------- */
export function Toasts() {
  const { state, dismissToast } = useSite();
  const { t } = useI18n();
  const toast = state.toasts[0];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dismissToast(toast.id), 4200);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const title =
    toast.kind === "advancement" && toast.advId
      ? t.advancements.items[toast.advId as keyof typeof t.advancements.items]?.title ?? "???"
      : (toast.title ?? "");
  const desc =
    toast.kind === "advancement" && toast.advId
      ? t.advancements.items[toast.advId as keyof typeof t.advancements.items]?.desc ?? ""
      : (toast.desc ?? "");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mc-toast fixed right-2 top-20 z-[60] sm:right-4 sm:top-[84px]"
      onClick={() => dismissToast(toast.id)}
    >
      <div className="relative cursor-pointer" style={{ width: 320, height: 64 }}>
        <PixelImg src="/mc/gui/toasts.png" alt="" width={320} height={64} className="h-full w-full" />
        <div className="absolute inset-0 flex items-center gap-3 px-4">
          <div className="adv-frame done flex h-10 w-10 shrink-0 items-center justify-center">
            <ItemIcon src={toast.icon} size={32} alt="" />
          </div>
          <div className="mc-font">
            <div className="text-[13px] text-[#ffff55] mc-sh-soft">
              {toast.kind === "advancement" ? t.ui.toast.advancementMade : t.ui.toast.info}
            </div>
            <div className="text-[15px] text-white mc-sh-soft">{title}</div>
            {desc && <div className="text-[10px] text-[#a8a8a8] mc-sh-soft">{desc}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Click burst (partikel block pecah) ---------------- */
const BURST_TEXTURES = [
  "/mc/blocks/dirt.png",
  "/mc/blocks/stone.png",
  "/mc/blocks/sand.png",
  "/mc/blocks/redstone_block.png",
  "/mc/blocks/oak_leaves.png",
];

type Burst = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  img: HTMLImageElement;
  sx: number; // crop offset x (0..12)
  sy: number;
};

export function ClickBurst() {
  const ref = useRef<HTMLCanvasElement>(null);
  const densityRef = useRef<"all" | "minimal" | "off">("all");
  const { state } = useSite();

  useEffect(() => {
    densityRef.current = state.options.particles;
  }, [state.options.particles]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgs = BURST_TEXTURES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const bursts: Burst[] = [];
    let raf = 0;
    let running = false;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.vy += 0.14; // gravitasi
        b.x += b.vx;
        b.y += b.vy;
        const age = 1 - (now - b.life) / b.maxLife;
        if (age <= 0 || b.y > canvas.height + 12) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, age * 1.6);
        ctx.drawImage(b.img, b.sx, b.sy, 4, 4, b.x, b.y, b.size, b.size);
      }
      ctx.globalAlpha = 1;
      if (bursts.length > 0) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    const spawn = (n: number, x: number, y: number) => {
      for (let i = 0; i < n; i++) {
        const img = imgs[Math.floor(Math.random() * imgs.length)];
        if (!img.complete || img.naturalWidth === 0) continue;
        bursts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3.4,
          vy: -1 - Math.random() * 2.6,
          life: performance.now(),
          maxLife: 480 + Math.random() * 360,
          size: 3 + Math.floor(Math.random() * 3),
          img,
          sx: Math.floor(Math.random() * 12),
          sy: Math.floor(Math.random() * 12),
        });
      }
      if (!running && bursts.length > 0) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (densityRef.current === "off") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const n = densityRef.current === "all" ? 9 : 4;
      spawn(n, e.clientX, e.clientY);
    };

    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[55] h-full w-full"
      aria-hidden
    />
  );
}
