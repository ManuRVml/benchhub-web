import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RadarChart } from './RadarChart';
import { colorOfToken, seriesColor } from './token-colors';

import type { ChartOption } from '../echarts';

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));

// jsdom has no layout, so the real ECharts instance is replaced; the tests inspect the option it would receive.
vi.mock('../echarts/core', () => ({ createChart: vi.fn(() => chart) }));

const AXES = [
  { id: 'fin', label: 'Financiera' },
  { id: 'op', label: 'Operativa' },
  { id: 'trans', label: 'Transversal' },
];
const SERIES = [
  { id: 'eco', label: 'Ecopetrol', colorKey: 'ecopetrol', values: [45, 30, 25] },
  { id: 'sector', label: 'Promedio sector', colorKey: 'chart.average', values: [43, null, 28] },
];
const LABEL = 'Ecopetrol vs. sector por dimensión';

type RadarOption = ChartOption & {
  animation?: boolean;
  radar: { indicator: { name: string; max: number }[]; center: string[]; startAngle: number };
  polar: { center: string[]; radius: string };
  angleAxis: { min: number; max: number; startAngle: number };
  series: {
    name: string;
    type: string;
    coordinateSystem: string;
    data: [number | string, number][];
    itemStyle: { color: string };
  }[];
};

const lastOption = (): RadarOption => {
  const call = chart.setOption.mock.calls.at(-1);
  if (!call) throw new Error('setOption was not called');
  return call[0] as RadarOption;
};

const tableRows = () => {
  const table = screen.getByRole('table', { name: LABEL });
  const [, ...rows] = within(table).getAllByRole('row');
  return rows.map((row) => [
    within(row).getByRole('rowheader').textContent,
    ...within(row)
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  ]);
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

describe('RadarChart', () => {
  beforeEach(() => {
    chart.setOption.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is an img named by its label with one series per company', () => {
    render(<RadarChart axes={AXES} series={SERIES} ariaLabel={LABEL} unit="percent" />);
    const image = screen.getByRole('img', { name: LABEL });
    expect(image).toHaveAttribute('data-testid', 'radar-chart');
    expect(image).toHaveAttribute('data-series-count', '2');
    expect(lastOption().series.map((s) => s.name)).toEqual(['Ecopetrol', 'Promedio sector']);
  });

  it('renders one table row per axis with es-CO values and "—" for null', () => {
    render(<RadarChart axes={AXES} series={SERIES} ariaLabel={LABEL} unit="percent" />);
    expect(tableRows()).toEqual([
      ['Financiera', '45,0%', '43,0%'],
      ['Operativa', '30,0%', '—'],
      ['Transversal', '25,0%', '28,0%'],
    ]);
  });

  it('breaks the line at null (never a vertex at 0) and closes the shape on the first value', () => {
    render(<RadarChart axes={AXES} series={SERIES} ariaLabel={LABEL} />);
    const option = lastOption();
    expect(option.series.map((s) => [s.type, s.coordinateSystem])).toEqual([
      ['line', 'polar'],
      ['line', 'polar'],
    ]);
    expect(option.series[0]?.data).toEqual([
      [45, 0],
      [30, 120],
      [25, 240],
      [45, 360],
    ]);
    expect(option.series[1]?.data).toEqual([
      [43, 0],
      ['-', 120],
      [28, 240],
      [43, 360],
    ]);
    expect([option.angleAxis.min, option.angleAxis.max]).toEqual([0, 360]);
    expect(option.series[0]).toHaveProperty('areaStyle');
    expect(option.series[1]).not.toHaveProperty('areaStyle');
  });

  it('overlays the polar series exactly on the radar grid and scales values to each axis max', () => {
    render(
      <RadarChart
        axes={[
          { id: 'a', label: 'A', max: 50 },
          { id: 'b', label: 'B' },
        ]}
        series={[{ id: 's', label: 'S', colorKey: 'ecopetrol', values: [25, 80] }]}
        ariaLabel={LABEL}
      />,
    );
    const option = lastOption();
    expect(option.polar.center).toEqual(option.radar.center);
    expect(option.angleAxis.startAngle).toBe(option.radar.startAngle);
    expect(option.radar.indicator.map((axis) => axis.max)).toEqual([50, 100]);
    expect(option.series[0]?.data).toEqual([
      [50, 0],
      [80, 180],
      [50, 360],
    ]);
  });

  it('resolves series colours from tokens', () => {
    render(<RadarChart axes={AXES} series={SERIES} ariaLabel={LABEL} />);
    const option = lastOption();
    expect(option.series[0]?.itemStyle.color).toBe(colorOfToken('chart.highlight'));
    expect(option.series[1]?.itemStyle.color).toBe(colorOfToken('brand.primary'));
  });

  it('handles 20 axes: 20 table rows and truncated chart labels', () => {
    const axes = Array.from({ length: 20 }, (_, i) => ({
      id: `kvi_${String(i)}`,
      label: `Indicador clave de valor ${String(i + 1)}`,
    }));
    const values = axes.map((_, i) => (i === 3 ? null : 60 + i));
    render(
      <RadarChart
        axes={axes}
        series={[{ id: 'eco', label: 'Ecopetrol 2025', colorKey: 'ecopetrol', values }]}
        ariaLabel="Benchmark radial"
      />,
    );
    const table = screen.getByRole('table', { name: 'Benchmark radial' });
    expect(within(table).getAllByRole('rowheader')).toHaveLength(20);
    expect(within(table).getAllByRole('cell')[3]).toHaveTextContent('—');
    const indicator = lastOption().radar.indicator;
    expect(indicator).toHaveLength(20);
    expect(indicator[0]?.name).toBe('Indicador clave…');
  });

  it('disables animation under reduced motion', () => {
    mockReducedMotion(true);
    render(<RadarChart axes={AXES} series={SERIES} ariaLabel={LABEL} />);
    expect(lastOption().animation).toBe(false);
  });
});

describe('seriesColor', () => {
  it('matches bare company slugs case-insensitively and falls back for unknown keys', () => {
    expect(seriesColor('totalenergies')).toBe(colorOfToken('company.totalEnergies'));
    expect(seriesColor('SHELL')).toBe(colorOfToken('company.shell'));
    expect(seriesColor('acme')).toBe(colorOfToken('company.fallback'));
    expect(seriesColor('chart.nope')).toBe(colorOfToken('company.fallback'));
    expect(seriesColor(undefined)).toBe(colorOfToken('company.fallback'));
  });
});
