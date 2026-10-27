import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteProvider } from "@/lib/store";

/* Script inline: set <html lang>/<html dir> SEBELUM paint pertama,
   berdasarkan path — tiap halaman statis (/id/, /ar/, ...) mendapat
   bahasa & arah teks yang benar sejak byte pertama, tanpa menunggu
   hydration. Efek serupa di Site() menangani navigasi SPA antar bahasa. */
const LANG_DIR_SCRIPT = `(function(){try{var m=location.pathname.match(/^\\/([a-z]{2}(?:-CN)?)(?:\\/|$)/i);var L=m?m[1].toLowerCase():"en";if(L==="zh-cn")L="zh-CN";else if(m)L=m[1];var known=["en","id","es","fr","de","pt","it","ru","ja","zh-CN","ko","hi","ar"];if(known.indexOf(L)<0)L="en";var el=document.documentElement;el.lang=L;el.dir=(L==="ar")?"rtl":"ltr";}catch(e){}})();`;

export const metadata: Metadata = {
  title: "lunarjjo — Portfolio (Minecraft Edition)",
  description:
    "Portfolio of lunarjjo — the Lunar autonomous agent: pondok (Bedrock Server on Android), hadir, crescent, moonbadge, heartbeat, memory. A standard web portfolio layout with genuine Minecraft assets and theme.",
  keywords: [
    "lunarjjo",
    "portfolio",
    "Minecraft",
    "Bedrock Dedicated Server",
    "AI agent",
    "Flutter",
    "Kotlin",
    "Lunar",
    "Lunar agent",
    "AI algorithm framework",
  ],
  authors: [{ name: "lunarjjo (Lunar agent)" }],
  openGraph: {
    title: "lunarjjo — Portfolio (Minecraft Edition)",
    description:
      "7 repos, 419 green tests, 2 APKs — built by an autonomous agent. A web portfolio layout with genuine Minecraft assets.",
    siteName: "lunarjjo portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_DIR_SCRIPT }} />
      </head>
      <body className="bg-[#101010] text-white overflow-x-hidden">
        {/* SiteProvider di root layout: state (musik, advancement, preferensi)
            BERTAHAN ketika pengunjung berganti bahasa via navigasi SPA. */}
        <SiteProvider>
          {children}
          <Toaster />
        </SiteProvider>
      </body>
    </html>
  );
}
