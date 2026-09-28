import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AnalysisResultsPage } from './AnalysisResultsPage';

import type { ServiceContainer } from '@/shared/api';

const HEADER_PATH = `${API_BASE_URL}/views/results-header/:analysisId`;
const FINDINGS_PATH = `${API_BASE_URL}/views/ai-findings/:analysisId`;
const RECALC_PATH = `${API_BASE_URL}/recalculations`;
const OPERATION_EVENTS_PATH = `${API_BASE_URL}/operations/:operationId/events`;
const PEER_AVERAGE_PATH = `${API_BASE_URL}/views/peer-average-comparison/:analysisId`;
const REPORT_SUMMARY_PATH = `${API_BASE_URL}/views/report-summary/:analysisId`;
const TBG_HORIZON_PATH = `${API_BASE_URL}/views/tbg-horizon/:analysisId`;
const COMPANY_COMPARISON_PATH = `${API_BASE_URL}/views/company-comparison/:analysisId`;
const _COMPARISON_PROFILES_PATH = `${API_BASE_URL}/views/comparison-profiles/:analysisId`;
const NARRATIVE_PATH = `${API_BASE_URL}/executive-narratives`;

const all = ['tbg', 'ilp', 'union'];
const noUnion = ['tbg', 'ilp'];

/** V-09's Resultados-only manifest and every frame permission. */
const V09 = {
  analysis: {
    id: 'ana_1',
    title: 'Desempeño comparativo — 4T 2025',
    status: 'in_review',
    lifecycleState: 'preparation',
    periodLabel: { year: 2025, quarter: 4 },
  },
  horizon: 'tbg',
  horizonOptions: [
    { id: 'tbg', labelKey: 'results.horizon.tbg' },
    { id: 'ilp', labelKey: 'results.horizon.ilp' },
    { id: 'union', labelKey: 'results.horizon.union' },
  ],
  modules: [
    { id: 'footerActions', order: 11, isGated: false, visibleInHorizons: noUnion },
    { id: 'actionRow', order: 1, isGated: false, visibleInHorizons: all },
    { id: 'companyCoverage', order: 2, isGated: false, visibleInHorizons: noUnion },
    { id: 'peerAverageComparison', order: 3, isGated: false, visibleInHorizons: all },
    { id: 'companyComparison', order: 4, isGated: false, visibleInHorizons: noUnion },
    { id: 'reportSummary', order: 10, isGated: false, visibleInHorizons: noUnion },
  ],
  companySet: [
    { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
    { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
  ],
  analysisTabs: [
    { id: 'configuration', isEnabled: true, presentationId: null },
    { id: 'results', isEnabled: true, presentationId: null },
    { id: 'presentation', isEnabled: true, presentationId: 'prs_9' },
  ],
  permissions: {
    canEditValues: true,
    canRecalculate: true,
    canCreatePresentation: true,
    canGenerateNarrative: true,
  },
};

const V14 = {
  findings: [{ id: 'f1', text: 'Shell reporta un margen atípico frente a su histórico.' }],
  status: 'suggestion',
  generatedBy: { model: 'mock', version: '1' },
  permissions: {},
};

function mockViews(
  header:
    typeof V09 | (Omit<typeof V09, 'permissions'> & { permissions: Record<string, boolean> }) = V09,
) {
  server.use(
    http.get(HEADER_PATH, () => HttpResponse.json(header)),
    http.get(FINDINGS_PATH, () => HttpResponse.json(V14)),
  );
}

/** V-11 (peer-average-comparison), minimal shape matching `usePeerAverageComparisonView`'s schema. */
const V11 = {
  categories: [{ id: 'rentabilidad', label: 'Rentabilidad' }],
  category: 'rentabilidad',
  rows: [
    {
      indicatorId: 'roace',
      label: 'ROACE (%)',
      unit: 'percent',
      geValue: 7.4,
      peerAvg: 5.5,
      hasDetail: true,
    },
  ],
  peerAvgCompanies: ['bp'],
  permissions: {},
};

/** V-13 (report-summary). */
const V13 = {
  categoryOptions: [{ id: 'rentabilidad', label: 'Rentabilidad' }],
  rows: [
    {
      category: { id: 'rentabilidad', label: 'Rentabilidad', tier: 1 },
      indicatorId: 'roace',
      label: 'ROACE (%)',
      unit: 'percent',
      geValue: 7.4,
      peerAvg: 5.5,
    },
  ],
  permissions: {},
};

/** V-17 (tbg-horizon), `?view=summary` slice; `companyEditor`/`union`/`companyDetail` are other slices' data. */
const V17_SUMMARY = {
  horizon: 'tbg',
  summary: {
    kpis: { companies: 5, avgFinPct: 47, avgOpPct: 22, avgTransPct: 33 },
    composition: [
      {
        companyId: 'bp',
        name: 'BP',
        finPct: 55,
        opPct: 15,
        transPct: 31,
        finOpPct: null,
        totalPct: 101,
        sumStatus: 'over',
      },
    ],
    mainIndicators: [],
  },
  companyEditor: null,
  union: null,
  companyDetail: null,
  permissions: {},
};

/** V-12 (company-comparison), one row, named after the requested company. */
function v12For(companyId: string) {
  const name = companyId === 'cmp_chevron' ? 'Chevron' : 'BP';
  const colorKey = companyId === 'cmp_chevron' ? 'chevron' : 'bp';
  return {
    company: { id: companyId, name, colorKey },
    summary: { wins: 2, total: 3, winPct: 60 },
    groups: [
      {
        category: { id: 'rentabilidad', label: 'Rentabilidad' },
        wins: 2,
        total: 3,
        rows: [
          {
            indicatorId: 'roace',
            code: 'IND-ROACE',
            label: 'ROACE (%)',
            unit: 'percent',
            geValue: 7.4,
            companyValue: 6.3,
            diff: 1.1,
            diffUnit: 'percent',
            lowerIsBetter: false,
            outcome: 'above',
            hasDetail: true,
          },
        ],
      },
    ],
    permissions: {},
  };
}

/** V-19 (comparison-profiles), two profiles so switching produces a visibly different result. */
function _v19For(profileId: string) {
  const name = profileId === 'prf_2' ? 'Perfil 2' : 'Perfil 1';
  return {
    profiles: [
      { id: 'prf_1', name: 'Perfil 1', businessTypeId: 'all' },
      { id: 'prf_2', name: 'Perfil 2', businessTypeId: 'all' },
    ],
    config: {
      profileId,
      name,
      businessType: 'all',
      businessTypeOptions: ['all'],
      indicators: { fin: [], op: [], trans: [] },
      validityYear: 2025,
      validityYearOptions: [2025],
      availablePeerIds: [],
      peerIds: [],
      weights: { fin: 40, op: 30, trans: 30 },
      weightsTotal: 100,
    },
    result: {
      score: profileId === 'prf_2' ? 70 : 50,
      peerAvg: 55,
      gapPts: profileId === 'prf_2' ? 15 : -5,
      position: 1,
      of: 2,
      ranking: [],
      insight: { text: `Insight for ${name}`, status: 'suggestion' },
    },
    summaryTable: [
      {
        profileId: 'prf_1',
        name: 'Perfil 1',
        subtitle: 'Subtítulo 1',
        year: 2025,
        ecopetrolScore: 50,
        peerAvg: 55,
        gapPts: -5,
        position: 1,
        of: 2,
        isActive: profileId === 'prf_1',
      },
      {
        profileId: 'prf_2',
        name: 'Perfil 2',
        subtitle: 'Subtítulo 2',
        year: 2025,
        ecopetrolScore: 70,
        peerAvg: 55,
        gapPts: 15,
        position: 1,
        of: 2,
        isActive: profileId === 'prf_2',
      },
    ],
    permissions: {},
  };
}

function mockModuleViews() {
  server.use(
    http.get(PEER_AVERAGE_PATH, () => HttpResponse.json(V11)),
    http.get(REPORT_SUMMARY_PATH, () => HttpResponse.json(V13)),
    http.get(TBG_HORIZON_PATH, () => HttpResponse.json(V17_SUMMARY)),
    http.get(COMPANY_COMPARISON_PATH, ({ request }) =>
      HttpResponse.json(v12For(new URL(request.url).searchParams.get('companyId') ?? 'cmp_bp')),
    ),
  );
}

function renderPage(entry = routes.analysisResults.build({ analysisId: 'ana_1' })) {
  const { wrapper: Wrapper } = createQueryHarness();
  const target = (testId: string) =>
    function Target() {
      return <p data-testid={testId} />;
    };
  const router = createMemoryRouter(
    [
      { path: routes.analysisResults.path, Component: AnalysisResultsPage },
      { path: routes.analysisDefinition.path, Component: target('definition-page') },
      { path: routes.analysisReport.path, Component: target('report-page') },
      { path: routes.presentationDetail.path, Component: target('presentation-detail-page') },
      { path: routes.presentationNew.path, Component: target('presentation-new-page') },
    ],
    { initialEntries: [entry] },
  );
  render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>,
  );
  return router;
}

function renderPageWithQueryClient(entry = routes.analysisResults.build({ analysisId: 'ana_1' })) {
  const harness = createQueryHarness();
  const Wrapper = harness.wrapper;
  const target = (testId: string) =>
    function Target() {
      return <p data-testid={testId} />;
    };
  const router = createMemoryRouter(
    [
      { path: routes.analysisResults.path, Component: AnalysisResultsPage },
      { path: routes.analysisDefinition.path, Component: target('definition-page') },
      { path: routes.analysisReport.path, Component: target('report-page') },
      { path: routes.presentationDetail.path, Component: target('presentation-detail-page') },
      { path: routes.presentationNew.path, Component: target('presentation-new-page') },
    ],
    { initialEntries: [entry] },
  );
  render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>,
  );
  return { ...harness, router };
}

