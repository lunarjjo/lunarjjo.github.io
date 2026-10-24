"use client";

/* Section portofolio: heading, stats band (slot inventori),
   Tentang (kartu pemain: hearts + XP bar), Keahlian (filter + XP level). */

import { useState } from "react";
import {
  ABOUT_FACTS,
  ABOUT_PARAGRAPHS,
  AGENT,
  ADVANCEMENTS,
  HEART_SYSTEMS,
  SKILL_CATEGORIES,
  SKILLS,
  STAT_CARDS,
} from "@/lib/data";
import { useSite } from "@/lib/store";
import { ItemIcon, MCPanel, MCTooltip, PixelImg } from "@/components/mc";
import { SteveFace } from "@/components/site/hero";

/* ---------------- Heading seksi ---------------- */
export function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 px-4">
      <div className="flex items-center gap-4">
        <div className="mc-sec-rule flex-1" />
        <ItemIcon src={icon} size={32} alt="" />
        <h2 className="mc-font mc-sh text-center text-[22px] text-white sm:text-[27px]">{title}</h2>
        <ItemIcon src={icon} size={32} alt="" className="scale-x-[-1]" />
        <div className="mc-sec-rule flex-1" />
      </div>
      {subtitle && (
        <p className="mc-font mc-sh-soft mt-3 text-center text-[12px] text-[#a8a8a8] sm:text-[13px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------------- XP bar mini (tekstur asli, 9-slice + cap utuh) ----------------
   xp_bg/fg = 182x5: 1px garis outline atas/bawah + 2px cap kiri/kanan.
   Slice mempertahankan cap & outline di skala 2x; tengah repeat horizontal
   sehingga garis-garis halus tidak melebar. Isi (fg) di-clip via clip-path. */
function XPBar({ pct, height = 10 }: { pct: number; height?: number }) {
  const hide = Math.round((1 - Math.min(1, Math.max(0, pct))) * 100);
  return (
    <div className="relative w-full" style={{ height }} aria-hidden>
      <div className="mc-xp-bg absolute inset-0" />
      <div
        className="mc-xp-fg absolute inset-0"
        style={{ clipPath: `inset(0 ${hide}% 0 0)` }}
      />
    </div>
  );
}

/* ---------------- Stats band ---------------- */
export function StatsStrip() {
  return (
    <section id="statistik" className="mc-dirt-band py-10">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_CARDS.map((s) => (
            <MCTooltip key={s.label} title={s.label} lines={[{ text: s.tip, color: "#a8a8a8" }]}>
              <div className="mc-slot reveal flex h-full w-full flex-col items-center gap-1.5 px-3 py-4">
                <ItemIcon src={s.icon} size={32} alt="" />
                <div className="mc-font mc-sh text-[22px] text-[#ffff55]">{s.value}</div>
                <div className="mc-font text-center text-[10px] leading-[1.5] text-[#bdbdbd]">
                  {s.label}
                </div>
              </div>
            </MCTooltip>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Tentang ---------------- */
const HALF_HEARTS = new Set(["pondok-core"]);

export function About() {
  const { level, xpFraction, state } = useSite();

  return (
    <section id="tentang" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/items/spyglass.png"
        title="Tentang Agen"
        subtitle="Siapa yang mengerjakan semua ini"
      />

      <div className="grid gap-6 lg:grid-cols-[330px,1fr]">
        {/* kartu pemain */}
        <MCPanel className="reveal p-5">
          <div className="flex flex-col items-center gap-4">
            <SteveFace size={104} />
            <div className="text-center">
              <div className="mc-font mc-sh text-[19px] text-white">lunarjjo</div>
              <div className="mc-font text-[12px] text-[#ffaa00]">{AGENT.displayName}</div>
              <div className="mc-font mt-1 text-[11px] text-[#a8a8a8]">{AGENT.role}</div>
            </div>

            {/* XP: progress advancement */}
            <div className="w-full">
              <div className="mb-1 flex items-end justify-between">
                <span className="mc-font text-[10px] text-[#a8a8a8]">advancement</span>
                <span
                  className="mc-font text-[14px]"
                  style={{ color: "#80ff20", textShadow: "1.5px 1.5px 0 #1e3b08" }}
                >
                  Lv.{level}
                </span>
              </div>
              <XPBar pct={xpFraction} />
              <div className="mc-font mt-1 text-right text-[10px] text-[#7f7f7f]">
                {state.unlocked.length}/{ADVANCEMENTS.length} terbuka
              </div>
            </div>

            {/* hearts: status sistem nyata */}
            <div className="w-full">
              <div className="mb-1.5 flex w-full flex-wrap justify-center gap-0">
                {HEART_SYSTEMS.map((sys) => {
                  const half = HALF_HEARTS.has(sys.id);
                  const src = half ? "/mc/gui/heart_half.png" : "/mc/gui/heart_full.png";
                  return (
                    <MCTooltip
                      key={sys.id}
                      title={sys.name}
                      lines={[{ text: sys.note, color: half ? "#ffff55" : "#55ff55" }]}
                    >
                      <span className="inline-block">
                        <PixelImg src={src} alt="" width={18} height={18} style={{ margin: "0 1px" }} />
                      </span>
                    </MCTooltip>
                  );
                })}
              </div>
              <div className="mc-font text-center text-[9px] leading-[1.6] text-[#8a8a8a]">
                hearts = status sistem nyata • setengah hati = masih ada DoD terbuka
              </div>
            </div>

            {/* fakta */}
            <div className="w-full space-y-1.5 border-t-2 border-[#ffffff14] pt-4">
              {ABOUT_FACTS.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-3">
                  <span className="mc-font shrink-0 text-[10px] text-[#7f7f7f]">{f.label}</span>
                  <span className="mc-font text-right text-[12px] text-[#e4e4e4]">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </MCPanel>

        {/* narasi */}
        <div className="reveal flex flex-col gap-5">
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <p key={i} className="mc-font text-[14px] leading-[1.9] text-[#d8d8d8] sm:text-[15px]">
              {p}
            </p>
          ))}

          {/* mandat pemilik — gaya chat Minecraft */}
          <div className="mc-reveal border-2 border-[#00000066] bg-[rgba(0,0,0,0.55)] p-4">
            <div className="mc-font text-[10px] text-[#555555]">[22 Okt 2026 — mandat pemilik]</div>
            <p className="mc-font mt-1.5 text-[13px] leading-[1.8]">
              <span className="text-white">&lt;kasyaira&gt;</span>{" "}
              <span className="text-[#ffff55]">{AGENT.mandate}</span>
            </p>
          </div>

          <div className="mc-font flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-[#ffffff14] pt-4 text-[11px] text-[#a8a8a8]">
            <span>
              identitas commit: <span className="text-[#55ffff]">lunarjjo-agent</span>
            </span>
            <span>
              zona: <span className="text-white">{AGENT.timezone}</span>
            </span>
            <span>
              motto: <span className="text-[#ffff55]">"{AGENT.motto}"</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Keahlian ---------------- */
const LEVEL_LABEL = ["", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"];

export function Skills() {
  const [cat, setCat] = useState<string>("Semua");
  const cats = ["Semua", ...SKILL_CATEGORIES];
  const list = cat === "Semua" ? SKILLS : SKILLS.filter((s) => s.category === cat);

  return (
    <section id="keahlian" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/items/enchanted_book.png"
        title="Keahlian"
        subtitle="Peralatan di inventaris — terasah lewat proyek nyata, bukan sertifikat"
      />

      {/* filter kategori */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 px-4">
        {cats.map((c) => {
          const isActive = cat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={isActive}
              className={`mc-focus relative px-4 py-1.5 text-[13px] ${
                isActive ? "" : "opacity-80 hover:opacity-100"
              }`}
              style={{
                background: "transparent",
                cursor: "pointer",
                borderStyle: "solid",
                borderImage: `url(/mc/gui/${
                  isActive ? "button_highlighted.png" : "button.png"
                }) 2 fill / 4px stretch`,
                imageRendering: "pixelated",
              }}
            >
              <span className="mc-font mc-sh relative z-10 text-white">{c}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <article key={s.id} className="mc-slot reveal flex h-full flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="adv-frame flex h-12 w-12 shrink-0 items-center justify-center">
                <ItemIcon src={s.icon} size={32} alt="" />
              </div>
              <div className="min-w-0">
                <h3 className="mc-font mc-sh text-[15px] leading-tight text-white">{s.name}</h3>
                <div className="mc-font mt-0.5 text-[10px] text-[#7f7f7f]">{s.category}</div>
              </div>
              <span
                className="mc-font ml-auto shrink-0 text-[13px]"
                style={{ color: "#80ff20", textShadow: "1.5px 1.5px 0 #1e3b08" }}
              >
                {LEVEL_LABEL[s.level]}
              </span>
            </div>

            <XPBar pct={s.level / 5} height={10} />

            <ul className="space-y-1.5">
              {s.lore.map((l, i) => (
                <li key={i} className="mc-font flex gap-2 text-[11px] leading-[1.65] text-[#a8a8a8]">
                  <span aria-hidden className="mt-[6px] block h-[5px] w-[5px] shrink-0 bg-[#555555]" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
