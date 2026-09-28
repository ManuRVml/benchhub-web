import { AUTH_LOGIN_PATH } from '../../auth-redirect';
import {
  CompleteLoginResponse,
  GetSessionResponse,
  PasswordLoginResponse,
  StartLoginResponse,
} from '../../generated/zod';
import { SESSION_ENDPOINT } from '../../http-client';
import { LogoutSuccessSchema } from '../../ports/response-schemas';

import type { HttpClient } from '../../http-client';
import type { AuthPort } from '../../ports';

const AUTH_CALLBACK_PATH = '/auth/callback';
const AUTH_LOGOUT_PATH = '/auth/logout';
const AUTH_PASSWORD_LOGIN_PATH = '/auth/password-login';

/**
 * HTTP adapter of {@link AuthPort}. `startLogin`/`completeLogin` are wired for contract completeness
 * (`pnpm contract:adapters`) and tests only — see the port's own module comment for why the app never calls them
 * with `fetch`.
 */
export function createAuthHttpAdapter(http: HttpClient): AuthPort {
  return {
    /** @operation startLogin */
    startLogin: ({ returnTo, loginHint, ...options } = {}) =>
      http.get(AUTH_LOGIN_PATH, {
        ...options,
        ...(returnTo || loginHint ? { query: { returnTo, loginHint } } : {}),
        schema: StartLoginResponse,
      }),
    /** @operation completeLogin */
    completeLogin: (state, { code, error, error_description, ...options } = {}) =>
      http.get(AUTH_CALLBACK_PATH, {
        ...options,
        query: { state, code, error, error_description },
        schema: CompleteLoginResponse,
      }),
    /** @operation logout */
    logout: (options) =>
      http.post(AUTH_LOGOUT_PATH, {}, { ...options, schema: LogoutSuccessSchema }),
    /** @operation getSession */
    getSession: (options) => http.get(SESSION_ENDPOINT, { ...options, schema: GetSessionResponse }),
    /** @operation passwordLogin */
    passwordLogin: (body, options) =>
      http.post(AUTH_PASSWORD_LOGIN_PATH, body, {
        ...options,
        schema: PasswordLoginResponse,
        anonymous: true,
      }),
  };
}
