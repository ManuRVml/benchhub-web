import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AnalysisReportPage } from '../pages/AnalysisReportPage';

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
