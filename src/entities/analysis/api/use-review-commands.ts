import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { ReviewCommands } from '@/shared/api';

// Mutation hooks of the review commands (C-10..C-13). Comment threads and change requests are views of later contract
// versions (V-26…), so they are keyed under `REVIEW_PREFIX` until `queryKeys` gains them; a change request about an
// analysis also refreshes that analysis.

/** Prefix of the review views (comment threads, change requests). */
export const REVIEW_PREFIX = [...queryKeys.all, 'review'] as const;

function useInvalidateReview() {
  const queryClient = useQueryClient();
  return (entity?: { entityType: string; entityId: string }) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: REVIEW_PREFIX }),
      entity?.entityType === 'analysis'
        ? queryClient.invalidateQueries({ queryKey: queryKeys.analysis(entity.entityId) })
        : undefined,
    ]);
}

/** C-10 create a review comment. */
export function useCreateReviewComment() {
  const { review } = useServices();
  const invalidate = useInvalidateReview();
  return useMutation({
    mutationFn: (body: Parameters<ReviewCommands['createReviewComment']>[0]) =>
      review.createReviewComment(body),
    onSuccess: () => invalidate(),
  });
}

/** C-11 change the status of a review comment. */
export function useUpdateReviewComment() {
  const { review } = useServices();
  const invalidate = useInvalidateReview();
  return useMutation({
    mutationFn: ({
      commentId,
      body,
    }: {
      commentId: string;
      body: Parameters<ReviewCommands['updateReviewComment']>[1];
    }) => review.updateReviewComment(commentId, body),
    onSuccess: () => invalidate(),
  });
}

/** C-12 create a change request (about an analysis, an indicator, a company or a section). */
export function useCreateChangeRequest() {
  const { review } = useServices();
  const invalidate = useInvalidateReview();
  return useMutation({
    mutationFn: (body: Parameters<ReviewCommands['createChangeRequest']>[0]) =>
      review.createChangeRequest(body),
    onSuccess: (_data, body) => invalidate(body),
  });
}

/** C-13 accept or reject a change request. */
export function useUpdateChangeRequest() {
  const { review } = useServices();
  const invalidate = useInvalidateReview();
  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: Parameters<ReviewCommands['updateChangeRequest']>[1];
    }) => review.updateChangeRequest(requestId, body),
    onSuccess: () => invalidate(),
  });
}
