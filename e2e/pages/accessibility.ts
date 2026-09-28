import { AxeBuilder } from '@axe-core/playwright';

import type { Page } from '@playwright/test';

export interface AxeViolationSummary {
  readonly id: string;
  readonly impact: string | null | undefined;
}

/**
 * Serious/critical axe violations of `page`, measured on the settled page: running CSS transitions/animations are
 * awaited first, because axe computes contrast from the current (mid-transition) colours and reported 1.25:1 on the
 * 403 page of the production build while its final colours pass (e2e validation finding F18).
 */
export async function seriousOrCriticalViolations(page: Page): Promise<AxeViolationSummary[]> {
  // A string expression: it runs in the browser, and the e2e tsconfig has no DOM lib.
  await page.waitForFunction(
    "document.getAnimations().every((animation) => animation.playState !== 'running')",
  );
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({ id: violation.id, impact: violation.impact }));
}
