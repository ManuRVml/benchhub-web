import { useServices } from '@/shared/api';
import { routes } from '@/shared/config';

/**
 * "Salir" (A-03): calls the BFF logout, then reloads the app on the login route.
 *
 * The reload is deliberate: the session the router's guards read is resolved once at bootstrap (src/app/App.tsx), so a
 * client-side navigate to /login would still see the old session and the login guard would send the user back into
 * the app. A full navigation re-bootstraps the app, A-04 answers 401, and every cached query of the previous user is
 * dropped. The reload waits for A-03 to settle so the request is not cut short by the unload; it happens even when
 * A-03 fails, because the BFF destroys the session idempotently (A-03 doc) and the user asked to leave.
 */
export function useLogout(): () => Promise<void> {
  const { auth } = useServices();
  return async () => {
    try {
      await auth.logout();
    } catch {
      // Best-effort: leaving must not depend on the call succeeding.
    } finally {
      window.location.assign(routes.login.build());
    }
  };
}
