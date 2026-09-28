import { expect, test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

import { freezeClock, screenOptions, waitForFonts } from './capture';

// SCR-01 only renders without a session, so it runs in the visual-signed-out project (VITE_MOCK_ROLE=none).
test('SCR-01 login', async ({ page }) => {
  await freezeClock(page);
  const login = new LoginPage(page);
  await login.goto();
  await expect(login.usernameInput).toBeVisible();
  await expect(login.passwordInput).toBeVisible();
  await waitForFonts(page);
  await expect(page).toHaveScreenshot('scr-01-login.png', screenOptions(page, 'scr-01-login'));
});
