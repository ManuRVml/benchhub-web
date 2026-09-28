// ECharts theme built from the design tokens (docs/design/design-tokens.json, the same DTCG source that
// tools/tokens/build-theme.mjs turns into theme.css). No colour literals here: every value is a token path.
// Named JSON imports let the bundler drop the token groups the charts do not use.
import {
  ai,
  brand,
  chart,
  font,
  info,
  status,
  surface,
  text,
  border,
} from '../../../../../docs/design/design-tokens.json';

interface TokenNode {
  $value?: unknown;
  [key: string]: unknown;
}

// Every group a `chart.*` token references (e.g. chart.category.financiero → {info.icon}) must be listed here.
const GROUPS: Readonly<Record<string, unknown>> = {
  ai,
  brand,
  chart,
  font,
  info,
  status,
  surface,
  text,
  border,
};
const REFERENCE = /^\{([^}]+)\}$/;

function tokenAt(path: string): TokenNode {
  const node = path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        typeof current === 'object' && current !== null
          ? (current as Record<string, unknown>)[key]
          : undefined,
      GROUPS,
    );
  if (typeof node !== 'object' || node === null || !('$value' in node)) {
    throw new Error(`Unknown design token ${path}`);
  }
  return node;
}

/** Resolves a token path to its literal value, following `{reference}` aliases. */
export function tokenValue(path: string, seen: readonly string[] = []): unknown {
  if (seen.includes(path)) throw new Error(`Design token reference cycle through ${path}`);
  const value = tokenAt(path).$value;
  const reference = typeof value === 'string' ? REFERENCE.exec(value) : null;
  return reference?.[1] ? tokenValue(reference[1], [...seen, path]) : value;
}

export function tokenColor(path: string): string {
  const value = tokenValue(path);
  if (typeof value !== 'string') throw new Error(`Design token ${path} is not a colour`);
  return value;
}

/** Fontsource variable families come first, as in theme.css (`--font-sans`). */
const FONTSOURCE_FAMILY: Readonly<Record<string, string>> = { Roboto: 'Roboto Variable' };

function fontStack(path: string): string {
  const families = tokenValue(path);
  const names = Array.isArray(families) ? (families as string[]) : [String(families)];
  return names
    .flatMap((name) => {
      const fontsource = FONTSOURCE_FAMILY[name];
      return fontsource ? [fontsource, name] : [name];
    })
    .map((name) => (/^[a-z-]+$/i.test(name) ? name : `'${name}'`))
    .join(', ');
}

/** Categorical palette in token order (`chart.series.1..9`, #83E377 reserved for Ecopetrol and excluded). */
export const SERIES_COLORS: readonly string[] = Object.keys(chart.series)
  .sort((a, b) => Number(a) - Number(b))
  .map((index) => tokenColor(`chart.series.${index}`));

export const ECO_THEME_NAME = 'eco';

const axisColors = {
  axisLine: { lineStyle: { color: tokenColor('border.default') } },
  axisTick: { lineStyle: { color: tokenColor('border.default') } },
  axisLabel: { color: tokenColor('text.secondary') },
  splitLine: { lineStyle: { color: tokenColor('border.subtle') } },
};

export const ECO_THEME = {
  color: [...SERIES_COLORS],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: fontStack('font.family.sans'), color: tokenColor('text.body') },
  legend: { textStyle: { color: tokenColor('text.secondary') } },
  tooltip: {
    backgroundColor: tokenColor('surface.card'),
    borderColor: tokenColor('border.default'),
    textStyle: { color: tokenColor('text.body') },
  },
  categoryAxis: axisColors,
  valueAxis: axisColors,
};
