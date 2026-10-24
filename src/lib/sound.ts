/* Sound engine — real Minecraft .ogg assets (SHA-1 verified from Mojang servers) */

export type SfxName =
  | "click"
  | "levelup"
  | "orb"
  | "pop"
  | "door_open"
  | "door_close"
  | "pling"
  | "bell"
  | "harp"
  | "toast";

const SFX_PATH: Record<SfxName, string> = {
  click: "/mc/click.ogg",
  levelup: "/mc/levelup.ogg",
  orb: "/mc/orb.ogg",
  pop: "/mc/pop.ogg",
  door_open: "/mc/door_open.ogg",
  door_close: "/mc/door_close.ogg",
  pling: "/mc/pling.ogg",
  bell: "/mc/bell.ogg",
  harp: "/mc/harp.ogg",
  toast: "/mc/toast.ogg",
};

class McSoundEngine {
  private sfxVolume = 1;
  private musicVolume = 0.4;
  private sfxReady = false;
  private bgm: HTMLAudioElement | null = null;
  private bgmCurrent: string | null = null;
  private bgmFading = false;
  private musicStarted = false;
  private onMusicStart: (() => void) | null = null;
  private unlocked = false;

  ensureUnlocked() {
    if (this.unlocked) return;
    this.unlocked = true;
    // preload all sfx into decoded cache on first user gesture
    (Object.keys(SFX_PATH) as SfxName[]).forEach((n) => {
      const a = new Audio(SFX_PATH[n]);
      a.preload = "auto";
      a.load();
    });
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.bgm) {
      this.bgm.volume = v;
      if (v <= 0) {
        this.bgm.pause();
      } else if (this.musicStarted && !this.bgmFading) {
        this.bgm.play().catch(() => {});
      }
    }
  }

  get musicOn() {
    return this.musicVolume > 0;
  }

  /** Play a short SFX with overlap support. */
  play(name: SfxName, opts?: { volume?: number }) {
    if (this.sfxVolume <= 0 || typeof window === "undefined") return;
    try {
      const a = new Audio(SFX_PATH[name]);
      a.volume = Math.min(1, this.sfxVolume * (opts?.volume ?? 1));
      a.play().catch(() => {});
    } catch {
      /* audio not available */
    }
  }

  /** Switch looping BGM track with a short crossfade. */
  playBgm(track: string) {
    if (typeof window === "undefined") return;
    if (this.bgmCurrent === track && this.bgm) return;
    const startNew = () => {
      const next = new Audio(`/mc/${track}`);
      next.loop = true;
      next.volume = this.musicVolume;
      this.bgm = next;
      this.bgmCurrent = track;
      if (this.musicVolume > 0) {
        next.play().catch(() => {});
        if (!this.musicStarted) {
          this.musicStarted = true;
          this.onMusicStart?.();
        }
      }
    };
    if (this.bgm) {
      const old = this.bgm;
      this.bgmFading = true;
      const fade = setInterval(() => {
        old.volume = Math.max(0, old.volume - 0.08);
        if (old.volume <= 0.01) {
          clearInterval(fade);
          old.pause();
          this.bgmFading = false;
        }
      }, 60);
      setTimeout(startNew, 500);
    } else {
      startNew();
    }
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
      this.bgmCurrent = null;
    }
  }

  notifyMusicStart(cb: () => void) {
    this.onMusicStart = cb;
    if (this.musicStarted) cb();
  }
}

// singleton (client only)
export const sound = typeof window !== "undefined" ? new McSoundEngine() : (null as unknown as McSoundEngine);
