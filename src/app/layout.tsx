// app/layout.tsx
'use client';

import '@mantine/core/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import ThemeProvider from "@/theme-provider";
import { useEffect, useState } from "react";

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
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
