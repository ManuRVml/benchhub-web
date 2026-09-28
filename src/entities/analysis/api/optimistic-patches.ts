import { deepPatch } from '@/shared/api';

import type { AnalysisEditCommands, V10Response, V12Response } from '@/shared/api';

// Pure optimistic patches of the analysis views for the edit commands (C-06, C-07). Each takes a cached view payload
// and returns it with the edit applied (or unchanged when the view does not show the edited data).

export type ValueOverride = Parameters<
  AnalysisEditCommands['updateValueOverrides']
>[1]['overrides'][number];
export type WeightOverride = Parameters<
  AnalysisEditCommands['updateWeightOverrides']
>[1]['weights'][number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** V-10 selected company panel: value, estimate flag and justification of the overridden indicators. */
function patchCoverage(view: V10Response, overrides: readonly ValueOverride[]): V10Response {
  if (view.selected.status !== 'ok') return view;
  const selected = view.selected.data;
  const mine = overrides.filter((override) => override.companyId === selected.companyId);
  if (mine.length === 0) return view;
  const groups = selected.groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const override = mine.find((candidate) => candidate.indicatorId === item.indicatorId);
      return override
        ? {
            ...item,
            value: override.value,
            isEstimate: override.isEstimate,
            justification: override.justification ?? item.justification,
          }
        : item;
    }),
  }));
  return { ...view, selected: { ...view.selected, data: { ...selected, groups } } };
}

/** V-12 GE vs. company: the company value of the overridden indicators (diff / outcome refresh on invalidation). */
function patchComparison(view: V12Response, overrides: readonly ValueOverride[]): V12Response {
  const mine = overrides.filter((override) => override.companyId === view.company.id);
  if (mine.length === 0) return view;
  return {
    ...view,
    groups: view.groups.map((group) => ({
      ...group,
      rows: group.rows.map((row) => {
        const override = mine.find((candidate) => candidate.indicatorId === row.indicatorId);
        return override ? { ...row, companyValue: override.value } : row;
      }),
    })),
  };
}

/** C-06: applies value overrides to whichever analysis view is cached under `queryKey`. */
export function applyValueOverrides(
  data: unknown,
  queryKey: readonly unknown[],
  overrides: readonly ValueOverride[],
): unknown {
  const view = queryKey[3];
  if (view === 'company-coverage' && isRecord(data)) {
    return patchCoverage(data as V10Response, overrides);
  }
  if (view === 'company-comparison' && isRecord(data)) {
    return patchComparison(data as V12Response, overrides);
  }
  return data;
}

/**
 * C-07: sets `weight` on every cached object of the overridden indicators. No 0.1.0 view carries per-indicator weights,
 * so today this changes nothing; views that add `{ indicatorId, weight }` rows get the optimistic update for free.
 */
export function applyWeightOverrides(data: unknown, weights: readonly WeightOverride[]): unknown {
  return deepPatch(
    data,
    (node) => 'weight' in node && weights.some((w) => w.indicatorId === node.indicatorId),
    (node) => ({
      ...node,
      weight: weights.find((w) => w.indicatorId === node.indicatorId)?.weight,
    }),
  );
}
