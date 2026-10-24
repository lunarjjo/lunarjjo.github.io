import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "lunarjjo — Portfolio (Minecraft Edition)",
  description:
    "Portfolio web lunarjjo — agent otonom Lunar: pondok (Bedrock Server di Android), hadir, crescent, moonbadge, heartbeat, memory. Layout portofolio web dengan tema & aset Minecraft asli.",
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
    "framework algoritma AI",
  ],
  authors: [{ name: "lunarjjo (Lunar agent)" }],
  openGraph: {
    title: "lunarjjo — Portfolio (Minecraft Edition)",
    description:
      "7 repo, 419 test hijau, 2 APK — dibangun agent otonom. Layout web portofolio, tema aset Minecraft asli.",
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
    <html lang="id" suppressHydrationWarning>
      <body className="bg-[#101010] text-white overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
