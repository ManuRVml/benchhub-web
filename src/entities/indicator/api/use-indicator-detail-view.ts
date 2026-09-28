import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

/** Back-link origin of SCR-10 (`origen` in the URL); the BFF also uses it to admit executive_viewer (V-24). */
export type IndicatorOrigin = 'resultados' | 'visualizacion' | 'presentacion';

/** Key of V-24, under the per-analysis prefix so analysis commands (C-04..C-09) refresh it too. */
export const indicatorDetailKey = (
  analysisId: string,
  indicatorId: string,
  origin: IndicatorOrigin | null,
) => [...queryKeys.analysis(analysisId), 'indicator-detail', indicatorId, origin] as const;

/**
 * V-24 indicator detail (SCR-10): `indicator` + `permissions` (primary datum) and four independent sections (`kpis`,
 * `series`, `insight`, `traceability`). Uses the typed `indicatorDetail.getIndicatorDetailView` port (P7-PORTS-C).
 * Idle until both ids are set; errors surface as ApiError.
 */
export function useIndicatorDetailView(
  analysisId: string,
  indicatorId: string,
  origin: IndicatorOrigin | null = null,
) {
  const { indicatorDetail } = useServices();
  return useQuery({
    queryKey: indicatorDetailKey(analysisId, indicatorId, origin),
    queryFn: ({ signal }) =>
      indicatorDetail.getIndicatorDetailView(analysisId, indicatorId, origin ?? undefined, {
        signal,
      }),
    enabled: analysisId !== '' && indicatorId !== '',
    staleTime: STALE_TIMES.view,
  });
}
