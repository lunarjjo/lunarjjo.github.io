import type { Metadata } from "next";
import { Site } from "@/components/site/site";
import { getDict } from "@/i18n";
import { LOCALES, SITE_URL, localePath } from "@/i18n/config";

/* Halaman utama "/" — bahasa default English (mandat: English-first).
   12 bahasa lain = halaman statis sendiri di /src/app/[locale]/page.tsx. */

export function generateMetadata(): Metadata {
  const t = getDict("en");
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
      canonical: SITE_URL + "/",
      languages: { ...languages, "x-default": SITE_URL + "/" },
    },
  };
}

export default function Page() {
  return <Site locale="en" />;
}
