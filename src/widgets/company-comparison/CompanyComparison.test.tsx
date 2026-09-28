import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { CompanyComparison } from './CompanyComparison';
import { companyComparisonTestIds } from './test-ids';

import type { CompanyComparisonProps } from './CompanyComparison';

const PATH = `${API_BASE_URL}/views/company-comparison/:analysisId`;

const COMPANIES = [
  { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
  { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
];

function viewOf(companyId: string) {
  const companyName = companyId === 'cmp_bp' ? 'BP' : 'Chevron';
  return {
    company: {
      id: companyId,
      name: companyName,
      colorKey: companyId === 'cmp_bp' ? 'bp' : 'chevron',
    },
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
          {
            indicatorId: 'costo_levantamiento',
            code: 'IND-COSTO-LEVANTAMIENTO',
            label: 'Costo de Levantamiento (USD/B)',
            unit: 'usd_b',
            geValue: 12.2,
            companyValue: 4.7,
            diff: 7.5,
            diffUnit: 'usd_b',
            lowerIsBetter: true,
            outcome: 'below',
            hasDetail: false,
          },
          {
            indicatorId: 'crecimiento_ebitda',
            code: 'IND-CRECIMIENTO-EBITDA',
            label: 'Crecimiento EBITDA (%)',
            unit: 'percent',
            geValue: -13.8,
            companyValue: -2,
            diff: -11.8,
            diffUnit: 'percent',
            lowerIsBetter: false,
            outcome: 'below',
            hasDetail: false,
          },
        ],
      },
    ],
    permissions: {},
  };
}

function serve() {
  const seen: string[] = [];
  server.use(
    http.get(PATH, ({ request }) => {
      const companyId = new URL(request.url).searchParams.get('companyId') ?? '';
      seen.push(companyId);
      return HttpResponse.json(viewOf(companyId || 'cmp_chevron'));
    }),
  );
  return seen;
}

function renderWidget(overrides: Partial<CompanyComparisonProps> = {}) {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ToastProvider>
        <MemoryRouter>
          <CompanyComparison analysisId="ana_1" companies={COMPANIES} {...overrides} />
        </MemoryRouter>
      </ToastProvider>
    </Wrapper>,
  );
}

describe('CompanyComparison', () => {
  it('requests V-12 with the default (first) company, then refetches with the newly selected one on tab click', async () => {
    const seen = serve();
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.summary);
    expect(seen).toEqual(['cmp_chevron']);

    fireEvent.click(screen.getByRole('tab', { name: 'BP' }));

    await waitFor(() => {
      expect(seen).toEqual(expect.arrayContaining(['cmp_chevron', 'cmp_bp']));
    });
    await waitFor(() => {
      expect(screen.getByTestId(companyComparisonTestIds.legend)).toHaveTextContent('BP');
    });
  });

  it('re-renders the rows for the newly selected company', async () => {
    serve();
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.row('roace'));
    expect(screen.getByTestId(companyComparisonTestIds.row('roace'))).toHaveTextContent('Chevron');

    fireEvent.click(screen.getByRole('tab', { name: 'BP' }));

    await waitFor(() => {
      expect(screen.getByTestId(companyComparisonTestIds.row('roace'))).toHaveTextContent('BP');
    });
  });

  it('formats the signed difference with its unit suffix (es-CO)', async () => {
    serve();
    renderWidget();
    const roaceRow = await screen.findByTestId(companyComparisonTestIds.row('roace'));
    expect(roaceRow).toHaveTextContent('+1,1 pts');

    const costRow = screen.getByTestId(companyComparisonTestIds.row('costo_levantamiento'));
    expect(costRow).toHaveTextContent('+7,5 USD/B');

    const ebitdaRow = screen.getByTestId(companyComparisonTestIds.row('crecimiento_ebitda'));
    expect(ebitdaRow).toHaveTextContent('-11,8 pts');
  });

  it('shows the polarity tag only for lowerIsBetter indicators', async () => {
    serve();
    renderWidget();
    const costRow = await screen.findByTestId(companyComparisonTestIds.row('costo_levantamiento'));
    expect(within(costRow).getByText('Menor es mejor')).toBeInTheDocument();

    const roaceRow = screen.getByTestId(companyComparisonTestIds.row('roace'));
    expect(within(roaceRow).queryByText('Menor es mejor')).toBeNull();
  });

  it('expands and collapses a category accordion', async () => {
    serve();
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.row('roace'));
    const trigger = screen.getByRole('button', { name: /Rentabilidad/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the "Grupo Ecopetrol" + selected company legend via ChartLegend list items', async () => {
    serve();
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.summary);
    const legend = screen.getByTestId(companyComparisonTestIds.legend);
    const items = within(legend).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Grupo Ecopetrol', 'Chevron']);
  });

  it("carries the selected company's colour on the legend swatch, and updates it on tab switch", async () => {
    serve();
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.summary);

    const chevronItem = screen.getByTestId(companyComparisonTestIds.legendItem('cmp_chevron'));
    const chevronSwatch = chevronItem.querySelector('[aria-hidden="true"]');
    expect(chevronSwatch).toHaveClass('bg-company-chevron');

    fireEvent.click(screen.getByRole('tab', { name: 'BP' }));

    await waitFor(() => {
      expect(screen.getByTestId(companyComparisonTestIds.legendItem('cmp_bp'))).toBeInTheDocument();
    });
    const bpItem = screen.getByTestId(companyComparisonTestIds.legendItem('cmp_bp'));
    const bpSwatch = bpItem.querySelector('[aria-hidden="true"]');
    expect(bpSwatch).toHaveClass('bg-company-bp');
    expect(screen.queryByTestId(companyComparisonTestIds.legendItem('cmp_chevron'))).toBeNull();
  });

  it('opens the narrative dialog on the AI pill and requests C-15 with the performance section', async () => {
    serve();
    let requestBody: unknown;
    server.use(
      http.post(`${API_BASE_URL}/executive-narratives`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          sections: [
            {
              title: 'Rendimiento',
              text: 'Ecopetrol supera a Chevron en la mayoría de indicadores.',
            },
          ],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
        });
      }),
    );
    renderWidget();
    await screen.findByTestId(companyComparisonTestIds.summary);

    fireEvent.click(screen.getByTestId(companyComparisonTestIds.aiPill));

    await waitFor(() => {
      expect(requestBody).toMatchObject({ analysisId: 'ana_1', section: 'performance' });
    });
    expect(
      await screen.findByTestId(`${companyComparisonTestIds.aiPill}-modal-text`),
    ).toHaveTextContent('Ecopetrol supera a Chevron');
  });
});
