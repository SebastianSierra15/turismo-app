import type { NextConfig } from "next";

const backendApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const normalizedBackendApiUrl = backendApiUrl
  ? backendApiUrl.replace(/\/+$/, "")
  : "";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    if (!normalizedBackendApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/_backend/:path*",
        destination: `${normalizedBackendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
