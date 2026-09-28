import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import {
  PeerAverageComparison,
  type PeerAverageComparisonProps,
  type PeerAverageRow,
} from './PeerAverageComparison';

function renderWidget(props: PeerAverageComparisonProps) {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ToastProvider>
        <MemoryRouter>
          <PeerAverageComparison {...props} />
        </MemoryRouter>
      </ToastProvider>
    </Wrapper>,
  );
}

describe('PeerAverageComparison', () => {
  it('renders title and subtitle', () => {
    renderWidget({
      categories: [
        { id: 'rentabilidad', label: 'Rentabilidad' },
        { id: 'liquidez', label: 'Liquidez' },
      ],
      rows: [],
      category: 'rentabilidad',
      onCategoryChange: () => {
        /* noop */
      },
      analysisId: 'analysis-123',
    });

    expect(screen.getByText('Comparativo GE vs. Promedio Pares')).toBeInTheDocument();
    expect(
      screen.getByText('Valor Grupo Ecopetrol frente al promedio de pares, por indicador'),
    ).toBeInTheDocument();
  });

  it('renders category chips and calls onCategoryChange when clicked', () => {
    const handleChange = vi.fn();
    renderWidget({
      categories: [
        { id: 'rentabilidad', label: 'Rentabilidad' },
        { id: 'liquidez', label: 'Liquidez' },
      ],
      rows: [],
      category: 'rentabilidad',
      onCategoryChange: handleChange,
      analysisId: 'analysis-123',
    });

    const liquidezChip = screen.getByRole('button', { name: 'Liquidez' });
    liquidezChip.click();

    expect(handleChange).toHaveBeenCalledWith('liquidez');
  });

  it('renders "Ver más" link only for rows with hasDetail true', () => {
    const rows: PeerAverageRow[] = [
      {
        indicatorId: 'ind-1',
        label: 'ROACE (%)',
        unit: '%',
        geValue: 7.4,
        peerAvg: 5.5,
        hasDetail: true,
      },
      {
        indicatorId: 'ind-2',
        label: 'Margen EBITDA (%)',
        unit: '%',
        geValue: 39.0,
        peerAvg: 32.0,
        hasDetail: false,
      },
    ];

    renderWidget({
      categories: [{ id: 'rentabilidad', label: 'Rentabilidad' }],
      rows,
      category: 'rentabilidad',
      onCategoryChange: () => {
        /* noop */
      },
      analysisId: 'analysis-123',
    });

    expect(screen.getByText('ROACE (%)')).toBeInTheDocument();
    expect(screen.getByTestId('ver-mas-ind-1')).toBeInTheDocument();

    expect(screen.getByText('Margen EBITDA (%)')).toBeInTheDocument();
    expect(screen.queryByTestId('ver-mas-ind-2')).not.toBeInTheDocument();
  });

  it('renders bar widths correctly for negative values', () => {
    const rows: PeerAverageRow[] = [
      {
        indicatorId: 'ind-1',
        label: 'Crecimiento EBITDA (%)',
        unit: '%',
        geValue: -13.8,
        peerAvg: -2.2,
        hasDetail: false,
      },
    ];

    renderWidget({
      categories: [{ id: 'operacional', label: 'Operacional' }],
      rows,
      category: 'operacional',
      onCategoryChange: () => {
        /* noop */
      },
      analysisId: 'analysis-123',
    });

    // Get all bar-fill elements (there should be 2: GE and Peer for the single row)
    const barFills = screen.getAllByTestId('bar-fill');

    // We should have 2 bar fills (GE and Peer)
    expect(barFills).toHaveLength(2);
    expect(barFills[0]).toHaveStyle('width: 86.95652173913044%');
    expect(barFills[1]).toHaveStyle('width: 13.862633900441084%');
  });

  it('opens the narrative dialog via C-15 when the pill is clicked', async () => {
    const requests: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/executive-narratives`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({
          sections: [{ title: 'Comparativo', text: 'GE supera al promedio en ROACE.' }],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
        });
      }),
    );
    const user = userEvent.setup();

    renderWidget({
      categories: [{ id: 'rentabilidad', label: 'Rentabilidad' }],
      rows: [],
      category: 'rentabilidad',
      onCategoryChange: () => {
        /* noop */
      },
      analysisId: 'analysis-123',
    });

    await user.click(screen.getByTestId('peer-average-comparison-ai-pill'));

    expect(await screen.findByText('GE supera al promedio en ROACE.')).toBeInTheDocument();
    expect(requests).toEqual([
      { scope: 'results', section: 'performance', analysisId: 'analysis-123' },
    ]);
  });
});
