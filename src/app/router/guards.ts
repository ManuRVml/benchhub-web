import { redirect } from 'react-router';

import { ACCESS } from './access';

import type { SessionSource } from '@/entities/session';
import type { RouteKey } from '@/shared/config';
import type { LoaderFunctionArgs } from 'react-router';

/**
 * Route loader that applies the access policy of `key` before the page loads. Stub guard: it reads the session from
 * `getSession` (a mock until P5-01 wires `GET /api/v1/session`).
 */
export const guardLoader =
  (key: RouteKey, getSession: SessionSource) =>
  ({ request }: LoaderFunctionArgs): Response | null => {
    const decision = ACCESS[key](getSession(), new URL(request.url));
    return decision.kind === 'redirect' ? redirect(decision.to) : null;
  };
