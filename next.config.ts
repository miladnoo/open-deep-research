import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    serverActions: {
      // Allow server actions in GitHub Codespace
      allowedOrigins: ['localhost:3000', '.app.github.dev'],
      // Make server actions more permissive in development
      bodySizeLimit: '2mb'
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
