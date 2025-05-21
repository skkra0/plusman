import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/login/sign-in',
        permanent: true
      }
    ]
  }
};

export default nextConfig;
