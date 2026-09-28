import { createContext, useContext } from 'react';

import type { Session } from './model';

/**
 * Session of the signed-in user for the pages inside the app shell (SCR-04 layout route provides it from its loader).
 * `null` outside the shell or when signed out.
 */
export const SessionContext = createContext<Session | null>(null);

/** The current session, or `null`; pages gate role-specific actions on `session.role`. */
export function useSession(): Session | null {
  return useContext(SessionContext);
}
