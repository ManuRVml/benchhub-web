import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { ValueMonitorPage } from '../pages/ValueMonitorPage';

// SCR-11 Monitor de Valor: header/KPIs/ranking/history/KVIs/composition/comments/benchmark, all real vendored ports
// now (task/P7-HOOKS). The V-27 fixture's snapshots are 2026-04 (default) and 2026-01.
test('the snapshot select, historico chip and KVI category filter write the URL', async ({
  page,
}) => {
  const monitor = new ValueMonitorPage(page);
  await monitor.goto();
  await expect(monitor.root).toBeVisible();
  await expect(monitor.header).toBeVisible();

  await monitor.snapshotSelect.selectOption('2026-01');
  await expect(page).toHaveURL(/[?&]corte=2026-01/);

  await monitor.historyRangeChip('5y').click();
  await expect(page).toHaveURL(/[?&]historico=5y/);
  await expect(monitor.historyRangeChip('5y')).toHaveAttribute('aria-pressed', 'true');

  await monitor.kviCategoryFilterChip('financiero').click();
  await expect(page).toHaveURL(/[?&]categoria=financiero/);
  await expect(monitor.kviCategoryFilterChip('financiero')).toHaveAttribute('aria-pressed', 'true');
});

test('the benchmark radar section renders', async ({ page }) => {
  const monitor = new ValueMonitorPage(page);
  await monitor.goto();

  await expect(monitor.benchmarkRadar).toBeVisible();
});

test('the content is an 840px column; radar, configuration and donut show their data', async ({
  page,
}) => {
  const monitor = new ValueMonitorPage(page);
  await monitor.goto();
  await expect(monitor.header).toBeVisible();

  const column = await monitor.column.boundingBox();
  expect(column?.width).toBeLessThanOrEqual(840);
  expect(column?.width).toBeGreaterThan(800);

  await expect(monitor.benchmarkChart).toHaveAttribute('data-series-count', '2');
  await expect(monitor.benchmarkCompanyToggle('cmp-ecopetrol')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(monitor.configSources.getByRole('listitem')).toHaveCount(4);
  await expect(monitor.configIndicatorChips()).toHaveCount(22);
  const donut = await monitor.compositionDonut.boundingBox();
  expect(donut?.width).toBe(180);
});

test('Monitor de Valor has no serious or critical accessibility violations', async ({ page }) => {
  const monitor = new ValueMonitorPage(page);
  await monitor.goto();
  await expect(monitor.header).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
