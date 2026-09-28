import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { SensitivitiesPage } from '../pages/SensitivitiesPage';

import type { Locator } from '@playwright/test';

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('element has no bounding box');
  return rect;
}

// SCR-12 Sensibilidades: §1 indicator pills + levers (V-37, fetchPendingView), §2-6 scenario presets + sliders (V-38),
// §7 strategic plan (V-39) — all genuinely-pending views wired correctly through fetchPendingView.
test('the ROACE indicator pill is selected and its levers render', async ({ page }) => {
  const sensitivities = new SensitivitiesPage(page);
  await sensitivities.goto();
  await expect(sensitivities.root).toBeVisible();
  await expect(sensitivities.driversCard).toBeVisible();

  const roacePill = sensitivities.indicatorPill('ind-roace');
  await expect(roacePill).toHaveAttribute('aria-pressed', 'true');
  await expect(sensitivities.lever('lev_energy_cost')).toBeVisible();
});

test('loading a scenario preset updates the simulation sliders', async ({ page }) => {
  const sensitivities = new SensitivitiesPage(page);
  await sensitivities.goto();
  await expect(sensitivities.weightSimulator).toBeVisible();

  const productivity = sensitivities.variableSlider('productivity');
  await expect(productivity).toHaveAttribute('aria-valuenow', '0');

  await sensitivities.preset('optimistic').click();

  await expect(productivity).toHaveAttribute('aria-valuenow', '5');
  await expect(sensitivities.variableSlider('operating_costs')).toHaveAttribute(
    'aria-valuenow',
    '-5',
  );
});

test('follows the prototype column at 1440px: 840px, left-aligned, drivers card first', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const sensitivities = new SensitivitiesPage(page);
  await sensitivities.goto();
  await expect(sensitivities.driversCard).toBeVisible();

  // One h1 per page: the app shell header "Sensibilidades".
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const root = await box(sensitivities.root);
  const card = await box(sensitivities.driversCard);
  expect(root.width).toBeLessThanOrEqual(840);
  expect(root.x).toBeLessThan(300);
  expect(Math.abs(card.y - root.y)).toBeLessThan(2);
  await expect(sensitivities.targetGap).toBeVisible();
});

test('Sensibilidades has no serious or critical accessibility violations', async ({ page }) => {
  const sensitivities = new SensitivitiesPage(page);
  await sensitivities.goto();
  await expect(sensitivities.strategicPlanCard).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
