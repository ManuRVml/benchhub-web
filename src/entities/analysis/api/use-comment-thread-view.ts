import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

import { REVIEW_PREFIX } from './use-review-commands';

import type { ReviewEntityType } from '@/shared/api';

/** Key of V-26 for one entity, under REVIEW_PREFIX so the review commands (C-10..C-13) refresh it. */
export const commentThreadKey = (entityType: ReviewEntityType, entityId: string) =>
  [...REVIEW_PREFIX, 'comment-thread', entityType, entityId] as const;

/**
 * V-26 comment thread of an entity (comments and change requests with their replies, plus the thread permissions).
 * Uses the typed `comments.getCommentThreadView` port (P7-PORTS-C). Idle until `entityId` is set.
 */
export function useCommentThreadView(entityType: ReviewEntityType, entityId: string) {
  const { comments } = useServices();
  return useQuery({
    queryKey: commentThreadKey(entityType, entityId),
    queryFn: ({ signal }) =>
      comments.getCommentThreadView(entityType, entityId, undefined, { signal }),
    enabled: entityId !== '',
    staleTime: STALE_TIMES.view,
  });
}
