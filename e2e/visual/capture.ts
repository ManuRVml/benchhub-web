import { MAX_DIFF_PIXEL_RATIO, masksFor } from './masks';

import type { Page, PageAssertionsToHaveScreenshotOptions } from '@playwright/test';

/** Fixed "now" for every visual run, so relative dates render the same text on any day. */
export const FROZEN_NOW = new Date('2026-09-27T15:00:00-05:00');

/** Call before the first navigation: Date.now() inside the app then returns FROZEN_NOW (timers keep running). */
export async function freezeClock(page: Page): Promise<void> {
  await page.clock.setFixedTime(FROZEN_NOW);
}

/** Resolves once the page's web fonts are loaded, so text metrics match the baseline. (A string expression: the e2e
 * tsconfig has no DOM lib.) */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate('document.fonts.ready.then(() => true)');
}

/** Unroll the app shell scroll so `toHaveScreenshot({ fullPage: true })` captures the full content.
 * Sets overflow='visible', height='auto', maxHeight='none' on scrollable elements and fixed-height ancestors. */
export async function unrollScroll(page: Page): Promise<void> {
  await page.evaluate(`(() => {
    const scrollableElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = getComputedStyle(el);
      const isOverflow = style.overflowY === 'auto' || style.overflowY === 'scroll';
      return isOverflow && el.scrollHeight > el.clientHeight;
    });

    scrollableElements.forEach(el => {
      el.style.overflow = 'visible';
      el.style.height = 'auto';
      el.style.maxHeight = 'none';

      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (
          style.height === '100vh' ||
          ancestor.classList.contains('h-screen') ||
          ancestor.getBoundingClientRect().height === window.innerHeight
        ) {
          ancestor.style.height = 'auto';
          ancestor.style.maxHeight = 'none';
        }
      }
    });
  })()`);
}

/** The comparison options every baseline uses: full page, no animations or caret, the tolerance and the masks. */
export function screenOptions(page: Page, screenId: string): PageAssertionsToHaveScreenshotOptions {
  return {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
    mask: masksFor(page, screenId),
  };
}
