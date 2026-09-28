import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeAll, describe, expect, it } from 'vitest';

import { mockSession, SessionContext } from '@/entities/session';
import { API_BASE_URL, TRACE_ID_HEADER } from '@/shared/api';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { IndicatorDetailPage } from './IndicatorDetailPage';

import type { Role } from '@/entities/session';
import type { CommentThreadView, IndicatorDetailView } from '@/shared/api';

// SCR-10 with V-24 / V-26 served by MSW (the vendored contract 0.1.0 has neither yet) and a mocked session.
const NOW = Date.parse('2026-09-25T10:00:00-05:00');
const URL_ROAC = routes.indicatorDetail.build(
  { analysisId: 'ana_01', indicatorId: 'roace' },
  { origen: 'resultados' },
);

const DETAIL: IndicatorDetailView = {
  indicator: { id: 'ind_roace', label: 'ROACE (%)', unit: 'percent', contextKey: 'above_peers' },
  kpis: {
    status: 'ok',
    data: { ecopetrol: 7.4, peerAvg: 5.5, geVsAvgPct: 34.5, deltaVsPeersPct: 34.5 },
  },
  series: {
    status: 'ok',
    data: {
      periods: { previous: { label: 'T4 2024' }, current: { label: 'T4 2025' } },
      rows: [
        {
          companyId: 'cmp_ecopetrol',
          name: 'Ecopetrol',
          isEcopetrol: true,
          previous: 10.2,
          current: 7.4,
          deltaPct: -27.5,
        },
        {
          companyId: 'cmp_shell',
          name: 'Shell',
          isEcopetrol: false,
          previous: 6.3,
          current: 6.5,
          deltaPct: 3.2,
        },
      ],
      peerAvgCurrent: 5.5,
    },
  },
  insight: {
    status: 'ok',
    data: {
      text: 'Ecopetrol supera el promedio de pares en este indicador.',
      status: 'suggestion',
    },
  },
  traceability: {
    status: 'ok',
    data: {
      source: 'Capital IQ · Estados financieros trimestrales',
      period: { year: 2025, quarter: 4 },
      updatedAt: '2026-09-22T10:00:00-05:00',
      history: [
        {
          text: 'Alejandra actualizó la fuente a Capital IQ.',
          occurredAt: '2026-09-22T10:00:00-05:00',
        },
        { text: 'Creación del indicador en el catálogo.', occurredAt: '2026-06-25T10:00:00-05:00' },
      ],
    },
  },
  permissions: { canComment: true, canRequestChange: true },
};

