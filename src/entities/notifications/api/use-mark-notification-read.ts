import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { V44Response } from '@/shared/api';

/**
 * C-35 — marks one notification as read. Optimistic: the card's dot clears immediately, rolled back if the request
 * fails (V-44 itself is never invalidated — it has no ETag, and the cache already holds the true next state; only the
 * shell's V-01 badge is refetched, on success).
 */
export function useMarkNotificationRead() {
  const { notifications } = useServices();
  const queryClient = useQueryClient();
  const key = queryKeys.notifications();

  return useMutation({
    mutationFn: (notificationId: string) => notifications.markNotificationRead(notificationId, {}),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<V44Response>(key);
      queryClient.setQueryData<V44Response>(key, (view) => {
        if (!view) return view;
        const target = view.items.find((item) => item.id === notificationId);
        if (!target || target.isRead) return view;
        return {
          ...view,
          items: view.items.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item,
          ),
          unreadCount: Math.max(0, view.unreadCount - 1),
        };
      });
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // The shell's bell badge reads V-01, not V-44: refetch it so the count drops with the card's dot.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shellStatus() }),
  });
}
