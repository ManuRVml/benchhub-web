import {
  useCommentThreadView,
  useCreateChangeRequest,
  useCreateReviewComment,
  useUpdateChangeRequest,
  useUpdateReviewComment,
} from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { CommentThread } from '@/shared/ui/composites/comment-thread';
import { Eyebrow } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import { reportCommentsTestIds } from './test-ids';

import type { CommentThreadView } from '@/shared/api';
import type {
  CommentThreadItem,
  CommentThreadPermissions,
} from '@/shared/ui/composites/comment-thread';

export interface ReportCommentsProps {
  /** V-26 entity id: the analysis id (SCR-09 Data fields, `entityType=analysis`). */
  analysisId: string;
  /** V-20 `permissions.canComment`. */
  canComment: boolean;
}

/**
 * SCR-09 right rail "Comentarios" (P5-48): the V-26 thread of the analysis in the shared CommentThread. The spec's
 * rail (L1326-1341) is a plain thread + composer, no "Solicitar ajuste" action, so `canRequestChange` is always
 * false here. Comments post C-10, the analyst sets statuses (C-11). The thread loads and fails independently of
 * V-20 (its own retry), mirroring `pages/indicator-detail/ui/IndicatorComments.tsx`.
 */
export function ReportComments({ analysisId, canComment }: ReportCommentsProps) {
  const t = useT();
  const thread = useCommentThreadView('analysis', analysisId);
  const createComment = useCreateReviewComment();
  const updateComment = useUpdateReviewComment();
  const createChangeRequest = useCreateChangeRequest();
  const updateChangeRequest = useUpdateChangeRequest();

  const roleLabel = (key: string): string => {
    switch (key) {
      case 'role.analystCreator':
        return t('analysis-report.comments.roles.analystCreator');
      case 'role.executiveViewer':
        return t('analysis-report.comments.roles.executiveViewer');
      case 'role.executiveIntegral':
        return t('analysis-report.comments.roles.executiveIntegral');
      case 'role.explorerViewer':
        return t('analysis-report.comments.roles.explorerViewer');
      case 'role.explorerIntegral':
        return t('analysis-report.comments.roles.explorerIntegral');
      default:
        return '';
    }
  };

  return (
    <div data-testid={reportCommentsTestIds.root} className="grid gap-8">
      <Eyebrow as="h4">{t('analysis-report.comments.title')}</Eyebrow>
      {thread.isError ? (
        <SectionErrorPanel
          testId={`${reportCommentsTestIds.root}-error`}
          retryTestId={`${reportCommentsTestIds.root}-retry`}
          errorCode={thread.error.code}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={() => {
            void thread.refetch();
          }}
        />
      ) : !thread.data ? (
        <Skeleton shape="block" size={120} />
      ) : (
        (() => {
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
            canRequestChange: false,
            canResolve: view.permissions.canResolve,
          };
          return (
            <CommentThread
              items={items}
              permissions={permissions}
              emptyLabel={t('analysis-report.comments.empty')}
              placeholder={t('analysis-report.comments.placeholder')}
              testId={reportCommentsTestIds.root}
              onSubmit={async (text) => {
                await createComment.mutateAsync({
                  entityType: 'analysis',
                  entityId: analysisId,
                  text,
                });
              }}
              onReply={async (parentId, text) => {
                await createComment.mutateAsync({
                  entityType: 'analysis',
                  entityId: analysisId,
                  text,
                  parentId,
                });
              }}
              onRequestChange={async (text) => {
                await createChangeRequest.mutateAsync({
                  entityType: 'analysis',
                  entityId: analysisId,
                  text,
                  kind: 'data',
                });
              }}
              onStatusChange={async (commentId, status) => {
                await updateComment.mutateAsync({
                  commentId,
                  body: { status },
                });
              }}
              onDecision={async (requestId, decision) => {
                await updateChangeRequest.mutateAsync({ requestId, body: { decision } });
              }}
            />
          );
        })()
      )}
    </div>
  );
}
