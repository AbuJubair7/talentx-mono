import type { NextConfig } from "next";
import { API_URL } from "./lib/config";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // jose is ESM-only; transpiling it lets next/jest transform it for tests.
  transpilePackages: ["jose"],
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;