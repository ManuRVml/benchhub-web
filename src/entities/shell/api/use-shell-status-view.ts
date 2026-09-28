import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

/** V-01 shell status: today just the unread notifications badge shown across every screen. Idle without a session. */
export function useShellStatusView(enabled: boolean) {
  const { shell } = useServices();
  return useQuery({
    queryKey: queryKeys.shellStatus(),
    queryFn: ({ signal }) => shell.getShellStatusView({ signal }),
    staleTime: STALE_TIMES.view,
    enabled,
  });
}
