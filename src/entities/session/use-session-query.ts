import { useQuery } from '@tanstack/react-query';

import { isApiError, queryKeys, useServices } from '@/shared/api';

import type { Session } from './model';
import type { A04Response, ApiPorts } from '@/shared/api';

/**
 * A-04 `GET /api/v1/session` → {@link Session} (P5-04b): the fields the router guards/shell read today, plus the raw
 * `navigation[]` for later. `role` is already validated against the known enum by the generated schema before this
 * runs, so it's passed through as-is (no client-side re-validation of something the contract already guarantees).
 */
export function mapSessionResponse(data: A04Response): Session {
  return {
    userId: data.user.id,
    displayName: data.user.displayName,
    role: data.role,
    hasAdminAccess: data.hasAdminAccess,
    canUseAssistant: data.permissions.canUseAssistant === true,
    navigation: data.navigation,
  };
}

/**
 * A-04 for components that want it reactively (loading/error included) — `null` on `UNAUTHENTICATED` (the http
 * client already redirected to `/login`; the caller just needs to stop rendering the signed-in UI), rethrown
 * otherwise. `Cache-Control: no-store` on the BFF side (A-04 doc): `staleTime: 0` mirrors that, always refetching on
 * mount/focus instead of trusting a cached copy.
 */
export function useSessionQuery() {
  const { auth } = useServices();
  return useQuery({
    queryKey: queryKeys.session(),
    queryFn: async ({ signal }) => {
      try {
        return mapSessionResponse(await auth.getSession({ signal }));
      } catch (error) {
        if (isApiError(error) && error.code === 'UNAUTHENTICATED') return null;
        throw error;
      }
    },
    staleTime: 0,
  });
}

/**
 * Non-reactive counterpart of {@link useSessionQuery}, for the one-shot fetch the app bootstraps with (before the
 * router — and its `SessionSource`-driven guards — can be created): same A-04 call, same `UNAUTHENTICATED` → `null`
 * mapping, no query cache involved.
 */
export async function fetchSession(services: Pick<ApiPorts, 'auth'>): Promise<Session | null> {
  try {
    return mapSessionResponse(await services.auth.getSession());
  } catch (error) {
    if (isApiError(error) && error.code === 'UNAUTHENTICATED') return null;
    throw error;
  }
}
