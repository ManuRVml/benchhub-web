import { ApiError } from '../../errors';

// A-05 mock password login (owner decision 2026-09-28): the one credential pair the mock BFF accepts by default
// (MOCK_LOGIN_USERNAME / MOCK_LOGIN_PASSWORD), mirrored here so `VITE_API_MODE=mock` and the MSW handlers behave the
// same. Mock-only: this module is reached only through `@/shared/api/mock`, never by an `http` build.

export const MOCK_LOGIN_CREDENTIALS = {
  username: 'ecopetrol@ecopetrol.com',
  password: 'ecopetrol',
} as const;

/** The generic A-05 401 body: the same for a wrong password and an unknown user. */
export const INVALID_CREDENTIALS_MESSAGE = 'The username or password is incorrect';

/** As the BFF compares them: username case-insensitive after trim, password exact. */
export function mockCredentialsMatch(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === MOCK_LOGIN_CREDENTIALS.username &&
    password === MOCK_LOGIN_CREDENTIALS.password
  );
}

/** The error the HTTP adapter raises for the BFF's 401 `INVALID_CREDENTIALS`. */
export function invalidCredentialsError(traceId = 'mock'): ApiError {
  return new ApiError({
    code: 'INVALID_CREDENTIALS',
    message: INVALID_CREDENTIALS_MESSAGE,
    traceId,
    status: 401,
  });
}
