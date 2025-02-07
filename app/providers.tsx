'use client';

import { AuthProvider } from '@/app/contexts/auth';
import { ThemeProvider } from '@/app/contexts/theme';
import { ToastProvider } from '@/app/contexts/toast';
import { getQueryClient } from '@/app/get-query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode } from 'react';

export default function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
