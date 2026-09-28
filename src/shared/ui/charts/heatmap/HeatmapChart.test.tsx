import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { colorOfToken, contrast, mixColor } from '../radar/token-colors';

import { HeatmapChart } from './HeatmapChart';

import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the tests inspect the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

const ROWS = ['Ecopetrol', 'BP', 'Equinor'];
const COLUMNS = ['Financiera', 'Operativa', 'Transversal'];
const VALUES = [
  [45, 30, 25],
  [55, 15, null],
  [33, 34, 33],
];
const LABEL = 'Peso por dimensión y compañía';

interface Cell {
  value: [number, number, number];
  itemStyle: { color: string };
  label: { color: string; formatter: () => string };
}

const lastCells = (): Cell[] => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return (call[0] as ChartOption & { series: { data: Cell[] }[] }).series[0]?.data ?? [];
};

function renderChart() {
  return render(
    <HeatmapChart
      rows={ROWS}
      columns={COLUMNS}
      values={VALUES}
      unit="percent"
      ariaLabel={LABEL}
      rowHeader="Compañía"
      columnColorKeys={[
        'dimension.accent.financiera',
        'dimension.accent.operativa',
        'dimension.accent.transversal',
      ]}
    />,
  );
}

describe('HeatmapChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  it('is an img named by its label with a single heatmap series', () => {
    renderChart();
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'heatmap-chart');
    expect(image).toHaveAttribute('data-series-count', '1');
  });

  it('renders the values as a data table, with "—" for null', () => {
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
      ['45,0%', '30,0%', '25,0%'],
      ['55,0%', '15,0%', '—'],
      ['33,0%', '34,0%', '33,0%'],
    ]);
  });

  it('leaves a null cell empty on the chart, never 0', () => {
    renderChart();
    const cells = lastCells();
    expect(cells).toHaveLength(8);
    expect(cells.some((cell) => cell.value[0] === 2 && cell.value[1] === 1)).toBe(false);
    expect(cells.some((cell) => cell.value[2] === 0)).toBe(false);
  });

  it('mixes surface.page into the column ramp and picks the more contrasting ink', () => {
    renderChart();
    const bpFin = lastCells().find((cell) => cell.value[0] === 0 && cell.value[1] === 1);
    const expected = mixColor(
      colorOfToken('surface.page'),
      colorOfToken('dimension.accent.financiera'),
      0.55,
    );
    expect(bpFin?.itemStyle.color).toBe(expected);
    expect(bpFin?.label.formatter()).toBe('55,0%');
    const inks = [colorOfToken('dark.bg'), colorOfToken('text.inverse')];
    const best = Math.max(...inks.map((ink) => contrast(expected, ink)));
    expect(contrast(expected, bpFin?.label.color ?? '')).toBe(best);
  });
});
