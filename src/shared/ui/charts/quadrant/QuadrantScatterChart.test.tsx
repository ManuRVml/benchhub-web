import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { colorOfToken } from '../radar/token-colors';

import { QuadrantScatterChart } from './QuadrantScatterChart';

import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the tests inspect the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

const POINTS = [
  { id: 'eco', label: 'Ecopetrol', x: 72, y: 82, colorKey: 'ecopetrol' },
  { id: 'oxy', label: 'Oxy', x: 10, y: 52, colorKey: 'oxy' },
  { id: 'exxon', label: 'Exxon', x: 50, y: 12, colorKey: 'exxon' },
  { id: 'ypf', label: 'YPF', x: 30, y: 35, colorKey: 'ypf' },
];
const QUADRANTS = {
  topLeft: 'Alto Y · bajo X',
  topRight: 'Alto X · alto Y',
  bottomLeft: 'Bajo X · bajo Y',
  bottomRight: 'Alto X · bajo Y',
};
const LABEL = 'Posicionamiento de pares';

type QuadrantOption = ChartOption & {
  xAxis: { min: number; max: number };
  yAxis: { min: number; max: number };
  graphic: { style: { text: string } }[];
  series: {
    data: { name: string; value: number[]; itemStyle: { color: string } }[];
    markLine: { data: Record<string, number>[] };
  }[];
};

const lastOption = (): QuadrantOption => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as QuadrantOption;
};

function renderChart() {
  return render(
    <QuadrantScatterChart
      points={POINTS}
      xLabel="Eje X"
      yLabel="Eje Y"
      xMid={50}
      yMid={50}
      quadrantLabels={QUADRANTS}
      ariaLabel={LABEL}
    />,
  );
}

describe('QuadrantScatterChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  it('is an img named by its label with one scatter series', () => {
    renderChart();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'quadrant-scatter-chart');
    expect(image).toHaveAttribute('data-series-count', '1');
  });

  it('draws both mid lines and the four quadrant labels', () => {
    renderChart();
    const option = lastOption();
    expect(option.series[0]?.markLine.data).toEqual([{ xAxis: 50 }, { yAxis: 50 }]);
    expect(option.graphic.map((g) => g.style.text)).toEqual([
      QUADRANTS.topLeft,
      QUADRANTS.topRight,
      QUADRANTS.bottomLeft,
      QUADRANTS.bottomRight,
    ]);
  });

  it('centres the axes on the mid lines and keeps every point inside', () => {
    renderChart();
    const { xAxis, yAxis } = lastOption();
    expect((xAxis.min + xAxis.max) / 2).toBeCloseTo(50);
    expect((yAxis.min + yAxis.max) / 2).toBeCloseTo(50);
    for (const p of POINTS) {
      expect(p.x).toBeGreaterThan(xAxis.min);
      expect(p.x).toBeLessThan(xAxis.max);
      expect(p.y).toBeGreaterThan(yAxis.min);
      expect(p.y).toBeLessThan(yAxis.max);
    }
  });

  it('colours points from company tokens, unknown slugs with the fallback', () => {
    renderChart();
    const colors = lastOption().series[0]?.data.map((d) => d.itemStyle.color);
    expect(colors?.[0]).toBe(colorOfToken('company.ecopetrol'));
    expect(colors?.[3]).toBe(colorOfToken('company.fallback'));
  });

  it('lists x, y and the quadrant of every point in the data table', () => {
    renderChart();
    const table = screen.getByRole('table', { name: LABEL });
    const [, ...rows] = within(table).getAllByRole('row');
    expect(
      rows.map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['72', '82', QUADRANTS.topRight],
      ['10', '52', QUADRANTS.topLeft],
      ['50', '12', QUADRANTS.bottomRight],
      ['30', '35', QUADRANTS.bottomLeft],
    ]);
  });
});
