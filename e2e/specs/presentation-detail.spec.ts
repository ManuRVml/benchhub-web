import { expect, test } from '@playwright/test';

import { seriousOrCriticalViolations } from '../pages/accessibility';
import { PresentationDetailPage } from '../pages/PresentationDetailPage';

// SCR-14 presentation viewer (V-42/V-43, V-26 comments). prs_directorio_t4's fixture deck has 7 slides.
const PRESENTATION_ID = 'prs_directorio_t4';

test('the comment heading count comes with the V-26 comments rendered, and a one-line composer', async ({
  page,
}) => {
  const detail = new PresentationDetailPage(page);
  await detail.goto(PRESENTATION_ID);

  await expect(detail.comments.getByRole('heading')).toHaveText(/\(2\)$/);
  await expect(detail.commentItems).toHaveCount(2);
  await expect(detail.comments.getByText('No hay datos para mostrar.')).toHaveCount(0);
  await expect(detail.commentInput).toHaveAttribute('maxlength', '1000');
  await expect(detail.commentInput).toHaveJSProperty('tagName', 'INPUT');
  await expect(detail.commentSubmit).toBeVisible();
});

test('the title row holds the actions and the cover slide paints its photo', async ({ page }) => {
  const detail = new PresentationDetailPage(page);
  await detail.goto(PRESENTATION_ID, 1);

  await expect(detail.titleRow.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(detail.titleRow.getByTestId('presentation-detail-download')).toBeVisible();
  await expect(detail.coverBackground).toBeVisible();
  await expect(detail.coverBackground).toHaveJSProperty('complete', true);
  await expect(detail.coverBackground).not.toHaveJSProperty('naturalWidth', 0);
});

test('the slide index lives in the URL and a reload restores it', async ({ page }) => {
  const detail = new PresentationDetailPage(page);
  await detail.goto(PRESENTATION_ID, 3);

  await expect(detail.dot(3)).toHaveAttribute('aria-selected', 'true');

  await page.reload();
  await expect(detail.dot(3)).toHaveAttribute('aria-selected', 'true');
});

test('the pager dots are keyboard-operable (roving tabindex, arrow keys)', async ({ page }) => {
  const detail = new PresentationDetailPage(page);
  await detail.goto(PRESENTATION_ID, 1);

  const firstDot = detail.dot(1);
  await expect(firstDot).toHaveAttribute('tabindex', '0');
  await firstDot.focus();

  await page.keyboard.press('ArrowRight');

  await expect(page).toHaveURL(/[?&]slide=2/);
  await expect(detail.dot(2)).toHaveAttribute('aria-selected', 'true');
  await expect(detail.dot(2)).toHaveAttribute('tabindex', '0');
  await expect(detail.dot(1)).toHaveAttribute('tabindex', '-1');
});

test('presentation detail has no serious or critical accessibility violations', async ({
  page,
}) => {
  const detail = new PresentationDetailPage(page);
  await detail.goto(PRESENTATION_ID);
  await expect(detail.stage).toBeVisible();
  // Wait past the real V-43-then-V-42 loading window: until the slides (V-42) resolve, the dots are drawn from
  // V-43's slideCount alone as unnamed placeholders (see PresentationDetailPage.tsx's own comment on `labels`) — a
  // deliberate, brief, real transitional state, not the page's steady state this check is meant to cover.
  await expect(page.getByTestId('slide')).toBeVisible();
  // The V-26 thread and the one-line composer are part of the steady state axe must cover.
  await expect(detail.commentItems).toHaveCount(2);

  expect(await seriousOrCriticalViolations(page)).toEqual([]);
});
