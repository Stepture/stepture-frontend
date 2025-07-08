import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "drive.google.com",
      "lh3.googleusercontent.com",
      "via.placeholder.com", // ← added for dummy screenshots
    ],
  },
};

export default nextConfig;