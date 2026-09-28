import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AnalysisResultsPage, RESULTS_MODULE_SCOPES } from '../pages/AnalysisResultsPage';
import { IndicatorDetailPage } from '../pages/IndicatorDetailPage';

// SCR-08 Resultados in mock mode: every module is answered by its port's mock adapter (the same fixtures for any
// analysis id). The V-09 fixture's company set is Chevron + Shell; V-12 always answers Chevron's rows, so what is under
// test for the company picker is the URL and the tab state, not the rows' company.
const ANALYSIS_ID = 'ana_e2e_smoke';

test('renders the frame and every module section', async ({ page }) => {
  const results = new AnalysisResultsPage(page);
  await results.goto(ANALYSIS_ID);

  await expect(results.actionRow).toBeVisible();
  await expect(results.resultsTab).toHaveAttribute('aria-selected', 'true');
  for (const scope of RESULTS_MODULE_SCOPES) {
    await expect(results.section(scope)).toBeVisible();
  }
});

test('the company picker writes empresa to the URL and selects that company in the module', async ({
  page,
}) => {
  const results = new AnalysisResultsPage(page);
  await results.goto(ANALYSIS_ID);
  await expect(results.section('company-comparison')).toBeVisible();

  // The first company of the set is selected until the URL says otherwise.
  await expect(results.companyTab('Chevron')).toHaveAttribute('aria-selected', 'true');
  await expect(results.companyTab('Shell')).toHaveAttribute('aria-selected', 'false');

  await results.companyTab('Shell').click();
  await expect(page).toHaveURL(/[?&]empresa=cmp_shell/);
  await expect(results.companyTab('Shell')).toHaveAttribute('aria-selected', 'true');
  await expect(results.companyTab('Chevron')).toHaveAttribute('aria-selected', 'false');
  await expect(results.section('company-comparison')).toBeVisible();
});

test('opening an indicator from the company comparison goes to Detalle de indicador and back', async ({
  page,
}) => {
  const results = new AnalysisResultsPage(page);
  await results.goto(ANALYSIS_ID);
  await expect(results.section('company-comparison')).toBeVisible();

  await results.companyComparisonVerMas('ind-roace').click();
  await expect(page).toHaveURL(new RegExp(`/analisis/${ANALYSIS_ID}/indicadores/ind_roace`));
  await expect(new IndicatorDetailPage(page).root).toBeVisible();

  await page.goBack();
  await expect(results.root).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/analisis/${ANALYSIS_ID}/resultados`));
  await expect(results.section('company-comparison')).toBeVisible();
});

test('Resultados has no serious or critical accessibility violations', async ({ page }) => {
  const results = new AnalysisResultsPage(page);
  await results.goto(ANALYSIS_ID);
  for (const scope of RESULTS_MODULE_SCOPES) {
    await expect(results.section(scope)).toBeVisible();
  }

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
