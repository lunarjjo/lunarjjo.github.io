/* ============================================================
   i18n config — lunarjjo portfolio
   English-first (site root "/"), 12 more locales as static
   route segments ("/id/", "/es/", ... "/ar/").
   Every locale page is prerendered at build time (output: export),
   so each language gets a real, indexable URL.
   ============================================================ */

export type LocaleCode =
  | "en"
  | "id"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "ru"
  | "ja"
  | "zh-CN"
  | "ko"
  | "hi"
  | "ar";

export type LocaleInfo = {
  /** URL segment ("en" is the root "/" itself — never generated as /en/) */
  code: LocaleCode;
  /** value for <html lang> */
  htmlLang: string;
  /** language name in its own script — shown in the switcher */
  native: string;
  /** language name in English (switcher tooltip) */
  english: string;
  /** text direction */
  dir: "ltr" | "rtl";
  /** short label used in compact UI (topbar chip) */
  short: string;
};

export const LOCALES: LocaleInfo[] = [
  { code: "en", htmlLang: "en", native: "English", english: "English", dir: "ltr", short: "EN" },
  { code: "id", htmlLang: "id", native: "Bahasa Indonesia", english: "Indonesian", dir: "ltr", short: "ID" },
  { code: "es", htmlLang: "es", native: "Español", english: "Spanish", dir: "ltr", short: "ES" },
  { code: "fr", htmlLang: "fr", native: "Français", english: "French", dir: "ltr", short: "FR" },
  { code: "de", htmlLang: "de", native: "Deutsch", english: "German", dir: "ltr", short: "DE" },
  { code: "pt", htmlLang: "pt", native: "Português", english: "Portuguese", dir: "ltr", short: "PT" },
  { code: "it", htmlLang: "it", native: "Italiano", english: "Italian", dir: "ltr", short: "IT" },
  { code: "ru", htmlLang: "ru", native: "Русский", english: "Russian", dir: "ltr", short: "RU" },
  { code: "ja", htmlLang: "ja", native: "日本語", english: "Japanese", dir: "ltr", short: "JA" },
  { code: "zh-CN", htmlLang: "zh-CN", native: "简体中文", english: "Chinese (Simplified)", dir: "ltr", short: "中文" },
  { code: "ko", htmlLang: "ko", native: "한국어", english: "Korean", dir: "ltr", short: "KO" },
  { code: "hi", htmlLang: "hi", native: "हिन्दी", english: "Hindi", dir: "ltr", short: "HI" },
  { code: "ar", htmlLang: "ar", native: "العربية", english: "Arabic", dir: "rtl", short: "AR" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";

/** Locales that get their own route segment (everything except "en"). */
export const ROUTED_LOCALES: LocaleCode[] = LOCALES.map((l) => l.code).filter(
  (c) => c !== DEFAULT_LOCALE
) as LocaleCode[];

const BY_CODE = new Map<string, LocaleInfo>(LOCALES.map((l) => [l.code, l]));

export function localeInfo(code: string): LocaleInfo {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LOCALE)!;
}

export function isLocaleCode(x: string): x is LocaleCode {
  return BY_CODE.has(x);
}

/** Absolute base URL (GitHub Pages root domain). */
export const SITE_URL = "https://lunarjjo.github.io";

/** Path prefix for a locale ("en" → "", others → "/id/" etc.). */
export function localePath(code: LocaleCode): string {
  return code === DEFAULT_LOCALE ? "/" : `/${code}/`;
}
