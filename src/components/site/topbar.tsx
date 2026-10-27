"use client";

/* TopBar portofolio: navbar sticky + progress bar baca (tekstur XP asli)
   + toggle musik/siang-malam/partikel + language switcher + menu mobile.
   Semua label dari kamus aktif (useI18n). */

import { useEffect, useRef, useState } from "react";
import { NAV_SECTIONS } from "@/lib/data";
import { useSite } from "@/lib/store";
import { useI18n } from "@/lib/i18n-context";
import { fill } from "@/i18n";
import { ItemIcon, MCTooltip } from "@/components/mc";
import { LanguageToggle } from "@/components/site/lang-switcher";

function IconToggle({
  icon,
  label,
  lines,
  onClick,
  active,
}: {
  icon: string;
  label: string;
  lines: { text: string; color?: string }[];
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <MCTooltip title={label} lines={lines}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className="mc-slot mc-focus flex h-9 w-9 items-center justify-center"
      >
        <ItemIcon
          src={icon}
          size={32}
          alt=""
          className={active ? "drop-shadow-[0_0_4px_rgba(85,255,85,0.8)]" : ""}
        />
      </button>
    </MCTooltip>
  );
}

export function TopBar({ active }: { active: string }) {
  const { state, setOptions } = useSite();
  const { t } = useI18n();
  const [pct, setPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const ticking = useRef(false);

  // progress baca (dibatasi rAF)
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cycleParticles = () => {
    const order = ["all", "minimal", "off"] as const;
    const next = order[(order.indexOf(state.options.particles) + 1) % order.length];
    setOptions({ particles: next });
  };

  const particleLabel =
    state.options.particles === "all"
      ? t.ui.topbar.particlesAll
      : state.options.particles === "minimal"
        ? t.ui.topbar.particlesMinimal
        : t.ui.topbar.particlesOff;

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="border-b-2 border-[#0a0a0a] bg-[rgba(12,12,14,0.9)] backdrop-blur-[3px] shadow-[0_3px_10px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
          {/* logo */}
          <a href="#beranda" className="mc-focus flex min-w-0 items-center gap-2" aria-label={t.ui.backToTop}>
            <ItemIcon src="/mc/items/compass.png" size={32} alt="" className="shrink-0" />
            <span className="mc-font mc-sh hidden text-[17px] tracking-wide text-white sm:inline">
              LUNARJJO
            </span>
            <span className="mc-font hidden text-[10px] text-[#7f7f7f] md:inline">v3</span>
          </a>

          {/* nav desktop */}
          <nav aria-label={t.ui.navLabel} className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`mc-font mc-focus flex items-center gap-1.5 border-2 px-2.5 py-1.5 text-[13px] transition-colors ${
                    isActive
                      ? "border-[#ffffff33] bg-[#ffffff18] text-white"
                      : "border-transparent text-[#c9c9c9] hover:border-[#ffffff22] hover:bg-[#ffffff0d] hover:text-white"
                  }`}
                >
                  <ItemIcon src={s.icon} size={16} alt="" />
                  {t.ui.nav[s.key]}
                </a>
              );
            })}
          </nav>

          {/* kontrol kanan */}
          <div className="flex items-center gap-2">
            <IconToggle
              icon="/mc/blocks/note_block.png"
              label={state.options.musicOn ? t.ui.topbar.musicOn : t.ui.topbar.musicOff}
              lines={[
                { text: t.ui.topbar.musicTip1, color: "#a8a8a8" },
                { text: t.ui.topbar.musicTip2, color: "#555555" },
              ]}
              onClick={() => setOptions({ musicOn: !state.options.musicOn })}
              active={state.options.musicOn}
            />
            <div className="hidden sm:block">
              <IconToggle
                icon={state.options.time === "day" ? "/mc/items/clock.png" : "/mc/items/ender_pearl.png"}
                label={state.options.time === "day" ? t.ui.topbar.timeDay : t.ui.topbar.timeNight}
                lines={[{ text: t.ui.topbar.timeTip, color: "#a8a8a8" }]}
                onClick={() => setOptions({ time: state.options.time === "day" ? "night" : "day" })}
              />
            </div>
            <div className="hidden sm:block">
              <IconToggle
                icon="/mc/items/experience_bottle.png"
                label={fill(t.ui.topbar.particles, { mode: particleLabel })}
                lines={[{ text: t.ui.topbar.particlesTip, color: "#a8a8a8" }]}
                onClick={cycleParticles}
                active={state.options.particles !== "off"}
              />
            </div>

            {/* language switcher */}
            <LanguageToggle />

            {/* burger mobile */}
            <button
              type="button"
              aria-label={menuOpen ? t.ui.topbar.closeMenu : t.ui.topbar.openMenu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="mc-slot mc-focus flex h-9 w-9 flex-col items-center justify-center gap-[3px] lg:hidden"
            >
              <span className="block h-[3px] w-[18px] bg-[#d8d8d8]" />
              <span className="block h-[3px] w-[18px] bg-[#d8d8d8]" />
              <span className="block h-[3px] w-[18px] bg-[#d8d8d8]" />
            </button>
          </div>
        </div>

        {/* progress baca — tekstur XP bar asli, 9-slice + clip-path */}
        <div className="relative h-[10px] w-full" aria-hidden>
          <div className="mc-xp-bg absolute inset-0" />
          <div
            className="mc-xp-fg absolute inset-0 transition-[clip-path] duration-150"
            style={{ clipPath: `inset(0 ${Math.round(100 - pct)}% 0 0)` }}
          />
        </div>
      </div>

      {/* menu mobile */}
      {menuOpen && (
        <nav
          aria-label={t.ui.navLabel}
          className="mc-mobile-menu absolute inset-x-0 top-full border-b-2 border-[#0a0a0a] bg-[rgba(10,10,12,0.97)] backdrop-blur-[3px] lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenuOpen(false)}
                className={`mc-font mc-focus flex items-center gap-3 border-2 border-transparent px-3 py-2.5 text-[15px] ${
                  active === s.id ? "border-[#ffffff33] bg-[#ffffff18] text-white" : "text-[#c9c9c9]"
                }`}
              >
                <ItemIcon src={s.icon} size={32} alt="" />
                {t.ui.nav[s.key]}
              </a>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t-2 border-[#ffffff14] px-3 pt-3">
              <span className="mc-font text-[11px] text-[#7f7f7f]">{t.ui.topbar.mobileTime}</span>
              <button
                type="button"
                onClick={() => setOptions({ time: state.options.time === "day" ? "night" : "day" })}
                className="mc-font mc-focus border-2 border-[#ffffff22] bg-[#ffffff0d] px-2 py-1 text-[12px] text-white"
              >
                {state.options.time === "day" ? t.ui.topbar.day : t.ui.topbar.night}
              </button>
              <span className="mc-font text-[11px] text-[#7f7f7f]">{t.ui.topbar.mobileParticles}</span>
              <button
                type="button"
                onClick={cycleParticles}
                className="mc-font mc-focus border-2 border-[#ffffff22] bg-[#ffffff0d] px-2 py-1 text-[12px] text-white"
              >
                {particleLabel}
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
