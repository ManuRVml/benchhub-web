import { defineConfig, devices } from '@playwright/test';

/**
 * Stack e2e configuration for local full-stack testing (web + BFF mock container).
 *
 * Uses environment variable STACK_URL (default http://127.0.0.1:8088) as baseURL.
 * Three projects:
 * - stack-setup: auth flow that saves storageState to test-results/stack-auth.json
 * - stack: signed-in tests (ignores login.spec.ts), uses stored auth
 * - stack-signed-out: login tests only, no auth
 */
const baseURL = process.env.STACK_URL ?? 'http://127.0.0.1:8088';

// e2e/visual has its own config (playwright.visual.config.ts) and baselines; this stack config runs only e2e/specs and
// e2e/stack. A project-level testIgnore replaces a top-level one, so every project lists it.
const VISUAL_SPECS = '**/e2e/visual/**';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  expect: { timeout: 20000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'stack-setup',
      testMatch: 'e2e/stack/auth.setup.ts',
      testIgnore: VISUAL_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL },
    },
    {
      name: 'stack',
      dependencies: ['stack-setup'],
      testIgnore: ['**/login.spec.ts', VISUAL_SPECS],
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
        storageState: 'test-results/stack-auth.json',
      },
    },
    {
      name: 'stack-signed-out',
      testMatch: '**/login.spec.ts',
      testIgnore: VISUAL_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL },
    },
  ],
  // No webServer: the stack runs externally via podman compose
});
