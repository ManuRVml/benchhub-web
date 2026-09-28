import type { Locator, Page } from '@playwright/test';

/**
 * Per-screen mask allowlist for the visual baselines (ADR-0011). A mask hides a region from the pixel comparison, so it
 * is an escape hatch and is kept to regions that are dynamic by design and cannot be made deterministic otherwise.
 * Relative dates ("hace 2 días") are NOT masked: screens.visual.spec.ts freezes the clock instead (FROZEN_NOW). Every
 * entry needs a one-line reason; outside the masks the diff must stay within MAX_DIFF_PIXEL_RATIO.
 */
export interface MaskEntry {
  readonly locate: (page: Page) => Locator;
  readonly reason: string;
}

/** Keyed by the screenshot id (the PNG name without extension). A screen with no entry has no mask. */
export const SCREEN_MASKS: Readonly<Record<string, readonly MaskEntry[]>> = {};

/**
 * Tolerance outside the masks: 0.1% of the page's pixels. Enough for sub-pixel anti-aliasing noise in text and chart
 * strokes between two renders on the same Chromium; a real regression (a colour, a spacing, a missing element) moves
 * far more pixels than that on a 1440px-wide page.
 */
export const MAX_DIFF_PIXEL_RATIO = 0.001;

export function masksFor(page: Page, screenId: string): Locator[] {
  return (SCREEN_MASKS[screenId] ?? []).map((entry) => entry.locate(page));
}
