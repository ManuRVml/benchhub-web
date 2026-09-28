import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { V44Response } from '@/shared/api';

/**
 * C-36 — marks every notification as read ("opening the page marks all visible notifications read once", SCR-15).
 * Optimistic: every unread dot clears immediately, rolled back if the request fails.
 */
export function useMarkAllNotificationsRead() {
  const { notifications } = useServices();
  const queryClient = useQueryClient();
  const key = queryKeys.notifications();

  return useMutation({
    mutationFn: () => notifications.markAllNotificationsRead({}),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<V44Response>(key);
      queryClient.setQueryData<V44Response>(key, (view) =>
        view
          ? {
              ...view,
              items: view.items.map((item) => ({ ...item, isRead: true })),
              unreadCount: 0,
            }
          : view,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // The shell's bell badge reads V-01, not V-44: refetch it so the count drops with the page's dots.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shellStatus() }),
  });
}
