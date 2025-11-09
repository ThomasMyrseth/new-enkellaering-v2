import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {protocol: "https",
        hostname: "source.unsplash.com"
      },
      {protocol: "https",
        hostname: "unsplash.com"
      },
      {
        protocol: "https",
        hostname: "clfgrepvidmzconiqqrt.supabase.co",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
  },
  /* other config options */
};

export default nextConfig;