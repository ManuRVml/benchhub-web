import type { CallOptions, CompleteLoginOptions, StartLoginOptions } from './call-options';
import type { A01Response, A02Response, A03Response, A04Response, A05Response } from './responses';
import type { A05Request } from '../generated/model';

// Auth port (brief §4.3): the BFF's token-handler flow (A-01/A-02) is a full-page browser redirect chain, never
// fetched by the SPA — see docs/design/view-data-contracts/A-01-auth-login.md / A-02-auth-callback.md. Their methods
// exist for contract completeness (`pnpm contract:adapters`) and tests; they are never fetched in production. A-03/A-04
// are real fetches: logout (a POST with no meaningful body) and the session query the app boots with. A-05 is the
// mock password login of the owner decision of 2026-09-28 (SCR-01 "Ingresar"): a JSON POST that needs no session and
// no CSRF token, the password travelling only in the body.
export interface AuthPort {
  /** A-01 — login redirect (Entra ID). Never called by fetch in production; see the module comment above. */
  startLogin(options?: StartLoginOptions): Promise<A01Response>;
  /** A-02 — login callback. Called by the IdP's browser redirect, never by the SPA; see the module comment above. */
  completeLogin(state: string, options?: CompleteLoginOptions): Promise<A02Response>;
  /** A-03 — logout: destroys the server session, `204 No Content` on success. */
  logout(options?: CallOptions): Promise<A03Response>;
  /** A-04 — the signed-in session: user, role, navigation and global permissions. */
  getSession(options?: CallOptions): Promise<A04Response>;
  /**
   * A-05 — password login (mock BFF only): sets the session cookie and returns the A-04 session. Wrong credentials
   * reject with `ApiError { status: 401, code: 'INVALID_CREDENTIALS' }`, without the global 401 handling.
   */
  passwordLogin(body: A05Request, options?: CallOptions): Promise<A05Response>;
}
