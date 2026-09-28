import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { PresentationsPage } from '../pages/PresentationsPage';

// SCR-13 "Presentaciones creadas" (V-40, fetchPendingView). The fixture's first row is prs_directorio_t4.
test('renders the presentations list and opens a detail view', async ({ page }) => {
  const presentations = new PresentationsPage(page);
  await presentations.goto();
  await expect(presentations.root).toBeVisible();
  await expect(presentations.table).toBeVisible();
  await expect(page.getByText('Directorio Ejecutivo T4')).toBeVisible();

  await presentations.viewDetailButton('prs_directorio_t4').click();

  await expect(page).toHaveURL(/\/presentaciones\/prs_directorio_t4$/);
});

test('"+ Crear presentación" sits below the table and the global list has no analysis tabs', async ({
  page,
}) => {
  const presentations = new PresentationsPage(page);
  await presentations.goto();
  await expect(presentations.table).toBeVisible();

  const tableBox = await presentations.table.boundingBox();
  const createBox = await presentations.createButton.boundingBox();
  expect(createBox?.y).toBeGreaterThan((tableBox?.y ?? 0) + (tableBox?.height ?? 0) - 1);
  expect(createBox?.x).toBeLessThan((tableBox?.x ?? 0) + 40);
  await expect(presentations.analysisTabs).toHaveCount(0);
});

test('the analysis-scoped list shows the analysis tabs with Presentación active', async ({
  page,
}) => {
  const presentations = new PresentationsPage(page);
  await presentations.gotoForAnalysis('ana_01J9Y8D4T2');
  await expect(presentations.analysisTabs).toBeVisible();
  await expect(presentations.analysisTab('presentation')).toHaveAttribute('aria-selected', 'true');

  await expect(presentations.table).toBeVisible();
  expect(await seriousOrCriticalViolations(page)).toEqual([]);

  await presentations.analysisTab('results').click();
  await expect(page).toHaveURL(/\/analisis\/ana_01J9Y8D4T2\/resultados/);
});

test('the builder matches the prototype card: types, slide groups, notes, PPT, comments, footer', async ({
  page,
}) => {
  const presentations = new PresentationsPage(page);
  await presentations.gotoBuilder('prs_directorio_t4');

  await expect(presentations.builder.getByRole('heading', { level: 2 })).toBeVisible();
  const row = presentations.builderPart('title-row');
  const titleBox = await row.getByTestId('presentation-builder-title').boundingBox();
  const dateBox = await row.getByTestId('presentation-builder-date').boundingBox();
  expect(Math.abs((titleBox?.y ?? 0) - (dateBox?.y ?? 100))).toBeLessThan(4);

  await expect(
    presentations.builderPart('templates').getByTestId(/^template-preview-/),
  ).toHaveCount(3);
  await expect(presentations.builderPart('slide-count')).toHaveAttribute(
    'data-variant',
    'count-brand',
  );
  await expect(presentations.builderPart('draft-all')).toBeVisible();
  await expect(presentations.builderPart('cover')).toHaveAttribute('data-variant', 'soft');
  await expect(presentations.builderGroup('comp')).toHaveAttribute('data-selected', 'true');
  await expect(presentations.builderNotes('comp')).toBeVisible();
  await expect(presentations.builderGroup('hom')).toHaveAttribute('data-selected', 'false');
  await expect(presentations.versionPanel).toBeVisible();
  await expect(presentations.builderPart('comments').getByTestId(/^comment-item-/)).toHaveCount(2);
  await expect(presentations.builderPart('footer').getByRole('button')).toHaveCount(4);

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});

test('Presentaciones has no serious or critical accessibility violations', async ({ page }) => {
  const presentations = new PresentationsPage(page);
  await presentations.goto();
  await expect(presentations.table).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
