import { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    optimizeCss: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zamda-media.sfo3.cdn.digitaloceanspaces.com",
        pathname: "/media/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['lightningcss'] = false;
    return config;
  },
};

export default nextConfig;