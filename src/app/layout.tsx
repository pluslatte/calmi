// app/layout.tsx
'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css'
import ThemeProvider from "@/theme-provider";
import { useEffect, useState } from "react";
import { MisskeyApiProvider } from "./MisskeyApiProvider";
import { EmojiCacheProvider } from "@/lib/emoji/EmojiCacheProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <html lang="en">
        <body>
          <p>not mounted</p>
        </body>
      </html>
    )
  }
  return (
    <html lang="en">
      <title>calmi</title>
      <meta name="application-name" content="calmi" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="calmi" />
      <meta name="description" content="静かに Misskey を使いたい人のためのクライアント" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#282828" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="manifest" href="/manifest.json" />
      <body>
        <ThemeProvider>
          <MisskeyApiProvider>
            <EmojiCacheProvider>
              {children}
            </EmojiCacheProvider>
          </MisskeyApiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
