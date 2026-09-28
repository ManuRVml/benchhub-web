import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockSession, SessionContext } from '@/entities/session';
import { API_BASE_URL, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { ValueMonitorPage } from './ValueMonitorPage';

const VALUE_MONITOR_PATH = `${API_BASE_URL}/views/value-monitor`;
const SAVED_VIEWS_PATH = `${API_BASE_URL}/saved-views`;
const PEER_RANKING_PATH = `${API_BASE_URL}/views/value-monitor-peer-ranking`;
const HISTORY_PATH = `${API_BASE_URL}/views/value-monitor-history`;
const KVIS_PATH = `${API_BASE_URL}/views/value-monitor-kvis`;
const COMPOSITION_PATH = `${API_BASE_URL}/views/value-monitor-composition`;
const THREAD_PATH = `${API_BASE_URL}/views/comment-thread`;
const REVIEW_COMMENTS_PATH = `${API_BASE_URL}/review-comments`;
const NARRATIVE_PATH = `${API_BASE_URL}/executive-narratives`;
const CONFIG_PATH = `${API_BASE_URL}/views/value-monitor-configuration`;
const UPDATE_CONFIG_PATH = `${API_BASE_URL}/value-monitor-configuration`;
const CANDIDATES_PATH = `${API_BASE_URL}/views/kvi-candidates`;
const ADD_KVIS_PATH = `${API_BASE_URL}/value-monitor-kvis`;
const BENCHMARK_RADAR_PATH = `${API_BASE_URL}/views/value-monitor-benchmark-radar`;

const V27 = {
  header: {
    analystName: 'Camila Bravo',
    updatedLabel: 'Abril 2026',
    status: 'in_construction',
    selectedSnapshotId: '2026-04',
    snapshots: [
      { id: '2026-04', label: 'Abril 2026', note: 'Corte vigente', isClosed: false },
      { id: '2026-01', label: 'Enero 2026', note: 'Cierre T4 2025', isClosed: true },
    ],
  },
  kpis: {
    status: 'ok',
    data: { globalPct: 96.15, retoPct: 78.56, atRiskCount: 1, tbdCount: 3 },
  },
  dimensionWeights: { status: 'ok', data: { fin: 45, op: 30, trans: 25 } },
  permissions: { canSaveView: true },
};

const RANKING = {
  indicator: { id: 'ind_roace', label: 'ROACE', unit: 'percent' },
  periodLabel: '2025',
  rows: [
    { rank: 1, companyId: 'ecopetrol', displayName: 'Ecopetrol', value: 7.4, isEcopetrol: true },
    {
      rank: 2,
      companyId: 'conocophillips',
      displayName: 'ConocoPhillips',
      value: 7.2,
      isEcopetrol: false,
    },
    { rank: 3, companyId: 'pttep', displayName: 'PTTEP', value: 6.7, isEcopetrol: false },
  ],
  permissions: {},
};

const HISTORY_ACTUAL = {
  indicator: { id: 'ind_roace', label: 'ROACE', unit: 'percent' },
  range: 'actual',
  points: [
    { year: 2024, value: 6.2 },
    { year: 2025, value: 7.8 },
  ],
  permissions: {},
};

const HISTORY_5Y = {
  indicator: { id: 'ind_roace', label: 'ROACE', unit: 'percent' },
  range: '5y',
  points: [
    { year: 2021, value: 5.9 },
    { year: 2022, value: 6.5 },
    { year: 2023, value: 7.1 },
    { year: 2024, value: 7.4 },
    { year: 2025, value: 7.8 },
  ],
  permissions: {},
};

const KVIS = {
  warnings: [],
  rows: [
    {
      kviId: 'kvi-fcl',
      code: 'KVI-FCL',
      category: 'financiero',
      categoryLabel: 'Financiero',
      label: 'Flujo de Caja Libre',
      unit: 'bcop',
      weightPct: 10,
      owner: 'Diego Gómez',
      meta: 7.19,
      metaReto: 10.53,
      real: 10.69,
      resultPct: 149,
      retoPct: 102,
      resultBand: 'ok',
      retoBand: 'ok',
      isTbd: false,
      isTextMode: false,
      lowerIsBetter: false,
      isEditable: true,
    },
    {
      kviId: 'kvi-roacewacc',
      code: 'KVI-ROACEWACC',
      category: 'financiero',
      categoryLabel: 'Financiero',
      label: 'ROACE menos WACC',
      unit: 'percent',
      weightPct: null,
      owner: 'Liz Cardona',
      meta: null,
      metaReto: null,
      real: null,
      resultPct: null,
      retoPct: null,
      resultBand: 'tbd',
      retoBand: 'tbd',
      isTbd: true,
      isTextMode: false,
      lowerIsBetter: false,
      isEditable: false,
    },
  ],
  permissions: {},
};

function serveValueMonitor(view: typeof V27 = V27) {
  server.use(http.get(VALUE_MONITOR_PATH, () => HttpResponse.json(view)));
}

function serveRanking(view: typeof RANKING = RANKING) {
  server.use(http.get(PEER_RANKING_PATH, () => HttpResponse.json(view)));
}

function serveHistory(view: typeof HISTORY_ACTUAL = HISTORY_ACTUAL): string[] {
  const seenRanges: string[] = [];
  server.use(
    http.get(HISTORY_PATH, ({ request }) => {
      const url = new URL(request.url);
      const range = url.searchParams.get('range');
      seenRanges.push(range ?? '');
      return HttpResponse.json(range === '5y' ? HISTORY_5Y : view);
    }),
  );
  return seenRanges;
}

function serveKvis(view: typeof KVIS = KVIS): (readonly [string, string])[] {
  const seen: (readonly [string, string])[] = [];
  server.use(
    http.get(KVIS_PATH, ({ request }) => {
      const url = new URL(request.url);
      seen.push([
        url.searchParams.get('categories') ?? '',
        url.searchParams.get('compliance') ?? '',
      ]);
      return HttpResponse.json(view);
    }),
  );
  return seen;
}

const COMPOSITION = {
  centerPct: 96.1,
  categories: [
    {
      id: 'financiero',
      label: 'Financiero',
      colorKey: 'chart.category.financiero',
      weightPct: 60,
      kviCount: 9,
      compliancePct: 90,
    },
    {
      id: 'mercado',
      label: 'Mercado',
      colorKey: 'chart.category.mercado',
      weightPct: 15,
      kviCount: 4,
      compliancePct: 97,
    },
  ],
  permissions: {},
};

function serveComposition(
  view: typeof COMPOSITION | 'error' = COMPOSITION,
): (readonly [string, string])[] {
  const requested: (readonly [string, string])[] = [];
  server.use(
    http.get(COMPOSITION_PATH, ({ request }) => {
      const url = new URL(request.url);
      requested.push([url.searchParams.get('snapshot') ?? '', request.url]);
      if (view === 'error') {
        return HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        );
      }
      return HttpResponse.json(url.searchParams.get('snapshot') === '2026-01' ? COMPOSITION : view);
    }),
  );
  return requested;
}

