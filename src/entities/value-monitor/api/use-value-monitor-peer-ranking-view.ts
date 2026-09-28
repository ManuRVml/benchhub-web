import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V28Response } from '@/shared/api';

// V-28 GET /api/v1/views/value-monitor-peer-ranking?indicator=&snapshot= (SCR-11 section 4 "Ranking de pares").
// Generated in src/shared/api/generated/zod.ts and reachable through the typed
// `valueMonitorViews.getValueMonitorPeerRankingView` port (P7-HOOKS / P7-SWAP-VM); the hand-written mirror this hook
// used before is gone. The generated indicator id default is `ind_roace` (the BFF's own id shape, not the bare
// `roace` this hook defaulted to before) — the port applies it when `indicator` is omitted.

export type ValueMonitorPeerRankingView = V28Response;
export type ValueMonitorPeerRankingRow = ValueMonitorPeerRankingView['rows'][number];

/** V-28 peer ranking of `indicator` (default ROACE) for `snapshot` (default the latest, i.e. omitted). */
export function useValueMonitorPeerRankingView(snapshot?: string, indicator = 'ind_roace') {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorPeerRanking(indicator, snapshot ?? ''),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorPeerRankingView({
        indicator,
        ...(snapshot ? { snapshot } : {}),
        signal,
      }),
    staleTime: STALE_TIMES.view,
  });
}
