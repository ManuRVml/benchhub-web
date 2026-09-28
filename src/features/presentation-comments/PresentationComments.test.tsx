// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { PresentationComments } from './PresentationComments';

const THREAD = {
  items: [
    {
      id: 'cmt_prs_1',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Incluir el comparativo frente a Shell antes de los hallazgos.',
      createdAt: '2026-09-27T09:10:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 1,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

function serve(thread: typeof THREAD = THREAD) {
  const posted: unknown[] = [];
  const queries: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/comment-thread`, ({ request }) => {
      queries.push(new URL(request.url).search);
      return HttpResponse.json(thread);
    }),
    http.post(`${API_BASE_URL}/review-comments`, async ({ request }) => {
      posted.push(await request.json());
      return HttpResponse.json(
        { id: 'cmt_new', createdAt: '2026-09-25T10:00:00-05:00', status: 'pending' },
        { status: 201 },
      );
    }),
  );
  return { posted, queries };
}

function renderComments(canComment = true, variant: 'detail' | 'builder' = 'builder') {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <PresentationComments
        presentationId="prs_test"
        canComment={canComment}
        count={1}
        variant={variant}
      />
    </Wrapper>,
  );
}

describe('PresentationComments', () => {
  it('reads the V-26 thread of the presentation and renders its comments', async () => {
    const { queries } = serve();
    renderComments();
    expect(await screen.findByText('Jorge Salas')).toBeInTheDocument();
    expect(
      screen.getByText('Incluir el comparativo frente a Shell antes de los hallazgos.'),
    ).toBeInTheDocument();
    expect(queries).toEqual(['?entityType=presentation&entityId=prs_test']);
  });

  it('builder variant: "Comentarios" heading with a neutral count pill (HTML L2562-2563)', async () => {
    serve();
    renderComments(true, 'builder');
    const heading = screen.getByRole('heading', { name: 'Comentarios' });
    expect(heading).toBeInTheDocument();
    const pill = screen.getByTestId('presentation-comments-count');
    expect(pill).toHaveTextContent('1');
    expect(pill).toHaveAttribute('data-variant', 'count-neutral');
    await screen.findByText('Jorge Salas');
  });

  it('detail variant: "Comentarios de otros usuarios (n)" card', async () => {
    serve();
    renderComments(true, 'detail');
    const heading = screen.getByRole('heading', { name: 'Comentarios de otros usuarios (1)' });
    expect(heading).toBeInTheDocument();
    const card = screen.getByTestId('presentation-comments');
    expect(await within(card).findByText('Jorge Salas')).toBeInTheDocument();
  });

  it('posts through C-10 with entityType presentation from the one-line composer', async () => {
    const { posted } = serve();
    const user = userEvent.setup();
    renderComments(true);

    await user.type(await screen.findByRole('textbox', { name: 'Comentario' }), 'Buen avance');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(posted).toEqual([
        { entityType: 'presentation', entityId: 'prs_test', text: 'Buen avance' },
      ]);
    });
  });

  it('hides the composer when canComment is false', async () => {
    serve();
    renderComments(false);
    await screen.findByText('Jorge Salas');
    expect(screen.queryByRole('textbox', { name: 'Comentario' })).not.toBeInTheDocument();
  });
});
