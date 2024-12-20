import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", "storage.googleapis.com"], // Add external image domains here
  },
  /* other config options */
};

export default nextConfig;