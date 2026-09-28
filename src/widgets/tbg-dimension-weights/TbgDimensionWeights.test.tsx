import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TbgDimensionWeights } from './TbgDimensionWeights';

// Real i18n (react-i18next), like the rest of the widget/page test suite: a mocked t() that ignores
// interpolation params cannot tell "Ecopetrol está +2 pts vs..." from "Ecopetrol está -5 pts vs...", so the tone
// tests below need the real translated, interpolated sentence.

describe('TbgDimensionWeights', () => {
  it('renders dimension tabs, Ecopetrol vs peer bars, and detail rows', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={45}
        peerAvgPct={43}
        diffPts={2}
        detail={[
          { rank: 1, companyId: 'tfe', name: 'TotalEnergies', pct: 62 },
          { rank: 2, companyId: 'bp', name: 'BP', pct: 55 },
          { rank: 3, companyId: 'oxy', name: 'Oxy', pct: 40 },
          { rank: 4, companyId: 'shl', name: 'Shell', pct: 35 },
          { rank: 5, companyId: 'eqn', name: 'Equinor', pct: 33 },
          { rank: 6, companyId: 'ptr', name: 'Petrobras', pct: 33 },
        ]}
      />,
    );

    expect(screen.getByText('Peso en TBG por dimensión · GE vs. pares')).toBeInTheDocument();
    expect(screen.getByText('Financiera')).toBeInTheDocument();
    expect(screen.getByText('Operativa')).toBeInTheDocument();
    expect(screen.getByText('Transversal')).toBeInTheDocument();
    expect(screen.getByText('Ecopetrol')).toBeInTheDocument();
    expect(screen.getByText('Promedio pares')).toBeInTheDocument();
    expect(screen.getByText('Detalle por compañía · Financiera')).toBeInTheDocument();
    expect(screen.getByText('TotalEnergies')).toBeInTheDocument();
    expect(screen.getByText('Petrobras')).toBeInTheDocument();
  });

  it('renders the message with a positive diff in the success tone', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={45}
        peerAvgPct={43}
        diffPts={2}
        detail={[]}
      />,
    );

    const message = screen.getByText(
      'Ecopetrol está +2 pts vs. el promedio de pares en Financiera',
    );
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-status-success-text');
  });

  it('renders the message with a negative diff in the danger tone', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={40}
        peerAvgPct={45}
        diffPts={-5}
        detail={[]}
      />,
    );

    const message = screen.getByText(
      'Ecopetrol está -5 pts vs. el promedio de pares en Financiera',
    );
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-status-danger-text');
  });

  it('renders the message with a zero diff in the muted tone', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={43}
        peerAvgPct={43}
        diffPts={0}
        detail={[]}
      />,
    );

    const message = screen.getByText('Ecopetrol está 0 pts vs. el promedio de pares en Financiera');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-text-secondary');
    expect(message).not.toHaveClass('text-status-success-text', 'text-status-danger-text');
  });

  it('renders detail rows in rank order', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={45}
        peerAvgPct={43}
        diffPts={2}
        detail={[
          { rank: 3, companyId: 'xyz', name: 'Company C', pct: 40 },
          { rank: 1, companyId: 'abc', name: 'Company A', pct: 62 },
          { rank: 2, companyId: 'def', name: 'Company B', pct: 55 },
        ]}
      />,
    );

    const rows = screen.getAllByTestId(/tbg-dimension-weights-detail-row-\d+/);
    expect(rows[0]).toHaveTextContent('3');
    expect(rows[1]).toHaveTextContent('1');
    expect(rows[2]).toHaveTextContent('2');
  });

  it('calls onDimensionChange when clicking a tab', async () => {
    const onDimensionChange = vi.fn();
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={onDimensionChange}
        ecopetrolPct={45}
        peerAvgPct={43}
        diffPts={2}
        detail={[]}
      />,
    );

    await userEvent.click(screen.getByText('Operativa'));

    expect(onDimensionChange).toHaveBeenCalledWith('op');
  });

  it('disables the AI pill', () => {
    render(
      <TbgDimensionWeights
        dimension="fin"
        onDimensionChange={vi.fn()}
        ecopetrolPct={45}
        peerAvgPct={43}
        diffPts={2}
        detail={[]}
      />,
    );

    const aiPill = screen.getByText('Recomendaciones de Yarbis');
    expect(aiPill).toBeDisabled();
  });
});
