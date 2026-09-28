import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { HomePage } from '../pages/HomePage';

const MOCK_ANALYSIS = {
  id: 'ana_01J9Y8C3N6',
  title: 'Informe de referenciamiento de pares',
};

const PATHS = {
  analyses: /\/analisis$/,
  analysisReport: `/analisis/${MOCK_ANALYSIS.id}/visualizacion`,
  notifications: /\/notificaciones$/,
  login: /\/login$/,
} as const;

// SCR-05 Inicio: five independently loaded V-03 sections, all ready in the mock fixture.
test('Inicio renders its five sections from the mock view', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.root).toBeVisible();

  for (const scope of HomePage.SECTION_SCOPES) {
    await expect(home.section(scope, 'ready')).toBeVisible();
  }
});

// Prototype L247-L378 at 1440 px: one h1 (shell header), uppercase group labels, 3-column analyses and 5-column news.
test('Inicio matches the prototype section layout at canvas width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const home = new HomePage(page);
  await home.goto();
  await expect(home.section('home-market-indicators', 'ready')).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(home.groupHeadings()).toHaveText([
    'Resumen ejecutivo',
    'Análisis habilitados',
    'Noticias de los pares',
    'Indicadores de mercado',
  ]);
  await expect(home.groupHeadings().first()).toHaveCSS('text-transform', 'uppercase');
  await expect(home.enabledAnalysesGrid()).toHaveCSS('grid-template-columns', /^\S+ \S+ \S+$/);
  await expect(home.peerNewsGrid()).toHaveCSS('grid-template-columns', /^(\S+ ){4}\S+$/);
});

test('Inicio has no serious or critical accessibility violations', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.section('home-banner', 'ready')).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});

test('the enabled analyses link navigates to the analyses screen', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.verTodosLink()).toBeVisible();
  await home.verTodosLink().click();
  await expect(page).toHaveURL(PATHS.analyses);
  await expect(page.getByTestId('analyses-page')).toBeVisible();
});

test('an enabled analysis card opens the BFF-resolved target route', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  const analysis = home.enabledAnalysis(MOCK_ANALYSIS.title);
  const target = PATHS.analysisReport;
  await expect(analysis).toHaveAttribute('href', target);
  await analysis.click();
  await expect(page).toHaveURL(target);
  await expect(page.getByTestId('analysis-report-page')).toBeVisible();
});

test('the notifications bell opens the notifications screen', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  await home.notificationsButton().click();
  await expect(page).toHaveURL(PATHS.notifications);
  await expect(page.getByTestId('notifications-page')).toBeVisible();
});

// Mock A-03 never resolves, so the shell's finally navigation cannot execute in this E2E mode.
test.fixme('logout navigates to the login screen after the command completes', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  await home.logoutButton().click();
  await expect(page).toHaveURL(PATHS.login);
  await expect(page.getByTestId('login-page')).toBeVisible();
});
