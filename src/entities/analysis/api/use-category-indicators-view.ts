import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V22Response } from '@/shared/api';

// V-22 GET /views/category-indicators/:analysisId?category=rentabilidad (SCR-09 indicator panel): now served by the
// typed VisualizationViewPort (P7-HOOKS-B), generated from the re-vendored contract (CF-revendor).

export type CategoryIndicatorsView = V22Response;
export type CategoryIndicatorRow = CategoryIndicatorsView['rows'][number];
export type CategoryIndicatorUnit = CategoryIndicatorRow['unit'];
export type CategoryIndicatorValueKind = CategoryIndicatorRow['valueKind'];

/** V-22 indicator panel of one category. Idle until the id is non-empty. */
export function useCategoryIndicatorsView(analysisId: string, category: string) {
  const { visualization } = useServices();
  return useQuery({
    queryKey: queryKeys.categoryIndicators(analysisId, category),
    queryFn: ({ signal }) =>
      visualization.getCategoryIndicatorsView(analysisId, category, { signal }),
    enabled: analysisId !== '' && category !== '',
    staleTime: STALE_TIMES.view,
  });
}
