import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: [
      "drive.google.com",
      "lh3.googleusercontent.com",
      "via.placeholder.com",
    ],
  },
};

export default nextConfig;
