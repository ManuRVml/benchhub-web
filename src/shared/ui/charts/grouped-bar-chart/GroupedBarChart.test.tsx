import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupedBarChart } from './GroupedBarChart';

import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the test inspects the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

const CATEGORIES = ['Ecopetrol', 'Shell', 'BP'];
const SERIES = [
  { id: 'y2024', label: '2024', values: [10.2, 6.3, 0.9] },
  { id: 'y2025', label: '2025', values: [7.4, null, 1.3] },
];
const LABEL = 'ROACE por compañía';

function renderChart() {
  return render(
    <GroupedBarChart
      categories={CATEGORIES}
      series={SERIES}
      unit="percent"
      ariaLabel={LABEL}
      categoryLabel="Compañía"
    />,
  );
}

const lastOption = (): ChartOption & { animation?: boolean } => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as ChartOption & { animation?: boolean };
};

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe('GroupedBarChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
    chart.dispose.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders an img with the accessible name, a test id and the series count', () => {
    renderChart();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'grouped-bar-chart');
    expect(image).toHaveAttribute('data-series-count', '2');
  });

  it('renders the same values as an es-CO data table, with missing values as "—"', () => {
    renderChart();
    const table = screen.getByRole('table', { name: LABEL });
    const [, ...rows] = within(table).getAllByRole('row');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Compañía', '2024', '2025']);
    expect(
      rows.map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['10,2%', '7,4%'],
      ['6,3%', '—'],
      ['0,9%', '1,3%'],
    ]);
    expect(rows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual(CATEGORIES);
  });

  it('leaves the corner cell without a header when no category label is given', () => {
    render(
      <GroupedBarChart categories={CATEGORIES} series={SERIES} unit="percent" ariaLabel={LABEL} />,
    );
    const table = screen.getByRole('table', { name: LABEL });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['2024', '2025']);
  });

  it('passes null through to ECharts as a gap, never as 0', () => {
    renderChart();
    const series = lastOption().series as { id: string; data: (number | null)[] }[];
    expect(series.map((s) => s.data)).toEqual([
      [10.2, 6.3, 0.9],
      [7.4, null, 1.3],
    ]);
  });

  it('formats axis labels and tooltips with the es-CO percent formatter', () => {
    renderChart();
    const option = lastOption() as {
      yAxis: { axisLabel: { formatter: (value: number) => string } };
      tooltip: { valueFormatter: (value: unknown) => string };
    };
    expect(option.yAxis.axisLabel.formatter(7.4)).toBe('7,4%');
    expect(option.tooltip.valueFormatter(null)).toBe('—');
  });

  it('animates by default and disables animation when the user prefers reduced motion', () => {
    mockReducedMotion(false);
    const { unmount } = renderChart();
    expect(lastOption().animation).toBe(true);
    unmount();
    expect(chart.dispose).toHaveBeenCalledTimes(1);

    mockReducedMotion(true);
    renderChart();
    expect(lastOption().animation).toBe(false);
  });
});
