import type { BuilderModule } from './use-presentation-builder-view';

// Pure derivation of a new `modules[]` (C-28 PATCH body, CF-109) from a reordered flat list of V-42 slide keys
// (OVL-06 "Orden de diapositivas"). A chart slide's key is `moduleId|chartId` (V-42 `slide.key`, matches V-41
// `notes` keys); `title` (cover) and `appendix` (closing) are not part of `modules[]` and are ignored here — cover
// always opens the deck and closing always ends it, driven by `includeCover` / `includeClosing`, not by this order.

/** `moduleId|chartId` pairs of `order`, in order, skipping the fixed cover/closing keys. */
function chartKeysOf(order: readonly string[]): readonly { moduleId: string; chartId: string }[] {
  return order.flatMap((key) => {
    const separator = key.indexOf('|');
    if (separator === -1) return [];
    return [{ moduleId: key.slice(0, separator), chartId: key.slice(separator + 1) }];
  });
}

/**
 * `modules` with each module's selected charts reordered to match `order`, unselected charts kept as they were
 * (appended after, original order), and the modules themselves reordered by the first appearance of one of their
 * charts in `order` (a module with no chart in `order` — fully unselected — keeps its original relative position,
 * appended last). Throws if `order` names a module or chart that `modules` does not have: the caller passed a stale
 * order.
 */
export function reorderModules(
  modules: readonly BuilderModule[],
  order: readonly string[],
): readonly BuilderModule[] {
  const chartKeys = chartKeysOf(order);

  const moduleOrder: string[] = [];
  for (const { moduleId } of chartKeys) {
    if (!moduleOrder.includes(moduleId)) moduleOrder.push(moduleId);
  }
  for (const module_ of modules) {
    if (!moduleOrder.includes(module_.id)) moduleOrder.push(module_.id);
  }

  return moduleOrder.map((moduleId) => {
    const original = modules.find((module_) => module_.id === moduleId);
    if (!original) throw new Error(`reorderModules: order names an unknown module "${moduleId}"`);

    const selectedChartIds = chartKeys
      .filter((chartKey) => chartKey.moduleId === moduleId)
      .map((chartKey) => chartKey.chartId);
    // A module absent from `order` (none of its charts appear) is not being reordered: keep every chart as it was.
    if (selectedChartIds.length === 0) return original;

    const selectedCharts = selectedChartIds.map((chartId) => {
      const chart = original.charts.find((candidate) => candidate.id === chartId);
      if (!chart) {
        throw new Error(`reorderModules: order names an unknown chart "${moduleId}|${chartId}"`);
      }
      return chart;
    });
    const unselectedCharts = original.charts.filter((chart) => !chart.isSelected);

    return { ...original, charts: [...selectedCharts, ...unselectedCharts] };
  });
}

/** Fixed pseudo-keys of the cover and closing slides (V-42 `slide.key`); never part of `modules[]`. */
export const COVER_KEY = 'title';
export const CLOSING_KEY = 'appendix';

/**
 * The deck's flat slide-key order from the builder's saved state (inverse of `reorderModules`): cover (if
 * `includeCover`), then every selected chart of every module in `modules[]` order, then closing (if
 * `includeClosing`). This is the initial "Orden de diapositivas" list (OVL-06) before the user touches it.
 */
export function flattenBuilderOrder(
  modules: readonly BuilderModule[],
  includeCover: boolean,
  includeClosing: boolean,
): readonly string[] {
  const keys: string[] = [];
  if (includeCover) keys.push(COVER_KEY);
  for (const module_ of modules) {
    for (const chart of module_.charts) {
      if (chart.isSelected) keys.push(`${module_.id}|${chart.id}`);
    }
  }
  if (includeClosing) keys.push(CLOSING_KEY);
  return keys;
}

/**
 * Swaps the slide key at `index` with its neighbour in `direction` (-1 up, +1 down); a no-op copy past either end.
 * Cover and closing are fixed anchors: the caller (the ▲▼ buttons) must disable a move that would cross them, this
 * function only performs the swap it is given.
 */
export function moveOrderItem(
  order: readonly string[],
  index: number,
  direction: -1 | 1,
): readonly string[] {
  const target = index + direction;
  if (target < 0 || target >= order.length) return [...order];
  const next = [...order];
  const a = next[index];
  const b = next[target];
  if (a === undefined || b === undefined) return next;
  next[index] = b;
  next[target] = a;
  return next;
}
