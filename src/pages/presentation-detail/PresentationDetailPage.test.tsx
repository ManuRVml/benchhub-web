import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { routes } from '@/shared/config';

import slidesFixture from '../../test/fixtures/contracts/V-42.response.json';
import detailFixture from '../../test/fixtures/contracts/V-43.response.json';
import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { PresentationDetailPage } from './PresentationDetailPage';

const ID = 'prs_directorio_t4';
const SLIDE_LABELS = slidesFixture.slides.map((slide) => slide.label);

beforeAll(() => {
  // SlideStage scales the canvas with a ResizeObserver, which jsdom does not implement.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

/** V-26 of the presentation (the prototype's two comments, HTML L2341-2348 / SCR-14 seeds). */
const THREAD = {
  items: [
    {
      id: 'cmt_prs_1',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Excelente síntesis para el comité.',
      createdAt: '2026-09-27T09:10:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
    {
      id: 'cmt_prs_2',
      kind: 'comment',
      author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
      text: 'Agregar el comparativo frente a Shell.',
      createdAt: '2026-09-26T08:00:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 2,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

function serve(detail: typeof detailFixture = detailFixture) {
  const posted: unknown[] = [];
  const threadQueries: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/comment-thread`, ({ request }) => {
      threadQueries.push(new URL(request.url).search);
      return HttpResponse.json(THREAD);
    }),
    http.get(`${API_BASE_URL}/views/presentation-detail/:id`, () => HttpResponse.json(detail)),
    http.get(`${API_BASE_URL}/views/presentation-slides/:id`, () =>
      HttpResponse.json(slidesFixture),
    ),
    http.post(`${API_BASE_URL}/review-comments`, async ({ request }) => {
      posted.push(await request.json());
      return HttpResponse.json(
        { id: 'cmt_new', createdAt: '2026-09-25T10:00:00-05:00', status: 'pending' },
        { status: 201 },
      );
    }),
  );
  return Object.assign(posted, { threadQueries });
}

function renderPage(slide?: number) {
  const { wrapper: Wrapper } = createQueryHarness();
  const router = createMemoryRouter(
    [
      {
        id: 'presentationDetail',
        path: routes.presentationDetail.path,
        element: <PresentationDetailPage />,
      },
    ],
    {
      initialEntries: [
        routes.presentationDetail.build(
          { presentationId: ID },
          slide === undefined ? {} : { slide },
        ),
      ],
    },
  );
  render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>,
  );
  return router;
}

const slideParam = (router: ReturnType<typeof renderPage>) =>
  new URLSearchParams(router.state.location.search).get('slide');

async function dots() {
  const list = await screen.findByRole('tablist', { name: 'Diapositivas' });
  await waitFor(() => {
    expect(within(list).getAllByRole('tab')[0]).toHaveAccessibleName(SLIDE_LABELS[0]);
  });
  return within(list).getAllByRole('tab');
}

describe('PresentationDetailPage', () => {
  it('reads the current slide from ?slide= and renders it on the stage', async () => {
    serve();
    renderPage(2);
    expect(
      await screen.findByRole('heading', { name: 'Directorio Ejecutivo T4' }),
    ).toBeInTheDocument();
    const tabs = await dots();
    expect(tabs).toHaveLength(SLIDE_LABELS.length);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', tabs[1]?.id);
    expect(tabs[1]).toHaveAttribute('aria-controls', panel.id);
  });

  it('opens the first slide without ?slide= and clamps an out-of-range value to the last one', async () => {
    serve();
    renderPage(99);
    const tabs = await dots();
    expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true');
  });

  it('reaches and activates the dots with the keyboard alone, writing the slide to the URL', async () => {
    serve();
    const user = userEvent.setup();
    const router = renderPage();
    const tabs = await dots();
    expect(tabs.filter((tab) => tab.tabIndex === 0)).toEqual([tabs[0]]);

    // Tab walks the page until the (single) tab stop of the tab list, the current dot.
    for (
      let step = 0;
      step < 10 && document.activeElement?.getAttribute('role') !== 'tab';
      step += 1
    ) {
      await user.tab();
    }
    expect(tabs[0]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(slideParam(router)).toBe('2');
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{End}');
    expect(slideParam(router)).toBe(String(SLIDE_LABELS.length));
    expect(tabs.at(-1)).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(slideParam(router)).toBe(String(SLIDE_LABELS.length));

    await user.keyboard('{Home}');
    expect(slideParam(router)).toBe('1');
    expect(tabs[0]).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Diapositiva siguiente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(slideParam(router)).toBe('2');
    await user.keyboard(' ');
    expect(slideParam(router)).toBe('3');
  });

  it('disables "‹" on the first slide and "›" on the last', async () => {
    serve();
    renderPage();
    await dots();
    expect(screen.getByRole('button', { name: 'Diapositiva anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Diapositiva siguiente' })).toBeEnabled();
  });

  it('renders the V-26 presentation thread under the count heading (bug: "(2)" over an empty list)', async () => {
    const served = serve();
    renderPage();
    const heading = await screen.findByRole('heading', {
      name: 'Comentarios de otros usuarios (2)',
    });
    expect(heading).toBeVisible();
    const card = screen.getByTestId('presentation-detail-comments');
    const list = await within(card).findByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('Jorge Salas')).toBeInTheDocument();
    expect(within(list).getByText('Excelente síntesis para el comité.')).toBeInTheDocument();
    expect(within(list).getByText('Alejandra Ríos')).toBeInTheDocument();
    expect(within(list).getByText(/Ejecutivo visualizador/)).toBeInTheDocument();
    expect(within(card).queryByText('No hay datos para mostrar.')).toBeNull();
    expect(served.threadQueries).toEqual([`?entityType=presentation&entityId=${ID}`]);
  });

  it('comments through a one-line field with "Enviar" inline, capped at 1000 characters', async () => {
    serve();
    renderPage();
    const input = await screen.findByRole('textbox', { name: 'Comentario' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('maxLength', '1000');
    const submit = screen.getByRole('button', { name: 'Enviar' });
    expect(submit).toBeDisabled();
    expect(input.closest('[data-testid$="-composer"]')).toContainElement(submit);
  });

  it('puts "Editar" and "Descargar" on the title row; "Editar" opens the builder', async () => {
    serve({ ...detailFixture, permissions: { ...detailFixture.permissions, canEdit: true } });
    const user = userEvent.setup();
    const router = renderPage();
    const row = await screen.findByTestId('presentation-detail-title-row');
    expect(within(row).getByRole('heading', { name: 'Directorio Ejecutivo T4' })).toBeVisible();
    expect(within(row).getByRole('button', { name: 'Descargar' })).toBeVisible();
    await user.click(within(row).getByRole('button', { name: 'Editar' }));
    expect(router.state.location.pathname).toBe(
      routes.presentationEdit.build({ presentationId: ID }),
    );
  });

  it('shows the comment count and posts a presentation comment', async () => {
    const posted = serve();
    const user = userEvent.setup();
    renderPage();
    expect(
      await screen.findByRole('heading', { name: 'Comentarios de otros usuarios (2)' }),
    ).toBeInTheDocument();
    await user.type(
      await screen.findByRole('textbox', { name: 'Comentario' }),
      'Lista para el comité',
    );
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect([...posted]).toEqual([
        { entityType: 'presentation', entityId: ID, text: 'Lista para el comité' },
      ]);
    });
  });

  it('hides the composer without canComment', async () => {
    serve({ ...detailFixture, permissions: { ...detailFixture.permissions, canComment: false } });
    renderPage();
    await screen.findByRole('heading', { name: 'Comentarios de otros usuarios (2)' });
    await screen.findByText('Jorge Salas');
    expect(screen.queryByRole('textbox', { name: 'Comentario' })).toBeNull();
  });

  it('opens the download modal from the header action', async () => {
    serve();
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Descargar' }));

    expect(await screen.findByTestId('presentation-download')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Descargar presentación' })).toBeInTheDocument();
  });
});

// The mock-mode regression class (see PresentationsPage.test.tsx): the services are the real mock adapters and the raw
// client's fetch rejects, so only the typed ports can answer the detail and slides views (no MSW handler is registered).
describe('PresentationDetailPage in mock mode (real mock adapter, no network)', () => {
  // Strict guard: every raw network request fails, so only the typed ports can answer (the raw client stub and a
  // raw global fetch both get a network error).
  beforeEach(() => {
    server.use(http.all('*', () => HttpResponse.error()));
  });

  it('renders the V-43 frame and the V-42 slides from the fixtures', async () => {
    const noNetwork = createHttpClient({
      fetch: () => Promise.reject(new TypeError('mock mode has no network')),
    });
    const services = { ...createMockPorts(), http: noNetwork, mode: 'mock' as const };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(
      [
        {
          id: 'presentationDetail',
          path: routes.presentationDetail.path,
          element: <PresentationDetailPage />,
        },
      ],
      { initialEntries: [routes.presentationDetail.build({ presentationId: ID })] },
    );
    render(
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ServiceContext.Provider>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Directorio Ejecutivo T4' }),
    ).toBeInTheDocument();
    const tabs = await dots();
    expect(tabs).toHaveLength(SLIDE_LABELS.length);
  });
});