const THREAD: CommentThreadView = {
  items: [
    {
      id: 'cmt_01',
      kind: 'comment',
      author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
      text: '¿Por qué la brecha con Shell se amplió?',
      createdAt: '2026-09-23T09:10:00-05:00',
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

function serve(detail: IndicatorDetailView | 'error', thread: CommentThreadView = THREAD) {
  const requested: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/indicator-detail/:analysisId/:indicatorId`, ({ request }) => {
      requested.push(request.url);
      return detail === 'error'
        ? HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
            { status: 500, headers: { [TRACE_ID_HEADER]: 't' } },
          )
        : HttpResponse.json(detail);
    }),
    http.get(`${API_BASE_URL}/views/comment-thread`, () => HttpResponse.json(thread)),
  );
  return requested;
}

function renderPage(role: Role = 'analyst_creator') {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <SessionContext.Provider value={mockSession(role)}>
        <MemoryRouter initialEntries={[URL_ROAC]}>
          <Routes>
            <Route path={routes.indicatorDetail.path} element={<IndicatorDetailPage now={NOW} />} />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>
    </Providers>,
  );
}

describe('IndicatorDetailPage (SCR-10)', () => {
  // The chart pulls ECharts into its own lazy chunk (IndicatorDetailPage.tsx); warm the module cache here so its
  // Suspense fallback resolves within the default findBy timeout instead of racing a cold import on a busy run.
  beforeAll(async () => {
    await import('./ui/IndicatorSeriesChart');
  });

  it('loads V-24 for the route params and renders every section', async () => {
    const requested = serve(DETAIL);
    renderPage();
    expect(
      await screen.findByRole('heading', { level: 2, name: /ROACE \(%\)/ }, { timeout: 5000 }),
    ).toHaveTextContent('Ecopetrol supera el desempeño promedio de las empresas pares.');
    const url = new URL(requested[0] ?? '');
    expect(url.pathname).toBe('/api/v1/views/indicator-detail/ana_01/roace');
    expect(url.searchParams.get('origin')).toBe('resultados');

    expect(
      screen.getByText('Comparativo T4 2024 vs T4 2025 frente a compañías pares seleccionadas.'),
    ).toBeInTheDocument();
    expect(screen.getByText('+34,5% frente a pares')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-detail-kpi-ecopetrol')).toHaveTextContent('7,4%');
    expect(await screen.findByTestId('indicator-detail-chart')).toHaveAttribute(
      'data-series-count',
      '2',
    );
    expect(
      screen.getByText('Ecopetrol supera el promedio de pares en este indicador.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Capital IQ · Estados financieros trimestrales')).toBeInTheDocument();
    expect(await screen.findByText('¿Por qué la brecha con Shell se amplió?')).toBeInTheDocument();
  });

  it('formats KBOE levels in KBOE (CF-67) and keeps relative variations in %', async () => {
    serve({
      ...DETAIL,
      indicator: {
        ...DETAIL.indicator,
        label: 'Crecimiento Producción',
        unit: 'kboe',
        contextKey: 'below_peers',
      },
      kpis: {
        status: 'ok',
        data: { ecopetrol: 745, peerAvg: 3020, geVsAvgPct: -75.3, deltaVsPeersPct: -75.3 },
      },
      series: {
        status: 'ok',
        data: {
          periods: { previous: { label: 'T4 2024' }, current: { label: 'T4 2025' } },
          rows: [
            {
              companyId: 'cmp_ecopetrol',
              name: 'Ecopetrol',
              isEcopetrol: true,
              previous: 746,
              current: 745,
              deltaPct: -0.1,
            },
            {
              companyId: 'cmp_chevron',
              name: 'Chevron',
              isEcopetrol: false,
              previous: 3338,
              current: 3723,
              deltaPct: 11.5,
            },
          ],
          peerAvgCurrent: 3020,
        },
      },
    });
    renderPage();
    expect(await screen.findByTestId('indicator-detail-kpi-ecopetrol')).toHaveTextContent(
      '745,0 KBOE',
    );
    expect(screen.getByTestId('indicator-detail-kpi-peer-average')).toHaveTextContent(
      '3.020,0 KBOE',
    );
    expect(screen.getByTestId('indicator-detail-kpi-ge-vs-average')).toHaveTextContent('-75,3%');
    expect(screen.getByTestId('indicator-detail-kpi-ecopetrol')).not.toHaveTextContent('%');
    const table = within(await screen.findByTestId('indicator-detail-chart-data-table'));
    expect(table.getByRole('row', { name: /Chevron/ })).toHaveTextContent(
      '3.338,0 KBOE3.723,0 KBOE+11,5%',
    );
    expect(screen.getByRole('heading', { level: 2, name: /Crecimiento/ })).toHaveTextContent(
      'Ecopetrol se ubica por debajo del desempeño promedio de las empresas pares.',
    );
  });

  it('follows the prototype frame: left-aligned 980px column, no page h1, 4-column traceability', async () => {
    serve(DETAIL);
    renderPage();
    await screen.findByRole('heading', { level: 2, name: /ROACE \(%\)/ }, { timeout: 5000 });
    // The app shell header is the page h1 ("Detalle de indicador"); the indicator title is an h2.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    const page = screen.getByTestId('indicator-detail-page');
    expect(page).toHaveClass('max-w-(--size-layout-max-width-detalle)');
    expect(page).not.toHaveClass('mx-auto');
    const kpis = screen.getByTestId('indicator-detail-kpi-ecopetrol').parentElement;
    expect(kpis).toHaveClass('laptop:grid-cols-3');
    const source = await screen.findByText('Capital IQ · Estados financieros trimestrales');
    expect(source.closest('dl')).toHaveClass('laptop:grid-cols-4');
  });

  it('keeps the V-24 quarter labels in the period copy (CF-76), not the prototype bare years', async () => {
    serve(DETAIL);
    renderPage();
    expect(
      await screen.findByText(
        'Comparativo T4 2024 vs T4 2025 frente a compañías pares seleccionadas.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Comparativo 2024 vs 2025 frente a compañías pares seleccionadas.'),
    ).toBeNull();
  });

  it('"Ver cambios ›" toggles the traceability history', async () => {
    const user = userEvent.setup();
    serve(DETAIL);
    renderPage();
    const toggle = await screen.findByRole('button', { name: 'Ver cambios ›' });
    const history = screen.getByTestId('indicator-detail-history');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', history.id);
    expect(history).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(history).toBeVisible();
    expect(
      within(history).getByText('Alejandra actualizó la fuente a Capital IQ.'),
    ).toBeInTheDocument();
    expect(within(history).getByText('Creación del indicador en el catálogo.')).toBeInTheDocument();

    await user.click(toggle);
    expect(history).not.toBeVisible();
  });

  it.each<[Role, boolean]>([
    ['executive_integral', true],
    ['analyst_creator', false],
    ['executive_viewer', false],
    ['explorer_integral', false],
  ])('"Solicitar ajuste" for %s: %s', async (role, visible) => {
    serve(DETAIL);
    renderPage(role);
    await screen.findByText('¿Por qué la brecha con Shell se amplió?');
    expect(screen.queryByRole('button', { name: 'Solicitar ajuste' }) !== null).toBe(visible);
  });

  it('hides "Solicitar ajuste" when V-24 denies canRequestChange, even for executive_integral', async () => {
    serve({ ...DETAIL, permissions: { canComment: true, canRequestChange: false } });
    renderPage('executive_integral');
    await screen.findByText('¿Por qué la brecha con Shell se amplió?');
    expect(screen.queryByRole('button', { name: 'Solicitar ajuste' })).toBeNull();
  });

  it('a failed section shows its own retry while the others render', async () => {
    serve({ ...DETAIL, kpis: { status: 'error', errorCode: 'PROVIDER_ERROR' } });
    renderPage();
    expect(await screen.findByTestId('indicator-detail-kpis-section-retry')).toBeInTheDocument();
    expect(screen.queryByTestId('indicator-detail-kpi-ecopetrol')).toBeNull();
    expect(await screen.findByTestId('indicator-detail-chart')).toBeInTheDocument();
    expect(screen.getByText('Capital IQ · Estados financieros trimestrales')).toBeInTheDocument();
  });

  it('a failed V-24 is a full-page error with retry', async () => {
    serve('error');
    renderPage();
    expect(
      await screen.findByTestId('indicator-detail-error', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('indicator-detail-retry')).toBeInTheDocument();
  });
});
