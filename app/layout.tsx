import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import { Providers } from '@/app/providers';
import clsx from 'clsx';
import { type ReactNode } from 'react';
import './globals.css';

const raleway = Raleway({
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-raleway',
});

export const metadata: Metadata = {
  title: {
    default: 'prepforge',
    template: `%s | prepforge`,
  },
  description: "It's a bank of interview questions",
  icons: [
    {
      rel: 'icon',
      url: '/favicon/favicon.ico',
      type: 'image/x-icon',
      sizes: 'any',
    },
    {
      rel: 'icon',
      url: '/favicon/favicon-32x32.png',
      type: 'image/png',
      sizes: '32x32',
    },
    {
      rel: 'apple-touch-icon',
      url: '/favicon/apple-touch-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={clsx(
          'text-foreground bg-background overflow-hidden min-w-[375px] min-h-[667px]',
          raleway.className,
          raleway.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
