import { ApiError, createHttpClient, createHttpPorts, ServiceContext } from '@/shared/api';

import type { ApiMode, HttpClient, ServiceContainer } from '@/shared/api';
import type { ReactNode } from 'react';

// `ServiceContainer`, `ApiMode` and `useServices` live in `@/shared/api` (entity hooks read them); re-exported here.
export { useServices, type ApiMode, type ServiceContainer } from '@/shared/api';

/** `VITE_API_MODE`: `http` talks to the BFF; anything else (default `mock`, `.env.example`) uses the mock adapters. */
export const resolveApiMode = (value: string | undefined): ApiMode =>
  value === 'http' ? 'http' : 'mock';

/**
 * Raw client of `mock` mode: there is no BFF, so every call rejects with `ApiError { code: 'MOCK_NOT_IMPLEMENTED' }`.
 * The ports use the in-memory mock adapters instead (P5-03), which return the fixtures validated by the contract.
 */
function createMockHttpStub(): HttpClient {
  const reject = (): Promise<never> =>
    Promise.reject(
      new ApiError({
        code: 'MOCK_NOT_IMPLEMENTED',
        message: 'No BFF in mock mode: use the ports',
        traceId: '',
        status: 0,
      }),
    );
  return { get: reject, post: reject, put: reject, patch: reject, delete: reject };
}

export interface ServiceContainerOptions {
  mode: ApiMode;
  /** 401 handler of the http client; the app navigates to the login route (routes.ts). */
  onUnauthenticated: () => void;
}

/**
 * Async because the mock adapters (and the contract fixtures behind them) are loaded with a dynamic import() inside a
 * branch Vite folds away when VITE_API_MODE=http: an http build never emits them (`pnpm check:http-bundle`).
 */
export async function createServiceContainer({
  mode,
  onUnauthenticated,
}: ServiceContainerOptions): Promise<ServiceContainer> {
  if (import.meta.env.VITE_API_MODE !== 'http' && mode === 'mock') {
    const { createMockPorts } = await import('@/shared/api/mock');
    return { ...createMockPorts(), http: createMockHttpStub(), mode };
  }
  const http = createHttpClient({ onUnauthenticated });
  return { ...createHttpPorts(http), http, mode };
}

export interface ServiceProviderProps {
  services: ServiceContainer;
  children: ReactNode;
}

/** Provides the service container to the tree (App wraps the router with it). */
export function ServiceProvider({ services, children }: ServiceProviderProps) {
  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}
