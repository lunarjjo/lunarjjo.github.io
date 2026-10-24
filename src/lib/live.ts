/* Live data: heartbeat status.json + GitHub public API — with honest offline fallback. */

export type HeartbeatStatus = {
  pulse_count?: number;
  mood?: string;
  uptime_days?: number;
  last_pulse_wib?: string;
  last_pulse_utc?: string;
  owner_last_push?: string;
  last_trend_date?: string;
  last_journal_date?: string;
  fetchedAt: string;
  raw?: Record<string, unknown>;
};

export type LiveRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  pushed_at: string;
  language: string | null;
};

export type LiveState = {
  status: HeartbeatStatus | null;
  activity: string[];
  repos: LiveRepo[];
  offline: boolean;
  loadedAt: string | null;
};

async function tryFetch(url: string, timeoutMs = 8000): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok ? res : null;
  } catch {
    clearTimeout(t);
    return null;
  }
}

export async function fetchLive(): Promise<LiveState> {
  const state: LiveState = {
    status: null,
    activity: [],
    repos: [],
    offline: false,
    loadedAt: new Date().toISOString(),
  };

  // 1) heartbeat status.json (try main then master)
  for (const branch of ["main", "master"]) {
    const res = await tryFetch(
      `https://raw.githubusercontent.com/lunarjjo/heartbeat/${branch}/status.json`
    );
    if (res) {
      try {
        const json = (await res.json()) as Record<string, unknown>;
        state.status = {
          ...json,
          fetchedAt: new Date().toISOString(),
          raw: json,
        } as HeartbeatStatus;
      } catch {
        /* bad json */
      }
      break;
    }
  }

  // 2) ACTIVITY.md tail
  for (const branch of ["main", "master"]) {
    const res = await tryFetch(
      `https://raw.githubusercontent.com/lunarjjo/heartbeat/${branch}/ACTIVITY.md`
    );
    if (res) {
      try {
        const text = await res.text();
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && /^[-*#>|]/.test(l) === false && /\d{2}:\d{2}|\d{4}-\d{2}-\d{2}|pulse/i.test(l));
        state.activity = lines.slice(-6).reverse();
      } catch {
        /* ignore */
      }
      break;
    }
  }

  // 3) GitHub repos (public API)
  const res = await tryFetch(
    "https://api.github.com/users/lunarjjo/repos?per_page=100&sort=pushed"
  );
  if (res) {
    try {
      const json = (await res.json()) as LiveRepo[];
      if (Array.isArray(json)) state.repos = json;
    } catch {
      /* ignore */
    }
  }

  if (!state.status && !state.repos.length && !state.activity.length) {
    state.offline = true;
  }
  return state;
}

/** Next heartbeat pulse: minutes 07/23/41 every hour (cron). */
export function nextPulse(now = new Date()): { minutes: number; seconds: number; at: Date } {
  const minutes = [7, 23, 41];
  const at = new Date(now);
  const m = now.getMinutes();
  const next = minutes.find((x) => x > m) ?? minutes[0];
  if (next <= m) at.setHours(at.getHours() + 1);
  at.setMinutes(next, 0, 0);
  const diff = Math.max(0, Math.floor((at.getTime() - now.getTime()) / 1000));
  return { minutes: Math.floor(diff / 60), seconds: diff % 60, at };
}
