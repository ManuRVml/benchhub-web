import {
  useCommentThreadView,
  useCreateChangeRequest,
  useCreateReviewComment,
  useUpdateChangeRequest,
  useUpdateReviewComment,
} from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { CommentThread } from '@/shared/ui/composites/comment-thread';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import type { CommentThreadView } from '@/shared/api';
import type {
  CommentThreadItem,
  CommentThreadPermissions,
} from '@/shared/ui/composites/comment-thread';

export interface IndicatorCommentsProps {
  /** V-26 entity id of the indicator: `{analysisId}/{indicatorId}` (SCR-10 Data fields). */
  entityId: string;
  /** V-24 flags (`canComment`, `canRequestChange`), already combined with the role by the page. */
  canComment: boolean;
  canRequestChange: boolean;
}

/**
 * "Comentarios" of SCR-10: the V-26 thread of the indicator in the shared CommentThread. Comments and replies post C-10,
 * "Solicitar ajuste" posts C-12 (`kind: data`), the analyst sets statuses (C-11) and decides requests (C-13). The thread
 * loads and fails independently of V-24 (its own retry).
 */
export function IndicatorComments({
  entityId,
  canComment,
  canRequestChange,
}: IndicatorCommentsProps) {
  const t = useT();
  const thread = useCommentThreadView('indicator', entityId);
  const createComment = useCreateReviewComment();
  const updateComment = useUpdateReviewComment();
  const createChangeRequest = useCreateChangeRequest();
  const updateChangeRequest = useUpdateChangeRequest();

  const roleLabel = (key: string): string => {
    switch (key) {
      case 'role.analystCreator':
        return t('indicator-detail.sections.comment.roles.analystCreator');
      case 'role.executiveViewer':
        return t('indicator-detail.sections.comment.roles.executiveViewer');
      case 'role.executiveIntegral':
        return t('indicator-detail.sections.comment.roles.executiveIntegral');
      case 'role.explorerViewer':
        return t('indicator-detail.sections.comment.roles.explorerViewer');
      case 'role.explorerIntegral':
        return t('indicator-detail.sections.comment.roles.explorerIntegral');
      default:
        return '';
    }
  };

  if (thread.isError) {
    return (
      <SectionErrorPanel
        testId="indicator-detail-comments-error"
        retryTestId="indicator-detail-comments-retry"
        errorCode={thread.error.code}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        onRetry={() => {
          void thread.refetch();
        }}
      />
    );
  }
  if (!thread.data) {
    return (
      <div
        aria-busy="true"
        className="h-24 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none"
      />
    );
  }

  const view: CommentThreadView = thread.data;
  const items: CommentThreadItem[] = view.items.map((item) => ({
    ...item,
    author: { name: item.author.name, roleLabel: roleLabel(item.author.roleLabelKey) },
    replies: item.replies.map((reply) => ({
      ...reply,
      author: { name: reply.author.name, roleLabel: roleLabel(reply.author.roleLabelKey) },
    })),
  }));
  const permissions: CommentThreadPermissions = {
    canComment: canComment && view.permissions.canComment,
    canReply: view.permissions.canReply,
    canRequestChange,
    canResolve: view.permissions.canResolve,
  };

  return (
    <CommentThread
      items={items}
      permissions={permissions}
      emptyLabel={t('indicator-detail.sections.comments.empty')}
      placeholder={t('indicator-detail.sections.comments.composerPlaceholder')}
      testId="indicator-detail-comments"
      onSubmit={async (text) => {
        await createComment.mutateAsync({ entityType: 'indicator', entityId, text });
      }}
      onReply={async (parentId, text) => {
        await createComment.mutateAsync({ entityType: 'indicator', entityId, text, parentId });
      }}
      onRequestChange={async (text) => {
        await createChangeRequest.mutateAsync({
          entityType: 'indicator',
          entityId,
          text,
          kind: 'data',
        });
      }}
      onStatusChange={async (commentId, status) => {
        await updateComment.mutateAsync({ commentId, body: { status } });
      }}
      onDecision={async (requestId, decision) => {
        await updateChangeRequest.mutateAsync({ requestId, body: { decision } });
      }}
    />
  );
}
