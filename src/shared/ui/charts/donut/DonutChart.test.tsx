import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tokenColor } from '../echarts';

import { DonutChart } from './DonutChart';

import type { DonutSegment } from './DonutChart';
import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the test inspects the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

// SCR-11 composition: category weights (CAT_TARGETS), one category without data.
const SEGMENTS: DonutSegment[] = [
  { id: 'financiero', label: 'Financiero', value: 60, colorKey: 'chart.category.financiero' },
  { id: 'mercado', label: 'Mercado', value: 15, colorKey: 'chart.category.mercado' },
  { id: 'estrategico', label: 'Estratégico', value: null, colorKey: 'chart.category.estrategico' },
];
const LABEL = 'Composición del Monitor por categoría';

const renderDonut = (centerValue: number | null = 96.1) =>
  render(
    <DonutChart
      segments={SEGMENTS}
      centerLabel="Cumplimiento"
      centerValue={centerValue}
      unit="percent"
      decimals={0}
      ariaLabel={LABEL}
      segmentLabel="Categoría"
      valueLabel="% Peso"
    />,
  );

type PieData = { id: string; name: string; value: number; itemStyle: { color: string } }[];

const lastOption = (): ChartOption & { animation?: boolean } => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as ChartOption & { animation?: boolean };
};

const pieData = (): PieData => (lastOption().series as { data: PieData }[])[0]?.data ?? [];

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}

describe('DonutChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders an img with the accessible name and one series', () => {
    renderDonut();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'donut-chart');
    expect(image).toHaveAttribute('data-series-count', '1');
  });

  it('renders the centre label and the es-CO centre value as HTML outside the chart image', () => {
    renderDonut();
    const center = screen.getByTestId('donut-chart-center');
    expect(center).toHaveTextContent('Cumplimiento');
    expect(center).toHaveTextContent('96,1%');
    expect(screen.getByRole('img')).not.toContainElement(center);
  });

  it('shows "—" for a missing centre value', () => {
    renderDonut(null);
    expect(screen.getByTestId('donut-chart-center')).toHaveTextContent('Cumplimiento—');
  });

  it('lists every segment in the data table, missing values as "—"', () => {
    renderDonut();
    const table = screen.getByRole('table', { name: LABEL });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Categoría', '% Peso']);
    const [, ...rows] = within(table).getAllByRole('row');
    expect(rows.map((row) => row.textContent)).toEqual([
      'Financiero60%',
      'Mercado15%',
      'Estratégico—',
    ]);
  });

  it('leaves a missing segment out of the ring instead of drawing it as 0, with token colours', () => {
    renderDonut();
    expect(pieData().map((item) => [item.id, item.value])).toEqual([
      ['financiero', 60],
      ['mercado', 15],
    ]);
    expect(pieData()[0]?.itemStyle.color).toBe(tokenColor('chart.category.financiero'));
  });

  it('disables animation when the user prefers reduced motion', () => {
    mockReducedMotion(false);
    const { unmount } = renderDonut();
    expect(lastOption().animation).toBe(true);
    unmount();
    mockReducedMotion(true);
    renderDonut();
    expect(lastOption().animation).toBe(false);
  });
});
