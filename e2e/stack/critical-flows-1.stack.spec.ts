import { expect, test } from '@playwright/test';

import { AnalysesPage } from '../pages/AnalysesPage';
import { AnalysisDefinitionPage } from '../pages/AnalysisDefinitionPage';
import { PresentationDetailPage } from '../pages/PresentationDetailPage';

import type { Request, Response } from '@playwright/test';

function requireRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${context} response is not an object`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, context: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${context} is missing`);
  }
  return value;
}

function expectCsrf(request: Request): void {
  expect(request.headers()['x-csrf-token']).toBeTruthy();
}

function isResponseFor(response: Response, method: string, pathname: string): boolean {
  return response.request().method() === method && new URL(response.url()).pathname === pathname;
}

test.describe('stack critical flows: wizard generation and presentation export', () => {
  test('creates, saves and generates an analysis draft through the real wizard', async ({
    page,
  }) => {
    const analyses = new AnalysesPage(page);
    const definition = new AnalysisDefinitionPage(page);

    await analyses.goto();
    const createResponsePromise = page.waitForResponse((response) =>
      isResponseFor(response, 'POST', '/api/v1/analysis-drafts'),
    );
    await analyses.createButton.click();
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expectCsrf(createResponse.request());
    const createBody = requireRecord(await createResponse.json(), 'C-01');
    const draftId = requireString(createBody.draftId, 'C-01 draftId');

    await expect(page).toHaveURL(new RegExp(`/analisis/${draftId}/definicion\\?paso=1$`));
    await expect(definition.wizard).toHaveAttribute('data-step', '1');

    const saveResponsePromise = page.waitForResponse((response) =>
      isResponseFor(response, 'PATCH', `/api/v1/analysis-drafts/${draftId}`),
    );
    await definition.nameInput.fill('Stack critical-flow analysis');
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.status()).toBe(200);
    expectCsrf(saveResponse.request());

    for (const step of [2, 3, 4, 5]) {
      await definition.nextButton.click();
      await expect(definition.wizard).toHaveAttribute('data-step', String(step));
    }

    const generate = page.getByTestId('analysis-definition-generate');
    await expect(generate).toBeEnabled();
    const generateResponsePromise = page.waitForResponse((response) =>
      isResponseFor(response, 'POST', `/api/v1/analysis-drafts/${draftId}/generation`),
    );
    await generate.click();
    const generateResponse = await generateResponsePromise;
    expect(generateResponse.status()).toBe(202);
    expectCsrf(generateResponse.request());
    const generateBody = requireRecord(await generateResponse.json(), 'C-03');
    expect(requireString(generateBody.operationId, 'C-03 operationId')).toMatch(/^op_/);

    await expect(page).toHaveURL(new RegExp(`/analisis/${draftId}/resultados$`));
  });

  test('exports a presentation through polling and mediated download', async ({ page }) => {
    const presentation = new PresentationDetailPage(page);
    await presentation.goto('prs_directorio_t4');

    await page.getByRole('button', { name: 'Descargar' }).click();
    await expect(page.getByTestId('presentation-download')).toBeVisible();

    const polls: Response[] = [];
    page.on('response', (response) => {
      const pathname = new URL(response.url()).pathname;
      if (response.request().method() === 'GET' && pathname.startsWith('/api/v1/operations/')) {
        polls.push(response);
      }
    });
    const downloadPromise = page.waitForEvent('download');
    const exportResponsePromise = page.waitForResponse((response) =>
      isResponseFor(response, 'POST', '/api/v1/exports'),
    );
    const fileResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /^\/api\/v1\/files\/[^/]+\/download$/.test(new URL(response.url()).pathname),
    );
    await page.getByTestId('presentation-download-generate').click();
    const exportResponse = await exportResponsePromise;
    expect(exportResponse.status()).toBe(202);
    expectCsrf(exportResponse.request());
    const exportBody = requireRecord(await exportResponse.json(), 'C-14');
    const operationId = requireString(exportBody.operationId, 'C-14 operationId');

    await expect
      .poll(
        () =>
          polls.filter((response) =>
            isResponseFor(response, 'GET', `/api/v1/operations/${operationId}`),
          ).length,
      )
      .toBeGreaterThanOrEqual(2);
    const statuses = await Promise.all(
      polls
        .filter((response) => isResponseFor(response, 'GET', `/api/v1/operations/${operationId}`))
        .slice(0, 2)
        .map(async (response) => {
          const body = requireRecord(await response.json(), 'O-01');
          return requireString(body.status, 'O-01 status');
        }),
    );
    expect(statuses).toEqual(['running', 'succeeded']);

    const fileResponse = await fileResponsePromise;
    expect(fileResponse.status()).toBe(200);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).not.toBe('');
  });
});
