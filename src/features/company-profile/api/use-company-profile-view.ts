import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V25Response } from '@/shared/api';

// V-25 GET /views/company-profile/:companyId (OVL-13 company profile): now served by the typed
// CompanyProfileViewPort (P7-PORTS-V25).

export type CompanyProfileView = V25Response;

/** V-25 profile of one company (any company, not scoped to an analysis). Idle until the id is non-empty. */
export function useCompanyProfileView(companyId: string) {
  const { companyProfile } = useServices();
  return useQuery({
    queryKey: queryKeys.companyProfile(companyId),
    queryFn: ({ signal }) => companyProfile.getCompanyProfileView(companyId, { signal }),
    enabled: companyId !== '',
    staleTime: STALE_TIMES.catalog,
  });
}
