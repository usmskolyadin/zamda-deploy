import { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    optimizeCss: false,
  },
  webpack: (config) => {
    config.resolve.alias['lightningcss'] = false;
    return config;
  },
};

export default nextConfig;