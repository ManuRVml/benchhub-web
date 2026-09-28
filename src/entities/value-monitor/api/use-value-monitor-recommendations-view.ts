import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V35Response } from '@/shared/api';

// V-35 GET /api/v1/views/value-monitor-recommendations?snapshot= (SCR-11 OVL-02 "Recomendaciones estratégicas de
// Yarbis"). Generated in src/shared/api/generated/zod.ts and reachable through the typed
// `valueMonitorViews.getValueMonitorRecommendationsView` port (P7-HOOKS / P7-SWAP-VM); this hook's own TODO(P7-PORTS)
// and hand-written mirror (predating the contract bump) are gone. `items[]` now also carries `dimension`
// (`fin`|`op`|`trans`) alongside `label`/`tone`/`text`; ValueMonitorRecommendationsModal doesn't read it yet
// (unaffected by the swap).

export type ValueMonitorRecommendationsView = V35Response;
export type ValueMonitorRecommendation = ValueMonitorRecommendationsView['items'][number];

/**
 * V-35 Yarbis strategic recommendations (OVL-02), for `snapshot` (default the latest, i.e. omitted). `enabled` keeps
 * it idle until the modal actually opens (no request just for the header pill to render).
 */
export function useValueMonitorRecommendationsView(snapshot: string | undefined, enabled: boolean) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorRecommendations(snapshot ?? ''),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorRecommendationsView({
        ...(snapshot ? { snapshot } : {}),
        signal,
      }),
    enabled,
    staleTime: STALE_TIMES.view,
  });
}
