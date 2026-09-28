import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { NotificationsPage } from '../pages/NotificationsPage';

test('search persists through the notifications URL after a reload', async ({ page }) => {
  const notifications = new NotificationsPage(page);
  await notifications.goto();

  await expect(notifications.root).toBeVisible();
  await notifications.searchInput.fill('Chevron');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Chevron');

  await page.reload();

  await expect(notifications.searchInput).toHaveValue('Chevron');
});

test('severity selection persists through the notifications URL after a reload', async ({
  page,
}) => {
  const notifications = new NotificationsPage(page);
  await notifications.goto();

  // None on by default (every severity shown); turning one on filters to it (SCR-15 prototype).
  await expect(notifications.severityChip('info')).toHaveAttribute('aria-pressed', 'false');
  await notifications.severityChip('info').click();
  await expect.poll(() => new URL(page.url()).searchParams.get('severidad')).toBe('info');

  await page.reload();

  await expect(notifications.severityChip('info')).toHaveAttribute('aria-pressed', 'true');
  await expect(notifications.severityChip('warn')).toHaveAttribute('aria-pressed', 'false');
});

test('cards sit in the 760px column with the severity border, type icon and right-hand tag', async ({
  page,
}) => {
  const notifications = new NotificationsPage(page);
  await notifications.goto();
  await expect(notifications.cards.first()).toBeVisible();

  const column = await notifications.root.boundingBox();
  expect(column?.width).toBeLessThanOrEqual(760);

  const card = notifications.cards.first();
  await expect(card).toHaveCSS('border-left-width', '3px');
  const icon = await notifications.cardIcon(card).boundingBox();
  expect(icon?.width).toBe(34);
  const cardBox = await card.boundingBox();
  const tagBox = await notifications.cardTag(card).boundingBox();
  expect((tagBox?.x ?? 0) + (tagBox?.width ?? 0)).toBeGreaterThan(
    (cardBox?.x ?? 0) + (cardBox?.width ?? 0) - 40,
  );
  await expect(notifications.cardTime(card)).toHaveText(/^Hace /);
});

test('Notificaciones has no serious or critical accessibility violations', async ({ page }) => {
  const notifications = new NotificationsPage(page);
  await notifications.goto();
  await expect(notifications.cards.first()).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
