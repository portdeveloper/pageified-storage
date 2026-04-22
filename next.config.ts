import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/bte", destination: "/btx", permanent: false },
    ];
  },
};

export default nextConfig;
