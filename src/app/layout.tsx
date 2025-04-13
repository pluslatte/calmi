// app/layout.tsx
'use client';

import '@mantine/core/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import ThemeProvider from "@/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
