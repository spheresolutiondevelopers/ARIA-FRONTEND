import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;