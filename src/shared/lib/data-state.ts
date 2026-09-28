/**
 * Machine-readable state attributes (brief §5.6): `data-state`, `data-entity-*`, `data-value`, `data-trend`.
 * Spread them on the element they describe: `<section {...dataStateAttrs('ready')}>`.
 */
export const DATA_STATES = ['loading', 'empty', 'error', 'forbidden', 'ready'] as const;
export type DataState = (typeof DATA_STATES)[number];

export const TRENDS = ['up', 'down', 'flat'] as const;
export type Trend = (typeof TRENDS)[number];

export function dataStateAttrs(state: DataState): { 'data-state': DataState } {
  return { 'data-state': state };
}

export function dataEntityAttrs(
  type: string,
  id: string,
): { 'data-entity-type': string; 'data-entity-id': string } {
  return { 'data-entity-type': type, 'data-entity-id': id };
}

/** Raw value next to its formatted text, e.g. `<td {...dataValueAttrs(7.4, 'down')}>7,4 %</td>`. */
export function dataValueAttrs(
  value: number | string | null,
  trend?: Trend,
): { 'data-value': string; 'data-trend'?: Trend } {
  const attrs: { 'data-value': string; 'data-trend'?: Trend } = {
    'data-value': value === null ? '' : String(value),
  };
  if (trend !== undefined) attrs['data-trend'] = trend;
  return attrs;
}
