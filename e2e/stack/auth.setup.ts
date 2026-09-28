import { test, expect } from '@playwright/test';

import { AppShellPage } from '../pages/AppShellPage';
import { LoginPage } from '../pages/LoginPage';

/**
 * Authentication setup for stack e2e tests.
 *
 * Opens the app, signs in through A-05 with the mock credential pair (ecopetrol@ecopetrol.com / ecopetrol; the BFF's
 * MOCK_ROLE makes the session analyst_creator), waits for the app shell to be ready, and saves storageState for
 * subsequent tests.
 */
test('stack auth setup: sign in and save storageState', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  await expect(login.usernameInput).toBeVisible();
  await expect(login.passwordInput).toBeVisible();
  await expect(login.submitButton).toBeVisible();
  await login.signIn();

  // Wait for app shell to be ready (indicating successful auth)
  const appShell = new AppShellPage(page);
  await expect(appShell.root).toBeVisible({ timeout: 30000 });
  await expect(appShell.title).toHaveText('Dashboard');

  // Verify we're on the home screen by checking navigation
  await expect(appShell.mainNav).toBeVisible();

  // Save storageState for subsequent tests
  await page.context().storageState({ path: 'test-results/stack-auth.json' });
});
