import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Reduce formats to only WebP (remove AVIF to halve transformations)
    formats: ['image/webp'],
    // Cache optimized images for 30 days
    minimumCacheTTL: 2678400,
    // Limit device sizes to common breakpoints
    deviceSizes: [320, 640, 750, 828, 1080, 1200],
    // Limit image sizes to what's actually needed
    imageSizes: [32, 64, 96, 128, 256, 384],
    // Configure allowed quality values
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnnarutoen-gmt.oasgames.com',
      }
    ]
  }
};

export default withNextIntl(nextConfig);
