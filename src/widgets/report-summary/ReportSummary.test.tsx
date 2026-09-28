import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { ReportSummary } from './ReportSummary';

import type { ReportSummaryRow } from './types';

// Mock test IDs
vi.mock('./test-ids', () => ({
  reportSummaryTestIds: {
    root: 'report-summary-root',
    aiPill: 'report-summary-ai-pill',
    exportButton: 'report-summary-export-button',
    exportingBand: 'report-summary-exporting-band',
    table: 'report-summary-table',
  },
}));

const mockRows: readonly ReportSummaryRow[] = [
  {
    rowId: 'env-1',
    category: 'Rentabilidad',
    tier: 1,
    kpi: 'ROACE (%)',
    unit: '%',
    geValue: 7.4,
    peerAvg: 5.5,
  },
];

describe('ReportSummary', () => {
  it('renders the section card with title and info', () => {
    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={vi.fn()}
        onExport={vi.fn()}
        exporting={false}
      />,
    );
    // The title appears twice: once as h3 and once as sr-only caption
    expect(screen.getAllByText('Resumen del informe').length).toBe(2);
  });

  it('renders category filter chips', () => {
    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={vi.fn()}
        onExport={vi.fn()}
        exporting={false}
      />,
    );
    expect(screen.getByRole('group', { name: 'Filtrar por categoría' })).toBeInTheDocument();
  });

  it('renders the Excel export button', () => {
    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={vi.fn()}
        onExport={vi.fn()}
        exporting={false}
      />,
    );
    expect(screen.getByTestId('report-summary-export-button')).toBeInTheDocument();
  });

  it('disables export button while exporting', () => {
    render(
      <ReportSummary rows={mockRows} onValueChange={vi.fn()} onExport={vi.fn()} exporting={true} />,
    );
    const button = screen.getByTestId('report-summary-export-button');
    expect(button).toBeDisabled();
  });

  it('shows exporting band when exporting is true', () => {
    render(
      <ReportSummary rows={mockRows} onValueChange={vi.fn()} onExport={vi.fn()} exporting={true} />,
    );
    expect(screen.getByTestId('report-summary-exporting-band')).toBeInTheDocument();
  });

  it('calls onValueChange immediately when clearing GE value', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={onValueChange}
        onExport={vi.fn()}
        exporting={false}
      />,
    );

    const input = screen.getByDisplayValue('7.4');
    await user.clear(input);

    // Should call immediately when cleared
    expect(onValueChange).toHaveBeenCalledWith('env-1', 'geValue', null);
  });

  it('calls onValueChange immediately when clearing peer average', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={onValueChange}
        onExport={vi.fn()}
        exporting={false}
      />,
    );

    const input = screen.getByDisplayValue('5.5');
    await user.clear(input);

    // Should call immediately when cleared
    expect(onValueChange).toHaveBeenCalledWith('env-1', 'peerAvg', null);
  });

  it('filters rows by selected category', () => {
    const rows: readonly ReportSummaryRow[] = [
      ...mockRows,
      {
        rowId: 'gov-1',
        category: 'Liquidez',
        tier: 2,
        kpi: 'Prueba ácida (x)',
        unit: 'x',
        geValue: 1.3,
        peerAvg: 0.8,
      },
    ];

    render(
      <ReportSummary rows={rows} onValueChange={vi.fn()} onExport={vi.fn()} exporting={false} />,
    );

    // One chip per distinct row category (data from the rows, not i18n — P5-I08b).
    const group = screen.getByRole('group', { name: 'Filtrar por categoría' });
    const categories = [...new Set(rows.map((r) => r.category))];
    expect(within(group).getAllByRole('button')).toHaveLength(categories.length);

    // Initially both rows are visible; selecting "Liquidez" keeps only its row.
    expect(screen.getByText('ROACE (%)')).toBeInTheDocument();
    expect(screen.getByText('Prueba ácida (x)')).toBeInTheDocument();
    fireEvent.click(within(group).getByRole('button', { name: 'Liquidez' }));
    expect(screen.queryByText('ROACE (%)')).not.toBeInTheDocument();
    expect(screen.getByText('Prueba ácida (x)')).toBeInTheDocument();
  });

  it('without analysisId, the AI pill stays disabled', () => {
    render(
      <ReportSummary
        rows={mockRows}
        onValueChange={vi.fn()}
        onExport={vi.fn()}
        exporting={false}
      />,
    );
    expect(screen.getByTestId('report-summary-ai-pill')).toBeDisabled();
  });

  it('with analysisId, the AI pill opens the narrative dialog via C-15 with the "overview" section', async () => {
    const requests: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/executive-narratives`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({
          sections: [
            { title: 'Resumen', text: 'El informe muestra una brecha moderada frente a pares.' },
          ],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
        });
      }),
    );
    const user = userEvent.setup();
    const { wrapper: Wrapper } = createQueryHarness();

    render(
      <Wrapper>
        <ToastProvider>
          <MemoryRouter>
            <ReportSummary
              rows={mockRows}
              onValueChange={vi.fn()}
              onExport={vi.fn()}
              exporting={false}
              analysisId="ana_1"
            />
          </MemoryRouter>
        </ToastProvider>
      </Wrapper>,
    );

    const pill = screen.getByTestId('report-summary-ai-pill');
    expect(pill).not.toBeDisabled();
    await user.click(pill);

    expect(
      await screen.findByText('El informe muestra una brecha moderada frente a pares.'),
    ).toBeInTheDocument();
    // Mutation check (P5-43d): swapping this section for any other value must fail this exact assertion.
    expect(requests).toEqual([{ scope: 'results', section: 'overview', analysisId: 'ana_1' }]);
  });
});
