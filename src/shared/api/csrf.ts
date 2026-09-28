import { z } from 'zod';

/**
 * The part of `GET /api/v1/session` the http client needs (BFF ADR-0004 §6). Contract 0.1.0 does not publish the
 * session endpoint yet, so this reads only `csrfToken` and ignores the other session fields; switch to the generated
 * schema when the contract adds it.
 */
export const sessionCsrfSchema = z.object({ csrfToken: z.string().min(1) });

export interface CsrfTokenStore {
  /** The current token, fetched from the session on first use; concurrent callers share one request. */
  get(): Promise<string>;
  /** Drops the token and fetches a new one (after a 403 CSRF_INVALID). */
  refresh(): Promise<string>;
  /** Forgets the token (sign-out, 401). */
  clear(): void;
}

/**
 * In-memory CSRF token store (synchronizer token, BFF ADR-0004 §6). The token lives only in this closure: never in
 * localStorage, sessionStorage or a cookie the page can read. A failed fetch is not cached, so the next call retries.
 */
export function createCsrfTokenStore(fetchToken: () => Promise<string>): CsrfTokenStore {
  let pending: Promise<string> | null = null;

  const load = (): Promise<string> => {
    const request = fetchToken();
    pending = request;
    request.catch(() => {
      if (pending === request) pending = null;
    });
    return request;
  };

  return {
    get: () => pending ?? load(),
    refresh: load,
    clear: () => {
      pending = null;
    },
  };
}
