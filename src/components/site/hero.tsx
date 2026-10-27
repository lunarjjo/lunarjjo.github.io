"use client";

/* Hero portofolio: panorama prosedural dari tekstur block asli (siang/malam),
   partikel ambient, logo + splash ala title screen, CTA, avatar Steve (skin asli).
   Teks dari kamus aktif; splash acak per bahasa. */

import { useEffect, useRef, useState } from "react";
import { generatePanorama } from "@/lib/panorama";
import { useSite } from "@/lib/store";
import { useI18n } from "@/lib/i18n-context";
import { MCButton } from "@/components/mc";
import { AGENT } from "@/lib/data";

/* ---------------- Panorama layers (tekstur asli -> canvas) ---------------- */
function PanoramaView({ time }: { time: "day" | "night" }) {
  const [pan, setPan] = useState<{ day: string; night: string } | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    window.clearTimeout(genRef.current);
    genRef.current = window.setTimeout(() => {
      generatePanorama(20261024)
        .then(setPan)
        .catch(() => {});
    }, 60);
    return () => window.clearTimeout(genRef.current);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* layer siang */}
      <div
        className="pan-marquee"
        style={{
          ["--pan-dur" as string]: "180s",
          opacity: time === "day" ? 1 : 0,
          transition: "opacity 1.6s",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100%",
              backgroundImage: pan ? `url(${pan.day})` : "none",
              backgroundColor: pan ? "transparent" : "#7ba4ff",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
              filter: "blur(1.5px) saturate(1.1)",
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
      {/* layer malam */}
      <div
        className="pan-marquee absolute inset-0"
        style={{
          ["--pan-dur" as string]: "180s",
          opacity: time === "night" ? 1 : 0,
          transition: "opacity 1.6s",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100%",
              backgroundImage: pan ? `url(${pan.night})` : "none",
              backgroundColor: pan ? "transparent" : "#0a0e24",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
              filter: "blur(1.5px)",
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
      {/* gradasi agar konten terbaca */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.55))]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  );
}

/* ---------------- Partikel ambient (ala firefly menu) ---------------- */
function ParticlesCanvas({ density }: { density: "all" | "minimal" | "off" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (density === "off") return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const N = density === "all" ? 60 : 16;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.05 + Math.random() * 0.22),
      s: Math.random() > 0.85 ? 3 : 2,
      a: 0.25 + Math.random() * 0.5,
      hue: Math.random() > 0.6 ? "180,230,255" : "220,255,190",
    }));
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = canvas.height + 4;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
        ctx.fillStyle = `rgba(${p.hue},${p.a})`;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

/* ---------------- Wajah Steve (crop skin asli 64x64, muka 8x8) ---------------- */
export function SteveFace({ size = 88 }: { size?: number }) {
  const { t } = useI18n();
  const scale = size / 8;
  return (
    <div
      className="mc-slot pixelated shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/mc/entity/steve.png)",
        backgroundSize: `${64 * scale}px ${64 * scale}px`,
        backgroundPosition: `-${8 * scale}px -${8 * scale}px`,
        imageRendering: "pixelated",
      }}
      role="img"
      aria-label={t.ui.hero.steveAlt}
    />
  );
}

/* ---------------- Hero ---------------- */
export function Hero() {
  const { state, setOptions, advance } = useSite();
  const { t } = useI18n();
  // splash acak — lazy init; SSR/client bisa beda, diredam suppressHydrationWarning
  const [splash] = useState(() => t.splashes[Math.floor(Math.random() * t.splashes.length)]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="beranda"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16"
    >
      <PanoramaView time={state.options.time} />
      <ParticlesCanvas density={state.options.particles} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center">
        <SteveFace size={88} />

        <div className="relative mt-6">
          <h1 className="mc-logo mc-font text-[52px] leading-none sm:text-[72px] lg:text-[84px]">
            LUNARJJO
          </h1>
          {splash && (
            <div
              suppressHydrationWarning
              className="mc-splash mc-font absolute -right-2 top-0 w-[150px] text-[13px] sm:-right-10 sm:w-[190px] sm:text-[15px]"
              aria-hidden
            >
              {splash}
            </div>
          )}
        </div>

        <p className="mc-font mc-sh-soft mt-5 text-[15px] text-[#e4e4e4] sm:text-[18px]">
          Autonomous Agent — Lunar
        </p>
        <p className="mc-font mc-sh-soft mt-1 text-[12px] text-[#ffff55] sm:text-[13px]">
          {t.ui.hero.tagline}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <MCButton size="lg" width={230} onClick={() => scrollTo("proyek")}>
            {t.ui.hero.viewProjects}
          </MCButton>
          <MCButton
            size="lg"
            width={210}
            onClick={() => window.open(AGENT.github, "_blank", "noopener")}
          >
            {t.ui.hero.github}
          </MCButton>
          <MCButton
            size="lg"
            width={190}
            onClick={() => {
              setOptions({ musicOn: true });
              advance("sound_of_music");
            }}
          >
            {state.options.musicOn ? t.ui.hero.musicPlaying : t.ui.hero.musicPlay}
          </MCButton>
        </div>

        <p className="mc-font mc-sh-soft mt-8 max-w-xl text-[11px] leading-[1.8] text-[#bdbdbd]">
          {t.ui.hero.assetsNote}
        </p>
      </div>

      {/* indikator scroll */}
      <button
        type="button"
        aria-label={t.ui.hero.scrollAria}
        onClick={() => scrollTo("statistik")}
        className="mc-float mc-focus absolute inset-x-0 bottom-10 z-10 mx-auto flex w-fit flex-col items-center gap-1"
      >
        <span className="mc-font text-[10px] text-[#d8d8d8]">{t.ui.hero.scroll}</span>
        <span
          className="block h-[10px] w-[10px] border-b-[4px] border-r-[4px] border-[#d8d8d8]"
          style={{ transform: "rotate(45deg)" }}
        />
      </button>

      {/* label sudut ala menu Minecraft */}
      <div className="mc-font mc-sh-soft absolute bottom-3 left-3 z-10 text-[10px] text-[#bdbdbd]">
        {t.ui.hero.corner1}
      </div>
      <div className="mc-font mc-sh-soft absolute bottom-3 right-3 z-10 text-[10px] text-[#bdbdbd]">
        {t.ui.hero.corner2}
      </div>
    </section>
  );
}
