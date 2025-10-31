import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable server-side features (auth, API routes)
  // Keep images unoptimized for compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
