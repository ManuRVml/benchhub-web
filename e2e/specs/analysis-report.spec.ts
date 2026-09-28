import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AnalysisReportPage } from '../pages/AnalysisReportPage';

import type { Locator } from '@playwright/test';

// SCR-09 Visualización: the mock adapter answers the same V-20 fixture for any analysis id.
const ANALYSIS_ID = 'ana_e2e_smoke';

test('renders the header, KPIs, and the ranking/category URL state', async ({ page }) => {
  const report = new AnalysisReportPage(page);
  await report.goto(ANALYSIS_ID);
  await expect(report.position).toBeVisible();
  await expect(report.kpiTile('fin')).toBeVisible();
  await expect(page.getByTestId('visualization-comparison-profiles-card')).toBeVisible();

  await report.rankingDimensionChip('op').click();
  await expect(page).toHaveURL(/[?&]ranking=op/);

  await report.categoryCard('solvencia').click();
  await expect(page).toHaveURL(/[?&]categoria=solvencia/);
  await expect(report.categoryCard('solvencia')).toHaveAttribute('aria-pressed', 'true');
});

test('clicking a heatmap company name opens its company profile', async ({ page }) => {
  const report = new AnalysisReportPage(page);
  await report.goto(ANALYSIS_ID);
  await expect(report.heatmapDataTable).toHaveCount(1);

  // The accessible data table is `sr-only` by design (EChart's own screen-reader/keyboard alternative to the
  // canvas, never meant to be seen or mouse-clicked): activate it the way a keyboard/screen-reader user would.
  await report.heatmapCompanyButton('BP').focus();
  await page.keyboard.press('Enter');

  // getCompanyProfileView is mocked with one static V-25 fixture regardless of companyId (Chevron) — what's under
  // test is that the click opens *a* profile at all, not which company it names.
  await expect(report.companyProfileModal).toBeVisible();
  await expect(report.companyProfileModal).toContainText('Chevron');
});

test('Visualización has no serious or critical accessibility violations', async ({ page }) => {
  const report = new AnalysisReportPage(page);
  await report.goto(ANALYSIS_ID);
  await expect(report.position).toBeVisible();
  // Wait past ECharts' own mount/relayout (heatmap + radar); scanning mid-mount has intermittently caught a
  // transient nested-interactive state in the chart internals, never present once layout settles.
  await expect(report.heatmapDataTable).toHaveCount(1);
  await expect(page.getByTestId('report-panorama-radar-data-table')).toHaveCount(1);

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  return box;
}

test('the main column stays inside its grid track and never runs under the comments rail', async ({
  page,
}) => {
  const report = new AnalysisReportPage(page);
  await report.goto(ANALYSIS_ID);
  await expect(report.position).toBeVisible();
  // Every chart/section must have mounted and settled at its final size before measuring.
  await expect(report.heatmapDataTable).toHaveCount(1);
  await expect(page.getByTestId('report-panorama-radar-data-table')).toHaveCount(1);
  await expect(page.locator('[data-testid^="tbg-horizon-composition-row-"]').first()).toBeVisible();

  // Desktop Chrome is 1280px wide: the two-column desktop layout (main column + comments rail) applies.
  const columns = page.getByTestId('analysis-report-layout').locator('xpath=./*');
  const main = columns.nth(0);
  const rail = columns.nth(1);
  // e2e type-checks without the DOM lib: read only the two properties needed.
  const mainWidths = await main.evaluate((node) => {
    const element = node as unknown as { scrollWidth: number; clientWidth: number };
    return { scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
  });
  expect(mainWidths.scrollWidth).toBeLessThanOrEqual(mainWidths.clientWidth);

  const mainBox = await boxOf(main);
  const railBox = await boxOf(rail);
  expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(railBox.x);
});
