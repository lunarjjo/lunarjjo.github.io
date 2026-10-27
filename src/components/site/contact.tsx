"use client";

/* Kontak + Footer. Disclaimer aset Mojang wajib tercantum (fan-content non-komersil).
   Teks dari kamus aktif. */

import { CONTACT_REPOS, AGENT } from "@/lib/data";
import { useSite } from "@/lib/store";
import { useI18n } from "@/lib/i18n-context";
import { sound } from "@/lib/sound";
import { ItemIcon, MCButton, MCPanel } from "@/components/mc";
import { SectionHeading } from "@/components/site/sections";

export function Contact() {
  const { pushToast } = useSite();
  const { t } = useI18n();

  return (
    <section id="kontak" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/items/ender_pearl.png"
        title={t.contact.heading}
        subtitle={t.contact.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <MCPanel className="reveal flex flex-col gap-5 p-6">
          <p className="mc-font text-[13px] leading-[1.9] text-[#d8d8d8] sm:text-[14px]">
            {t.contact.paragraph}
          </p>

          <div className="flex flex-wrap gap-3">
            <MCButton width={220} onClick={() => window.open(AGENT.github, "_blank", "noopener")}>
              {t.contact.profileBtn}
            </MCButton>
            <MCButton
              width={150}
              onClick={() => {
                sound?.play("bell");
                pushToast({
                  icon: "/mc/blocks/note_block.png",
                  title: t.contact.signalToastTitle,
                  desc: t.contact.signalToastDesc,
                  kind: "info",
                });
              }}
            >
              {t.contact.testSignalBtn}
            </MCButton>
          </div>

          <p className="mc-font border-t-2 border-[#ffffff14] pt-4 text-[11px] leading-[1.8] text-[#7f7f7f]">
            {t.contact.privacyNote}
          </p>
        </MCPanel>

        <MCPanel className="reveal p-6">
          <h3 className="mc-font mc-sh text-[15px] text-white">{t.contact.quickRepos}</h3>
          <ul className="mt-4 space-y-1">
            {CONTACT_REPOS.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-row mc-focus flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="mc-font truncate text-[13px] text-[#55ffff]">{r.name}</div>
                    <div className="mc-font truncate text-[10px] text-[#7f7f7f]">
                      {t.contact.repoDescs[r.name as keyof typeof t.contact.repoDescs]}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="repo-arrow block h-[9px] w-[9px] shrink-0 border-t-[3px] border-r-[3px] border-[#7f7f7f]"
                    style={{ transform: "rotate(45deg)" }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </MCPanel>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mc-dirt-band mt-auto pb-8 pt-10">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ItemIcon src="/mc/items/compass.png" size={32} alt="" />
              <span className="mc-font mc-sh text-[15px] text-white">lunarjjo</span>
            </div>
            <p className="mc-font mt-3 text-[11px] leading-[1.8] text-[#a8a8a8]">{t.footer.about}</p>
          </div>

          <div>
            <h4 className="mc-font mc-sh text-[13px] text-white">{t.footer.assetsHeading}</h4>
            <ul className="mc-font mt-3 space-y-1.5 text-[11px] leading-[1.7] text-[#a8a8a8]">
              {t.footer.assets.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mc-font mc-sh text-[13px] text-white">{t.footer.navHeading}</h4>
            <ul className="mc-font mt-3 space-y-1.5 text-[11px] leading-[1.7] text-[#a8a8a8]">
              <li>
                <a href="#beranda" className="mc-focus hover:text-white">LUNARJJO</a>
              </li>
              <li>
                <a href="#tentang" className="mc-focus hover:text-white">{t.ui.nav.tentang}</a>
              </li>
              <li>
                <a href="#keahlian" className="mc-focus hover:text-white">{t.ui.nav.keahlian}</a>
              </li>
              <li>
                <a href="#proyek" className="mc-focus hover:text-white">{t.ui.nav.proyek}</a>
              </li>
              <li>
                <a href="#live" className="mc-focus hover:text-white">{t.ui.nav.live}</a>
              </li>
              <li>
                <a href="#kronolog" className="mc-focus hover:text-white">{t.ui.nav.kronolog}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-[#ffffff14] pt-5 text-center">
          <p className="mc-font text-[10px] leading-[1.8] text-[#bdbdbd]">{t.footer.disclaimer}</p>
          <p className="mc-font mt-2 text-[10px] text-[#7f7f7f]">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
