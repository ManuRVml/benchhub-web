import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  API_BASE_URL,
  createHttpClient,
  createHttpPorts,
  ServiceContext,
  shouldRetry,
} from '@/shared/api';

import type { ServiceContainer } from '@/shared/api';
import type { ReactNode } from 'react';

/**
 * Test harness of the query hooks: the HTTP ports against the MSW server (src/test/msw, ok scenario by default) and a
 * fresh QueryClient with the app's retry policy and no retry delay.
 */
export function createQueryHarness() {
  const http = createHttpClient({ baseUrl: `${window.location.origin}${API_BASE_URL}` });
  const services: ServiceContainer = { ...createHttpPorts(http), http, mode: 'http' };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, retryDelay: 0, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ServiceContext.Provider>
    );
  }
  return { services, queryClient, wrapper };
}
