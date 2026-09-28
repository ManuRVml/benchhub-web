import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { SettingsPage } from '../pages/SettingsPage';

// SCR-16 Configuración (V-45): the switches reflect the V-45 fixture (high contrast off, email notifications on).
test('renders the profile card and accessibility switches', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();

  await expect(settings.root).toBeVisible();
  await expect(settings.fontSizeNormalButton).toHaveAttribute('aria-selected', 'true');
  await expect(settings.highContrastSwitch).toHaveAttribute('aria-checked', 'false');
  await expect(settings.emailNotificationsSwitch).toHaveAttribute('aria-checked', 'true');
});

test('lays out the 560px column of two cards, the 52px brand avatar and right-aligned font buttons', async ({
  page,
}) => {
  const settings = new SettingsPage(page);
  await settings.goto();
  await expect(settings.profileCard).toBeVisible();

  const column = await settings.form.boundingBox();
  expect(column?.width).toBeLessThanOrEqual(560);
  await expect(settings.profileCard).toHaveCSS('border-radius', '12px');
  await expect(settings.accessibilityCard).toHaveCSS('padding-top', '22px');
  const avatar = await settings.profileAvatar.boundingBox();
  expect(avatar?.width).toBe(52);
  await expect(settings.profileAvatar).toHaveCSS('background-color', 'rgb(103, 45, 189)');

  const row = await settings.fontSizeRow.boundingBox();
  const plus = await settings.fontSizeIncreaseButton.boundingBox();
  expect(plus?.width).toBe(28);
  expect((plus?.x ?? 0) + (plus?.width ?? 0)).toBeCloseTo((row?.x ?? 0) + (row?.width ?? 0), 0);
  await expect(settings.emailNotificationsSwitch).toHaveCSS(
    'background-color',
    'rgb(16, 185, 129)',
  );
});

// C-37 mock mutations invalidate V-45 but re-fetch its immutable fixture, so no visible mutation result exists.
test.fixme('font size controls update their selected state', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();

  await expect(settings.fontSizeNormalButton).toHaveAttribute('aria-selected', 'true');
  await expect(settings.fontSizeDecreaseButton).toHaveAttribute('aria-selected', 'false');
  await expect(settings.fontSizeIncreaseButton).toHaveAttribute('aria-selected', 'false');

  await settings.fontSizeDecreaseButton.click();
  await expect(settings.fontSizeDecreaseButton).toHaveAttribute('aria-selected', 'true');
  await expect(settings.fontSizeNormalButton).toHaveAttribute('aria-selected', 'false');
  await expect(settings.fontSizeIncreaseButton).toHaveAttribute('aria-selected', 'false');
});

test.fixme('high contrast toggle updates its visible state', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();

  await expect(settings.highContrastSwitch).toHaveAttribute('data-state', 'unchecked');

  await settings.highContrastSwitch.click();
  await expect(settings.highContrastSwitch).toHaveAttribute('data-state', 'checked');

  await settings.highContrastSwitch.click();
  await expect(settings.highContrastSwitch).toHaveAttribute('data-state', 'unchecked');
});

test.fixme('email notifications toggle updates its visible state', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();

  await expect(settings.emailNotificationsSwitch).toHaveAttribute('data-state', 'checked');

  await settings.emailNotificationsSwitch.click();
  await expect(settings.emailNotificationsSwitch).toHaveAttribute('data-state', 'unchecked');

  await settings.emailNotificationsSwitch.click();
  await expect(settings.emailNotificationsSwitch).toHaveAttribute('data-state', 'checked');
});

test('font size tabs support Arrow-key focus navigation', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();

  await settings.fontSizeNormalButton.focus();
  await expect(settings.fontSizeNormalButton).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(settings.fontSizeIncreaseButton).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expect(settings.fontSizeNormalButton).toBeFocused();
});

test('Configuración has no serious or critical accessibility violations', async ({ page }) => {
  const settings = new SettingsPage(page);
  await settings.goto();
  await expect(settings.root).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
