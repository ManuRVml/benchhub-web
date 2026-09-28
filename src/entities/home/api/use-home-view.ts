import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

/** V-03 Inicio: five independent sections (each a SectionResult); errors surface as ApiError. */
export function useHomeView() {
  const { home } = useServices();
  return useQuery({
    queryKey: queryKeys.home(),
    queryFn: ({ signal }) => home.getHomeView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
