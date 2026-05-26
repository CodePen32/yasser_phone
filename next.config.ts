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
      // Allow both local dev and the production Render domain
      allowedOrigins: [
        'localhost:3000',
        process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') ?? '',
      ].filter(Boolean),
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            // Keep it practical: allow self, R2 images, Google Fonts, WhatsApp link
            value: [
              "default-src 'self'",
              // Scripts: self + inline needed by Next.js hydration
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + inline + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + data URIs + R2 + Cloudinary + Unsplash
              "img-src 'self' data: blob: https://*.r2.dev https://*.cloudflarestorage.com https://res.cloudinary.com https://images.unsplash.com",
              // Connections: self + WhatsApp API
              "connect-src 'self' https://wa.me",
              // Frames: none
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
