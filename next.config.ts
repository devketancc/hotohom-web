import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dev API proxy: app/api/v1/[[...segments]]/route.ts (fetch + redirect: follow avoids 308↔301 loops with rewrites). */
  allowedDevOrigins: ['192.168.1.23', 'localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/fleet/T', destination: '/fleet/traveller', permanent: true },
      { source: '/fleet/t', destination: '/fleet/traveller', permanent: true },
      { source: '/fleet/U', destination: '/fleet/urbania', permanent: true },
      { source: '/fleet/u', destination: '/fleet/urbania', permanent: true },
      { source: '/fleet/M', destination: '/fleet/monarch', permanent: true },
      { source: '/fleet/m', destination: '/fleet/monarch', permanent: true },
      { source: '/fleet/V', destination: '/fleet/viceroy', permanent: true },
      { source: '/fleet/v', destination: '/fleet/viceroy', permanent: true },
    ];
  },
};

export default nextConfig;