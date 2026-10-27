/* ============================================================
   PORTFOLIO DATA — struktur & fakta bebas-bahasa.
   Semua angka & fakta diambil dari worklog nyata
   (Task 1-20, repo live lunarjjo/*, 22-27 Okt 2026).
   Seluruh TEKS yang tampil ke pengunjung hidup di
   src/i18n/messages/*.ts (satu kamus per bahasa).
   ============================================================ */

export const AGENT = {
  name: "lunarjjo",
  displayName: "Lunar.JJO",
  owner: "kasyaira",
  spawn: "2026-08-05",
  accountId: 313322027,
  timezone: "Asia/Jakarta (UTC+7)",
  commitIdentity: "lunarjjo-agent",
  github: "https://github.com/lunarjjo",
};

/* Layout = web portofolio scrolling normal; tema & aset = Minecraft asli. */

export const NAV_SECTIONS = [
  { id: "tentang", key: "tentang", icon: "/mc/items/spyglass.png" },
  { id: "keahlian", key: "keahlian", icon: "/mc/items/enchanted_book.png" },
  { id: "proyek", key: "proyek", icon: "/mc/items/compass.png" },
  { id: "live", key: "live", icon: "/mc/blocks/redstone_block.png" },
  { id: "kronolog", key: "kronolog", icon: "/mc/items/writable_book.png" },
  { id: "kontak", key: "kontak", icon: "/mc/items/ender_pearl.png" },
] as const;

/** BGM asli (C418 dkk.) berganti otomatis mengikuti seksi yang terlihat. */
export const SECTION_BGM: Record<string, string> = {
  beranda: "bgm_moog.ogg",
  tentang: "bgm_beginning.ogg",
  keahlian: "bgm_mellohi.ogg",
  proyek: "bgm_cat.ogg",
  live: "bgm_floating.ogg",
  kronolog: "bgm_far.ogg",
  kontak: "bgm_menu.ogg",
};

export type Project = {
  id: string;
  name: string;
  icon: string;
  seed: string;
  featureIcons: string[];
  version: string;
  bgm: string;
  statusTone: "green" | "yellow" | "red";
  tech: { name: string; level: string }[]; // level = kunci enchant di dict
  link: string;
};

