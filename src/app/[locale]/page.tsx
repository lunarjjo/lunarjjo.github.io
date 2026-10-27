import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Site } from "@/components/site/site";
import { getDict } from "@/i18n";
import { LOCALES, ROUTED_LOCALES, SITE_URL, isLocaleCode, localeInfo, localePath } from "@/i18n/config";

/* Halaman per-bahasa — statis: setiap locale di-prerender jadi
   /<locale>/index.html sendiri (output: export + generateStaticParams).
   "/" (root) = English, tidak diduplikasi sebagai /en/. */

export function generateStaticParams() {
  return ROUTED_LOCALES.map((code) => ({ locale: code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocaleCode(locale)) return {};
  const t = getDict(locale);
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.htmlLang] = `${SITE_URL}${localePath(l.code)}`;
  return {
    title: t.meta.title,
    description: t.meta.description,
    keywords: t.meta.keywords,
    authors: [{ name: "lunarjjo (Lunar agent)" }],
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      siteName: "lunarjjo portfolio",
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}${localePath(locale)}`,
      languages: { ...languages, "x-default": SITE_URL + "/" },
    },
  };
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocaleCode(locale) || locale === "en") notFound();
  return <Site locale={localeInfo(locale).code} />;
}
