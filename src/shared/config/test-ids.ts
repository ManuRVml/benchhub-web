/**
 * data-testid convention (brief §5.6): hierarchical kebab-case `{page|widget}-{component}-{element}[-{qualifier}]`,
 * e.g. `comparison-overview-kpi-card-ebitda`, `peer-ranking-table-row-{peerId}`.
 *
 * Each slice keeps its ids in its own `test-ids.ts`, built with `testId()`, and shares them between components and
 * tests. Every part is normalised to kebab-case, the qualifier too, so pass entity ids through `testId()` on both sides
 * (the raw id belongs in `data-entity-id`).
 */
export type TestIdPart = string | number;

/** `peerRanking` / `peer_ranking` / `Peer Ranking` → `peer-ranking`. */
export function toKebabCase(part: TestIdPart): string {
  return String(part)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function testId(
  scope: TestIdPart,
  component: TestIdPart,
  element: TestIdPart,
  qualifier?: TestIdPart,
): string {
  const parts = [scope, component, element, ...(qualifier === undefined ? [] : [qualifier])].map(
    toKebabCase,
  );
  if (parts.some((part) => part === '')) {
    throw new Error(`testId(): empty part in ${JSON.stringify(parts)}`);
  }
  return parts.join('-');
}
