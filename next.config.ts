import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'], // https://qiita.com/Yasushi-Mo/items/bda68188d5db4b4c709d
  }
};

export default nextConfig;