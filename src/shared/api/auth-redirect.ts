import { encodeQueryValue } from '@/shared/lib/url';

import { API_BASE_URL } from './http-client';

/**
 * Path of A-01 (login redirect, BFF ADR-0004) below the API root. The auth endpoints A-01..A-04 are not in contract
 * 0.1.0, so this is the one place that spells the login path; `loginRedirectUrl` builds the full URL from it.
 */
export const AUTH_LOGIN_PATH = '/auth/login';

/** Same-origin relative path (`/…`, not `//…` nor `/\…`): the only `returnTo` the BFF accepts (open-redirect guard). */
export const isInAppPath = (value: string | null | undefined): value is string =>
  typeof value === 'string' && /^\/(?![/\\])/.test(value);

export interface LoginRedirectParams {
  /** In-app route to open after login; anything that is not an in-app path is dropped (the BFF defaults to /inicio). */
  returnTo?: string | null | undefined;
  /** Username or corporate email typed on SCR-01, forwarded to Entra as `login_hint`; trimmed, dropped when empty. */
  loginHint?: string | null | undefined;
}

/**
 * URL of A-01 `GET /api/v1/auth/login?returnTo=&loginHint=` (A-01 query schema: `returnTo`, `loginHint`). The browser
 * navigates to it (full-page redirect to the IdP), it is never fetched.
 */
export function loginRedirectUrl({ returnTo, loginHint }: LoginRedirectParams): string {
  const query = new URLSearchParams();
  if (isInAppPath(returnTo)) query.set('returnTo', returnTo);
  const hint = encodeQueryValue(loginHint?.trim());
  if (hint !== null) query.set('loginHint', hint);
  const text = query.toString();
  return `${API_BASE_URL}${AUTH_LOGIN_PATH}${text ? `?${text}` : ''}`;
}

/** Full-page navigation (leaves the SPA). Injected into the login page so tests can observe it. */
export function assignLocation(url: string): void {
  window.location.assign(url);
}
