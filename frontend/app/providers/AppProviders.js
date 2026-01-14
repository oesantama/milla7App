'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ConfirmProvider } from '../components/ConfirmDialog';
import { useState } from 'react';

/**
 * Providers centralizados de la aplicación
 */
export default function AppProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