const THREAD = {
  items: [
    {
      id: 'cmt_01',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
      createdAt: '2026-09-24T10:00:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 1,
  permissions: { canComment: true, canReply: false, canRequestChange: false, canResolve: false },
};

function serveThread(thread: typeof THREAD | 'error' = THREAD) {
  server.use(
    http.get(THREAD_PATH, () =>
      thread === 'error'
        ? HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
            { status: 500 },
          )
        : HttpResponse.json(thread),
    ),
  );
}

function serveCreateComment() {
  const requests: unknown[] = [];
  server.use(
    http.post(REVIEW_COMMENTS_PATH, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({
        id: 'cmt_02',
        createdAt: '2026-09-25T10:00:00-05:00',
        status: 'pending',
      });
    }),
  );
  return requests;
}

const NARRATIVE_SECTION_CONTENT: Record<string, { title: string; text: string }> = {
  overview: {
    title: 'KVIs destacados',
    text: 'El Monitor de Valor registra un cumplimiento global de 96,1% sobre la meta 2025, con 1 KVI(s) en zona de riesgo.',
  },
  performance: {
    title: 'Peso por dimensión',
    text: 'Ecopetrol distribuye su peso en Financiera (45%), Operativa (30%) y Transversal (25%).',
  },
  trends: {
    title: 'Composición del Monitor por categoría',
    text: 'La categoría con mayor peso es Financiero (60% del total), con un cumplimiento promedio de 90%.',
  },
  recommendations: {
    title: 'Comentarios ejecutivos',
    text: '1 comentario(s) pendiente(s), 1 en análisis y 1 resuelto(s).',
  },
};

/** C-15 answers per `section`: the real contract keeps `section` singular even for `scope: 'value-monitor'`, so the
 * Monitor's narrative pill fires one request per fixed section and assembles the 4 results (CF-REVENDOR2). */
function serveNarrative() {
  const requests: { scope: string; section: string }[] = [];
  server.use(
    http.post(NARRATIVE_PATH, async ({ request }) => {
      const body = (await request.json()) as { scope: string; section: string };
      requests.push(body);
      return HttpResponse.json({
        sections: [NARRATIVE_SECTION_CONTENT[body.section]],
        status: 'suggestion',
        generatedBy: { model: 'eco-narrative', version: '1.0' },
      });
    }),
  );
  return requests;
}

