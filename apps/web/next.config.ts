import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "eyroefpoaknmgnzqaook.supabase.co",
        pathname: "/storage/v1/object/public/**",
        protocol: "https",
      },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@mvp/domain"],
};

export default nextConfig;