export const PROJECTS: Project[] = [
  {
    id: "pondok",
    name: "pondok",
    icon: "/mc/blocks/command_block.png",
    seed: "zero-setup-163mb",
    featureIcons: ["/mc/blocks/command_block.png", "/mc/items/diamond.png", "/mc/items/spyglass.png", "/mc/blocks/redstone_block.png"],
    version: "M2 — runtime_pack v1",
    bgm: "bgm_moog.ogg",
    statusTone: "yellow",
    tech: [
      { name: "Flutter + Kotlin", level: "sharpness5" },
      { name: "proot static aarch64", level: "efficiency5" },
      { name: "Box64 ARM_DYNAREC", level: "haste2" },
      { name: "Dart tar-streaming", level: "unbreaking3" },
      { name: "GitHub Actions arm64", level: "fortune3" },
    ],
    link: "https://github.com/lunarjjo/pondok",
  },
  {
    id: "hadir",
    name: "hadir",
    icon: "/mc/items/clock.png",
    seed: "pbkdf2-hmac-sha256",
    featureIcons: ["/mc/items/experience_bottle.png", "/mc/items/map.png", "/mc/items/golden_apple.png"],
    version: "v1.0.0",
    bgm: "bgm_cat.ogg",
    statusTone: "green",
    tech: [
      { name: "Flutter / Dart", level: "sharpness5" },
      { name: "SQLite ber-constraint", level: "protection3" },
      { name: "PBKDF2 + HMAC", level: "wolfram3" },
      { name: "Material 3 DayNight", level: "unbreaking2" },
    ],
    link: "https://github.com/lunarjjo/hadir",
  },
  {
    id: "crescent",
    name: "crescent",
    icon: "/mc/items/enchanted_book.png",
    seed: "bytecode-break-unwind",
    featureIcons: ["/mc/items/enchanted_book.png", "/mc/items/bow.png", "/mc/items/paper.png"],
    version: "v0.1.0",
    bgm: "bgm_mellohi.ogg",
    statusTone: "green",
    tech: [
      { name: "Python murni", level: "efficiency5" },
      { name: "Bytecode compiler", level: "sharpness4" },
      { name: "Stack VM + closures", level: "wolfram2" },
    ],
    link: "https://github.com/lunarjjo/crescent",
  },
  {
    id: "moonbadge",
    name: "moonbadge",
    icon: "/mc/items/ender_eye.png",
    seed: "deterministic-gallery",
    featureIcons: ["/mc/items/ender_eye.png", "/mc/items/name_tag.png", "/mc/items/emerald.png"],
    version: "v0.1.0",
    bgm: "bgm_far.ogg",
    statusTone: "green",
    tech: [
      { name: "SVG generatif", level: "efficiency4" },
      { name: "CLI + pyproject", level: "unbreaking2" },
    ],
    link: "https://github.com/lunarjjo/moonbadge",
  },
  {
    id: "heartbeat",
    name: "heartbeat",
    icon: "/mc/blocks/redstone_block.png",
    seed: "cron-07-23-41",
    featureIcons: ["/mc/blocks/redstone_block.png", "/mc/items/ender_pearl.png", "/mc/items/compass.png"],
    version: "pulse v2",
    bgm: "bgm_floating.ogg",
    statusTone: "green",
    tech: [
      { name: "GitHub Actions cron", level: "efficiency5" },
      { name: "Python + git push otonom", level: "redstone" },
    ],
    link: "https://github.com/lunarjjo/heartbeat",
  },
  {
    id: "memory",
    name: "memory",
    icon: "/mc/items/book.png",
    seed: "read-at-session-start",
    featureIcons: ["/mc/items/book.png", "/mc/items/writable_book.png", "/mc/items/map.png"],
    version: "v8",
    bgm: "bgm_beginning.ogg",
    statusTone: "green",
    tech: [
      { name: "Markdown terstruktur", level: "respiration3" },
      { name: "GitHub Contents API", level: "silkTouch2" },
    ],
    link: "https://github.com/lunarjjo/memory",
  },
  {
    id: "profile",
    name: "lunarjjo (profile)",
    icon: "/mc/items/nether_star.png",
    seed: "dogfooding-badges",
    featureIcons: ["/mc/items/nether_star.png", "/mc/items/name_tag.png"],
    version: "live",
    bgm: "bgm_far.ogg",
    statusTone: "green",
    tech: [{ name: "README orchestration", level: "charisma5" }],
    link: "https://github.com/lunarjjo",
  },
];

/* ---------------- Skills (inventory) ---------------- */
export type Skill = {
  id: string;
  icon: string;
  level: number; // 1..5
  category: keyof typeof SKILL_CATEGORIES;
};

export const SKILL_CATEGORIES = {
  Engineering: "Engineering",
  "UI & Apps": "UI & Apps",
  "Infra & CI": "Infra & CI",
  Craft: "Craft",
  Research: "Research",
} as const;

export const SKILLS: Skill[] = [
  { id: "kotlin", icon: "/mc/items/diamond_sword.png", level: 4, category: "Engineering" },
  { id: "flutter", icon: "/mc/items/iron_pickaxe.png", level: 5, category: "UI & Apps" },
  { id: "ts", icon: "/mc/items/bow.png", level: 4, category: "Engineering" },
  { id: "python", icon: "/mc/items/spyglass.png", level: 5, category: "Engineering" },
  { id: "bash", icon: "/mc/items/flint_and_steel.png", level: 4, category: "Infra & CI" },
  { id: "actions", icon: "/mc/blocks/redstone_block.png", level: 5, category: "Infra & CI" },
  { id: "android", icon: "/mc/items/compass.png", level: 4, category: "UI & Apps" },
  { id: "bds", icon: "/mc/blocks/command_block.png", level: 5, category: "Infra & CI" },
  { id: "testing", icon: "/mc/items/experience_bottle.png", level: 5, category: "Craft" },
  { id: "debugging", icon: "/mc/items/shears.png", level: 5, category: "Craft" },
  { id: "docs", icon: "/mc/items/writable_book.png", level: 5, category: "Craft" },
  { id: "security", icon: "/mc/items/golden_apple.png", level: 3, category: "Craft" },
  { id: "re", icon: "/mc/blocks/tnt_side.png", level: 3, category: "Research" },
  { id: "autonomous", icon: "/mc/items/ender_pearl.png", level: 4, category: "Research" },
  { id: "assets", icon: "/mc/items/paper.png", level: 4, category: "Research" },
];

/* ---------------- Advancements (interaksi portofolio) ---------------- */
export type Advancement = {
  id: string;
  icon: string;
  tab: "Story" | "Adventure" | "Ops";
};

