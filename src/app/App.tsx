import { RouterProvider } from 'react-router/dom';

import { fetchSession } from '@/entities/session';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import {
  createQueryClient,
  createServiceContainer,
  QueryProvider,
  resolveApiMode,
  ServiceProvider,
} from './providers';
import { createAppRouter } from './router';
import { getMockSession } from './session';

import type { ComponentType } from 'react';

/**
 * Builds the app once: the service container, the session the router's guards read, and the router itself, all
 * created a single time (never per-render — the caller renders the returned component, it does not call this
 * again). Async because the session comes from the real A-04 call in http mode (P5-04b); mock mode keeps its
 * current, synchronous identity unchanged (VITE_MOCK_ROLE), so the e2e signed-in/signed-out servers keep working.
 * `SessionSource` itself stays synchronous — the route guards read it many times per navigation, they can't each
 * await a fetch — so the session is resolved once, here, before the router (and its guards) exist.
 */
export async function createApp(): Promise<ComponentType> {
  // Use a mutable wrapper to hold the router so the onUnauthenticated callback can access it after it's assigned.
  // In http mode, the A-04 401 handler (onUnauthenticated) can be invoked during the fetchSession await,
  // before `router` is assigned. The callback checks `routerRef.current` which starts undefined.
  const routerRef: { current: ReturnType<typeof createAppRouter> | undefined } = {
    current: undefined,
  };

  const services = await createServiceContainer({
    mode: resolveApiMode(import.meta.env.VITE_API_MODE),
    onUnauthenticated: () => {
      const router = routerRef.current;
      if (router) {
        const { pathname, search } = router.state.location;
        void router.navigate(routes.login.build({}, { returnTo: `${pathname}${search}` }));
      }
    },
  });

  // A 401 is not a failure: fetchSession maps it to a null session and the router's guards send the user to the
  // login route. Only a thrown error (5xx, network) means the bootstrap failed and gets the full-page error below.
  let session = null as ReturnType<typeof getMockSession> | null;
  let bootstrapFailed = false;

  try {
    session = services.mode === 'mock' ? getMockSession() : await fetchSession(services);
  } catch {
    bootstrapFailed = true;
  }

  if (bootstrapFailed) {
    return function ErrorApp() {
      const t = useT();
      return (
        <ServiceProvider services={services}>
          <QueryProvider client={createQueryClient()}>
            <div
              className="min-h-screen bg-surface-page"
              role="alert"
              aria-label={t('common.section.error.title')}
            >
              <SectionErrorPanel
                testId="bootstrap-error"
                retryTestId="bootstrap-retry"
                errorCode="INTERNAL_ERROR"
                title={t('common.section.error.title')}
                retryLabel={t('common.section.error.retry')}
                onRetry={() => {
                  window.location.reload();
                }}
              />
            </div>
          </QueryProvider>
        </ServiceProvider>
      );
    };
  }

  const router = createAppRouter(() => session);
  routerRef.current = router;

  // Root component of the FSD `app` layer: the service container and the query cache around the data router (P2-W06,
  // P5-01, P5-04b). i18n is initialised by `@/shared/i18n` on import.
  return function App() {
    return (
      <ServiceProvider services={services}>
        <QueryProvider client={createQueryClient()}>
          <RouterProvider router={router} />
        </QueryProvider>
      </ServiceProvider>
    );
  };
}
