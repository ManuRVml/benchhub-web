import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V02Response } from '@/shared/api';

export type AdminHomeView = V02Response;
export type AdminHomeCard = AdminHomeView['cards'][number];

/** V-02 admin home (SCR-03): the back-office cards, in contract order, with their availability. */
export function useAdminHomeView() {
  const { admin } = useServices();
  return useQuery({
    queryKey: queryKeys.adminHome(),
    queryFn: ({ signal }) => admin.getAdminHomeView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