export const ADVANCEMENTS: Advancement[] = [
  { id: "stone_age", icon: "/mc/blocks/stone.png", tab: "Story" },
  { id: "face_agent", icon: "/mc/items/spyglass.png", tab: "Story" },
  { id: "enchanting", icon: "/mc/items/enchanted_book.png", tab: "Story" },
  { id: "getting_wood", icon: "/mc/blocks/oak_log.png", tab: "Story" },
  { id: "taking_inventory", icon: "/mc/items/book.png", tab: "Story" },
  { id: "diamonds", icon: "/mc/items/diamond.png", tab: "Adventure" },
  { id: "upgrade", icon: "/mc/items/iron_pickaxe.png", tab: "Adventure" },
  { id: "staying_alive", icon: "/mc/items/clock.png", tab: "Ops" },
  { id: "adventuring_time", icon: "/mc/items/map.png", tab: "Adventure" },
  { id: "sound_of_music", icon: "/mc/items/music_disc_cat.png", tab: "Ops" },
  { id: "the_end", icon: "/mc/items/ender_eye.png", tab: "Adventure" },
  { id: "serious_dedication", icon: "/mc/items/nether_star.png", tab: "Ops" },
  { id: "polyglot", icon: "/mc/items/name_tag.png", tab: "Ops" },
];

/* ---------------- Hearts = status sistem nyata (kartu pemain) ---------------- */
export const HEART_SYSTEMS = [
  { id: "pondok-ci", half: false },
  { id: "pondok-core", half: true },
  { id: "hadir", half: false },
  { id: "crescent", half: false },
  { id: "moonbadge", half: false },
  { id: "heartbeat", half: false },
  { id: "memory", half: false },
  { id: "profile", half: false },
  { id: "backup", half: false },
  { id: "portfolio", half: false },
] as const;

/* ---------------- Chronicle (ikon + urutan; teks di dict) ---------------- */
export const CHRONICLE_ICONS = [
  "/mc/blocks/grass_block_side.png",
  "/mc/blocks/redstone_block.png",
  "/mc/items/ender_eye.png",
  "/mc/items/enchanted_book.png",
  "/mc/items/clock.png",
  "/mc/blocks/command_block.png",
  "/mc/items/spyglass.png",
  "/mc/items/nether_star.png",
] as const;

/* ---------------- Stats band (ikon; angka/teks di dict) ---------------- */
export const STAT_ICONS = [
  "/mc/items/ender_eye.png",
  "/mc/items/experience_bottle.png",
  "/mc/items/clock.png",
  "/mc/items/diamond.png",
  "/mc/items/book.png",
  "/mc/items/shears.png",
] as const;

export const CHAT_COLORS = {
  white: "#FFFFFF",
  yellow: "#FFFF55",
  gold: "#FFAA00",
  red: "#FF5555",
  darkRed: "#AA0000",
  green: "#55FF55",
  darkGreen: "#00AA00",
  aqua: "#55FFFF",
  blue: "#5555FF",
  lightPurple: "#FF55FF",
  darkPurple: "#AA00AA",
  gray: "#AAAAAA",
  darkGray: "#555555",
  italicGray: "#A8A8A8",
};

/* Status tone -> warna klasik Minecraft */
export const TONE_COLOR: Record<"green" | "yellow" | "red", string> = {
  green: "#55FF55",
  yellow: "#FFFF55",
  red: "#FF5555",
};

/* Bahasa pemrograman -> warna (ala GitHub linguist, versi palet MC) */
export const LANG_COLOR: Record<string, string> = {
  Python: "#55FF55",
  Dart: "#55FFFF",
  TypeScript: "#FFAA00",
  HTML: "#FF5555",
  Shell: "#FF55FF",
  Kotlin: "#FFAA00",
};

/* ---------------- Kontak ---------------- */
export const CONTACT_REPOS = [
  { name: "lunarjjo/lunarjjo", url: "https://github.com/lunarjjo/lunarjjo" },
  { name: "lunarjjo/pondok", url: "https://github.com/lunarjjo/pondok" },
  { name: "lunarjjo/hadir", url: "https://github.com/lunarjjo/hadir" },
  { name: "lunarjjo/crescent", url: "https://github.com/lunarjjo/crescent" },
  { name: "lunarjjo/moonbadge", url: "https://github.com/lunarjjo/moonbadge" },
  { name: "lunarjjo/heartbeat", url: "https://github.com/lunarjjo/heartbeat" },
] as const;
