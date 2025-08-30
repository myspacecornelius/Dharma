import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';
import router from './routes';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
        {import.meta.env.DEV && (
          <React.Suspense fallback={null}>
            {React.createElement(
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require('@tanstack/react-query-devtools').ReactQueryDevtools,
              { initialIsOpen: false }
            )}
          </React.Suspense>
        )}
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
