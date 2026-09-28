import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (brief §2.4): Playwright + @axe-core/playwright, specs under e2e/specs, page objects under
// e2e/pages. The web server is the Vite dev server (P2-W01b); tests run against VITE_API_MODE=mock so they do not
// need the BFF.
//
// `E2E_PORT` (default 5173) picks the port of both servers below, so a run never collides with another worktree's dev
// server on 5173 (reuseExistingServer would otherwise silently test the wrong code): run e.g.
// `E2E_PORT=5199 pnpm test:e2e`.
//
// The app's mock session (src/app/session.ts) is fixed for the whole process by VITE_MOCK_ROLE / VITE_MOCK_ADMIN, read
// once at server start — it cannot be swapped per test against one running server. Login (SCR-01) only ever renders
// when there is no session (`ACCESS.login` redirects away otherwise), so it needs its own server with
// VITE_MOCK_ROLE=none; every other spec uses the default signed-in mock (analyst_creator, no admin access).
const PORT = Number(process.env.E2E_PORT ?? 5173);
const SIGNED_OUT_PORT = PORT + 1;
const baseURL = `http://localhost:${String(PORT)}`;
const signedOutBaseURL = `http://localhost:${String(SIGNED_OUT_PORT)}`;

// e2e/stack (playwright.stack.config.ts, real BFF) and e2e/visual (playwright.visual.config.ts, its own baselines) have
// their own configs; this mock config runs only e2e/specs. A project-level testIgnore replaces a top-level one, so
// both projects list it.
const OTHER_CONFIG_SPECS = ['**/e2e/stack/**', '**/e2e/visual/**'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  // This machine runs several consoles/orchestrators concurrently (memory-bound, shared); under contention (e.g. a
  // parallel full vitest run) a page's first response can take much longer than the 5s default, with no real defect
  // behind it. 20s absorbs that without hiding a genuinely broken page (which stays broken well past 20s too).
  expect: { timeout: 20000 },
  // The first page of a cold dev server compiles the whole module graph; on this machine that first `page.goto` alone
  // can pass the 30s default (seen on login.spec.ts's first test, on task/F1-A as well: ~58s), with no defect behind
  // it. Same 90s budget as playwright.visual.config.ts.
  timeout: 90000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'signed-in',
      testIgnore: ['**/login.spec.ts', ...OTHER_CONFIG_SPECS],
      use: { ...devices['Desktop Chrome'], baseURL },
    },
    {
      name: 'signed-out',
      testMatch: '**/login.spec.ts',
      testIgnore: OTHER_CONFIG_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL: signedOutBaseURL },
    },
  ],
  webServer: [
    {
      command: `pnpm dev --port ${String(PORT)} --strictPort`,
      url: baseURL,
      env: { VITE_API_MODE: 'mock' },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm dev --port ${String(SIGNED_OUT_PORT)} --strictPort`,
      url: signedOutBaseURL,
      env: { VITE_API_MODE: 'mock', VITE_MOCK_ROLE: 'none' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
