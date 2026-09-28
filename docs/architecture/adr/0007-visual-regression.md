# ADR-0007: Visual regression — baselines from prototype renders, Playwright screenshot tests

## Status

Accepted; decisions 1, 3, 4 and the tolerance superseded by [ADR-0011](0011-visual-regression-baselines.md).

## Context

Visual regression testing ensures the implementation matches the prototype. The decision must balance accuracy (prototype vs handoff JPEGs), test speed, and maintenance effort.

Constraints:
- Baselines must be the P1-03 prototype renders, not handoff JPEGs.
- Playwright's `toHaveScreenshot` for assertion.
- Per-screen mask files for dynamic content.
- Animations disabled during tests.
- `maxDiffPixelRatio: 0.02` for tolerance.

Sources: `PLAN.md` §9, `.plan/probes/iris/feasibility.md` §1.4, `prompt_Start_Eco.md` L503.

## Decision

1. **Baseline source**: Prototype renders in `docs/design/screenshots/prototype/` (PNG exports from the P1-03 prototype).

2. **Test runner**: Playwright with `@playwright/test`:
   ```ts
   // tests/visual/SCR-01-login.spec.ts
   import { test, expect } from '@playwright/test';

   test('SCR-01 login matches baseline', async ({ page }) => {
     await page.goto('/login');
     await expect(page).toHaveScreenshot('SCR-01-login.png', {
       maxDiffPixelRatio: 0.02,
       mask: [page.locator('[data-testid="dynamic-content"]')],
     });
   });
   ```

3. **Mask files**: Per-screen mask definitions in `tests/visual/masks/`:
   ```ts
   // tests/visual/masks/SCR-01-login.ts
   export const masks = [
     '[data-testid="dynamic-content"]',
     '[data-testid="timestamp"]',
   ];
   ```

4. **Animation disabling**: Set `animation-duration: 0s` in test environment CSS.

5. **Yarbis FAB masking**: The floating action button is masked in all tests (not compared).

6. **CI integration**: `pnpm test:visual` runs all screenshot tests; fails on any diff > 2%.

## Alternatives considered

- **Handoff JPEGs as baselines**: Less accurate; prototype renders match implementation more closely.
- **Pixel-diff tools (Chromatic, Applitools)**: Requires external service; overkill for v1.
- **Manual visual inspection**: No automated regression detection.

## Consequences

- Positive: Catches unintended visual changes before merge.
- Positive: Prototype-based baselines match the actual implementation target.
- Positive: Mask files handle dynamic content gracefully.
- Negative: Initial setup requires capturing all prototype renders.
- Negative: Tests may flake on different screen sizes; CI must pin viewport.
