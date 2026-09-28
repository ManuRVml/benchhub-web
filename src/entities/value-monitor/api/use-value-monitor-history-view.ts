import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V29Response } from '@/shared/api';

// V-29 GET /api/v1/views/value-monitor-history?indicator=&range=&snapshot= (SCR-11 section 5 "Comparación con serie
// histórica"). Generated in src/shared/api/generated/zod.ts and reachable through the typed
// `valueMonitorViews.getValueMonitorHistoryView` port (P7-HOOKS / P7-SWAP-VM); the hand-written mirror this hook used
// before is gone. The generated indicator id default is `ind_roace` (see use-value-monitor-peer-ranking-view.ts's
// same note) — the port applies it when `indicator` is omitted.

/** Range chips of section 5, in display order (URL param `historico`). */
export const VALUE_MONITOR_HISTORY_RANGES = ['actual', '5y', '8y', '10y'] as const;
export type ValueMonitorHistoryRange = (typeof VALUE_MONITOR_HISTORY_RANGES)[number];

export type ValueMonitorHistoryView = V29Response;
export type ValueMonitorHistoryPoint = ValueMonitorHistoryView['points'][number];

/** V-29 history series of `indicator` (default ROACE) over `range` (default `actual`). */
export function useValueMonitorHistoryView(
  range: ValueMonitorHistoryRange = 'actual',
  indicator = 'ind_roace',
) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorHistory(indicator, range),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorHistoryView({ indicator, range, signal }),
    staleTime: STALE_TIMES.view,
  });
}