const CONFIG = {
  cutOffDate: '2026-03-31',
  rangeFrom: 2020,
  rangeTo: 2026,
  thresholds: { alert: 65, warning: 88 },
  period: 'year',
  sources: [{ id: 'interna_ecp', label: 'Interna ECP', isEnabled: true }],
  kvis: [
    { id: 'ind_roace', label: 'ROACE', isIncluded: true },
    { id: 'ind_margen_ebitda', label: 'Margen EBITDA', isIncluded: false },
  ],
  exceptionsText: '',
  assistantContext: '',
  permissions: { canConfigure: true },
};

function serveConfig(view: typeof CONFIG | 'error' = CONFIG) {
  server.use(
    http.get(CONFIG_PATH, () =>
      view === 'error'
        ? HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
            { status: 500 },
          )
        : HttpResponse.json(view),
    ),
  );
}

function serveUpdateConfig(recalculationOperationId?: string) {
  const requests: unknown[] = [];
  server.use(
    http.put(UPDATE_CONFIG_PATH, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({
        saved: true,
        ...(recalculationOperationId ? { recalculationOperationId } : {}),
      });
    }),
  );
  return requests;
}

const CANDIDATES = {
  source: 'pares',
  items: [
    {
      indicatorId: 'ind_score_esg',
      label: 'Score ESG',
      categoryLabel: 'Transversal',
      isAlreadyIncluded: false,
    },
  ],
  permissions: { canConfigure: true },
};

function serveCandidates(view: typeof CANDIDATES = CANDIDATES) {
  server.use(http.get(CANDIDATES_PATH, () => HttpResponse.json(view)));
}

function serveAddKvis() {
  const requests: unknown[] = [];
  server.use(
    http.post(ADD_KVIS_PATH, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ added: true, monitorCount: 23 });
    }),
  );
  return requests;
}

/** Default backends for the sections every test now renders (composition, comments, configuration), so a test that
 * only cares about e.g. the header does not have to know about them (MSW errors on any unhandled request). */
beforeEach(() => {
  serveComposition();
  serveThread();
  serveConfig();
});

interface RenderOptions {
  /** Initial location (default: the bare route). */
  url?: string;
  /** Session of the shell around the page (default none, as before). */
  session?: ReturnType<typeof mockSession>;
}

