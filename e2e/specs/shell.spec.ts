import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { AppShellPage } from '../pages/AppShellPage';

// SCR-04 shell smoke (dev server, VITE_API_MODE=mock, default mock session analyst_creator): routing between screens,
// the sidebar collapse toggle, and an axe scan of the shell chrome.
test('the app shell routes between screens', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.goto('/');
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(shell.title).toHaveText('Dashboard');

  await expect(shell.mainNav.getByRole('listitem')).toHaveCount(7);
  await expect(shell.mainNav.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await shell.clickNavLink('Monitor de Valor');
  await expect(page).toHaveURL(/\/monitor-valor$/);
  await expect(shell.title).toHaveText('Monitor de Valor');
  await expect(shell.mainNav.getByRole('link', { name: 'Monitor de Valor' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await shell.userLink.click();
  await expect(page).toHaveURL(/\/configuracion$/);
  await expect(shell.title).toHaveText('Configuración');
});

test('the sidebar collapses and expands, and the preference survives a reload', async ({
  page,
}) => {
  const shell = new AppShellPage(page);
  await shell.goto('/inicio');
  await expect(shell.sidebar).toHaveAttribute('data-collapsed', 'false');

  await shell.toggleCollapse();
  await expect(shell.sidebar).toHaveAttribute('data-collapsed', 'true');
  await expect(shell.collapseButton).toHaveAttribute('aria-expanded', 'false');

  await page.reload();
  await expect(shell.sidebar).toHaveAttribute('data-collapsed', 'true');

  await shell.toggleCollapse();
  await expect(shell.sidebar).toHaveAttribute('data-collapsed', 'false');
});

test('the shell has no serious or critical accessibility violations', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.goto('/inicio');
  await expect(shell.root).toBeVisible();

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
