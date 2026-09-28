import { expect } from '@playwright/test';

import type { Page } from '@playwright/test';

/**
 * Wait for a page object's root testid after navigation, generous enough to absorb a cold lazy route chunk under a
 * heavily-loaded dev server (several consoles/orchestrators sharing this machine, sometimes running a full parallel
 * vitest suite too) with no real defect behind it. playwright.config.ts's `expect.timeout` covers ordinary
 * assertions; this is its own explicit budget for a page's very first content, the one most exposed to a slow lazy
 * chunk compile, independent of that shared default.
 */
export const READY_TIMEOUT_MS = 20000;

/** Navigates to `url` and waits for `rootTestId` to render; every page object's `goto()` funnels through this. */
export async function gotoAndWaitReady(
  page: Page,
  url: string,
  rootTestId: string,
  timeout: number = READY_TIMEOUT_MS,
): Promise<void> {
  await page.goto(url);
  await expect(page.getByTestId(rootTestId)).toBeVisible({ timeout });
}
