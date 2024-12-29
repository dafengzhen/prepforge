import type { Metadata } from 'next';

import '@/app/styles/globals.scss';
import Providers from '@/app/providers';
import clsx from 'clsx';
import { Raleway } from 'next/font/google';
import { type ReactNode } from 'react';

const raleway = Raleway({
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-raleway',
});

export const metadata: Metadata = {
  description: "It's a bank of interview questions",
  icons: [
    {
      rel: 'icon',
      sizes: 'any',
      type: 'image/x-icon',
      url: '/favicon/favicon.ico',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
      url: '/favicon/favicon-32x32.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      type: 'image/png',
      url: '/favicon/apple-touch-icon.png',
    },
  ],
  title: {
    default: 'prepforge',
    template: `%s | prepforge`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html data-bs-theme="light" lang="en">
      <body className={clsx(raleway.className, raleway.variable, 'bg-body-tertiary')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
