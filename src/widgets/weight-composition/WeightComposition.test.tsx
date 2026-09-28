import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { chartTestIds } from '@/shared/ui/charts/primitives';

import { weightCompositionTestIds } from './test-ids';
import { WeightComposition } from './WeightComposition';

import type { WeightCompositionProps } from './WeightComposition';
import type {
  VisualizationLineLegendItem,
  VisualizationWeightComposition,
} from '@/entities/analysis';

const DATA: VisualizationWeightComposition = {
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
    { companyId: 'cmp_bp', name: 'BP', fin: 55, op: 15, trans: 30, totalPct: 100, sumStatus: 'ok' },
    {
      companyId: 'cmp_oxy',
      name: 'Oxy',
      fin: 40,
      op: 35,
      trans: 20,
      totalPct: 95,
      sumStatus: 'under',
    },
  ],
  groupAvg: { fin: 43, op: 30, trans: 28 },
  hasOverweight: true,
};

const LEGEND: VisualizationLineLegendItem[] = [
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
];

function renderWidget(overrides: Partial<WeightCompositionProps> = {}) {
  const onDimensionChange = vi.fn();
  const utils = render(
    <WeightComposition
      data={DATA}
      lineLegend={LEGEND}
      dimension="fin"
      onDimensionChange={onDimensionChange}
      {...overrides}
    />,
  );
  return { ...utils, onDimensionChange };
}

describe('WeightComposition', () => {
  it('toggles a segment tip and opening another (in a different row) closes the first', () => {
    renderWidget();
    const segmentTotalFin = screen.getByTestId(
      chartTestIds.segment('weight-composition', 'row-cmp_total', 'fin'),
    );
    fireEvent.click(segmentTotalFin);
    expect(
      screen.getByTestId(chartTestIds.tip('weight-composition', 'row-cmp_total', 'fin')),
    ).toBeInTheDocument();

    const segmentBpOp = screen.getByTestId(
      chartTestIds.segment('weight-composition', 'row-cmp_bp', 'op'),
    );
    fireEvent.click(segmentBpOp);
    expect(
      screen.queryByTestId(chartTestIds.tip('weight-composition', 'row-cmp_total', 'fin')),
    ).toBeNull();
    expect(
      screen.getByTestId(chartTestIds.tip('weight-composition', 'row-cmp_bp', 'op')),
    ).toBeInTheDocument();

    fireEvent.click(segmentBpOp);
    expect(
      screen.queryByTestId(chartTestIds.tip('weight-composition', 'row-cmp_bp', 'op')),
    ).toBeNull();
  });

  it('keeps only one LIN legend popover open at a time', async () => {
    renderWidget();
    fireEvent.click(screen.getByTestId(weightCompositionTestIds.legendInfo('LIN-01')));
    expect(
      await screen.findByTestId(weightCompositionTestIds.legendPanel('LIN-01')),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(weightCompositionTestIds.legendInfo('LIN-02')));
    expect(
      await screen.findByTestId(weightCompositionTestIds.legendPanel('LIN-02')),
    ).toBeInTheDocument();
    expect(screen.queryByTestId(weightCompositionTestIds.legendPanel('LIN-01'))).toBeNull();
  });

  it('shows the overweight banner when hasOverweight is true', () => {
    renderWidget();
    expect(screen.getByTestId(weightCompositionTestIds.overweightBanner)).toBeInTheDocument();
  });

  it('hides the overweight banner when hasOverweight is false', () => {
    renderWidget({ data: { ...DATA, hasOverweight: false } });
    expect(screen.queryByTestId(weightCompositionTestIds.overweightBanner)).toBeNull();
  });

  it('colours the Total label by sumStatus: over red, ok green, under amber', () => {
    renderWidget();
    expect(screen.getByTestId(weightCompositionTestIds.total('cmp_total'))).toHaveClass(
      'text-status-danger-text',
    );
    expect(screen.getByTestId(weightCompositionTestIds.total('cmp_bp'))).toHaveClass(
      'text-status-success-text',
    );
    expect(screen.getByTestId(weightCompositionTestIds.total('cmp_oxy'))).toHaveClass(
      'text-status-warning-base',
    );
  });

  it('sorts company rows descending by the selected dimension', () => {
    const { container } = renderWidget({ dimension: 'op' });
    const text = container.textContent;
    // op: Oxy 35 > TotalEnergies 20 > BP 15
    expect(text.indexOf('Oxy')).toBeLessThan(text.indexOf('TotalEnergies'));
    expect(text.indexOf('TotalEnergies')).toBeLessThan(text.indexOf('BP'));
  });

  it('calls onDimensionChange when a dimension tab is clicked', () => {
    const { onDimensionChange } = renderWidget();
    fireEvent.click(screen.getByRole('tab', { name: 'Operativa' }));
    expect(onDimensionChange).toHaveBeenCalledWith('op');
  });
});
