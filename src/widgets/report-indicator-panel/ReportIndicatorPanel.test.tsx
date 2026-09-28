import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';
import { sectionBoundaryTestIds } from '@/shared/ui/layout/section-boundary';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { REPORT_INDICATOR_PANEL_SCOPE, ReportIndicatorPanel } from './ReportIndicatorPanel';
import { reportIndicatorPanelTestIds } from './test-ids';

import type { CategoryIndicatorsView } from '@/entities/analysis';

const PATH = `${API_BASE_URL}/views/category-indicators/:analysisId`;

// SCR-09 Rentabilidad mock (docs/design/screen-inventory/SCR-09-visualizacion.md, module 4 render). Shaped on the
// generated GetCategoryIndicatorsViewResponse (src/shared/api/generated/zod.ts).
const ROWS: CategoryIndicatorsView = {
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

function serve(rows: typeof ROWS = ROWS) {
  server.use(http.get(PATH, () => HttpResponse.json(rows)));
}

function renderPanel(category = 'rentabilidad') {
  const { wrapper: Wrapper } = createQueryHarness();
  const target = (testId: string) =>
    function Target() {
      return <p data-testid={testId} />;
    };
  const router = createMemoryRouter(
    [
      {
        path: routes.analysisReport.path,
        Component: () => (
          <ReportIndicatorPanel
            analysisId="ana_1"
            category={category}
            categoryLabel="Rentabilidad"
            categoryMessage="Ecopetrol mantiene margen sólido pese a la contracción."
          />
        ),
      },
      { path: routes.indicatorDetail.path, Component: target('indicator-detail-page') },
    ],
    { initialEntries: [routes.analysisReport.build({ analysisId: 'ana_1' })] },
  );
  render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>,
  );
  return router;
}

describe('ReportIndicatorPanel', () => {
  it('renders each row with Ecopetrol vs. peer average, es-CO formatted', async () => {
    serve();
    renderPanel();
    const roace = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_roace'));
    expect(roace).toHaveTextContent('ROACE (%)');
    expect(roace).toHaveTextContent('IND-01');
    expect(roace).toHaveTextContent('7,4%');
    expect(roace).toHaveTextContent('5,5%');
  });

  it('links a row with hasDetail to the indicator detail route', async () => {
    serve();
    const router = renderPanel();
    const roace = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_roace'));
    expect(roace.tagName).toBe('A');
    fireEvent.click(roace);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/analisis/ana_1/indicadores/ind_roace');
    });
  });

  it('renders a row without hasDetail as a plain row (no link)', async () => {
    serve();
    renderPanel();
    const ebitda = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_ebitda'));
    expect(ebitda.tagName).not.toBe('A');
  });

  it('signs the value only for growth/delta indicators (CF-70), never for levels', async () => {
    serve({
      category: ROWS.category,
      rows: [
        {
          indicatorId: 'ind_growth',
          code: 'IND-03',
          label: 'Crecimiento EBITDA (%)',
          unit: 'percent',
          valueKind: 'growth',
          ecopetrol: -13.8,
          peerAvg: -2.2,
          tierId: 4,
          hasDetail: true,
        },
      ],
      permissions: {},
    });
    renderPanel();
    const row = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_growth'));
    expect(row).toHaveTextContent('-13,8%');
    expect(row).toHaveTextContent('-2,2%');
  });

  it('renders "—" for a null value', async () => {
    serve({
      category: ROWS.category,
      rows: [
        {
          indicatorId: 'ind_missing',
          code: 'IND-04',
          label: 'Sin dato',
          unit: 'percent',
          valueKind: 'level',
          ecopetrol: null,
          peerAvg: null,
          tierId: 3,
          hasDetail: false,
        },
      ],
      permissions: {},
    });
    renderPanel();
    const row = await screen.findByTestId(reportIndicatorPanelTestIds.row('ind_missing'));
    expect(row).toHaveTextContent('—');
  });

  it('shows a retry button on a V-22 error', async () => {
    server.use(
      http.get(PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderPanel();
    expect(
      await screen.findByTestId(sectionBoundaryTestIds.retry(REPORT_INDICATOR_PANEL_SCOPE)),
    ).toBeInTheDocument();
  });
});
