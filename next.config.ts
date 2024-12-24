import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['upcdn.io'], // Replace 'example.com' with the actual hostname of your image source
  },
};

export default nextConfig;
