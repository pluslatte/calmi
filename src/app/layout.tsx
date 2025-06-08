import { MantineProvider } from "@mantine/core"
import { theme } from "@/lib/mantine-theme"
import { Notifications } from "@mantine/notifications"
import { SessionProvider } from "next-auth/react"

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export const metadata = {
  title: 'calmi',
  description: 'Calmi - Minimal Misskey Client',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>calmi</title>
      </head>
      <body>
        <SessionProvider>
          <MantineProvider theme={theme} forceColorScheme="dark">
            <Notifications position="bottom-center" />
            {children}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
