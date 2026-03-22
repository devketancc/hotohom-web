import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dev API proxy: app/api/v1/[[...segments]]/route.ts (fetch + redirect: follow avoids 308↔301 loops with rewrites). */
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com'],
  },
};

export default nextConfig;