import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { PresentationDownloadModal } from './PresentationDownloadModal';

const ID = 'prs_test';

beforeAll(() => {
  // jsdom implements the WHATWG URL class but not the File API's object-URL statics; add them without replacing
  // the real `URL` constructor (MSW and the http client both do `new URL(...)`).
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
});

interface Served {
  exported: unknown[];
  downloadedUrls: string[];
}

/** Simulates C-14 → O-01 (settles "succeeded" on the first poll) → O-03, all through MSW. */
function serve(options: { operationFails?: boolean } = {}): Served {
  const exported: unknown[] = [];
  const downloadedUrls: string[] = [];
  server.use(
    http.post(`${API_BASE_URL}/exports`, async ({ request }) => {
      exported.push(await request.json());
      return HttpResponse.json({ operationId: 'op_test1', status: 'accepted' }, { status: 202 });
    }),
    http.get(`${API_BASE_URL}/operations/:id`, () => {
      if (options.operationFails) {
        return HttpResponse.json({
          id: 'op_test1',
          kind: 'export',
          status: 'failed',
          progressPct: 40,
          messageKey: 'operation.export.failed',
          result: null,
          error: { code: 'EXPORT_FAILED', messageKey: 'operation.export.failed' },
        });
      }
      return HttpResponse.json({
        id: 'op_test1',
        kind: 'export',
        status: 'succeeded',
        progressPct: 100,
        messageKey: 'operation.export.done',
        result: { fileId: 'fil_test1', fileName: 'presentacion.pptx' },
        error: null,
      });
    }),
    // The one and only download path this feature is allowed to use (O-03): a raw storage URL would never be
    // requested through this handler at all, so asserting the request happened here IS the "never a raw storage
    // URL" check.
    http.get(`${API_BASE_URL}/files/:fileId/download`, ({ request }) => {
      downloadedUrls.push(request.url);
      return HttpResponse.arrayBuffer(new ArrayBuffer(4), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
      });
    }),
  );
  return { exported, downloadedUrls };
}

function renderModal() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <PresentationDownloadModal presentationId={ID} open />
    </Wrapper>,
  );
}

describe('PresentationDownloadModal', () => {
  it('exports, polls O-01, and downloads only through the mediated O-03 URL', async () => {
    const { exported, downloadedUrls } = serve();
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId('presentation-download-format-presentation-pdf'));
    await user.click(screen.getByTestId('presentation-download-generate'));

    await waitFor(() => {
      expect(exported).toEqual([{ kind: 'presentation-pdf', params: { presentationId: ID } }]);
    });

    await waitFor(() => {
      expect(downloadedUrls).toHaveLength(1);
    });
    expect(downloadedUrls[0]).toContain(`${API_BASE_URL}/files/fil_test1/download`);
    expect(downloadedUrls[0]).toContain('disposition=attachment');

    expect(await screen.findByTestId('presentation-download-done')).toBeInTheDocument();
  });

  it('shows an error state when the operation fails', async () => {
    serve({ operationFails: true });
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId('presentation-download-generate'));

    expect(await screen.findByTestId('presentation-download-error')).toBeInTheDocument();
  });
});
