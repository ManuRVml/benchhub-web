// Series colours of the P5-21 charts, resolved from the design tokens (docs/design/design-tokens.json): the ECharts
// theme (../echarts/theme) covers brand / chart / font / surface / text / border; the ai, company, dark, dimension
// and status colours live in their own groups and alias those (e.g. company.ecopetrol = {chart.highlight}).
// No colour literal in TS.
import {
  ai,
  company,
  dark,
  dimension,
  status,
} from '../../../../../docs/design/design-tokens.json';
import { tokenColor } from '../echarts/theme';

interface TokenNode {
  $value?: unknown;
  [key: string]: unknown;
}

const EXTRA_GROUPS: Readonly<Record<string, unknown>> = { ai, company, dark, dimension, status };
const REFERENCE = /^\{([^}]+)\}$/;

/** Colour of any token path (`chart.average`, `company.shell`, `dimension.accent.financiera`), following aliases. */
export function colorOfToken(path: string): string {
  const [group = '', ...rest] = path.split('.');
  if (!(group in EXTRA_GROUPS)) return tokenColor(path);
  const node = rest.reduce<unknown>(
    (current, key) =>
      typeof current === 'object' && current !== null
        ? (current as Record<string, unknown>)[key]
        : undefined,
    EXTRA_GROUPS[group],
  ) as TokenNode | undefined;
  const value = node?.$value;
  if (typeof value !== 'string') throw new Error(`Unknown colour token ${path}`);
  const reference = REFERENCE.exec(value);
  return reference?.[1] ? colorOfToken(reference[1]) : value;
}

const COMPANY_KEYS = Object.keys(company).filter((key) => !key.startsWith('$'));

/**
 * Colour of a series `colorKey`: a bare company slug of the contracts (`ecopetrol`, `shell`, `totalenergies`; matched
 * case-insensitively, CF-98 / CF-137) → `company.*`; a token path (`chart.average`) → that token; anything else →
 * `company.fallback`.
 */
export function seriesColor(colorKey: string | null | undefined): string {
  if (colorKey) {
    const slug = COMPANY_KEYS.find((key) => key.toLowerCase() === colorKey.toLowerCase());
    if (slug) return colorOfToken(`company.${slug}`);
    if (colorKey.includes('.')) {
      try {
        return colorOfToken(colorKey);
      } catch {
        // Unknown token path: fall through to the fallback colour.
      }
    }
  }
  return colorOfToken('company.fallback');
}

/** `#rrggbb` → [r, g, b]. */
function rgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Linear mix of two `#rrggbb` colours (`t` 0 → `from`, 1 → `to`), as the prototype's `mixHex`. */
export function mixColor(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const [a, b] = [rgb(from), rgb(to)];
  return `#${a
    .map((channel, index) => Math.round(channel + ((b[index] ?? 0) - channel) * clamped))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** WCAG relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colours. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
