'use client';

import { NextUIProvider } from '@nextui-org/react';
import { type ReactNode } from 'react';
import { getQueryClient } from '@/app/get-query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          {children}
          <Toaster
            toastOptions={{
              className: '!text-foreground !bg-background',
            }}
          />
        </NextThemesProvider>
      </NextUIProvider>
    </QueryClientProvider>
  );
}
