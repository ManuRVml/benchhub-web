import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V21Response } from '@/shared/api';

// V-21 GET /views/peer-weight-ranking/:analysisId?dimension=fin|op|trans (SCR-09 "Ranking por categoría"): now
// served by the typed VisualizationViewPort (P7-HOOKS-B). The generated response also carries `rank`, `initials`,
// `colorKey` and a structured `explanation` per row (server-composed, for the row-click text) — this hook still
// only exposes what P5-47b renders (name/pct/isLeader/isEcopetrol computed client-side), so those extra fields pass
// through the type untouched rather than being dropped.

export const PEER_WEIGHT_RANKING_DIMENSIONS = ['fin', 'op', 'trans'] as const;
export type PeerWeightRankingDimension = (typeof PEER_WEIGHT_RANKING_DIMENSIONS)[number];

export type PeerWeightRankingView = V21Response;
export type PeerWeightRankingRow = PeerWeightRankingView['rows'][number];

/** V-21 ranking of one dimension. Idle until the id is non-empty. */
export function usePeerWeightRankingView(
  analysisId: string,
  dimension: PeerWeightRankingDimension,
) {
  const { visualization } = useServices();
  return useQuery({
    queryKey: queryKeys.peerWeightRanking(analysisId, dimension),
    queryFn: ({ signal }) =>
      visualization.getPeerWeightRankingView(analysisId, dimension, { signal }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}
