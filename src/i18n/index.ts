/* ============================================================
   i18n loader — synchronous, build-time-safe.
   Every locale dictionary is statically imported so each
   prerendered page gets its language baked into the HTML.
   ============================================================ */

import type { LocaleCode } from "./config";
import en, { type Dict } from "./messages/en";
import id from "./messages/id";
import es from "./messages/es";
import fr from "./messages/fr";
import de from "./messages/de";
import pt from "./messages/pt";
import it from "./messages/it";
import ru from "./messages/ru";
import ja from "./messages/ja";
import zh from "./messages/zh";
import ko from "./messages/ko";
import hi from "./messages/hi";
import ar from "./messages/ar";

export type { Dict };

const DICTS: Record<LocaleCode, Dict> = {
  en,
  id,
  es,
  fr,
  de,
  pt,
  it,
  ru,
  ja,
  "zh-CN": zh,
  ko,
  hi,
  ar,
};

export function getDict(locale: string): Dict {
  return DICTS[locale as LocaleCode] ?? en;
}

/** Tiny template helper: fills "{key}" placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m
  );
}
