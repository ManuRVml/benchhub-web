import { setupWorker } from 'msw/browser';

import { scenarioHandlers } from './handlers';
import { scenarioFromSearch } from './scenarios';

import type { SetupWorker } from 'msw/browser';

/**
 * MSW browser worker for the dev server: the 48 operations in the scenario named by `?msw=<scenario>` (default ok).
 * Only for development with `VITE_API_MODE=mock`; it is never imported by the app bundle. Starting it needs
 * `public/mockServiceWorker.js` (`pnpm exec msw init public`), which is not committed yet.
 */
export async function startMockWorker(search = window.location.search): Promise<SetupWorker> {
  const worker = setupWorker(...scenarioHandlers(scenarioFromSearch(search)));
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  return worker;
}
