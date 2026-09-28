import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { ErrorPages } from '../pages/ErrorPages';

test.describe('SCR-17 error pages', () => {
  test('an unknown URL renders the 404 page with its heading and its link back home', async ({
    page,
  }) => {
    const errorPages = new ErrorPages(page);

    await errorPages.gotoUnknownUrl();

    await expect(errorPages.notFoundHeading).toBeVisible();
    await expect(errorPages.notFoundAction).toBeVisible();
  });

  test('clicking the 404 back link goes to Inicio (SCR-05 root visible)', async ({ page }) => {
    const errorPages = new ErrorPages(page);
    const homePage = { root: page.getByTestId('home-page') };

    await errorPages.gotoUnknownUrl();
    await errorPages.notFoundAction.click();

    await expect(homePage.root).toBeVisible();
  });

  test('the 403 route renders its heading and its action', async ({ page }) => {
    const errorPages = new ErrorPages(page);

    await errorPages.gotoForbidden();

    await expect(errorPages.forbiddenHeading).toBeVisible();
    await expect(errorPages.forbiddenAction).toBeVisible();
  });

  test('both pages have no serious or critical axe violations', async ({ page }) => {
    const errorPages = new ErrorPages(page);

    await errorPages.gotoUnknownUrl();
    const notFoundViolations = await seriousOrCriticalViolations(page);
    expect(notFoundViolations).toEqual([]);

    await errorPages.gotoForbidden();
    const forbiddenViolations = await seriousOrCriticalViolations(page);
    expect(forbiddenViolations).toEqual([]);
  });
});
