import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages (lunarjjo.github.io) — situs statis murni, tanpa server Node.
  // Root domain (repo <user>.github.io) => tidak perlu basePath:
  // seluruh path aset "/mc/..." absolute tetap valid.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
