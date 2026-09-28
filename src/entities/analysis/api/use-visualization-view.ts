import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V20Response } from '@/shared/api';

// V-20 GET /views/visualization/:analysisId (SCR-09) contains five independently loaded SectionResults. Preserve
// those generated contract results so the page can degrade each dashboard widget independently.

type Section<S> = Extract<S, { status: 'ok' }>;
type SectionData<S> = Section<S> extends { data: infer D } ? D : never;

/**
 * Tier 1 (Estratégico) .. 4 (Requiere apoyo). The generated schema validates the range at runtime
 * (`position.tierId`/`categories[].tierId`: `zod.int().min(1).max(4)`) but its Zod output type is a plain `number`;
 * every tier-keyed lookup table (tier-names.ts) still indexes by this literal union, so it's asserted below.
 */
export type VisualizationTierId = 1 | 2 | 3 | 4;

export type VisualizationHeatmapRow = SectionData<V20Response['heatmap']>[number];
export type VisualizationRadar = SectionData<V20Response['radar']>;
export type VisualizationKpiTile = SectionData<V20Response['kpiTiles']>[number];
export type VisualizationCategory = Omit<
  SectionData<V20Response['categories']>[number],
  'tierId'
> & { tierId: VisualizationTierId };
/** Excludes `lineLegend`: WeightComposition (the widget) already takes it as its own separate prop. */
export type VisualizationWeightComposition = Omit<
  SectionData<V20Response['weightComposition']>,
  'lineLegend'
>;
export type VisualizationWeightCompositionCompany =
  VisualizationWeightComposition['companies'][number];
export type VisualizationLineLegendItem = SectionData<
  V20Response['weightComposition']
>['lineLegend'][number];

export interface VisualizationView {
  lifecycleState: V20Response['lifecycleState'];
  position: Omit<V20Response['position'], 'tierId'> & { tierId: VisualizationTierId };
  kpiTiles: V20Response['kpiTiles'];
  heatmap: V20Response['heatmap'];
  radar: V20Response['radar'];
  categories: V20Response['categories'];
  weightComposition: V20Response['weightComposition'];
  permissions: V20Response['permissions'];
}

/** V-20 header + KPI tiles slice of the Visualización dashboard. Idle until the id is non-empty. */
export function useVisualizationView(analysisId: string) {
  const { visualization } = useServices();
  return useQuery({
    queryKey: queryKeys.visualization(analysisId),
    queryFn: async ({ signal }): Promise<VisualizationView> => {
      const data = await visualization.getVisualizationView(analysisId, { signal });
      return {
        lifecycleState: data.lifecycleState,
        position: { ...data.position, tierId: data.position.tierId as VisualizationTierId },
        kpiTiles: data.kpiTiles,
        heatmap: data.heatmap,
        radar: data.radar,
        categories: data.categories,
        weightComposition: data.weightComposition,
        permissions: data.permissions,
      };
    },
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}
