import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { ReportComments } from './ReportComments';

import type { CommentThreadView } from '@/shared/api';

const BASE_THREAD: CommentThreadView = {
  items: [
    {
      id: 'cmt_01',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
      createdAt: '2026-09-24T10:00:00-05:00',
      status: 'in_analysis',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 1,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

function serve() {
  let thread = BASE_THREAD;
  server.use(
    http.get(`${API_BASE_URL}/views/comment-thread`, () => HttpResponse.json(thread)),
    http.post(`${API_BASE_URL}/review-comments`, async ({ request }) => {
      const body = (await request.json()) as { text: string };
      thread = {
        ...thread,
        items: [
          ...thread.items,
          {
            id: 'cmt_new',
            kind: 'comment',
            author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
            text: body.text,
            createdAt: '2026-09-25T10:00:00-05:00',
            status: 'pending',
            decision: null,
            replies: [],
          },
        ],
      };
      return HttpResponse.json({
        id: 'cmt_new',
        createdAt: '2026-09-25T10:00:00-05:00',
        status: 'pending',
      });
    }),
  );
}

function renderComments() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ReportComments analysisId="ana_1" canComment />
    </Wrapper>,
  );
}

describe('ReportComments', () => {
  it('renders the existing thread with translated role labels', async () => {
    serve();
    renderComments();
    expect(await screen.findByText(/Excelente que ahora se pueda ver/)).toBeInTheDocument();
    expect(screen.getByText('Ejecutivo visualizador')).toBeInTheDocument();
  });

  it('posts a new comment and appends it to the thread', async () => {
    serve();
    renderComments();
    await screen.findByText(/Excelente que ahora se pueda ver/);
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText('Escribe un comentario...'),
      'Nuevo comentario de prueba',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => {
      expect(screen.getByText('Nuevo comentario de prueba')).toBeInTheDocument();
    });
  });
});
