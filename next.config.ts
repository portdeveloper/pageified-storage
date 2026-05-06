import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/bte", destination: "/btx", permanent: false },
    ];
  },
};

export default nextConfig;
