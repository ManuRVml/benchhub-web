import { expect, test } from '@playwright/test';

import { AnalysisReportPage } from '../pages/AnalysisReportPage';
import { AnalysisResultsPage } from '../pages/AnalysisResultsPage';

import type { Request, Response } from '@playwright/test';

const ANALYSIS_ID = 'ana_desempeno_4t_2025';
const PRESENTATION_ID = 'prs_directorio_t4';
const profile = process.env.STACK_PROFILE ?? 'default';

function isResponseFor(response: Response, method: string, pathname: string): boolean {
  return response.request().method() === method && new URL(response.url()).pathname === pathname;
}

function expectCsrf(request: Request): void {
  expect(request.headers()['x-csrf-token']).toBeTruthy();
}

if (profile === 'default') {
  test.describe('stack critical flows set 2: default analyst', () => {
    test('edits and publishes a presentation through C-28 and C-29', async ({ page }) => {
      await page.goto(`/presentaciones/${PRESENTATION_ID}/editar`);
      await expect(page.getByTestId('presentation-builder')).toBeVisible();
      const saveResponsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'PATCH', `/api/v1/presentations/${PRESENTATION_ID}`),
      );
      await page.getByTestId('presentation-builder-title').fill('Critical flow presentation');
      const saveResponse = await saveResponsePromise;
      expect(saveResponse.status()).toBe(200);
      expectCsrf(saveResponse.request());
      await page.getByTestId('presentation-builder-publish').click();
      await expect(page.getByTestId('presentation-publish')).toBeVisible();
      const publishResponsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'POST', `/api/v1/presentations/${PRESENTATION_ID}/publication`),
      );
      await page.getByTestId('presentation-publish-confirm').click();
      const publishResponse = await publishResponsePromise;
      expect(publishResponse.status()).toBe(200);
      expectCsrf(publishResponse.request());
      await expect(page.getByText('Presentación publicada correctamente.')).toBeVisible();
    });

    test('adds and replies to report comments through C-10', async ({ page }) => {
      const report = new AnalysisReportPage(page);
      await report.goto(ANALYSIS_ID);
      const composer = page.getByTestId('report-comments-composer-input');
      await expect(composer).toBeVisible();
      const commentResponsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'POST', '/api/v1/review-comments'),
      );
      await composer.fill('Stack comment');
      await page.getByTestId('report-comments-composer-submit').click();
      const commentResponse = await commentResponsePromise;
      expect(commentResponse.status()).toBe(201);
      expectCsrf(commentResponse.request());
      const comment = page.getByTestId('comment-item-cmt_01J9ZB1C2D');
      await comment.getByRole('button', { name: 'Responder' }).click();
      const replyResponsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'POST', '/api/v1/review-comments'),
      );
      await comment.getByRole('textbox', { name: 'Respuesta' }).fill('Stack reply');
      await comment.getByRole('button', { name: 'Enviar' }).click();
      const replyResponse = await replyResponsePromise;
      expect(replyResponse.status()).toBe(201);
      expectCsrf(replyResponse.request());
      await expect(comment).toContainText('Shell reportó una revisión al alza');
    });

    test('follows C-08 over O-02 and refetches SCR-08 views', async ({ page }) => {
      const results = new AnalysisResultsPage(page);
      await results.goto(ANALYSIS_ID);
      const recalculate = page.getByTestId('results-recalculate');
      const commandResponsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'POST', '/api/v1/recalculations'),
      );
      const headerRefetchPromise = page.waitForResponse((response) =>
        isResponseFor(response, 'GET', `/api/v1/views/results-header/${ANALYSIS_ID}`),
      );
      const coverageRefetchPromise = page.waitForResponse((response) =>
        isResponseFor(response, 'GET', `/api/v1/views/company-coverage/${ANALYSIS_ID}`),
      );
      const eventsResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          /^\/api\/v1\/operations\/[^/]+\/events$/.test(new URL(response.url()).pathname),
      );
      await recalculate.click();
      const commandResponse = await commandResponsePromise;
      expect(commandResponse.status()).toBe(202);
      expectCsrf(commandResponse.request());
      await expect(recalculate).toBeDisabled();
      await Promise.all([eventsResponsePromise, headerRefetchPromise, coverageRefetchPromise]);
      await expect(recalculate).toBeEnabled();
    });

    test('streams the static C-33 assistant answer', async ({ page }) => {
      await page.goto(`/analisis/${ANALYSIS_ID}/visualizacion`);
      await page.getByTestId('yarbis-assistant-fab').click();
      const responsePromise = page.waitForResponse((response) =>
        isResponseFor(response, 'POST', '/api/v1/assistant/messages'),
      );
      await page.getByTestId('yarbis-assistant-composer').fill('Resume el análisis');
      await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      expectCsrf(response.request());
      await expect(page.getByTestId('yarbis-assistant-log')).toContainText('…');
    });
  });
}

if (profile === 'explorer') {
  test.describe('stack critical flows set 2: explorer viewer', () => {
    test('redirects a denied route to /403 and hides Yarbis', async ({ page }) => {
      await page.goto(`/analisis/${ANALYSIS_ID}/definicion`);
      await expect(page).toHaveURL(/\/403$/);
      await expect(page.getByTestId('yarbis-assistant-fab')).toHaveCount(0);
    });
  });
}

if (profile === 'partial') {
  test.describe('stack critical flows set 2: partial visualization', () => {
    test('keeps healthy SCR-09 sections visible beside a failed section', async ({ page }) => {
      const report = new AnalysisReportPage(page);
      await report.goto(ANALYSIS_ID);
      await expect(page.getByTestId('analysis-report-kpi-tiles-section-error')).toBeVisible();
      await expect(page.getByTestId('report-panorama-heatmap-data-table')).toBeVisible();
    });
  });
}
