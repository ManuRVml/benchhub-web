import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { NotificationsViewOptions } from '@/shared/api';

type NotificationsViewFilters = Pick<NotificationsViewOptions, 'q' | 'severity'>;

/**
 * V-44 notifications list + unread count (SCR-15). A single, non-sectioned payload (brief §5): a failure is the
 * whole endpoint's ApiError, surfaced through `query.error` for the page's own retry UI.
 */
export function useNotificationsView({ q, severity = [] }: NotificationsViewFilters = {}) {
  const { notifications } = useServices();
  return useQuery({
    queryKey: queryKeys.notifications(q ?? '', severity),
    queryFn: ({ signal }) =>
      notifications.getNotificationsView({
        ...(q === undefined ? {} : { q }),
        ...(severity.length === 0 ? {} : { severity }),
        signal,
      }),
    staleTime: STALE_TIMES.view,
  });
}
