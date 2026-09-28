import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V30Response } from '@/shared/api';

// V-30 GET /api/v1/views/value-monitor-kvis?snapshot=&categories=&compliance= (SCR-11 KVI table, mounted through
// widgets/kvi-table, P5-51). Generated in src/shared/api/generated/zod.ts and reachable through the typed
// `valueMonitorViews.getValueMonitorKvisView` port (P7-HOOKS / P7-SWAP-VM); the hand-written mirror this hook used
// before is gone. `categories` / `compliance` stay arrays here — the http client comma-joins query lists itself
// (GetOptions.query doc, ADR-0005), matching this hook's previous behaviour.
//
// The generated response has NO `year` field (the hand-written schema's own `year` was never a real V-30 field, only
// a workaround this entity added by hand — flagged for Nilo/BFF back then). Every snapshot id in this codebase is a
// `YYYY-MM` cut-off (V-27's `header.snapshots[].id`, e.g. "2026-04"), so the KVI table's "Meta {{year}}" / "Real
// {{year}}" column headers now read the year from the *selected snapshot id's* first 4 characters instead
// (ValueMonitorPage derives it, not this hook — this view has no snapshot id of its own to parse).

export type ValueMonitorKvisView = V30Response;
export type ValueMonitorKviRow = ValueMonitorKvisView['rows'][number];

export interface ValueMonitorKvisFilters {
  snapshot?: string;
  categories?: readonly string[];
  compliance?: readonly string[];
}

/** V-30 KVI table rows for `snapshot` (default the latest), filtered server-side by category / compliance band. */
export function useValueMonitorKvisView({
  snapshot,
  categories = [],
  compliance = [],
}: ValueMonitorKvisFilters) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorKvis(snapshot ?? '', categories, compliance),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorKvisView({
        ...(snapshot ? { snapshot } : {}),
        categories,
        compliance,
        signal,
      }),
    staleTime: STALE_TIMES.view,
  });
}
