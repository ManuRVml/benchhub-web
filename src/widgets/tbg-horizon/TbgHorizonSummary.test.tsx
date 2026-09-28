import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TbgHorizonSummary } from './TbgHorizonSummary';

import type { TbgHorizonSummaryComposition } from './TbgHorizonSummary';

const KPIS = { companies: 11, avgFinPct: 47, avgOpPct: 22, avgTransPct: 33 };

const COMPOSITION: TbgHorizonSummaryComposition[] = [
  {
    companyId: 'bp',
    name: 'BP',
    finPct: 55,
    opPct: 15,
    transPct: 31,
    totalPct: 101,
    sumStatus: 'over',
  },
  {
    companyId: 'oxy',
    name: 'Oxy',
    finPct: 70,
    opPct: 10,
    transPct: 20,
    totalPct: 100,
    sumStatus: 'ok',
  },
  {
    companyId: 'petrobras',
    name: 'Petrobras',
    finPct: 33,
    opPct: 0,
    finOpPct: 33,
    transPct: 66,
    totalPct: 99,
    sumStatus: 'under',
  },
];

describe('TbgHorizonSummary', () => {
  it('renders the 4 KPI values (companies, avgFinPct, avgOpPct, avgTransPct)', () => {
    render(<TbgHorizonSummary kpis={KPIS} composition={COMPOSITION} />);
    expect(screen.getByTestId('tbg-horizon-kpi-companies-value')).toHaveTextContent('11');
    expect(screen.getByTestId('tbg-horizon-kpi-avg-fin-value')).toHaveTextContent('47%');
    expect(screen.getByTestId('tbg-horizon-kpi-avg-op-value')).toHaveTextContent('22%');
    expect(screen.getByTestId('tbg-horizon-kpi-avg-trans-value')).toHaveTextContent('33%');
  });

  it('renders one composition row per company, with a segment per non-zero dimension', () => {
    render(<TbgHorizonSummary kpis={KPIS} composition={COMPOSITION} />);
    expect(screen.getByTestId('tbg-horizon-composition-row-bp')).toBeInTheDocument();
    expect(screen.getByTestId('tbg-horizon-composition-row-oxy')).toBeInTheDocument();
    expect(screen.getByTestId('tbg-horizon-composition-row-petrobras')).toBeInTheDocument();

    // BP has no finOp segment.
    expect(screen.getByTestId('tbg-horizon-segment-bp-fin')).toHaveTextContent('55%');
    expect(screen.getByTestId('tbg-horizon-segment-bp-op')).toHaveTextContent('15%');
    expect(screen.getByTestId('tbg-horizon-segment-bp-trans')).toHaveTextContent('31%');
    expect(screen.queryByTestId('tbg-horizon-segment-bp-fin-op')).not.toBeInTheDocument();

    // Petrobras has a 0% op segment (not rendered) and a finOp segment (rendered).
    expect(screen.queryByTestId('tbg-horizon-segment-petrobras-op')).not.toBeInTheDocument();
    expect(screen.getByTestId('tbg-horizon-segment-petrobras-fin-op')).toHaveTextContent('33%');
  });

  it('colours the "Total:" label by sumStatus', () => {
    render(<TbgHorizonSummary kpis={KPIS} composition={COMPOSITION} />);
    const over = screen.getByTestId('tbg-horizon-total-bp');
    expect(over).toHaveTextContent('101,0%');
    expect(over).toHaveClass('text-status-danger-text');

    const ok = screen.getByTestId('tbg-horizon-total-oxy');
    expect(ok).toHaveTextContent('100,0%');
    expect(ok).toHaveClass('text-status-success-text');

    const under = screen.getByTestId('tbg-horizon-total-petrobras');
    expect(under).toHaveTextContent('99,0%');
    expect(under).toHaveClass('text-status-warning-text');
  });

  it('"Por compañía" is an inert disabled tab, "Resumen general" is active', () => {
    render(<TbgHorizonSummary kpis={KPIS} composition={COMPOSITION} />);
    const byCompany = screen.getByRole('tab', { name: 'Por compañía' });
    expect(byCompany).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Resumen general' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
