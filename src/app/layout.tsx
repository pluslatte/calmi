import Providers from "./providers";

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
