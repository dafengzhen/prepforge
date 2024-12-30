import type { Metadata } from 'next';

import '@/app/styles/globals.scss';
import Providers from '@/app/providers';
import { getPublicPath } from '@/app/tools';
import clsx from 'clsx';
import { Raleway } from 'next/font/google';
import { type ReactNode } from 'react';

const publicPath = getPublicPath();

const raleway = Raleway({
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-raleway',
});

export const metadata: Metadata = {
  description:
    "Prepforge is a tool designed to help you prepare for interviews efficiently. It allows users to customize, manage, and optimize their personal interview question banks. Whether you're preparing for technical interviews or non-technical job applications, Prepforge provides the support you need.",
  icons: [
    {
      rel: 'icon',
      sizes: 'any',
      type: 'image/x-icon',
      url: publicPath + '/favicon/favicon.ico',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
      url: publicPath + '/favicon/favicon-32x32.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      type: 'image/png',
      url: publicPath + '/favicon/apple-touch-icon.png',
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
