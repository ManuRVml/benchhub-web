import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import { presentationQueryKeys } from './presentation-views';

// C-10 review comment on a presentation (SCR-14 composer), through the typed review port: `entityType: 'presentation'`
// (CF-132) is in the vendored contract now, so the raw-client mirror this hook used to carry is gone.

export interface PresentationCommentInput {
  text: string;
  /** Reply to this comment. */
  parentId?: string;
}

/** Posts a comment (or a reply) on a presentation, then refreshes its detail (comment count) and review threads. */
export function useCreatePresentationComment(presentationId: string) {
  const { review } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ text, parentId }: PresentationCommentInput) =>
      review.createReviewComment({
        entityType: 'presentation',
        entityId: presentationId,
        text,
        ...(parentId === undefined ? {} : { parentId }),
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: presentationQueryKeys.detail(presentationId) }),
        queryClient.invalidateQueries({ queryKey: [...queryKeys.all, 'review'] }),
      ]),
  });
}
