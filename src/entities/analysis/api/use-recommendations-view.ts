import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V23Response } from '@/shared/api';

// V-23 GET /views/weight-recommendations/:analysisId?scope=visualization (SCR-09 OVL-01 "Recomendaciones de
// Yarbis"): now served by the typed VisualizationViewPort (P7-HOOKS-B). V-23 is also used with `scope=horizon`
// elsewhere (a different screen, different item shape); this hook only ever requests `scope=visualization`, so its
// exported types narrow to that branch of the response union.

export type RecommendationsView = Extract<V23Response, { scope: 'visualization' }>;
export type RecommendationItem = RecommendationsView['items'][number];
export type RecommendationDimension = RecommendationItem['dimension'];

/** V-23 recommendations of the visualization dashboard. Idle until the id is non-empty. */
export function useRecommendationsView(analysisId: string) {
  const { visualization } = useServices();
  return useQuery({
    queryKey: queryKeys.recommendations(analysisId),
    queryFn: ({ signal }): Promise<RecommendationsView> =>
      visualization.getWeightRecommendationsView(analysisId, 'visualization', undefined, {
        signal,
      }) as Promise<RecommendationsView>,
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}
