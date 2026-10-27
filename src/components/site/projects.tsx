"use client";

/* Proyek: grid kartu portofolio + dialog detail (lore, fitur, stats, tech).
   Dialog mengganti BGM ke track milik proyek selama terbuka.
   Semua teks dari kamus aktif; struktur/fakta dari data.ts. */

import { useEffect } from "react";
import { PROJECTS, TONE_COLOR } from "@/lib/data";
import { useSite } from "@/lib/store";
import { useI18n } from "@/lib/i18n-context";
import { fill } from "@/i18n";
import { sound } from "@/lib/sound";
import { ItemIcon, MCButton, MCPanel, MCTooltip } from "@/components/mc";
import { SectionHeading } from "@/components/site/sections";

function StatusDot({ tone }: { tone: "green" | "yellow" | "red" }) {
  return (
    <span
      aria-hidden
      className="inline-block h-[8px] w-[8px] shrink-0"
      style={{ background: TONE_COLOR[tone], boxShadow: `0 0 6px ${TONE_COLOR[tone]}66` }}
    />
  );
}

/* ---------------- Kartu proyek ---------------- */
function ProjectCard({ id }: { id: string }) {
  const p = PROJECTS.find((x) => x.id === id)!;
  const { openProject } = useSite();
  const { t } = useI18n();
  const d = t.projects.items[p.id as keyof typeof t.projects.items];

  return (
    <MCTooltip
      title={p.name}
      lines={[
        { text: d.subtitle, color: "#a8a8a8" },
        { text: d.tip, color: "#555555" },
      ]}
    >
      <MCPanel className="world-row reveal flex h-full cursor-pointer flex-col gap-3 p-5 transition-colors">
        <button
          type="button"
          onClick={() => openProject(p.id)}
          aria-label={fill(t.projects.openDetail, { name: p.name })}
          className="mc-focus text-left"
        >
          <div className="flex items-start gap-3">
            <div className="adv-frame flex h-14 w-14 shrink-0 items-center justify-center">
              <ItemIcon src={p.icon} size={48} alt="" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mc-font mc-sh truncate text-[17px] text-white">{p.name}</h3>
              <div className="mc-font mt-0.5 text-[11px] text-[#ffaa00]">{p.version}</div>
              <p className="mc-font mt-1.5 text-[12px] leading-[1.6] text-[#a8a8a8]">{d.subtitle}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <StatusDot tone={p.statusTone} />
            <span className="mc-font text-[11px] leading-[1.5]" style={{ color: TONE_COLOR[p.statusTone] }}>
              {d.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {d.stats.slice(0, 2).map((s, i) => (
              <div key={i}>
                <span className="mc-font text-[13px] text-[#ffff55]">{s.value}</span>{" "}
                <span className="mc-font text-[10px] text-[#7f7f7f]">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tech.slice(0, 3).map((tech) => (
              <span
                key={tech.name}
                className="mc-font border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.35)] px-1.5 py-0.5 text-[10px] italic text-[#c58aff]"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </button>

        <div className="mt-auto flex items-center gap-2 border-t-2 border-[#ffffff14] pt-3">
          <MCButton size="sm" width={110} onClick={() => openProject(p.id)}>
            {t.projects.detail}
          </MCButton>
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mc-font mc-focus py-1 text-[12px] text-[#55ffff] hover:text-[#55ffff]"
            style={{ textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {t.projects.githubLink}
          </a>
        </div>
      </MCPanel>
    </MCTooltip>
  );
}

/* ---------------- Dialog detail ---------------- */
function ProjectDialog() {
  const { state, closeProject } = useSite();
  const { t } = useI18n();
  const p = state.openProjectId ? PROJECTS.find((x) => x.id === state.openProjectId) : null;
  const d = p ? t.projects.items[p.id as keyof typeof t.projects.items] : null;

  // Esc untuk menutup + kunci scroll body
  useEffect(() => {
    if (!p) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [p, closeProject]);

  // BGM track milik proyek selama dialog terbuka
  useEffect(() => {
    if (p) sound?.playBgm(p.bgm);
  }, [p]);

  if (!p || !d) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={fill(t.projects.dialogLabel, { name: p.name })}
    >
      <div className="mc-dialog-backdrop absolute inset-0" onClick={closeProject} aria-hidden />
      <MCPanel className="mc-dialog-in mc-scroll relative z-10 max-h-[88vh] w-full max-w-3xl overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-[#00000088] bg-[rgba(16,16,16,0.97)] p-4 sm:p-5">
          <div className="adv-frame flex h-14 w-14 shrink-0 items-center justify-center">
            <ItemIcon src={p.icon} size={48} alt="" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mc-font mc-sh truncate text-[19px] text-white">{p.name}</h3>
            <div className="mc-font mt-0.5 text-[11px] text-[#ffaa00]">
              {p.version} — {d.subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={closeProject}
            aria-label={t.projects.closeDetail}
            className="mc-slot mc-focus mc-font flex h-9 w-9 shrink-0 items-center justify-center text-[14px] text-[#d8d8d8]"
          >
            X
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* info dunia */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.35)] p-3 sm:grid-cols-3">
            {[
              [t.projects.fields.seed, p.seed],
              [t.projects.fields.gamemode, d.gamemode],
              [t.projects.fields.lastPlayed, d.lastPlayed],
              [t.projects.fields.size, d.size],
              [t.projects.fields.status, d.status],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <div className="mc-font text-[9px] uppercase text-[#7f7f7f]">{k}</div>
                <div className="mc-font mt-0.5 truncate text-[11px] text-[#e4e4e4]">{v}</div>
              </div>
            ))}
          </div>

          {/* lore */}
          <div className="mt-5 space-y-3.5">
            {d.lore.map((l, i) => (
              <p key={i} className="mc-font text-[13px] leading-[1.85] text-[#d8d8d8] sm:text-[14px]">
                {l}
              </p>
            ))}
          </div>

          {/* fitur */}
          <h4 className="mc-font mc-sh mt-7 border-b-2 border-[#ffffff14] pb-2 text-[15px] text-white">
            {t.projects.featuresHeading}
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {d.features.map((f, i) => (
              <div key={i} className="flex gap-3 border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.3)] p-3">
                <ItemIcon src={p.featureIcons[i] ?? p.icon} size={32} alt="" className="mt-0.5 shrink-0" />
                <div>
                  <div className="mc-font text-[13px] text-white">{f.title}</div>
                  <p className="mc-font mt-1 text-[11px] leading-[1.7] text-[#a8a8a8]">{f.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* stats */}
          <h4 className="mc-font mc-sh mt-7 border-b-2 border-[#ffffff14] pb-2 text-[15px] text-white">
            {t.projects.statsHeading}
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {d.stats.map((s, i) => (
              <div key={i} className="mc-slot p-3 text-center">
                <div className="mc-font text-[15px] text-[#ffff55]">{s.value}</div>
                <div className="mc-font mt-1 text-[10px] leading-[1.5] text-[#a8a8a8]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* enchantment tech */}
          <h4 className="mc-font mc-sh mt-7 border-b-2 border-[#ffffff14] pb-2 text-[15px] text-white">
            {t.projects.techHeading}
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tech.map((tech) => (
              <span
                key={tech.name}
                className="mc-font border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.35)] px-2.5 py-1 text-[12px]"
              >
                <span className="text-white">{tech.name}</span>{" "}
                <span className="italic text-[#c58aff]">{t.enchants[tech.level as keyof typeof t.enchants]}</span>
              </span>
            ))}
          </div>

          {/* aksi */}
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t-2 border-[#ffffff14] pt-4">
            <MCButton width={230} onClick={() => window.open(p.link, "_blank", "noopener")}>
              {t.projects.openRepo}
            </MCButton>
            <MCButton width={130} onClick={closeProject}>
              {t.projects.close}
            </MCButton>
          </div>

          <p className="mc-font mt-4 text-[11px] italic leading-[1.7] text-[#7f7f7f]">{d.tip}</p>
        </div>
      </MCPanel>
    </div>
  );
}

/* ---------------- Seksi Proyek ---------------- */
export function Projects() {
  const { t } = useI18n();
  return (
    <section id="proyek" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/items/compass.png"
        title={t.projects.heading}
        subtitle={t.projects.subtitle}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} id={p.id} />
        ))}
      </div>
      <ProjectDialog />
    </section>
  );
}