const operationEvents = (...events: object[]) =>
  events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');

/** Renders through the real mock adapter (`mode: 'mock'`, `docs/design/screen-inventory` fixtures), no MSW override
 * — the regression this guards is a hook that bypasses its port and calls the raw http client, which throws
 * MOCK_NOT_IMPLEMENTED in this mode instead of resolving. */
function renderPageInMockMode() {
  const services: ServiceContainer = {
    ...createMockPorts(),
    http: createHttpClient(),
    mode: 'mock',
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [{ path: routes.analysisResults.path, Component: AnalysisResultsPage }],
    { initialEntries: [routes.analysisResults.build({ analysisId: 'ana_1' })] },
  );
  render(
    <ServiceContext.Provider value={services}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ServiceContext.Provider>,
  );
}

const moduleOrder = () =>
  [...document.querySelectorAll('[data-module]')].map((node) => node.getAttribute('data-module'));

describe('AnalysisResultsPage', () => {
  it('renders the frame: tabs, action row, results-only modules, footer and rail', async () => {
    mockViews();
    renderPage();
    expect(await screen.findByTestId('results-action-row')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-module-companyCoverage')).toHaveClass('p-(--spacing-22)');
    expect(moduleOrder()).toEqual([
      'companyCoverage',
      'peerAverageComparison',
      'companyComparison',
      'reportSummary',
    ]);
    expect(screen.getByTestId('results-footer')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Resultados' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByTestId('analysis-results-horizon')).not.toBeInTheDocument();
    expect(
      await screen.findByText('Shell reporta un margen atípico frente a su histórico.'),
    ).toBeInTheDocument();
  });

  it('renders the known modules when V-09 carries a module id the web does not know', async () => {
    const warn = vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined);
    mockViews({
      ...V09,
      modules: [
        ...V09.modules,
        { id: 'esgScorecard', order: 5, isGated: false, visibleInHorizons: all },
      ],
    });
    renderPage();
    expect(await screen.findByTestId('results-action-row')).toBeInTheDocument();
    expect(moduleOrder()).toEqual([
      'companyCoverage',
      'peerAverageComparison',
      'companyComparison',
      'reportSummary',
    ]);
    expect(screen.queryByTestId('analysis-results-error')).toBeNull();
    expect(warn.mock.calls.some(([message]) => String(message).includes('esgScorecard'))).toBe(
      true,
    );
    warn.mockRestore();
  });

  it('navigates with the analysis tabs', async () => {
    mockViews();
    const router = renderPage();
    await userEvent.click(await screen.findByRole('tab', { name: 'Configuración' }));
    expect(await screen.findByTestId('definition-page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(
      routes.analysisDefinition.build({ analysisId: 'ana_1' }),
    );
  });

  it('opens the analysis presentation from the Presentación tab', async () => {
    mockViews();
    renderPage();
    await userEvent.click(await screen.findByRole('tab', { name: 'Presentación' }));
    expect(await screen.findByTestId('presentation-detail-page')).toBeInTheDocument();
  });

  it('follows O-02 to completion, refreshes the analysis and re-enables recalculation', async () => {
    mockViews();
    let body: unknown;
    let releaseDone: () => void = () => undefined;
    const done = new Promise<void>((resolve) => {
      releaseDone = resolve;
    });
    server.use(
      http.post(RECALC_PATH, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ operationId: 'op_42', status: 'accepted' }, { status: 202 });
      }),
      http.get(OPERATION_EVENTS_PATH, () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                operationEvents({
                  operationId: 'op_42',
                  status: 'running',
                  progressPct: 50,
                  messageKey: 'operation.running',
                }),
              ),
            );
            void done.then(() => {
              controller.enqueue(
                encoder.encode(
                  operationEvents({
                    operationId: 'op_42',
                    status: 'succeeded',
                    progressPct: 100,
                    messageKey: 'operation.done',
                    result: { targetRoute: '/analisis/ana_1/resultados' },
                  }),
                ),
              );
              controller.close();
            });
          },
        });
        return new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
      }),
    );
    const { queryClient } = renderPageWithQueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.click(await screen.findByTestId('results-recalculate'));
    expect(await screen.findByText('Recalculando resultados…')).toBeInTheDocument();
    expect(screen.getByTestId('results-recalculate')).toBeDisabled();
    releaseDone();
    expect(await screen.findByText('✓ Resultados recalculados.')).toBeInTheDocument();
    expect(body).toEqual({ analysisId: 'ana_1', reason: 'manual-trigger' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['eco', 'analysis', 'ana_1'] });
    expect(screen.getByTestId('results-recalculate')).toBeEnabled();
  });

  it('shows an error and re-enables recalculation when O-02 fails', async () => {
    mockViews();
    server.use(
      http.post(RECALC_PATH, () =>
        HttpResponse.json({ operationId: 'op_43', status: 'accepted' }, { status: 202 }),
      ),
      http.get(
        OPERATION_EVENTS_PATH,
        () =>
          new HttpResponse(
            operationEvents({
              operationId: 'op_43',
              status: 'failed',
              progressPct: 100,
              messageKey: 'operation.failed',
              error: { code: 'RECALCULATION_FAILED', messageKey: 'operation.failed' },
            }),
            { headers: { 'Content-Type': 'text/event-stream' } },
          ),
      ),
    );
    renderPage();
    await userEvent.click(await screen.findByTestId('results-recalculate'));
    expect(await screen.findByText('No se pudo cargar esta sección.')).toBeInTheDocument();
    expect(screen.getByTestId('results-recalculate')).toBeEnabled();
  });

  it('Generar vista de reporte and Crear presentación navigate', async () => {
    mockViews();
    const router = renderPage();
    await userEvent.click(await screen.findByTestId('results-create-presentation'));
    expect(await screen.findByTestId('presentation-new-page')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?analysisId=ana_1');
    await router.navigate(routes.analysisResults.build({ analysisId: 'ana_1' }));
    await userEvent.click(await screen.findByTestId('results-generate-report'));
    expect(await screen.findByTestId('report-page')).toBeInTheDocument();
  });

  it('hides Actualizar and Crear presentación without their permissions; Guardar waits for edits', async () => {
    mockViews({ ...V09, permissions: { canEditValues: true } });
    renderPage();
    expect(await screen.findByTestId('results-footer')).toBeInTheDocument();
    expect(screen.queryByTestId('results-recalculate')).toBeNull();
    expect(screen.queryByTestId('results-create-presentation')).toBeNull();
    expect(screen.queryByTestId('results-generate-narrative')).toBeNull();
    expect(screen.getByTestId('results-save')).toBeDisabled();
  });

  it('shows a full-page error with retry when V-09 fails', async () => {
    server.use(
      http.get(HEADER_PATH, () =>
        HttpResponse.json({ code: 'NOT_FOUND', message: 'x', traceId: 't' }, { status: 404 }),
      ),
      http.get(FINDINGS_PATH, () => HttpResponse.json(V14)),
    );
    renderPage();
    expect(await screen.findByTestId('analysis-results-error')).toHaveAttribute(
      'data-error-code',
      'NOT_FOUND',
    );
    expect(screen.getByTestId('analysis-results-retry')).toBeInTheDocument();
  });

  it('renders each wired module’s own content once its view resolves (P5-RES)', async () => {
    mockViews();
    mockModuleViews();
    renderPage();
    expect(await screen.findByTestId('peer-average-comparison-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('report-summary-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('company-comparison-section-ready')).toBeInTheDocument();
  });

  it('switching the company tab writes ?empresa= and refetches V-12 with that companyId (P5-RES2)', async () => {
    mockViews();
    mockModuleViews();
    const router = renderPage();
    expect(await screen.findByTestId('company-comparison-summary')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('tab', { name: 'Chevron' }));
    await waitFor(() => {
      expect(router.state.location.search).toContain('empresa=cmp_chevron');
    });
    await waitFor(() => {
      expect(screen.getByTestId('company-comparison-summary')).toHaveTextContent('Chevron');
    });
  });

  it('company-comparison’s view error does not blank the other modules (P5-RES2)', async () => {
    mockViews();
    server.use(
      http.get(PEER_AVERAGE_PATH, () => HttpResponse.json(V11)),
      http.get(REPORT_SUMMARY_PATH, () => HttpResponse.json(V13)),
      http.get(COMPANY_COMPARISON_PATH, () =>
        HttpResponse.json({ code: 'INTERNAL', message: 'x', traceId: 't' }, { status: 500 }),
      ),
    );
    renderPage();
    expect(await screen.findByTestId('peer-average-comparison-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('report-summary-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('company-comparison-section-error')).toBeInTheDocument();
  });

  it('one module’s view error does not blank the others (P5-RES)', async () => {
    mockViews();
    server.use(
      http.get(PEER_AVERAGE_PATH, () => HttpResponse.json(V11)),
      http.get(REPORT_SUMMARY_PATH, () =>
        HttpResponse.json({ code: 'INTERNAL', message: 'x', traceId: 't' }, { status: 500 }),
      ),
    );
    renderPage();
    expect(await screen.findByTestId('peer-average-comparison-section-ready')).toBeInTheDocument();
    expect(await screen.findByTestId('report-summary-section-error')).toBeInTheDocument();
  });

  it('a narrative pill opens its dialog with analysisId from the route (P5-RES)', async () => {
    mockViews();
    mockModuleViews();
    const requests: unknown[] = [];
    server.use(
      http.post(NARRATIVE_PATH, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({
          sections: [{ title: 'Comparativo', text: 'GE supera al promedio en ROACE.' }],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
        });
      }),
    );
    renderPage();
    await screen.findByTestId('peer-average-comparison-section-ready');
    await userEvent.click(screen.getByTestId('peer-average-comparison-ai-pill'));
    expect(await screen.findByText('GE supera al promedio en ROACE.')).toBeInTheDocument();
    expect(requests).toEqual([{ scope: 'results', section: 'performance', analysisId: 'ana_1' }]);
  });

  it('every wired module reaches -section-ready in MOCK mode, through the real mock adapter (P7-SWAP-RES)', async () => {
    // The global MSW server answers raw fetches in every mode, which would hide a hook that bypasses its port; make
    // any network request fail so only the mock ports can satisfy the modules.
    server.use(http.all('*', () => HttpResponse.error()));
    renderPageInMockMode();
    for (const scope of [
      'company-coverage',
      'peer-average-comparison',
      'company-comparison',
      'report-summary',
    ]) {
      expect(await screen.findByTestId(`${scope}-section-ready`)).toBeInTheDocument();
    }
  });
});
