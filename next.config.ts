import type { NextConfig } from "next";
import withPWA from 'next-pwa';

// PWAの設定
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    // Turbopackの設定
    turbo: {
      // PWAに必要なモジュールをTurbopackの設定に追加
      resolveAlias: {
        'next-pwa': 'next-pwa'
      }
    }
  }
};

export default pwaConfig(nextConfig);
