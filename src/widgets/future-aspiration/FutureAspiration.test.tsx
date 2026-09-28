import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FutureAspiration } from './FutureAspiration';

const mockTiles = {
  ecopetrolProductionKbped: 855,
  totalRank: 9,
  of: 10,
  lowEmissionsSharePct: {
    ecopetrol: 11,
    peers: 9,
  },
};

const mockSegments: {
  id: 'total' | 'crude' | 'gas' | 'unconventional' | 'lowEmissions';
  label: string;
  colorKey?: string;
}[] = [
  { id: 'total', label: 'Total' },
  { id: 'crude', label: 'Crudo convencional', colorKey: 'crude' },
  { id: 'gas', label: 'Gas natural', colorKey: 'gas' },
  { id: 'unconventional', label: 'No convencional / offshore', colorKey: 'unconventional' },
  { id: 'lowEmissions', label: 'Bajas emisiones (boe eq.)', colorKey: 'lowEmissions' },
];

const mockRows: {
  rank: number;
  companyId: string;
  name: string;
  isEcopetrol: boolean;
  segments: {
    crude: number;
    gas: number;
    unconventional: number;
    lowEmissions: number;
  };
  total: number;
}[] = [
  {
    rank: 1,
    companyId: 'exxon',
    name: 'Exxon',
    isEcopetrol: false,
    segments: { crude: 2000, gas: 1500, unconventional: 500, lowEmissions: 750 },
    total: 4750,
  },
  {
    rank: 2,
    companyId: 'petrobras',
    name: 'Petrobras',
    isEcopetrol: false,
    segments: { crude: 1500, gas: 1000, unconventional: 400, lowEmissions: 470 },
    total: 3370,
  },
  {
    rank: 3,
    companyId: 'chevron',
    name: 'Chevron',
    isEcopetrol: false,
    segments: { crude: 1400, gas: 1000, unconventional: 300, lowEmissions: 420 },
    total: 3120,
  },
  {
    rank: 4,
    companyId: 'shell',
    name: 'Shell',
    isEcopetrol: false,
    segments: { crude: 1300, gas: 950, unconventional: 320, lowEmissions: 500 },
    total: 3070,
  },
  {
    rank: 5,
    companyId: 'totalenergies',
    name: 'TotalEnergies',
    isEcopetrol: false,
    segments: { crude: 1200, gas: 900, unconventional: 250, lowEmissions: 580 },
    total: 2930,
  },
  {
    rank: 6,
    companyId: 'bp',
    name: 'BP',
    isEcopetrol: false,
    segments: { crude: 1000, gas: 800, unconventional: 200, lowEmissions: 410 },
    total: 2410,
  },
  {
    rank: 7,
    companyId: 'equinor',
    name: 'Equinor',
    isEcopetrol: false,
    segments: { crude: 800, gas: 700, unconventional: 180, lowEmissions: 380 },
    total: 2060,
  },
  {
    rank: 8,
    companyId: 'pemex',
    name: 'Pemex',
    isEcopetrol: false,
    segments: { crude: 700, gas: 600, unconventional: 150, lowEmissions: 480 },
    total: 1930,
  },
  {
    rank: 9,
    companyId: 'ecopetrol',
    name: 'Ecopetrol',
    isEcopetrol: true,
    segments: { crude: 300, gas: 250, unconventional: 100, lowEmissions: 205 },
    total: 855,
  },
  {
    rank: 10,
    companyId: 'ypf',
    name: 'YPF',
    isEcopetrol: false,
    segments: { crude: 250, gas: 200, unconventional: 100, lowEmissions: 200 },
    total: 750,
  },
];

describe('FutureAspiration widget', () => {
  it('renders the 3 KPI tiles with formatted values', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={() => undefined}
      />,
    );

    expect(screen.getByText('855 kbpe/d')).toBeInTheDocument();
    expect(screen.getByText('9 de 10')).toBeInTheDocument();
    expect(screen.getByText('11% vs. 9%')).toBeInTheDocument();
  });

  it('renders one row per company in rank order', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={() => undefined}
      />,
    );

    expect(screen.getByText('Exxon')).toBeInTheDocument();
    expect(screen.getByText('Petrobras')).toBeInTheDocument();
    expect(screen.getByText('Ecopetrol')).toBeInTheDocument();
    expect(screen.getByText('YPF')).toBeInTheDocument();

    const rows = screen.getAllByTestId('future-aspiration-row');
    expect(rows).toHaveLength(mockRows.length);
    expect(rows[0]).toHaveTextContent('Exxon');
    expect(rows.at(-1)).toHaveTextContent('YPF');
  });

  it('highlights the Ecopetrol row with a distinct tone', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={() => undefined}
      />,
    );

    const ecopetrolRow = screen.getByText('Ecopetrol');
    const rowElement = ecopetrolRow.closest('[data-testid="future-aspiration-row"]');
    expect(rowElement).toHaveClass('bg-status-success-bg/20');
  });

  it('calls onSegmentChange when a segment chip is clicked', () => {
    const handleChange = vi.fn();
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={handleChange}
      />,
    );

    const gasChip = screen.getByText('Gas natural');
    gasChip.click();
    expect(handleChange).toHaveBeenCalledWith('gas');
  });

  it('renders all rows when a non-total segment is selected', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="crude"
        onSegmentChange={() => undefined}
      />,
    );

    expect(screen.getByText('Exxon')).toBeInTheDocument();
    expect(screen.getByText('Petrobras')).toBeInTheDocument();
    expect(screen.getByText('Ecopetrol')).toBeInTheDocument();
    expect(screen.getByText('YPF')).toBeInTheDocument();
  });

  it('shows the "Grupo Ecopetrol" legend item as an outlined marker (SCR-08 L587)', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={() => undefined}
      />,
    );

    expect(screen.getByText('Grupo Ecopetrol')).toBeInTheDocument();
    const swatch = screen
      .getByText('Grupo Ecopetrol')
      .closest('[role="listitem"]')
      ?.querySelector('[aria-hidden="true"]');
    expect(swatch).toHaveAttribute('data-variant', 'outlined');
  });

  it('renders the footnote text', () => {
    render(
      <FutureAspiration
        tiles={mockTiles}
        segments={mockSegments}
        rows={mockRows}
        selectedSegment="total"
        onSegmentChange={() => undefined}
      />,
    );

    expect(
      screen.getByText(
        'Cifras ilustrativas en kbpe/d basadas en la aspiración de largo plazo anunciada por cada compañía · Análisis interno de la Gerencia de Estrategia.',
      ),
    ).toBeInTheDocument();
  });
});
