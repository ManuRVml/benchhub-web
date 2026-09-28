import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';
import { reportIndicatorPanelTestIds } from '@/widgets/report-indicator-panel';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AnalysisReportPage } from './AnalysisReportPage';

import type { V20Response } from '@/shared/api';

const ID = 'ana_1';
const VISUALIZATION_PATH = `${API_BASE_URL}/views/visualization/:analysisId`;
const RANKING_PATH = `${API_BASE_URL}/views/peer-weight-ranking/:analysisId`;
const INDICATORS_PATH = `${API_BASE_URL}/views/category-indicators/:analysisId`;
const COMMENT_THREAD_PATH = `${API_BASE_URL}/views/comment-thread`;
const RECOMMENDATIONS_PATH = `${API_BASE_URL}/views/weight-recommendations/:analysisId`;

/** V-20 header + KPI tiles (P5-47a) + heatmap/radar (P5-47b) + weightComposition/lineLegend (P5-48); categories are
 * still P5-47c. Real wire shape (P7-SWAP-VIS): each section is SectionResult-wrapped, `position.periodLabel` is
 * `{year,quarter}`, `kpiTiles` is an array tagged by `dimension`, `radar.axes` are dimension codes, and
 * `lineLegend` items carry `dimension` instead of `label`/`colorKey`. */
const V20: V20Response = {
  lifecycleState: 'preparation',
  position: {
    tierId: 2,
    periodLabel: { year: 2025, quarter: 4 },
    indicatorCount: 34,
    peerCount: 14,
  },
  kpiTiles: {
    status: 'ok',
    data: [
      { dimension: 'fin', sectorAvg: 43, ecopetrol: 45, min: 33, max: 62 },
      { dimension: 'op', sectorAvg: 30, ecopetrol: 30, min: 15, max: 40 },
      { dimension: 'trans', sectorAvg: 28, ecopetrol: 25, min: 24, max: 33 },
    ],
  },
  heatmap: {
    status: 'ok',
    data: [
      {
        companyId: 'cmp_ecopetrol',
        name: 'Ecopetrol',
        isEcopetrol: true,
        fin: 45,
        op: 30,
        trans: 25,
      },
      { companyId: 'cmp_bp', name: 'BP', isEcopetrol: false, fin: 55, op: 15, trans: 30 },
    ],
  },
  radar: {
    status: 'ok',
    data: {
      axes: ['fin', 'op', 'trans'],
      ecopetrol: [45, 30, 25],
      sector: [43, 30, 28],
    },
  },
  categories: {
    status: 'ok',
    data: [
      {
        id: 'rentabilidad',
        label: 'Rentabilidad',
        tierId: 2,
        message: 'Ecopetrol mantiene margen sólido.',
      },
      { id: 'liquidez', label: 'Liquidez', tierId: 1, message: 'Liquidez sana.' },
      { id: 'operacional', label: 'Operacional', tierId: 3, message: 'Seguimiento cercano.' },
      {
        id: 'competitividad_opex',
        label: 'Competitividad OPEX',
        tierId: 1,
        message: 'Costos competitivos.',
      },
      { id: 'solvencia', label: 'Solvencia', tierId: 4, message: 'Requiere atención.' },
      { id: 'esg', label: 'ESG', tierId: 2, message: 'Desempeño alineado.' },
    ],
  },
  weightComposition: {
    status: 'ok',
    data: {
      ecopetrol: { fin: 45, op: 30, trans: 25 },
      diffs: { fin: 2, op: 0, trans: -3 },
      companies: [
        {
          companyId: 'cmp_total',
          name: 'TotalEnergies',
          fin: 62,
          op: 20,
          trans: 24,
          totalPct: 106,
          sumStatus: 'over',
        },
        {
          companyId: 'cmp_bp',
          name: 'BP',
          fin: 55,
          op: 15,
          trans: 30,
          totalPct: 100,
          sumStatus: 'ok',
        },
      ],
      groupAvg: { fin: 43, op: 30, trans: 28 },
      hasOverweight: true,
      lineLegend: [
        {
          code: 'LIN-01',
          dimension: 'fin',
          formula: 'Promedio ponderado de ROACE, Margen EBITDA y Deuda Neta/EBITDA',
        },
        {
          code: 'LIN-02',
          dimension: 'op',
          formula: 'Promedio ponderado de crecimiento de producción y competitividad en OPEX',
        },
        {
          code: 'LIN-03',
          dimension: 'trans',
          formula: 'Promedio ponderado de gobernanza corporativa y factores ESG',
        },
      ],
    },
  },
  permissions: { canPublish: true, canCreatePresentation: true, canComment: true },
};

