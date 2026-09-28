import { describe, expect, it } from 'vitest';

import { chart } from '../../../../../docs/design/design-tokens.json';

import { ECO_THEME, SERIES_COLORS, tokenColor, tokenValue } from './theme';

describe('ECharts token theme', () => {
  it('builds the categorical palette from chart.series.1..9, following references', () => {
    expect(SERIES_COLORS).toHaveLength(9);
    expect(SERIES_COLORS[0]).toBe(tokenColor('chart.series.1'));
    // chart.series.9 is the alias {brand.navActive}.
    expect(SERIES_COLORS[8]).toBe(tokenValue('brand.navActive'));
    expect(SERIES_COLORS.every((color) => /^#[0-9A-F]{6}$/i.test(color))).toBe(true);
    expect(ECO_THEME.color).toEqual(SERIES_COLORS);
  });

  it('keeps the Ecopetrol highlight out of the categorical palette', () => {
    expect(SERIES_COLORS).not.toContain(tokenColor('chart.highlight'));
  });

  it('uses the token font stack with the self-hosted family first', () => {
    expect(ECO_THEME.textStyle.fontFamily).toBe("'Roboto Variable', Roboto, system-ui, sans-serif");
  });

  it('resolves every chart.* colour token, references to other groups included', () => {
    const paths = (node: object, prefix: string): string[] =>
      Object.entries(node).flatMap(([key, value]) => {
        if (key.startsWith('$') || typeof value !== 'object' || value === null) return [];
        const path = `${prefix}.${key}`;
        return '$value' in value ? [path] : paths(value as object, path);
      });
    const colours = paths(chart, 'chart').map((path) => tokenColor(path));
    expect(colours.length).toBeGreaterThan(30);
    expect(colours.every((color) => /^#[0-9A-F]{6,8}$/i.test(color))).toBe(true);
    expect(tokenColor('chart.category.financiero')).toBe(tokenValue('info.icon'));
  });

  it('rejects unknown token paths', () => {
    expect(() => tokenColor('chart.nope')).toThrow('Unknown design token chart.nope');
  });
});
