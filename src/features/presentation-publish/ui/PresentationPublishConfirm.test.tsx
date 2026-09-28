import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { PresentationPublishConfirm } from './PresentationPublishConfirm';

const ID = 'prs_test';

function serve(options: { fails?: boolean } = {}) {
  const published: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/presentations/:id/publication`, async ({ request }) => {
      published.push(await request.json());
      if (options.fails) {
        return HttpResponse.json(
          { code: 'NOT_COMPLETE', message: 'Missing modules', traceId: 't1' },
          { status: 422 },
        );
      }
      return HttpResponse.json({
        published: true,
        publicationId: 'pub_1',
        publishedAt: '2026-09-25T10:00:00Z',
      });
    }),
  );
  return { published };
}

function renderConfirm(onPublished?: () => void) {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ToastProvider>
        <PresentationPublishConfirm
          presentationId={ID}
          open
          {...(onPublished ? { onPublished } : {})}
        />
      </ToastProvider>
    </Wrapper>,
  );
}

describe('PresentationPublishConfirm', () => {
  it('publishes via C-29 on confirm and shows the success Toast', async () => {
    const { published } = serve();
    const user = userEvent.setup();
    let publishedCount = 0;
    renderConfirm(() => {
      publishedCount += 1;
    });

    await user.click(screen.getByTestId('presentation-publish-confirm'));

    await waitFor(() => {
      expect(published).toEqual([{}]);
    });
    expect(await screen.findByText('✓ Presentación publicada correctamente.')).toBeInTheDocument();
    expect(publishedCount).toBe(1);
  });

  it('shows an error Toast when the publish command fails', async () => {
    serve({ fails: true });
    const user = userEvent.setup();
    renderConfirm();

    await user.click(screen.getByTestId('presentation-publish-confirm'));

    expect(
      await screen.findByText('No se pudo publicar la presentación. Intenta de nuevo.'),
    ).toBeInTheDocument();
  });
});
