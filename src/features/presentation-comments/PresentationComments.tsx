import { useId } from 'react';

import { useCommentThreadView } from '@/entities/analysis';
import { useCreatePresentationComment } from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { CommentThread } from '@/shared/ui/composites/comment-thread';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { Badge } from '@/shared/ui/primitives/badge';

import type { CommentThreadItem } from '@/shared/ui/composites/comment-thread';

export interface PresentationCommentsProps {
  presentationId: string;
  /** V-43 / V-41 `permissions.canComment` (the builder passes `canEdit`: only the analyst reaches it). */
  canComment: boolean;
  /** V-43 `comments.count` / V-41 `commentCount`: the BFF's count shown in the heading. */
  count: number;
  /**
   * `detail` (SCR-14, HTML L2340-2353): a card titled "Comentarios de otros usuarios (n)". `builder` (SCR-13, HTML
   * L2560-2582): the "Comentarios" label with a count pill above a bordered thread.
   */
  variant: 'detail' | 'builder';
  testId?: string;
}

/** V-26 `roleLabelKey` → label (CF-133 English keys); unknown keys render no role. */
const ROLE_LABEL_KEY = {
  'role.analystCreator': 'presentation-detail.comments.roles.analystCreator',
  'role.executiveViewer': 'presentation-detail.comments.roles.executiveViewer',
  'role.executiveIntegral': 'presentation-detail.comments.roles.executiveIntegral',
  'role.explorerViewer': 'presentation-detail.comments.roles.explorerViewer',
  'role.explorerIntegral': 'presentation-detail.comments.roles.explorerIntegral',
} as const;

const isRoleKey = (key: string): key is keyof typeof ROLE_LABEL_KEY => key in ROLE_LABEL_KEY;

/**
 * The review thread of a presentation (V-26, `entityType: presentation`) in the shared CommentThread, with the one-line
 * composer of the prototype; posts go through C-10 (`useCreatePresentationComment`). Shared by the SCR-14 viewer and the
 * SCR-13 builder, which only differ in the frame around the thread. The thread loads and fails on its own (retry).
 */
export function PresentationComments({
  presentationId,
  canComment,
  count,
  variant,
  testId = 'presentation-comments',
}: PresentationCommentsProps) {
  const t = useT();
  const headingId = useId();
  const thread = useCommentThreadView('presentation', presentationId);
  const comment = useCreatePresentationComment(presentationId);

  const roleLabel = (key: string): string => (isRoleKey(key) ? t(ROLE_LABEL_KEY[key]) : '');

  let body;
  if (thread.isError) {
    body = (
      <SectionErrorPanel
        testId={`${testId}-error`}
        retryTestId={`${testId}-retry`}
        errorCode={thread.error.code}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        onRetry={() => {
          void thread.refetch();
        }}
      />
    );
  } else if (!thread.data) {
    body = <Skeleton shape="block" size={96} />;
  } else {
    const items: CommentThreadItem[] = thread.data.items.map((item) => ({
      ...item,
      author: { name: item.author.name, roleLabel: roleLabel(item.author.roleLabelKey) },
      replies: item.replies.map((reply) => ({
        ...reply,
        author: { name: reply.author.name, roleLabel: roleLabel(reply.author.roleLabelKey) },
      })),
    }));
    body = (
      <CommentThread
        items={items}
        permissions={{
          canComment: canComment && thread.data.permissions.canComment,
          canReply: false,
          canRequestChange: false,
          canResolve: false,
        }}
        composerLayout="inline"
        emptyLabel={t('common.section.empty')}
        placeholder={
          variant === 'detail'
            ? t('presentation-detail.comments.placeholder')
            : t('presentations.builder.comments.placeholder')
        }
        onSubmit={async (text) => {
          await comment.mutateAsync({ text });
        }}
        onReply={async (parentId, text) => {
          await comment.mutateAsync({ text, parentId });
        }}
        onRequestChange={() => undefined}
        onStatusChange={() => undefined}
        testId={`${testId}-thread`}
      />
    );
  }

  if (variant === 'detail') {
    return (
      <section
        aria-labelledby={headingId}
        data-testid={testId}
        className="grid gap-12 rounded-card border border-border-default bg-surface-card p-18"
      >
        <h3 id={headingId} className="text-title-card text-text-heading">
          {`${t('presentation-detail.comments.title')} (${String(count)})`}
        </h3>
        {body}
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} data-testid={testId} className="grid gap-8">
      <div className="flex items-center gap-6">
        <h3 id={headingId} className="text-label text-text-body">
          {t('presentations.builder.comments.title')}
        </h3>
        <Badge kind="count" countTone="neutral" data-testid={`${testId}-count`}>
          {String(count)}
        </Badge>
      </div>
      <div className="rounded-card border border-border-default px-16 py-14">{body}</div>
    </section>
  );
}