const V22_RENTABILIDAD = {
  category: {
    id: 'rentabilidad',
    label: 'Rentabilidad',
    message: 'Ecopetrol mantiene margen sólido pese a la contracción.',
  },
  rows: [
    {
      indicatorId: 'ind_roace',
      code: 'IND-01',
      label: 'ROACE (%)',
      unit: 'percent',
      valueKind: 'level',
      ecopetrol: 7.4,
      peerAvg: 5.5,
      tierId: 2,
      hasDetail: true,
    },
    {
      indicatorId: 'ind_ebitda',
      code: 'IND-02',
      label: 'Margen EBITDA (%)',
      unit: 'percent',
      valueKind: 'level',
      ecopetrol: 39,
      peerAvg: 32,
      tierId: 1,
      hasDetail: false,
    },
  ],
  permissions: {},
};

const V22_LIQUIDEZ = {
  category: { id: 'liquidez', label: 'Liquidez', message: 'Liquidez sana.' },
  rows: [
    {
      indicatorId: 'ind_razon',
      code: 'IND-14',
      label: 'Razón corriente',
      unit: 'ratio_x',
      valueKind: 'level',
      ecopetrol: 1.3,
      peerAvg: 1.1,
      tierId: 1,
      hasDetail: true,
    },
  ],
  permissions: {},
};

