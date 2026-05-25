import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Cloudflare R2 public buckets (pub-*.r2.dev)
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        // Cloudflare R2 custom domains routed via workers.dev
        protocol: 'https',
        hostname: '*.cloudflarestorage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
