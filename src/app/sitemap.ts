import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL, localePath } from "@/i18n/config";

/* Sitemap statis: 13 URL bahasa + alternates hreflang per entri. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LOCALES.map((l) => {
    const languages: Record<string, string> = {};
    for (const x of LOCALES) languages[x.htmlLang] = `${SITE_URL}${localePath(x.code)}`;
    return {
      url: `${SITE_URL}${localePath(l.code)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: l.code === "en" ? 1 : 0.8,
      alternates: { languages: { ...languages, "x-default": `${SITE_URL}/` } },
    };
  });
}
