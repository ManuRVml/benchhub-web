import { useServices } from '@/shared/api';

import type { A05Response } from '@/shared/api';

export interface PasswordCredentials {
  username: string;
  password: string;
}

/**
 * SCR-01 "Ingresar" with a password (A-05, owner decision 2026-09-28; mock BFF only). The body carries both fields
 * (never the URL); the username is trimmed as the BFF compares it. Resolves with the A-04 session the BFF just
 * established (session cookie set); rejects with the `ApiError` of the call (401 `INVALID_CREDENTIALS` for wrong
 * credentials, without the app's global 401 handling).
 */
export function usePasswordLogin(): (credentials: PasswordCredentials) => Promise<A05Response> {
  const { auth } = useServices();
  return ({ username, password }) => auth.passwordLogin({ username: username.trim(), password });
}
