import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { shouldRetry, STALE_TIMES } from '@/shared/api';

import type { ReactNode } from 'react';

/**
 * Query client of the app (ADR-0005): ApiError-aware retries (a 4xx or an invalid payload is never retried), views
 * fresh for 30 s by default (hooks set their own `STALE_TIMES`), no refetch on window focus for the heavy analysis
 * views, and mutations never retried (commands are not idempotent in general).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: STALE_TIMES.view,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

export interface QueryProviderProps {
  /** Injected in tests; the app builds one client for its lifetime. */
  client: QueryClient;
  children: ReactNode;
}

/** TanStack Query provider; App.tsx mounts it inside ServiceProvider, around the router. */
export function QueryProvider({ client, children }: QueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
