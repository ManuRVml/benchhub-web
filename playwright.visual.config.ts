import { defineConfig, devices } from '@playwright/test';

// Visual regression (P5-73, ADR-0011): one full-page screenshot per screen, compared with the committed baselines in
// e2e/visual/__screenshots__/. Same two mock servers as playwright.config.ts (signed-in analyst_creator on E2E_PORT,
// signed-out on E2E_PORT+1 for SCR-01), fixed 1440x900 viewport, one worker. Baselines are rendered on this machine's
// Chromium; regenerate them with `pnpm test:visual --update-snapshots` only for an intended visual change.
const PORT = Number(process.env.E2E_PORT ?? 5173);
const SIGNED_OUT_PORT = PORT + 1;
const baseURL = `http://localhost:${String(PORT)}`;
const signedOutBaseURL = `http://localhost:${String(SIGNED_OUT_PORT)}`;
const viewport = { width: 1440, height: 900 };

export default defineConfig({
  testDir: './e2e/visual',
  testMatch: '**/*.visual.spec.ts',
  snapshotPathTemplate: 'e2e/visual/__screenshots__/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  // A full-page capture waits for two identical frames; on this shared, memory-bound machine that plus a cold lazy
  // route chunk can pass the 30s default with no defect behind it.
  timeout: 90000,
  reporter: 'list',
  expect: { timeout: 20000 },
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'visual-signed-in',
      testIgnore: '**/login.visual.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport, baseURL },
    },
    {
      name: 'visual-signed-out',
      testMatch: '**/login.visual.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport, baseURL: signedOutBaseURL },
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
