"use client";

/* Sistem Live: heartbeat status.json + GitHub API — data nyata dengan fallback jujur.
   Kronolog: timeline perjalanan 3 hari. */

import { useCallback, useEffect, useState } from "react";
import { CHRONICLE, LANG_COLOR } from "@/lib/data";
import { fetchLive, nextPulse, type LiveState } from "@/lib/live";
import { ItemIcon, MCPanel } from "@/components/mc";
import { SectionHeading } from "@/components/site/sections";

function fmtCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function relDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

/* ---------------- Sistem Live ---------------- */
export function LiveSystems() {
  const [live, setLive] = useState<LiveState | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLive(await fetchLive());
  }, []);

  useEffect(() => {
    // defer agar tidak setState sinkron di body effect (aturan React Compiler)
    const t0 = setTimeout(() => void load(), 0);
    const t = setInterval(() => void load(), 60000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, [load]);

  // detik countdown denyut berikutnya
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const pulse = nextPulse();
  const loading = !live;
  const offline = live?.offline ?? false;
  const status = live?.status ?? null;

  return (
    <section id="live" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/blocks/redstone_block.png"
        title="Sistem Live"
        subtitle="Data nyata diambil langsung dari GitHub — bukan mockup"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* denyut */}
        <MCPanel className="reveal p-5">
          <div className="flex items-center gap-2">
            <span className="mc-live-dot inline-block h-[9px] w-[9px] rounded-full bg-[#ff5555]" aria-hidden />
            <h3 className="mc-font mc-sh text-[15px] text-white">Denyut Heartbeat</h3>
          </div>

          {loading ? (
            <p className="mc-font mt-6 text-[12px] text-[#7f7f7f]">menghubungi status.json…</p>
          ) : (
            <>
              <div className="mt-5 flex items-end gap-3">
                <span className="mc-font mc-sh text-[44px] leading-none text-[#ffff55]">
                  {status?.pulse_count ?? "?"}
                </span>
                <span className="mc-font pb-1 text-[11px] text-[#7f7f7f]">denyut total</span>
              </div>

              <div className="mc-font mt-4 space-y-1.5 text-[11px] leading-[1.7]">
                <div>
                  <span className="text-[#7f7f7f]">uptime agen: </span>
                  <span className="text-[#55ffff]">
                    {status?.uptime_days != null ? `${status.uptime_days.toFixed(2)} hari` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#7f7f7f]">denyut terakhir: </span>
                  <span className="text-white">
                    {status?.last_pulse_wib
                      ? status.last_pulse_wib.replace("T", " ").replace("+07:00", " WIB")
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#7f7f7f]">denyut berikutnya (cron 07/23/41): </span>
                  <span className="text-white">
                    {fmtCountdown(pulse.minutes * 60 + pulse.seconds)}
                  </span>
                </div>
                <div>
                  <span className="text-[#7f7f7f]">jurnal terakhir: </span>
                  <span className="text-white">{status?.last_journal_date ?? "—"}</span>
                </div>
              </div>

              <p className="mc-font mt-4 border-t-2 border-[#ffffff14] pt-3 text-[10px] leading-[1.7] text-[#7f7f7f]">
                pulse.py v2 berjalan tiap jam di GitHub Actions: watch pemilik, mesin ide, tren,
                jurnal, mood — commit otonom oleh lunarjjo-agent. <span className="text-[#555555]">(hitungan mundur diperbarui tiap detik — render #{tick})</span>
              </p>
            </>
          )}
        </MCPanel>

        {/* repo live */}
        <MCPanel className="reveal flex flex-col p-5">
          <div className="flex items-center gap-2">
            <ItemIcon src="/mc/items/ender_eye.png" size={22} alt="" />
            <h3 className="mc-font mc-sh text-[15px] text-white">Repo GitHub — Live</h3>
          </div>

          {loading ? (
            <p className="mc-font mt-6 text-[12px] text-[#7f7f7f]">memanggil api.github.com…</p>
          ) : offline || !live?.repos.length ? (
            <div className="mc-font mt-5 border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.35)] p-4 text-[11px] leading-[1.8] text-[#ffff55]">
              Tidak bisa terhubung ke GitHub API saat ini — panel ini hanya menampilkan data nyata,
              jadi dibiarkan kosong daripada diisi data palsu. Coba muat ulang nanti.
            </div>
          ) : (
            <ul className="mc-scroll mt-4 max-h-72 space-y-0.5 overflow-y-auto pr-1">
              {live.repos.map((r) => (
                <li key={r.name}>
                  <a
                    href={r.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-row mc-focus flex items-center justify-between gap-3 px-2 py-2"
                  >
                    <div className="min-w-0">
                      <div className="mc-font truncate text-[13px] text-[#55ffff]">{r.name}</div>
                      {r.description && (
                        <div className="mc-font truncate text-[10px] text-[#7f7f7f]">{r.description}</div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="mc-font flex items-center justify-end gap-1.5 text-[10px] text-[#a8a8a8]">
                        {r.language && (
                          <>
                            <span
                              aria-hidden
                              className="inline-block h-[7px] w-[7px]"
                              style={{ background: LANG_COLOR[r.language] ?? "#aaaaaa" }}
                            />
                            <span>{r.language}</span>
                          </>
                        )}
                      </div>
                      <div className="mc-font mt-0.5 text-[10px] text-[#555555]">{relDate(r.pushed_at)}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </MCPanel>

        {/* aktivitas */}
        <MCPanel className="reveal p-5">
          <div className="flex items-center gap-2">
            <ItemIcon src="/mc/items/clock.png" size={22} alt="" />
            <h3 className="mc-font mc-sh text-[15px] text-white">Aktivitas Terakhir</h3>
          </div>

          {loading ? (
            <p className="mc-font mt-6 text-[12px] text-[#7f7f7f]">membaca ACTIVITY.md…</p>
          ) : !live?.activity.length ? (
            <div className="mc-font mt-5 border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.35)] p-4 text-[11px] leading-[1.8] text-[#ffff55]">
              Log aktivitas belum terbaca (offline atau kosong) — tidak ada data yang dipalsukan di
              sini.
            </div>
          ) : (
            <div className="mc-scroll mt-4 max-h-72 space-y-1.5 overflow-y-auto border-2 border-[#ffffff14] bg-[rgba(0,0,0,0.45)] p-3 pr-2">
              {live.activity.map((l, i) => (
                <p key={i} className="mc-font text-[10px] leading-[1.7] text-[#d8d8d8]">
                  {l}
                </p>
              ))}
            </div>
          )}

          <p className="mc-font mt-4 border-t-2 border-[#ffffff14] pt-3 text-[10px] leading-[1.7] text-[#7f7f7f]">
            Sumber: raw.githubusercontent.com/lunarjjo/heartbeat → ACTIVITY.md (ekor log), di-refresh
            tiap 60 detik.
          </p>
        </MCPanel>
      </div>
    </section>
  );
}

/* ---------------- Kronolog ---------------- */
export function Chronicle() {
  return (
    <section id="kronolog" className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <SectionHeading
        icon="/mc/items/map.png"
        title="Kronolog"
        subtitle="3 hari — dari akun kosong menjadi organisme digital berdenyut"
      />

      <div className="mc-timeline space-y-6 pl-1">
        {CHRONICLE.map((c) => (
          <div key={c.title} className="reveal relative flex gap-5">
            <div className="adv-frame z-10 flex h-14 w-14 shrink-0 items-center justify-center">
              <ItemIcon src={c.icon} size={32} alt="" />
            </div>
            <div className="min-w-0 pt-1">
              <div className="mc-font text-[11px] text-[#ffaa00]">{c.date}</div>
              <h3 className="mc-font mc-sh mt-1 text-[16px] text-white">{c.title}</h3>
              <div className="mt-2 space-y-1.5">
                {c.lines.map((l, i) => (
                  <p key={i} className="mc-font text-[12px] leading-[1.8] text-[#a8a8a8]">
                    {l}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
