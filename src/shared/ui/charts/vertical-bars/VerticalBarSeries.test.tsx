import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tokenColor } from '../echarts';

import { VerticalBarSeries } from './VerticalBarSeries';

import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the test inspects the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

// SCR-11 "Comparación con serie histórica" (5 años), one year without data.
const PERIODS = ['2021', '2022', '2023', '2024', '2025'].map((year) => ({
  id: year,
  label: year,
}));
const SERIES = [{ id: 'roace', label: 'ROACE', values: [6.2, 7.8, null, 7.4, 8.1] }];
const LABEL = 'ROACE · serie histórica';

type BarDatum =
  number | null | { value: number; itemStyle: { opacity: number }; label: { opacity: number } };
interface BarSeries {
  data: BarDatum[];
  itemStyle: { color: string };
  label: { formatter: (params: { value: unknown }) => string };
}

const lastOption = (): ChartOption & { animation?: boolean } => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as ChartOption & { animation?: boolean };
};
const firstSeries = (): BarSeries => {
  const [series] = lastOption().series as BarSeries[];
  if (!series) throw new Error('no series');
  return series;
};

function renderBars(highlightId?: string) {
  return render(
    <VerticalBarSeries
      periods={PERIODS}
      series={SERIES}
      unit="percent"
      ariaLabel={LABEL}
      periodLabel="Año"
      {...(highlightId === undefined ? {} : { highlightId })}
    />,
  );
}

describe('VerticalBarSeries', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders an img with the accessible name and the series count', () => {
    renderBars();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'vertical-bar-series');
    expect(image).toHaveAttribute('data-series-count', '1');
  });

  it('lists every period in the data table, es-CO, missing values as "—"', () => {
    renderBars();
    const table = screen.getByRole('table', { name: LABEL });
    const [, ...rows] = within(table).getAllByRole('row');
    expect(rows.map((row) => row.textContent)).toEqual([
      '20216,2%',
      '20227,8%',
      '2023—',
      '20247,4%',
      '20258,1%',
    ]);
  });

  it('passes null through as a gap, uses the monitor token colour and formats the bar labels', () => {
    renderBars();
    expect(firstSeries().data).toEqual([6.2, 7.8, null, 7.4, 8.1]);
    expect(firstSeries().itemStyle.color).toBe(tokenColor('chart.monitor'));
    expect(firstSeries().label.formatter({ value: 7.4 })).toBe('7,4%');
    expect(firstSeries().label.formatter({ value: null })).toBe('—');
  });

  it('dims every period but the highlighted one, keeping nulls as gaps', () => {
    renderBars('2025');
    expect(firstSeries().data).toEqual([
      { value: 6.2, itemStyle: { opacity: 0.45 }, label: { opacity: 1 } },
      { value: 7.8, itemStyle: { opacity: 0.45 }, label: { opacity: 1 } },
      null,
      { value: 7.4, itemStyle: { opacity: 0.45 }, label: { opacity: 1 } },
      8.1,
    ]);
  });

  it('disables animation when the user prefers reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    renderBars();
    expect(lastOption().animation).toBe(false);
  });
});
