import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { ResultsHorizon, V12Response } from '@/shared/api';

// V-12 GE vs. company module (SCR-08 module 4). P7-SWAP-RES: swapped from the raw http client to
// `results.getCompanyComparisonView` now that its port forwards `companyId`/`horizon`
// (`CompanyComparisonViewOptions`, adapters/http/views.ts).

export type CompanyComparisonView = V12Response;
export type CompanyComparisonGroup = CompanyComparisonView['groups'][number];
export type CompanyComparisonRow = CompanyComparisonGroup['rows'][number];
export type CompanyComparisonUnit = CompanyComparisonRow['unit'];

/** V-12 of one company, at one horizon. Idle until the analysis id is non-empty. */
export function useCompanyComparisonDetailView(
  analysisId: string,
  companyId?: string,
  horizon: ResultsHorizon = 'tbg',
) {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.companyComparisonDetail(analysisId, companyId, horizon),
    queryFn: ({ signal }) =>
      results.getCompanyComparisonView(analysisId, {
        horizon,
        ...(companyId === undefined ? {} : { companyId }),
        signal,
      }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}
