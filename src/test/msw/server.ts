import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW node server for vitest (jsdom), started and reset by tools/test/setup.ts. It answers every 0.1.0 operation in the
 * ok scenario; tests switch one with `server.use(...scenarioHandlers('error'))` or add their own handlers.
 */
export const server = setupServer(...handlers);
