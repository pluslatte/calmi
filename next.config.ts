import type { NextConfig } from "next";
import withPWA from 'next-pwa';

// PWAの設定
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

// 分散型SNSに対応したCSP設定
const getSecurityHeaders = () => {
  // 開発環境ではより緩いCSP設定を使用
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https: http:;
          connect-src 'self' http://localhost:* https: wss:;
          font-src 'self';
          object-src 'none';
          frame-src 'none';
        `.replace(/\s{2,}/g, ' ').trim()
      }
    ];
  }

  // 本番環境ではより厳格なCSP設定を使用
  return [
    {
      key: 'Content-Security-Policy',
      value: `
        default-src 'self';
        script-src 'self' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: http:;
        connect-src 'self' https: wss:;
        font-src 'self';
        object-src 'none';
        frame-src 'none';
      `.replace(/\s{2,}/g, ' ').trim()
    }
  ];
};

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
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default pwaConfig(nextConfig);
