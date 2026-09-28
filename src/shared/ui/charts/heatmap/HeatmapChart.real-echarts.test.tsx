import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { colorOfToken, mixColor } from '../radar/token-colors';

import { HeatmapChart } from './HeatmapChart';

// Regression (P5-21b): the other HeatmapChart tests mock echarts/core, so they never saw ECharts reject the option
// ("Heatmap must use with visualMap"). This one renders with the real modular core and SVG renderer.
// jsdom has no layout: the container gets a fixed size so ECharts draws the cells.
const SIZE = { clientWidth: 480, clientHeight: 280 };
const saved = Object.keys(SIZE).map(
  (key) => [key, Object.getOwnPropertyDescriptor(HTMLElement.prototype, key)] as const,
);

beforeAll(() => {
  for (const [key, value] of Object.entries(SIZE)) {
    Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get: () => value });
  }
});

afterAll(() => {
  for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor);
  }
});

describe('HeatmapChart with the real ECharts core', () => {
  it('renders without throwing and paints each cell with its token ramp colour', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <HeatmapChart
        rows={['Ecopetrol', 'BP']}
        columns={['Financiera', 'Operativa']}
        values={[
          [45, 30],
          [55, null],
        ]}
        unit="percent"
        ariaLabel="Peso por dimensión y compañía"
        columnColorKeys={['dimension.accent.financiera', 'dimension.accent.operativa']}
      />,
    );
    const chart = screen.getByRole('img', { name: 'Peso por dimensión y compañía' });
    const svg = chart.querySelector('svg');
    expect(svg).not.toBeNull();

    const fills = new Set(
      Array.from(svg?.querySelectorAll('[fill]') ?? [], (node) =>
        node.getAttribute('fill')?.toLowerCase(),
      ),
    );
    const start = colorOfToken('surface.page');
    const expected = [
      mixColor(start, colorOfToken('dimension.accent.financiera'), 0.45),
      mixColor(start, colorOfToken('dimension.accent.operativa'), 0.3),
      mixColor(start, colorOfToken('dimension.accent.financiera'), 0.55),
    ];
    for (const color of expected) expect(fills).toContain(color.toLowerCase());
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
