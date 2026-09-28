import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AnalysesPage } from '../pages/AnalysesPage';
import { AnalysisDefinitionPage } from '../pages/AnalysisDefinitionPage';

// SCR-06 Análisis: search and the Fecha / Creador / Estado selects are URL-persisted (ADR-0005) but not
// server-filtered yet (the mock view always answers the same fixed rows) — what's under test is that the URL state, and
// the controls restored from it, survive a real reload, not that the table's row count changes.
test('search and select filters survive a reload through the URL', async ({ page }) => {
  const analyses = new AnalysesPage(page);
  await analyses.goto();
  await expect(analyses.root).toBeVisible();
  await expect(analyses.table).toBeVisible();

  // Each control's URL write is awaited before the next one: the router commits search-param updates in a transition,
  // so back-to-back writes faster than a render would read stale params.
  await analyses.searchInput.fill('ROACE');
  await expect(page).toHaveURL(/[?&]q=ROACE/);
  await analyses.statusFilter.selectOption({ label: 'Borrador' });
  await expect(page).toHaveURL(/[?&]estado=draft/);
  await expect(analyses.statusFilter).toHaveValue('draft');
  await analyses.creatorFilter.selectOption({ label: 'Jorge Salas' });
  await expect(page).toHaveURL(/[?&]creador=usr_01J9Y7C9JS/);
  await expect(page).toHaveURL(/[?&]estado=draft/);
  await expect(analyses.clearFiltersButton).toBeVisible();

  await page.reload();

  await expect(analyses.searchInput).toHaveValue('ROACE');
  await expect(analyses.statusFilter).toHaveValue('draft');
  await expect(analyses.creatorFilter).toHaveValue('usr_01J9Y7C9JS');
  await expect(analyses.clearFiltersButton).toBeVisible();

  await analyses.clearFiltersButton.click();
  await expect(page).not.toHaveURL(/[?&]q=/);
  await expect(analyses.searchInput).toHaveValue('');
});

// Prototype L390-L427 at 1440 px: the search fills the row left of the three selects; no chevron column, and the
// blue "(i)" after each name opens its description row.
test('the filter bar and table rows match the prototype layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const analyses = new AnalysesPage(page);
  await analyses.goto();
  await expect(analyses.table).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(analyses.statusFilter).toHaveValue('');
  await expect(analyses.dateFilter.locator('option').first()).toHaveText('Fecha: todas');
  const search = await analyses.boxOf(analyses.searchInput);
  const date = await analyses.boxOf(analyses.dateFilter);
  expect(search.width).toBeGreaterThan(600);
  expect(Math.abs(search.y + search.height / 2 - (date.y + date.height / 2))).toBeLessThan(4);
  expect(date.x).toBeGreaterThan(search.x + search.width);
  await expect(analyses.table.getByRole('columnheader')).toHaveCount(5);

  const toggle = analyses.infoToggle('ana_01J9Y8D4T2');
  await expect(analyses.row('ana_01J9Y8D4T2').getByRole('rowheader')).toContainText(
    'Desempeño comparativo',
  );
  await expect(analyses.detailRow('ana_01J9Y8D4T2')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(analyses.detailRow('ana_01J9Y8D4T2')).toContainText('Referenciamiento competitivo');
});

test('Análisis has no serious or critical accessibility violations', async ({ page }) => {
  const analyses = new AnalysesPage(page);
  await analyses.goto();
  await expect(analyses.table).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});

// New interactions uncovered in SCR-06

// "+ Crear nuevo análisis" creates a draft through C-01 and opens the wizard on the returned draft id; the mock serves
// the C-01 docs fixture, whose draftId is the V-05 draft (drf_01J9ZA2B3C).
test('clicking create new analysis opens the first definition step', async ({ page }) => {
  const analyses = new AnalysesPage(page);
  const definition = new AnalysisDefinitionPage(page);
  await analyses.goto();
  await expect(analyses.createButton).toBeVisible();
  await analyses.createButton.click();
  await expect(page).toHaveURL(/\/analisis\/drf_01J9ZA2B3C\/definicion\?paso=1$/);
  await expect(definition.wizard).toHaveAttribute('data-step', '1');
  await expect(definition.nameInput).toBeVisible();
});

test('clicking view details on a table row navigates to the analysis results page', async ({
  page,
}) => {
  const analyses = new AnalysesPage(page);
  await analyses.goto();
  await expect(analyses.table).toBeVisible();
  // Use the first row's ID from the mock data (ana_01J9Y8D4T2)
  const firstRow = analyses.row('ana_01J9Y8D4T2');
  await expect(firstRow).toBeVisible();
  await analyses.viewDetailsButton('ana_01J9Y8D4T2').click();
  await expect(page).toHaveURL(/\/analisis\/ana_01J9Y8D4T2\/resultados/);
});
