"use client";

/* Language switcher — panel bergaya GUI Minecraft.
   Navigasi antar halaman locale memakai router.push (SPA): musik tetap
   mengalir (SiteProvider di root layout), hash seksi dibawa serta agar
   pengunjung tetap berada di seksi yang sama. Pertama kali berganti
   bahasa -> advancement "polyglot". Pilihan disimpan di localStorage. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, localePath, type LocaleCode } from "@/i18n/config";
import { useI18n } from "@/lib/i18n-context";
import { useSite } from "@/lib/store";
import { sound } from "@/lib/sound";
import { ItemIcon } from "@/components/mc";

const LOCALE_KEY = "lunarjjo-locale";

/** Simpan & navigasi ke locale lain, membawa hash seksi aktif. */
export function switchLocale(
  router: ReturnType<typeof useRouter>,
  code: LocaleCode
) {
  try {
    localStorage.setItem(LOCALE_KEY, code);
  } catch {
    /* private mode */
  }
  const hash = window.location.hash;
  const path = localePath(code);
  router.push(hash ? `${path}${hash}` : path);
}

export function LanguageToggle() {
  const { locale, t } = useI18n();
  const { advance } = useSite();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const info = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // klik di luar / Esc menutup panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code: LocaleCode) => {
    if (code !== locale) {
      sound?.play("levelup", { volume: 0.5 });
      advance("polyglot");
      switchLocale(router, code);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.ui.lang.button}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="mc-slot mc-focus flex h-9 items-center gap-1.5 px-2"
        title={t.ui.lang.buttonTip}
      >
        <ItemIcon src="/mc/items/name_tag.png" size={24} alt="" />
        <span className="mc-font hidden text-[11px] text-[#d8d8d8] md:inline">{info.short}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.ui.lang.panelTitle}
          className="mc-mobile-menu absolute right-0 top-full z-50 mt-2 w-[248px] border-2 border-[#0a0a0a] bg-[rgba(10,10,12,0.97)] p-2 backdrop-blur-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
        >
          <div className="mc-font mc-sh border-b-2 border-[#ffffff14] px-2 pb-2 pt-1 text-center text-[13px] text-white">
            {t.ui.lang.panelTitle}
          </div>
          <div className="mc-scroll mc-lang-list mt-1 max-h-[300px] overflow-y-auto">
            {LOCALES.map((l) => {
              const isActive = l.code === locale;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => pick(l.code)}
                  className={`mc-font mc-focus flex w-full items-center justify-between gap-2 border-2 px-2.5 py-1.5 text-left text-[13px] ${
                    isActive
                      ? "border-[#ffffff33] bg-[#ffffff18] text-white"
                      : "border-transparent text-[#c9c9c9] hover:border-[#ffffff22] hover:bg-[#ffffff0d] hover:text-white"
                  }`}
                >
                  <span className="truncate" style={{ direction: l.dir }}>
                    {l.native}
                  </span>
                  {isActive ? (
                    <span className="mc-font shrink-0 text-[9px] text-[#55ff55]">
                      {t.ui.lang.current}
                    </span>
                  ) : (
                    <span className="mc-font shrink-0 text-[9px] text-[#555555]">{l.short}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mc-font border-t-2 border-[#ffffff14] px-2 pb-1 pt-2 text-center text-[9px] leading-[1.6] text-[#7f7f7f]">
            {t.ui.lang.panelNote}
          </div>
        </div>
      )}
    </div>
  );
}
