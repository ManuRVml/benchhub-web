import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentThreadKey } from '@/entities/analysis';
import { useServices } from '@/shared/api';

/**
 * C-10 for the Monitor de Valor comment thread (SCR-11 §11), through the typed `review.createReviewComment` port
 * (entityType `value_monitor`, underscore, as in the generated enum). Posts a top-level comment on the `entityId`
 * (snapshot) thread and refreshes every V-26 thread on success.
 */
export function usePostValueMonitorComment(entityId: string) {
  const { review } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      review.createReviewComment({ entityType: 'value_monitor', entityId, text }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: commentThreadKey('value_monitor', entityId) }),
  });
}
