import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { LoginPage, MOCK_CREDENTIALS } from '../pages/LoginPage';

// SCR-01 Iniciar sesión (signed-out project: VITE_MOCK_ROLE=none against the dev server, or no cookie against the stack):
// the only config where this route does not redirect away (ACCESS.login sends any existing session to the gate /
// returnTo / Inicio). "Ingresar" posts A-05 with the mock credential pair (owner decision 2026-09-28).
test('the login page renders its brand panel and form', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  await expect(login.root).toBeVisible();
  await expect(login.heading).toHaveText('Inteligencia financiera para decisiones estratégicas');
  await expect(login.usernameInput).toBeVisible();
  await expect(login.usernameInput).toHaveAttribute('autocomplete', 'username');
  await expect(login.passwordInput).toBeVisible();
  await expect(login.passwordInput).toHaveAttribute('type', 'password');
  await expect(login.passwordInput).toHaveAttribute('autocomplete', 'current-password');
  await expect(login.submitButton).toBeVisible();
  await expect(login.errorBanner).toBeHidden();
});

test('from laptop up the brand sits left of the card over the refinery photo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const login = new LoginPage(page);
  await login.goto();

  await expect(login.background).toHaveAttribute('src', /login-bg.*\.webp/);
  expect(await login.backgroundStatus()).toBe(200);
  const brand = await login.boxOf(login.brand);
  const card = await login.boxOf(login.card);
  expect(card.x).toBeGreaterThan(brand.x + brand.width);
  expect(Math.round(card.width)).toBe(420);
  // Vertically centred in the 900 px viewport (prototype: align-items center, min-height 100vh).
  expect(Math.abs(card.y + card.height / 2 - 450)).toBeLessThan(8);
});

test('?error= shows the mapped error banner', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto('?error=access_denied');

  await expect(login.errorBanner).toHaveText(
    'Tu cuenta no tiene acceso al Comparador. Solicita acceso a tu administrador.',
  );
});

test('a wrong password shows the generic error, keeps the page and never puts the password in a URL', async ({
  page,
}) => {
  const password = 'Wrong-Pass-123';
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  const login = new LoginPage(page);
  await login.goto();

  await login.signIn(MOCK_CREDENTIALS.username, password);

  await expect(login.errorBanner).toHaveText('Usuario o contraseña incorrectos.');
  await expect(login.submitButton).toBeEnabled();
  expect(new URL(page.url()).pathname).toBe('/login');
  expect(urls.filter((url) => url.includes(password))).toEqual([]);
});

test('an unknown user gets the same error as a wrong password', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  await login.signIn('nobody@ecopetrol.com', MOCK_CREDENTIALS.password);

  await expect(login.errorBanner).toHaveText('Usuario o contraseña incorrectos.');
});

test('the mock credential pair signs in and opens returnTo', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto('?returnTo=%2Finicio');

  // The full-page navigation to returnTo commits even where the dev-server mock keeps its fixed session.
  const landed = page.waitForURL((url) => url.pathname === '/inicio', { waitUntil: 'commit' });
  await login.signIn();
  await landed;
  await expect(login.errorBanner).toBeHidden();
});

test('the login page has no serious or critical accessibility violations', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await expect(login.root).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});

test('the login page with its credentials error has no serious or critical accessibility violations', async ({
  page,
}) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.signIn(MOCK_CREDENTIALS.username, 'wrong');
  await expect(login.errorBanner).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
