import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rankRows, rowTotal, StackedRankedBarChart } from './StackedRankedBarChart';

import type {
  StackedRankedLegendItem,
  StackedRankedRow,
  StackedRankedSort,
} from './StackedRankedBarChart';
import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the test inspects the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

// SCR-08 "Aspiración futura 2040+" (kbpe/d), trimmed: Ecopetrol has no low-emissions figure, YPF no data at all.
const LEGEND: StackedRankedLegendItem[] = [
  { id: 'crude', label: 'Crudo convencional', colorKey: 'chart.aspiration.crudo' },
  { id: 'gas', label: 'Gas natural', colorKey: 'chart.aspiration.gas' },
  { id: 'lowEmissions', label: 'Bajas emisiones', colorKey: 'chart.aspiration.bajasEmisiones' },
];
const row = (id: string, label: string, values: (number | null)[]): StackedRankedRow => ({
  id,
  label,
  segments: LEGEND.map((segment, index) => ({ id: segment.id, value: values[index] ?? null })),
});
const ROWS: StackedRankedRow[] = [
  row('ecopetrol', 'Ecopetrol', [600, 255, null]),
  row('ypf', 'YPF', [null, null, null]),
  row('exxon', 'Exxon', [3000, 1500, 250]),
  row('shell', 'Shell', [1500, 1200, 370]),
];
const LABEL = 'Aspiración futura 2040+ · kbpe/d';

const lastOption = (): ChartOption & { animation?: boolean } => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as ChartOption & { animation?: boolean };
};

const renderChart = (sort: StackedRankedSort = 'desc') =>
  render(
    <StackedRankedBarChart
      rows={ROWS}
      segmentLegend={LEGEND}
      sort={sort}
      unit="number"
      ariaLabel={LABEL}
      rowLabel="Compañía"
    />,
  );

const tableRows = () => {
  const [, ...rows] = within(screen.getByRole('table', { name: LABEL })).getAllByRole('row');
  return rows.map((r) =>
    [within(r).getByRole('rowheader'), ...within(r).getAllByRole('cell')].map(
      (cell) => cell.textContent,
    ),
  );
};

describe('rankRows / rowTotal', () => {
  it('sums the known segments and keeps a row without data as null, never 0', () => {
    expect(rowTotal(row('ecopetrol', 'Ecopetrol', [600, 255, null]))).toBe(855);
    expect(rowTotal(row('ypf', 'YPF', [null, null, null]))).toBeNull();
  });

  it('ranks by total in both directions, rows without a total last', () => {
    expect(rankRows(ROWS, 'desc').map((r) => r.id)).toEqual(['exxon', 'shell', 'ecopetrol', 'ypf']);
    expect(rankRows(ROWS, 'asc').map((r) => r.id)).toEqual(['ecopetrol', 'shell', 'exxon', 'ypf']);
  });
});

describe('StackedRankedBarChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders an img with the accessible name and one series per segment', () => {
    renderChart();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'stacked-ranked-bar-chart');
    expect(image).toHaveAttribute('data-series-count', '3');
  });

  it('lists the rows in rank order with every segment and the total, es-CO, missing values as "—"', () => {
    renderChart('desc');
    expect(
      within(screen.getByRole('table', { name: LABEL }))
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Compañía', 'Crudo convencional', 'Gas natural', 'Bajas emisiones', 'Total']);
    expect(tableRows()).toEqual([
      ['Exxon', '3.000', '1.500', '250', '4.750'],
      ['Shell', '1.500', '1.200', '370', '3.070'],
      ['Ecopetrol', '600', '255', '—', '855'],
      ['YPF', '—', '—', '—', '—'],
    ]);
  });

  it('follows the sort direction in the chart axes and the table', () => {
    renderChart('asc');
    const [labels, totals] = lastOption().yAxis as { data: string[] }[];
    expect(labels?.data).toEqual(['Ecopetrol', 'Shell', 'Exxon', 'YPF']);
    expect(totals?.data).toEqual(['855', '3.070', '4.750', '—']);
    expect(tableRows().map(([name]) => name)).toEqual(['Ecopetrol', 'Shell', 'Exxon', 'YPF']);
  });

  it('stacks the segments in legend order with nulls as gaps', () => {
    renderChart('desc');
    const series = lastOption().series as { id: string; stack: string; data: (number | null)[] }[];
    expect(series.map((s) => s.id)).toEqual(['crude', 'gas', 'lowEmissions']);
    expect(series.every((s) => s.stack === 'total')).toBe(true);
    expect(series[2]?.data).toEqual([250, 370, null, null]);
  });

  it('disables animation when the user prefers reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    renderChart();
    expect(lastOption().animation).toBe(false);
  });
});
