// Vitest setup (vitest.config.ts `setupFiles`): jest-dom matchers, Testing Library cleanup and the MSW node server.
// Unhandled requests fail the test, so every network call in a test is mocked on purpose.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
