import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site has several root layouts (app/[lang], app/admin) — see app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  images: {
    remotePatterns: [
      // Add your image host here once assets move off /public, e.g. Supabase Storage:
      // { protocol: "https", hostname: "<project>.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