function renderPage({ url = routes.valueMonitor.build(), session }: RenderOptions = {}) {
  const { wrapper: Wrapper } = createQueryHarness();
  const target = (testId: string) =>
    function Target() {
      return <p data-testid={testId} />;
    };
  const router = createMemoryRouter(
    [
      { path: routes.valueMonitor.path, Component: ValueMonitorPage },
      { path: routes.sensitivities.path, Component: target('sensitivities-page') },
    ],
    { initialEntries: [url] },
  );
  const page = <RouterProvider router={router} />;
  render(
    <Wrapper>
      {session === undefined ? (
        page
      ) : (
        <SessionContext.Provider value={session}>{page}</SessionContext.Provider>
      )}
    </Wrapper>,
  );
  return router;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ValueMonitorPage', () => {
  it('renders the header fields (analyst, updated, status chip) and the note next to the snapshot select', async () => {
    serveValueMonitor();
    renderPage();
    expect(await screen.findByTestId('value-monitor-meta-analyst')).toHaveTextContent(
      'Camila Bravo',
    );
    expect(screen.getByTestId('value-monitor-meta-updated')).toHaveTextContent('Abril 2026');
    expect(screen.getByTestId('value-monitor-status-chip')).toHaveTextContent('En construcción');
    expect(screen.getByTestId('value-monitor-snapshot-note')).toHaveTextContent('Corte vigente');
  });

  it('lays the sections out in the 840px content column (size token, not the 4px spacing scale)', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    const column = screen.getByTestId('value-monitor-column');
    expect(column).toHaveClass('max-w-(--size-layout-max-width-monitor)', 'gap-20');
    expect(column).toContainElement(screen.getByTestId('value-monitor-header'));
    expect(screen.getByTestId('value-monitor-header')).toHaveClass('px-22', 'py-18');
  });

  it('renders the 4 KPI tiles, toned by band', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    expect(screen.getByText('96%')).toBeInTheDocument();
    expect(screen.getByText('78,6%')).toBeInTheDocument();
    // globalPct 96 -> success (>=90); retoPct 78,6 -> warning (70-89).
    expect(screen.getByText('96%')).toHaveClass('text-status-success-text');
    expect(screen.getByText('78,6%')).toHaveClass('text-status-warning-text');
  });

  it('the snapshot select writes `corte` to the URL and refetches for it', async () => {
    serveValueMonitor();
    const router = renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    fireEvent.change(screen.getByTestId('value-monitor-snapshot-select'), {
      target: { value: '2026-01' },
    });

    expect(await screen.findByTestId('value-monitor-snapshot-note')).toHaveTextContent(
      'Cierre T4 2025',
    );
    expect(router.state.location.search).toContain('corte=2026-01');
  });

  it('"Ir a Sensibilidades" navigates to routes.sensitivities', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    fireEvent.click(screen.getByTestId('value-monitor-go-to-sensitivities'));
    expect(await screen.findByTestId('sensitivities-page')).toBeInTheDocument();
  });

  it('"Guardar vista" shows the inline confirmation for 2.5 s then hides it', async () => {
    serveValueMonitor();
    server.use(
      http.post(SAVED_VIEWS_PATH, () =>
        HttpResponse.json({ id: 'view_1', createdAt: '2026-04-01T00:00:00Z' }),
      ),
    );
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getByTestId('value-monitor-save-view'));
      // Flushes the mutation's promise resolution (onSuccess sets the flash + schedules the 2.5 s hide); wrapped in
      // act() so React flushes the state update the fake-timer-fired callback makes.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(screen.getByTestId('value-monitor-saved-flash')).toHaveTextContent('✓ Vista guardada');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2499);
      });
      expect(screen.getByTestId('value-monitor-saved-flash')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(screen.queryByTestId('value-monitor-saved-flash')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the 3 dimension weights (Financiera / Operativa / Transversal)', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    expect(screen.getByRole('button', { name: 'Financiera: 45%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Operativa: 30%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transversal: 25%' })).toBeInTheDocument();
  });

  it('renders the peer ranking sorted with Ecopetrol distinguished', async () => {
    serveValueMonitor();
    serveRanking();
    renderPage();
    const rows = within(await screen.findByTestId('value-monitor-ranking')).getAllByRole(
      'listitem',
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Ecopetrol');
    const ecopetrolBar = screen.getByRole('img', { name: 'Ecopetrol: 7,4%' });
    expect(ecopetrolBar.closest('[data-highlight]')).toHaveAttribute('data-highlight', 'ecopetrol');
  });

  it('a history range chip writes `historico` to the URL, refetches, and V-29 carries `range`', async () => {
    serveValueMonitor();
    const seenRanges = serveHistory();
    const router = renderPage();
    const dataTable = await screen.findByTestId('value-monitor-history-chart-data-table');
    expect(dataTable).toHaveTextContent('6,2%');
    expect(dataTable).toHaveTextContent('7,8%');
    expect(seenRanges).toEqual(['actual']);

    fireEvent.click(screen.getByRole('button', { name: '5 años' }));

    expect(await screen.findByTestId('value-monitor-history-chart-data-table')).toHaveTextContent(
      '5,9%',
    );
    expect(router.state.location.search).toContain('historico=5y');
    expect(seenRanges).toEqual(['actual', '5y']);
  });

  it('the KVI filters round-trip through the `categoria` / `cumplimiento` URL params, and V-30 carries both', async () => {
    serveValueMonitor();
    const seenFilters = serveKvis();
    const router = renderPage();
    await screen.findByTestId('value-monitor-kvis-section-ready');
    expect(seenFilters).toEqual([['', '']]);

    fireEvent.click(screen.getByRole('button', { name: 'Financiero' }));
    // The URL/query value is the lowercase V-30 slug (categoryId), not the chip's display label.
    expect(router.state.location.search).toContain('categoria=financiero');
    // The category filter is also a V-30 query param, so the KVI section refetches (a new cache key); wait for it
    // to settle back to ready before the next interaction.
    await screen.findByTestId('value-monitor-kvis-section-ready');
    expect(seenFilters.at(-1)).toEqual(['financiero', '']);

    fireEvent.click(screen.getByRole('button', { name: 'TBD' }));
    expect(router.state.location.search).toContain('cumplimiento=tbd');
    await waitFor(() => {
      expect(seenFilters.at(-1)).toEqual(['financiero', 'tbd']);
    });
  });

  it("one section's error does not blank the others", async () => {
    serveValueMonitor();
    serveHistory();
    serveKvis();
    server.use(
      http.get(PEER_RANKING_PATH, () =>
        HttpResponse.json({ code: 'x', message: 'x', traceId: 't' }, { status: 500 }),
      ),
    );
    renderPage();

    expect(await screen.findByTestId('value-monitor-meta-analyst')).toHaveTextContent(
      'Camila Bravo',
    );
    expect(await screen.findByTestId('value-monitor-ranking-section-error')).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-kvis-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-history-chart-data-table')).toHaveTextContent(
      '6,2%',
    );
    // Composition, comments (P5-53) and configuration (P5-52b) are their own SectionResults too: the ranking
    // failure does not blank them.
    expect(await screen.findByTestId('value-monitor-composition-donut-center')).toHaveTextContent(
      '96,1%',
    );
    expect(await screen.findByText('Jorge Salas')).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-config-card-root')).toBeInTheDocument();
  });

  it("a V-32 configuration error doesn't blank the other Monitor sections", async () => {
    serveValueMonitor();
    serveHistory();
    serveKvis();
    serveConfig('error');
    renderPage();

    expect(await screen.findByTestId('value-monitor-meta-analyst')).toHaveTextContent(
      'Camila Bravo',
    );
    expect(
      await screen.findByTestId('value-monitor-configuration-section-error'),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-kvis-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-history-chart-data-table')).toHaveTextContent(
      '6,2%',
    );
    expect(await screen.findByTestId('value-monitor-composition-donut-center')).toHaveTextContent(
      '96,1%',
    );
  });

  it('renders the composition donut and category table (V-31)', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    expect(await screen.findByTestId('value-monitor-composition-donut-center')).toHaveTextContent(
      '96,1%',
    );
    expect(screen.getByTestId('value-monitor-composition-table')).toHaveTextContent('Financiero');
  });

  it('changing the snapshot select changes the composition donut centre (V-31 re-fetches per snapshot)', async () => {
    serveValueMonitor();
    const requested = serveComposition();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');
    expect(await screen.findByTestId('value-monitor-composition-donut-center')).toHaveTextContent(
      '96,1%',
    );

    fireEvent.change(screen.getByTestId('value-monitor-snapshot-select'), {
      target: { value: '2026-01' },
    });

    await screen.findByTestId('value-monitor-snapshot-note');
    expect(requested.some(([snapshot]) => snapshot === '2026-01')).toBe(true);
  });

  it('posting a comment appends it to the list', async () => {
    serveValueMonitor();
    const requests = serveCreateComment();
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByText('Jorge Salas');

    // The mutation invalidates V-26, so the next GET must include the new comment.
    serveThread({
      ...THREAD,
      items: [
        ...THREAD.items,
        {
          id: 'cmt_02',
          kind: 'comment',
          author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
          text: '¿Podemos agregar exportación a PDF del dashboard completo?',
          createdAt: '2026-09-25T10:00:00-05:00',
          status: 'pending',
          decision: null,
          replies: [],
        },
      ],
    });

    await user.type(
      screen.getByTestId('value-monitor-comments-composer-input'),
      '¿Podemos agregar exportación a PDF del dashboard completo?',
    );
    await user.click(screen.getByTestId('value-monitor-comments-composer-submit'));

    expect(
      await screen.findByText('¿Podemos agregar exportación a PDF del dashboard completo?'),
    ).toBeInTheDocument();
    expect(requests).toEqual([
      {
        entityType: 'value_monitor',
        entityId: '2026-04',
        text: '¿Podemos agregar exportación a PDF del dashboard completo?',
      },
    ]);
  });

  it('the "Generar narrativa ejecutiva" pill fires exactly 4 C-15 requests (one per section) and renders 4 sections', async () => {
    serveValueMonitor();
    const requests = serveNarrative();
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByTestId('value-monitor-generate-narrative'));

    const modal = await screen.findByTestId('value-monitor-narrative-modal');
    const sections = within(modal);
    expect(await sections.findByText('KVIs destacados')).toBeInTheDocument();
    expect(sections.getByText('Peso por dimensión')).toBeInTheDocument();
    expect(sections.getByText('Composición del Monitor por categoría')).toBeInTheDocument();
    expect(sections.getByText('Comentarios ejecutivos')).toBeInTheDocument();

    expect(requests).toHaveLength(4);
    expect(requests.map((r) => r.section).sort()).toEqual([
      'overview',
      'performance',
      'recommendations',
      'trends',
    ]);
    for (const request of requests) {
      expect(request).toEqual({ scope: 'value-monitor', section: request.section });
    }
  });

  it('the "Recomendaciones estratégicas IA" pill opens its modal', async () => {
    serveValueMonitor();
    server.use(
      http.get(`${API_BASE_URL}/views/value-monitor-recommendations`, () =>
        HttpResponse.json({
          items: [
            { dimension: 'fin', label: 'Financiera', text: 'alineado con el sector.', tone: 'ok' },
          ],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
          permissions: {},
        }),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByTestId('value-monitor-ai-recommendations'));

    expect(await screen.findByTestId('value-monitor-recommendations-modal')).toBeInTheDocument();
    expect(await screen.findByText('alineado con el sector.')).toBeInTheDocument();
  });

  it("shows V-32's real saved thresholds and period, not fixed defaults", async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    expect(await screen.findByTestId('value-monitor-config-card-root')).toBeInTheDocument();
    expect(screen.getByTestId('value-monitor-config-input-threshold-alert')).toHaveValue('65');
    expect(screen.getByTestId('value-monitor-config-input-threshold-warning')).toHaveValue('88');
    expect(screen.getByTestId('value-monitor-config-select-period')).toHaveValue('year');
  });

  it('"Aplicar configuración" sends C-17 with the edited visible indicators and thresholds, then refetches', async () => {
    serveValueMonitor();
    const requests = serveUpdateConfig();
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByRole('button', { name: 'Margen EBITDA' }));
    await user.click(screen.getByTestId('value-monitor-config-button-apply'));

    expect(await screen.findByTestId('value-monitor-config-card-root')).toBeInTheDocument();
    expect(requests).toEqual([
      {
        config: {
          visibleIndicators: ['ind_roace', 'ind_margen_ebitda'],
          thresholds: { alert: 65, warning: 88 },
          period: 'year',
        },
      },
    ]);
  });

  it('disables the apply button while C-17 is pending', async () => {
    serveValueMonitor();
    let resolveRequest = (): void => undefined;
    server.use(
      http.put(UPDATE_CONFIG_PATH, async () => {
        await new Promise<void>((resolve) => {
          resolveRequest = resolve;
        });
        return HttpResponse.json({ saved: true });
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByTestId('value-monitor-config-button-apply'));

    expect(await screen.findByTestId('value-monitor-config-button-apply')).toBeDisabled();
    resolveRequest();
  });

  it('shows the recalculation banner and reloads the Monitor sections once C-17 returns an operation that succeeds', async () => {
    serveValueMonitor();
    serveUpdateConfig('op_1');
    server.use(
      http.get(`${API_BASE_URL}/operations/op_1`, () =>
        HttpResponse.json({
          id: 'op_1',
          kind: 'recalculation',
          status: 'succeeded',
          progressPct: 100,
          messageKey: 'x',
          result: null,
          error: null,
        }),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByTestId('value-monitor-config-button-apply'));

    const banner = await screen.findByTestId('value-monitor-recalc-banner');
    expect(banner).toBeInTheDocument();
    await waitFor(() => {
      expect(banner).toHaveAttribute('data-status', 'succeeded');
    });
  });

  it('adding a candidate via OVL-05 sends AddValueMonitorKvis with the checked id, and the row appears', async () => {
    serveValueMonitor();
    serveCandidates();
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    await user.click(screen.getByTestId('value-monitor-config-button-add-indicator'));
    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));

    // The new candidate list added on this refetch (invalidated by the mutation) includes the just-added indicator.
    serveConfig({
      ...CONFIG,
      kvis: [...CONFIG.kvis, { id: 'ind_score_esg', label: 'Score ESG', isIncluded: true }],
    });

    await user.click(screen.getByTestId('value-monitor-config-modal-confirm'));

    expect(requests).toEqual([{ source: 'custom', indicatorIds: ['ind_score_esg'] }]);
    expect(await screen.findByRole('button', { name: 'Score ESG' })).toBeInTheDocument();
  });

  it('renders the radar section with one axis per KVI from the mock', async () => {
    serveValueMonitor();
    renderPage();
    await screen.findByTestId('value-monitor-meta-analyst');

    const table = await screen.findByTestId('value-monitor-benchmark-radar-radar-data-table');

    // V-36's default mock fixture (src/test/fixtures/contracts/V-36.response.json) has 6 axes: with the old 2-axis
    // example the "radar" was a single line through the centre (a polygon needs 3+ vertices).
    expect(within(table).getAllByRole('rowheader')).toHaveLength(6);
    expect(screen.getByTestId('value-monitor-benchmark-radar-radar')).toHaveAttribute(
      'data-series-count',
      '2',
    );
    expect(
      screen.getByTestId('value-monitor-benchmark-radar-company-toggle-cmp-ecopetrol'),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it("a radar view error doesn't blank the other Monitor sections", async () => {
    serveValueMonitor();
    server.use(
      http.get(BENCHMARK_RADAR_PATH, () =>
        HttpResponse.json({ code: 'x', message: 'x', traceId: 't' }, { status: 500 }),
      ),
    );
    renderPage();

    expect(await screen.findByTestId('value-monitor-meta-analyst')).toHaveTextContent(
      'Camila Bravo',
    );
    expect(
      await screen.findByTestId('value-monitor-benchmark-radar-section-error'),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('value-monitor-composition-donut-center')).toHaveTextContent(
      '96,1%',
    );
    expect(await screen.findByTestId('value-monitor-config-card-root')).toBeInTheDocument();
  });
});

const SAVED_VIEWS_LIST_PATH = `${API_BASE_URL}/views/saved-views`;
const SAVED_VIEW_ITEM_PATH = `${API_BASE_URL}/saved-views/:viewId`;

const VIEW_A = {
  id: 'sv_01',
  name: 'Financiero en riesgo · Abril 2026',
  createdAt: '2026-09-24T15:30:00-05:00',
  state: {
    corte: '2026-04',
    historico: 'actual',
    categoria: ['financiero'],
    cumplimiento: ['risk'],
  },
};
const VIEW_B = {
  id: 'sv_02',
  name: 'Enero 2026 · 5 años',
  createdAt: '2026-09-23T09:00:00-05:00',
  state: { corte: '2026-01', historico: '5y', categoria: [], cumplimiento: ['ok', 'watch'] },
};

/** Serves V-47 (stateful: a C-20 delete removes the view from the next answer) and records every request. */
function serveSavedViews(
  items: (typeof VIEW_A)[] = [VIEW_A, VIEW_B],
  permissions: { canSaveView: boolean; canDeleteView: boolean } = {
    canSaveView: true,
    canDeleteView: true,
  },
) {
  let current = [...items];
  const listRequests: string[] = [];
  const deleted: string[] = [];
  server.use(
    http.get(SAVED_VIEWS_LIST_PATH, ({ request }) => {
      listRequests.push(new URL(request.url).search);
      return HttpResponse.json({ items: current, permissions });
    }),
    http.get(`${API_BASE_URL}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
    http.delete(SAVED_VIEW_ITEM_PATH, ({ params }) => {
      const viewId = String(params.viewId);
      deleted.push(viewId);
      current = current.filter((view) => view.id !== viewId);
      return HttpResponse.json({ deleted: true, viewId });
    }),
  );
  return { listRequests, deleted };
}

const savedViewsSelect = () => screen.findByTestId('value-monitor-saved-views-select');
const urlParams = (router: ReturnType<typeof renderPage>) =>
  Object.fromEntries(new URLSearchParams(router.state.location.search));

describe('ValueMonitorPage "Mis vistas" (V-47)', () => {
  it('lists the saved views of V-47 after "Vista actual", asking for screen=value-monitor', async () => {
    serveValueMonitor();
    const { listRequests } = serveSavedViews();
    renderPage();
    const select = await savedViewsSelect();
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Vista actual', 'Financiero en riesgo · Abril 2026', 'Enero 2026 · 5 años']);
    expect(select).toHaveValue('');
    expect(listRequests).toEqual(['?screen=value-monitor']);
  });

  it('choosing a view writes vista and applies its stored state (snapshot, history range, filters)', async () => {
    serveValueMonitor();
    serveSavedViews();
    const ranges = serveHistory();
    const kvis = serveKvis();
    const user = userEvent.setup();
    const router = renderPage();
    await user.selectOptions(await savedViewsSelect(), 'sv_02');

    await waitFor(() => {
      expect(urlParams(router)).toEqual({
        vista: 'sv_02',
        corte: '2026-01',
        historico: '5y',
        cumplimiento: 'ok,watch',
      });
    });
    expect(await savedViewsSelect()).toHaveValue('sv_02');
    expect(screen.getByTestId('value-monitor-snapshot-select')).toHaveValue('2026-01');
    // The state reaches the data requests, not just the URL.
    await waitFor(() => {
      expect(ranges).toContain('5y');
      expect(kvis).toContainEqual(['', 'ok,watch']);
    });
  });

  it('"Vista actual" clears vista and leaves the filters as they are', async () => {
    serveValueMonitor();
    serveSavedViews();
    const user = userEvent.setup();
    const router = renderPage();
    await user.selectOptions(await savedViewsSelect(), 'sv_02');
    await waitFor(() => {
      expect(urlParams(router).vista).toBe('sv_02');
    });
    await user.selectOptions(await savedViewsSelect(), '');
    await waitFor(() => {
      expect(urlParams(router).vista).toBeUndefined();
    });
    expect(urlParams(router)).toMatchObject({ corte: '2026-01', historico: '5y' });
  });

  it('reopens a saved view from a vista in the URL: its state is applied without touching the select', async () => {
    serveValueMonitor();
    serveSavedViews();
    const router = renderPage({ url: routes.valueMonitor.build({}, { vista: 'sv_01' }) });
    await waitFor(() => {
      expect(urlParams(router)).toEqual({
        vista: 'sv_01',
        corte: '2026-04',
        historico: 'actual',
        categoria: 'financiero',
        cumplimiento: 'risk',
      });
    });
    expect(await savedViewsSelect()).toHaveValue('sv_01');
  });

  it('deleting the active view calls C-20 with its id, clears vista and drops it from the list', async () => {
    serveValueMonitor();
    const { deleted } = serveSavedViews();
    const user = userEvent.setup();
    const router = renderPage();
    await savedViewsSelect();
    expect(screen.queryByTestId('value-monitor-saved-views-delete')).toBeNull();
    await user.selectOptions(await savedViewsSelect(), 'sv_02');
    await waitFor(() => {
      expect(urlParams(router).vista).toBe('sv_02');
    });
    await user.click(
      await screen.findByRole('button', { name: 'Eliminar la vista «Enero 2026 · 5 años»' }),
    );
    await waitFor(() => {
      expect(deleted).toEqual(['sv_02']);
      expect(urlParams(router).vista).toBeUndefined();
    });
    await waitFor(() => {
      const options = within(screen.getByTestId('value-monitor-saved-views-select')).getAllByRole(
        'option',
      );
      expect(options.map((option) => option.textContent)).toEqual([
        'Vista actual',
        'Financiero en riesgo · Abril 2026',
      ]);
    });
  });

  it('has no delete action without canDeleteView', async () => {
    serveValueMonitor();
    serveSavedViews([VIEW_A, VIEW_B], { canSaveView: true, canDeleteView: false });
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(await savedViewsSelect(), 'sv_01');
    expect(screen.queryByTestId('value-monitor-saved-views-delete')).toBeNull();
  });

  it('is hidden when the user has no saved views', async () => {
    serveValueMonitor();
    const { listRequests } = serveSavedViews([]);
    renderPage();
    await screen.findByTestId('value-monitor-snapshot-select');
    await waitFor(() => {
      expect(listRequests).toHaveLength(1);
    });
    expect(screen.queryByTestId('value-monitor-saved-views-select')).toBeNull();
  });

  it('is hidden when V-47 fails', async () => {
    serveValueMonitor();
    server.use(
      http.get(SAVED_VIEWS_LIST_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    await screen.findByTestId('value-monitor-snapshot-select');
    expect(screen.queryByTestId('value-monitor-saved-views-select')).toBeNull();
  });

  it('is hidden for executive_viewer (no saved views, §1.19) and V-47 is not even requested', async () => {
    serveValueMonitor();
    const { listRequests } = serveSavedViews();
    renderPage({ session: mockSession('executive_viewer') });
    await screen.findByTestId('value-monitor-snapshot-select');
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    expect(screen.queryByTestId('value-monitor-saved-views-select')).toBeNull();
    expect(listRequests).toEqual([]);
  });

  it('shows for an analyst session, and "Guardar vista" refreshes the list (C-19)', async () => {
    serveValueMonitor();
    const { listRequests } = serveSavedViews();
    server.use(
      http.post(SAVED_VIEWS_PATH, () =>
        HttpResponse.json({ id: 'view_new', createdAt: '2026-04-01T00:00:00Z' }),
      ),
    );
    const user = userEvent.setup();
    renderPage({ session: mockSession('analyst_creator') });
    await savedViewsSelect();
    await user.click(screen.getByTestId('value-monitor-save-view'));
    await waitFor(() => {
      expect(listRequests).toHaveLength(2);
    });
  });
});

// The strict mock-mode rule: in `VITE_API_MODE=mock` there is no BFF, so every raw request must fail and only the typed
// ports can answer. The services are the real mock adapters, the raw client's fetch rejects and MSW answers every raw
// request with a network error: "Mis vistas" (V-47 through the port) must still list the fixture's saved view.
describe('ValueMonitorPage "Mis vistas" in mock mode (real mock adapter, all raw http rejected)', () => {
  beforeEach(() => {
    server.use(http.all('*', () => HttpResponse.error()));
  });

  it('lists the V-47 fixture view and applies its state', async () => {
    const noNetwork = createHttpClient({
      fetch: () => Promise.reject(new TypeError('mock mode has no network')),
    });
    const services = { ...createMockPorts(), http: noNetwork, mode: 'mock' as const };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(
      [{ path: routes.valueMonitor.path, Component: ValueMonitorPage }],
      { initialEntries: [routes.valueMonitor.build()] },
    );
    render(
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ServiceContext.Provider>,
    );
    const select = await screen.findByTestId('value-monitor-saved-views-select');
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Vista actual', 'Financiero en riesgo · Abril 2026']);
    await userEvent.setup().selectOptions(select, 'sv_01');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('vista')).toBe('sv_01');
    });
  });
});
