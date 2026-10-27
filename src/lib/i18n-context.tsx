"use client";

/* I18n context — locale + kamus aktif untuk seluruh pohon komponen.
   Disediakan di level HALAMAN (bukan root layout) supaya setiap
   halaman statis (/ , /id/ , /ja/ ...) di-prerender dengan bahasa
   yang benar sejak byte pertama HTML. */

import { createContext, useContext, type ReactNode } from "react";
import type { LocaleCode } from "@/i18n/config";
import { getDict, type Dict } from "@/i18n";

type I18nCtx = {
  locale: LocaleCode;
  t: Dict;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: LocaleCode;
  children: ReactNode;
}) {
  const t = getDict(locale);
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
