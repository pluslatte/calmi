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
  // Turbopackの設定
  turbopack: {
    // PWAに必要なモジュールをTurbopackの設定に追加
    resolveAlias: {
      'next-pwa': 'next-pwa'
    }
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'], // https://qiita.com/Yasushi-Mo/items/bda68188d5db4b4c709d
  }
};

export default pwaConfig(nextConfig);
