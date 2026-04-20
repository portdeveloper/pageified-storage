import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/btx", destination: "/bte", permanent: false },
    ];
  },
};

export default nextConfig;
