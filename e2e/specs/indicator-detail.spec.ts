import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { IndicatorDetailPage } from '../pages/IndicatorDetailPage';

import type { Locator } from '@playwright/test';

// SCR-10 Detalle de indicador (V-24, a "pending view" mirror — fetchPendingView reads the docs fixture directly in
// mock mode, ids ignored). ROACE (ind_roace) is the fixture's indicator.
const ANALYSIS_ID = 'ana_e2e_smoke';
const INDICATOR_ID = 'ind_roace';

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('element has no bounding box');
  return rect;
}

test('renders KPIs, the series chart, traceability and comments', async ({ page }) => {
  const detail = new IndicatorDetailPage(page);
  await detail.goto(ANALYSIS_ID, INDICATOR_ID);

  await expect(detail.root).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /ROACE/ })).toBeVisible();
  await expect(detail.kpiEcopetrol).toBeVisible();
  await expect(detail.kpiPeerAverage).toBeVisible();
  await expect(detail.kpiGeVsAverage).toBeVisible();
  await expect(detail.chartCard).toBeVisible();
  await expect(detail.traceabilityCard).toBeVisible();
  await expect(detail.commentsCard).toBeVisible();
});

test('follows the prototype frame at 1440px: left column, KPI row, 4-column traceability', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const detail = new IndicatorDetailPage(page);
  await detail.goto(ANALYSIS_ID, INDICATOR_ID);
  await expect(detail.kpiEcopetrol).toBeVisible();

  // One h1 per page: the app shell header.
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const root = await box(detail.root);
  // Left-aligned in the content frame (the prototype starts at x = 252), not centred (x = 340).
  expect(root.x).toBeLessThan(300);
  expect(root.width).toBeLessThanOrEqual(980);
  const kpis = await Promise.all(
    [detail.kpiEcopetrol, detail.kpiPeerAverage, detail.kpiGeVsAverage].map(box),
  );
  expect(new Set(kpis.map((kpi) => Math.round(kpi.y))).size).toBe(1);
  await expect(detail.traceabilityGrid).toBeVisible();
  const grid = await box(detail.traceabilityGrid);
  // Third cell ("Historial") of a 4-column grid starts at half the width (at two thirds with 3 columns).
  const history = await box(detail.historyToggle);
  expect(history.x - grid.x).toBeLessThan(grid.width * 0.6);
});

test('Detalle de indicador has no serious or critical accessibility violations', async ({
  page,
}) => {
  const detail = new IndicatorDetailPage(page);
  await detail.goto(ANALYSIS_ID, INDICATOR_ID);
  await expect(detail.kpiEcopetrol).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
