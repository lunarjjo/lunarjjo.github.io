"use client";

/* lunarjjo portfolio v2 — layout web portofolio, tema & aset Minecraft asli.
   Orkestrator: seksi scroll, BGM berganti per seksi, advancement on-scroll,
   SFX klik global, intro veil. */

import { useEffect, useState } from "react";
import { SECTION_BGM } from "@/lib/data";
import { SiteProvider, useSite } from "@/lib/store";
import { sound } from "@/lib/sound";
import { TopBar } from "@/components/site/topbar";
import { Hero } from "@/components/site/hero";
import { About, Skills, StatsStrip } from "@/components/site/sections";
import { Projects } from "@/components/site/projects";
import { Chronicle, LiveSystems } from "@/components/site/live";
import { Contact, Footer } from "@/components/site/contact";
import { ClickBurst, IntroVeil, Toasts } from "@/components/site/fx";

const SECTION_IDS = [
  "beranda",
  "statistik",
  "tentang",
  "keahlian",
  "proyek",
  "live",
  "kronolog",
  "kontak",
];

const SECTION_ADV: Record<string, string | undefined> = {
  tentang: "face_agent",
  keahlian: "enchanting",
  live: "staying_alive",
  kronolog: "adventuring_time",
  kontak: "the_end",
};

function App() {
  const { state, advance } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [active, setActive] = useState("beranda");

  // reveal-on-scroll untuk semua elemen .reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));

    // safety-net: elemen yang berada jauh di bawah viewport dipaksa tampil setelah 3.5s
    // (menjamin konten terlihat pada print / screenshot full-page / IO gagal)
    const fallback = setTimeout(() => {
      for (const el of els) {
        if (el.classList.contains("revealed")) continue;
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight * 1.5) el.classList.add("revealed");
      }
    }, 3500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  // seksi aktif (nav + BGM) + advancement on-scroll
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (x): x is HTMLElement => !!x
    );
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            const id = en.target.id;
            setActive((prev) => (prev === id ? prev : id));
            const adv = SECTION_ADV[id];
            if (adv) advance(adv);
          }
        }
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [advance]);

  // BGM mengikuti seksi aktif (dialog proyek punya track sendiri)
  useEffect(() => {
    if (!introDone) return;
    if (!state.options.musicOn) return;
    if (state.openProjectId) return;
    sound?.playBgm(SECTION_BGM[active] ?? "bgm_moog.ogg");
  }, [introDone, state.options.musicOn, state.openProjectId, active]);

  // SFX klik global untuk semua elemen interaktif
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (el?.closest("button, a")) sound?.play("click", { volume: 0.6 });
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101010] text-white">
      {/* vignette sinematik halus */}
      <div className="mc-vignette pointer-events-none fixed inset-0 z-30" aria-hidden />

      <TopBar active={active} />

      <main className="relative z-10 flex-1">
        <Hero />
        <StatsStrip />
        <About />
        <Skills />
        <Projects />
        <LiveSystems />
        <Chronicle />
        <Contact />
      </main>

      <Footer />

      <Toasts />
      <ClickBurst />
      <IntroVeil
        onDone={() => {
          setIntroDone(true);
          advance("stone_age");
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <SiteProvider>
      <App />
    </SiteProvider>
  );
}
