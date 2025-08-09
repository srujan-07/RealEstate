import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  // Ensure Next.js looks in the src directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
