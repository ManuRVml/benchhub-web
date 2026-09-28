import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AnalysisDefinitionPage } from '../pages/AnalysisDefinitionPage';

import type { Locator } from '@playwright/test';

// SCR-07 "Definición del análisis": the mock adapter answers the same V-05 draft fixture for any draft id, so any id
// works here. Step 1 autosaves through a debounced C-02 PATCH (also mocked); steps 1..5 navigate through `?paso=`.
const DRAFT_ID = 'ana_e2e_smoke';

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('element has no bounding box');
  return rect;
}

test('steps 1 through 5 navigate and the stepper follows the URL', async ({ page }) => {
  const definition = new AnalysisDefinitionPage(page);
  await definition.goto(DRAFT_ID, 1);
  await expect(definition.wizard).toHaveAttribute('data-step', '1');
  await expect(definition.previousButton).toBeDisabled();

  for (const step of [2, 3, 4, 5]) {
    await definition.nextButton.click();
    await expect(definition.wizard).toHaveAttribute('data-step', String(step));
    await expect(page).toHaveURL(new RegExp(`paso=${String(step)}$`));
  }

  await expect(definition.stepperStep(5)).toHaveAttribute('aria-current', 'step');
});

test('a fresh draft opens with the analysis tabs and steps 2–5 pending', async ({ page }) => {
  const definition = new AnalysisDefinitionPage(page);
  await definition.goto(DRAFT_ID, 1);
  await expect(definition.analysisTab('configuration')).toHaveAttribute('aria-selected', 'true');
  await expect(definition.analysisTab('results')).toBeDisabled();
  await expect(definition.analysisTab('presentation')).toBeDisabled();

  await expect(definition.stepperStep(1)).toHaveAttribute('data-status', 'current');
  for (const step of [2, 3, 4, 5]) {
    await expect(definition.stepperStep(step)).toHaveAttribute('data-status', 'pending');
  }
});

test('step 1 follows the prototype layout: two period halves, narrow date, option chips', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const definition = new AnalysisDefinitionPage(page);
  await definition.goto(DRAFT_ID, 1);

  const periods = await box(definition.periods);
  const current = await box(definition.periods.getByRole('group').nth(0));
  const compared = await box(definition.periods.getByRole('group').nth(1));
  // "Periodo comparado" starts in the right half of the row, on the same line as "Periodo actual".
  expect(compared.x).toBeGreaterThanOrEqual(periods.x + periods.width / 2);
  expect(Math.abs(compared.y - current.y)).toBeLessThan(4);
  expect((await box(definition.cutOffDateField)).width).toBe(290);

  const tbg = definition.generalChip('type', 'estrategico-tbg');
  await expect(tbg).toHaveAttribute('aria-pressed', 'true');
  await expect(tbg).toHaveAttribute('data-variant', 'option');
  await expect(tbg).not.toContainText('✓');
  await expect(definition.generalChip('scope', 'grupo-ecopetrol')).toHaveAttribute(
    'data-variant',
    'option',
  );
});

test('editing step 1 autosaves the draft', async ({ page }) => {
  const definition = new AnalysisDefinitionPage(page);
  await definition.goto(DRAFT_ID, 1);
  await expect(definition.nameInput).toBeVisible();

  await definition.nameInput.fill('Análisis de prueba E2E');

  await expect(definition.autosaveToast).toHaveText('Guardado');
});

test('the definition wizard has no serious or critical accessibility violations', async ({
  page,
}) => {
  const definition = new AnalysisDefinitionPage(page);
  await definition.goto(DRAFT_ID, 1);
  await expect(definition.wizard).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