const THREAD_EMPTY = {
  items: [],
  page: 1,
  pageSize: 20,
  totalItems: 0,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

const RECOMMENDATIONS_EMPTY = {
  scope: 'visualization',
  items: [],
  countActionable: 0,
  status: 'suggestion',
  permissions: {},
};

const V21_FIN = {
  dimension: 'fin',
  rows: [
    {
      rank: 1,
      companyId: 'cmp_bp',
      name: 'BP',
      initials: 'BP',
      colorKey: 'bp',
      pct: 55,
      isLeader: true,
      isEcopetrol: false,
      explanation: {
        key: 'ranking.explain.leader',
        params: { name: 'BP', dimension: 'fin', pct: 55 },
      },
    },
    {
      rank: 2,
      companyId: 'cmp_ecopetrol',
      name: 'Ecopetrol',
      initials: 'EC',
      colorKey: 'ecopetrol',
      pct: 45,
      isLeader: false,
      isEcopetrol: true,
      explanation: {
        key: 'ranking.explain.ecopetrol',
        params: {
          rank: 2,
          dimension: 'fin',
          pct: 45,
          gapToLeaderPts: 10,
          leaderName: 'BP',
          leaderPct: 55,
          gapToAvgPts: 2,
        },
      },
    },
  ],
  permissions: {},
};

const V21_OP = {
  dimension: 'op',
  rows: [
    {
      rank: 1,
      companyId: 'cmp_ecopetrol',
      name: 'Ecopetrol',
      initials: 'EC',
      colorKey: 'ecopetrol',
      pct: 30,
      isLeader: true,
      isEcopetrol: true,
      explanation: {
        key: 'ranking.explain.leader',
        params: { name: 'Ecopetrol', dimension: 'op', pct: 30 },
      },
    },
    {
      rank: 2,
      companyId: 'cmp_bp',
      name: 'BP',
      initials: 'BP',
      colorKey: 'bp',
      pct: 15,
      isLeader: false,
      isEcopetrol: false,
      explanation: {
        key: 'ranking.explain.peer',
        params: {
          name: 'BP',
          rank: 2,
          dimension: 'op',
          pct: 15,
          gapToLeaderPts: 15,
          leaderName: 'Ecopetrol',
          leaderPct: 30,
        },
      },
    },
  ],
  permissions: {},
};

function serveVisualization(view: V20Response = V20) {
  server.use(
    http.get(VISUALIZATION_PATH, () => HttpResponse.json(view)),
    http.get(COMMENT_THREAD_PATH, () => HttpResponse.json(THREAD_EMPTY)),
    http.get(RECOMMENDATIONS_PATH, () => HttpResponse.json(RECOMMENDATIONS_EMPTY)),
  );
}

function serveRanking(seen: string[] = []) {
  server.use(
    http.get(RANKING_PATH, ({ request }) => {
      const dimension = new URL(request.url).searchParams.get('dimension') ?? '';
      seen.push(dimension);
      return HttpResponse.json(dimension === 'op' ? V21_OP : V21_FIN);
    }),
  );
  return seen;
}

function serveIndicators(seen: string[] = []) {
  server.use(
    http.get(INDICATORS_PATH, ({ request }) => {
      const category = new URL(request.url).searchParams.get('category') ?? '';
      seen.push(category);
      return HttpResponse.json(category === 'liquidez' ? V22_LIQUIDEZ : V22_RENTABILIDAD);
    }),
  );
  return seen;
}

function renderPage(entry = routes.analysisReport.build({ analysisId: ID })) {
  const { wrapper: Wrapper } = createQueryHarness();
  const target = (testId: string) =>
    function Target() {
      return <p data-testid={testId} />;
    };
  const router = createMemoryRouter(
    [
      { path: routes.analysisReport.path, Component: AnalysisReportPage },
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

describe('AnalysisReportPage', () => {
  it('renders the relocated TBG and ILP module group in Visualización', async () => {
    renderPage();

    expect(await screen.findByTestId('visualization-comparison-profiles-card')).toBeInTheDocument();
  });

  it('renders the header (tier, period, counts) and the 3 KPI tiles from V-20', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    expect(await screen.findByTestId('report-position-tier-name')).toHaveTextContent('Estratégico');
    expect(screen.getByText('Posición global · T4 2025')).toBeInTheDocument();
    expect(screen.getByText('promedio de 34 indicadores vs. 14 pares')).toBeInTheDocument();
    expect(screen.getByTestId('report-position-kpi-tile-fin')).toHaveTextContent('43%');
    expect(screen.getByTestId('report-position-kpi-tile-op')).toHaveTextContent('30%');
    expect(screen.getByTestId('report-position-kpi-tile-trans')).toHaveTextContent('28%');
  });

  it('keeps the prototype visualization free of preview and publish workflow controls', async () => {
    serveVisualization({ ...V20, lifecycleState: 'preview' });
    serveRanking();
    serveIndicators();
    renderPage();
    await screen.findByTestId('report-position-tier-name');
    expect(
      screen.queryByText('Vista previa · visible solo para los revisores invitados'),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Publicar' })).toBeNull();
    expect(screen.getByTestId('report-position-create-presentation')).toBeInTheDocument();
  });

  it('uses the tokenized 300px comments rail from the prototype grid', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    expect(await screen.findByTestId('analysis-report-layout')).toHaveClass(
      'desktop:grid-cols-[minmax(0,1fr)_var(--size-layout-right-rail)]',
    );
  });

  it('uses the prototype spacing token on its major cards', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    expect(await screen.findByTestId('report-position-header')).toHaveClass('p-(--spacing-22)');
    expect(screen.getByTestId('report-panorama')).toHaveClass('p-(--spacing-22)');
    expect(screen.getByTestId('category-tiers')).toHaveClass('p-(--spacing-22)');
    expect(screen.getByTestId('weight-composition')).toHaveClass('p-(--spacing-22)');
  });

  it('"Crear presentación" links to the presentation builder for this analysis', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    const router = renderPage();
    await userEvent.click(await screen.findByTestId('report-position-create-presentation'));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(routes.presentationNew.path);
    });
    expect(router.state.location.search).toBe(`?analysisId=${ID}`);
  });

  it('renders the Panorama heatmap and radar from V-20', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    const heatmapTable = await screen.findByTestId('report-panorama-heatmap-data-table');
    expect(heatmapTable).toHaveTextContent('Ecopetrol');
    expect(heatmapTable).toHaveTextContent('BP');
    const radarTable = screen.getByTestId('report-panorama-radar-data-table');
    expect(radarTable).toHaveTextContent('Financiera');
  });

  it('keeps the KPI tiles and categories when the V-20 heatmap section errors', async () => {
    serveVisualization({
      ...V20,
      heatmap: { status: 'error', errorCode: 'PROVIDER_ERROR' },
    });
    serveRanking();
    serveIndicators();
    renderPage();
    expect(await screen.findByTestId('analysis-report-heatmap-section-error')).toBeInTheDocument();
    expect(screen.getByTestId('report-position-kpi-tile-fin')).toHaveTextContent('43%');
    expect(await screen.findByTestId('category-tiers-card-rentabilidad')).toBeInTheDocument();
  });

  it('shows the V-20 radar forbidden state without replacing the dashboard', async () => {
    serveVisualization({ ...V20, radar: { status: 'forbidden' } });
    serveRanking();
    serveIndicators();
    renderPage();
    expect(
      await screen.findByTestId('analysis-report-radar-section-forbidden'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('report-position-kpi-tile-fin')).toHaveTextContent('43%');
  });

  it('handles partial degradation when weight-composition errors while other sections render', async () => {
    serveVisualization({
      ...V20,
      weightComposition: { status: 'error', errorCode: 'PROVIDER_ERROR' },
    });
    serveRanking();
    serveIndicators();
    renderPage();
    expect(
      await screen.findByTestId('analysis-report-weight-composition-section-error'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('report-position-kpi-tile-fin')).toHaveTextContent('43%');
    expect(await screen.findByTestId('category-tiers-card-rentabilidad')).toBeInTheDocument();
  });

  it('writes ranking=op to the URL and refetches V-21 with dimension=op', async () => {
    serveVisualization();
    const seen = serveRanking();
    serveIndicators();
    const router = renderPage();
    // V-21 only fires after V-20 resolves; same chained wait as the V-22 panel test.
    await screen.findAllByTestId(/^peer-weight-ranking-row-/, {}, { timeout: 5000 });
    expect(seen).toEqual(['fin']);
    await userEvent.click(screen.getByTestId('peer-weight-ranking-dimension-chip-op'));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?ranking=op');
    });
    await waitFor(() => {
      expect(seen).toEqual(expect.arrayContaining(['fin', 'op']));
    });
  });

  it('reads the initial ranking dimension from ?ranking=', async () => {
    serveVisualization();
    const seen = serveRanking();
    serveIndicators();
    renderPage(routes.analysisReport.build({ analysisId: ID }, { ranking: 'op' }));
    await waitFor(() => {
      expect(seen).toEqual(['op']);
    });
  });

  it('mounts the weight composition, comments rail and recommendations trigger (P5-48)', async () => {
    serveVisualization();
    serveRanking();
    renderPage();
    expect(await screen.findByTestId('weight-composition')).toHaveTextContent('TotalEnergies');
    expect(screen.getByTestId('weight-composition-overweight-banner')).toBeInTheDocument();
    expect(screen.getByTestId('report-comments')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('yarbis-recommendations-pill')).toHaveTextContent(
        'Recomendaciones de Yarbis (0)',
      );
    });
  });

  it('a V-21 error shows retry without breaking the header/KPI slice', async () => {
    serveVisualization();
    serveIndicators();
    server.use(
      http.get(RANKING_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    expect(await screen.findByTestId('report-position-tier-name')).toHaveTextContent('Estratégico');
    expect(screen.getByTestId('report-position-kpi-tile-fin')).toHaveTextContent('43%');
    expect(await screen.findByTestId('peer-weight-ranking-section-retry')).toBeInTheDocument();
  });

  it('renders the 6 category cards with their tier chip', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    expect(await screen.findByTestId('category-tiers-card-rentabilidad')).toHaveTextContent(
      'Estratégico',
    );
    expect(screen.getByTestId('category-tiers-card-liquidez')).toHaveTextContent('Líder');
    expect(screen.getByTestId('category-tiers-card-solvencia')).toHaveTextContent('Prioritario');
    expect(screen.getAllByTestId(/^category-tiers-card-/)).toHaveLength(6);
  });

  it('defaults to rentabilidad and renders its indicator rows', async () => {
    serveVisualization();
    serveRanking();
    const seen = serveIndicators();
    renderPage();
    expect(
      // V-22 only fires after V-20 resolves (the selected category comes from V-20's categories), so this waits on
      // two sequential requests plus the lazy panel — past findBy's 1s default under load (same as the retry test).
      await screen.findByTestId(
        reportIndicatorPanelTestIds.row('ind_roace'),
        {},
        { timeout: 5000 },
      ),
    ).toHaveTextContent('7,4%');
    expect(seen).toEqual(['rentabilidad']);
  });

  it('clicking a category card writes categoria= and refetches V-22 with that category', async () => {
    serveVisualization();
    serveRanking();
    const seen = serveIndicators();
    const router = renderPage();
    await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_roace'));
    await userEvent.click(screen.getByTestId('category-tiers-card-liquidez'));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?categoria=liquidez');
    });
    await waitFor(() => {
      expect(seen).toEqual(expect.arrayContaining(['rentabilidad', 'liquidez']));
    });
    expect(
      await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_razon')),
    ).toBeInTheDocument();
  });

  it('a row with hasDetail links to the indicator detail route, one without has no link', async () => {
    serveVisualization();
    serveRanking();
    serveIndicators();
    renderPage();
    const roace = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_roace'));
    expect(roace.tagName).toBe('A');
    const ebitda = screen.getByTestId(reportIndicatorPanelTestIds.row('ind_ebitda'));
    expect(ebitda.tagName).not.toBe('A');
  });

  it('a V-22 error shows retry without breaking the rest of the page', async () => {
    serveVisualization();
    serveRanking();
    server.use(
      http.get(INDICATORS_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    expect(await screen.findByTestId('report-position-tier-name')).toHaveTextContent('Estratégico');
    expect(
      await screen.findByTestId('report-indicator-panel-section-retry', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
