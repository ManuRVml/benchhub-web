import { useId, useState } from 'react';

import { useT } from '@/shared/i18n';
import { formatRelativeTime } from '@/shared/lib/format';
import { Badge, badgeVariants } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Select } from '@/shared/ui/primitives/inputs';

import { CommentComposer } from './CommentComposer';

import type {
  ChangeRequestDecision,
  CommentAuthor,
  CommentStatus,
  CommentThreadItem,
  CommentThreadPermissions,
  MaybePromise,
} from './types';
import type { BadgeTone } from '@/shared/ui/primitives/badge';

// The comment status chip is the Badge `commentStatus` kind (English values, AA tones since P5-13b / CF-141). The
// change-request tag and decision have no Badge kind, so they are drawn with the same badge tone classes.
function Chip({
  tone,
  variant,
  testId,
  children,
}: {
  tone: BadgeTone;
  variant: string;
  testId?: string;
  children: string;
}) {
  return (
    <span
      data-testid={testId}
      data-variant={variant}
      className={badgeVariants({ tone, size: 'sm' })}
    >
      {children}
    </span>
  );
}

const STATUSES: readonly CommentStatus[] = ['pending', 'in_analysis', 'resolved'];

export interface CommentItemProps {
  item: CommentThreadItem;
  permissions: CommentThreadPermissions;
  /** Reply to this thread (C-10 with `parentId`). */
  onReply: (parentId: string, text: string) => MaybePromise;
  /** New status of a comment (C-11); shown as a select when `canResolve`. */
  onStatusChange: (id: string, status: CommentStatus) => MaybePromise;
  /** Decision on an open change request (C-13); Aceptar / Rechazar are shown only with `canResolve` and this callback. */
  onDecision?: ((id: string, decision: ChangeRequestDecision) => MaybePromise) | undefined;
  /** Reference time for relative dates (default: now). */
  now?: number | undefined;
}

function Meta({
  author,
  createdAt,
  now,
}: {
  author: CommentAuthor;
  createdAt: string;
  now?: number | undefined;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-4 text-small text-text-secondary">
      <span className="font-semibold text-text-heading">{author.name}</span>
      <span aria-hidden="true">·</span>
      <span>{author.roleLabel}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={createdAt}>{formatRelativeTime(createdAt, now)}</time>
    </p>
  );
}

/**
 * One thread of the comment list (component catalog `Cmp:CommentItem`): author · role · relative time, the text, the
 * status chip (comments) or the "Solicitud de cambio" tag and decision (change requests), the analyst controls, the
 * nested replies list and the "Responder" composer. Controls whose permission is false are not rendered.
 */
export function CommentItem({
  item,
  permissions,
  onReply,
  onStatusChange,
  onDecision,
  now,
}: CommentItemProps) {
  const t = useT();
  const [replying, setReplying] = useState(false);
  const repliesId = useId();
  const statusLabel: Readonly<Record<CommentStatus, string>> = {
    pending: t('common.commentThread.status.pending'),
    in_analysis: t('common.commentThread.status.inAnalysis'),
    resolved: t('common.commentThread.status.resolved'),
  };

  return (
    <li
      className="flex flex-col gap-6"
      data-testid={`comment-item-${item.id}`}
      data-kind={item.kind}
    >
      <div className="flex items-start justify-between gap-8">
        <Meta author={item.author} createdAt={item.createdAt} now={now} />
        <div className="flex shrink-0 items-center gap-6">
          {item.kind === 'comment' ? (
            permissions.canResolve ? (
              <Select
                label={t('common.a11y.commentStatus')}
                hideLabel
                size="sm"
                value={item.status}
                testId={`comment-status-${item.id}`}
                options={STATUSES.map((status) => ({ value: status, label: statusLabel[status] }))}
                onValueChange={(value) => {
                  const next = STATUSES.find((status) => status === value);
                  if (next !== undefined && next !== item.status)
                    void onStatusChange(item.id, next);
                }}
              />
            ) : (
              <Badge
                kind="commentStatus"
                commentStatus={item.status}
                data-testid={`comment-status-${item.id}`}
              >
                {statusLabel[item.status]}
              </Badge>
            )
          ) : (
            <>
              <Chip tone="progress" variant="change-request">
                {t('common.commentThread.changeRequest')}
              </Chip>
              {item.decision === null ? null : (
                <Chip
                  tone={item.decision === 'accepted' ? 'success' : 'danger'}
                  variant={`decision-${item.decision}`}
                >
                  {item.decision === 'accepted'
                    ? t('common.commentThread.decision.accepted')
                    : t('common.commentThread.decision.rejected')}
                </Chip>
              )}
            </>
          )}
        </div>
      </div>
      <p className="text-small whitespace-pre-line text-text-body">{item.text}</p>

      {item.kind === 'change_request' &&
      item.decision === null &&
      permissions.canResolve &&
      onDecision ? (
        <div className="flex gap-8">
          <Button
            size="sm"
            variant="outline"
            testId={`comment-accept-${item.id}`}
            onClick={() => void onDecision(item.id, 'accepted')}
          >
            {t('common.commentThread.accept')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            testId={`comment-reject-${item.id}`}
            onClick={() => void onDecision(item.id, 'rejected')}
          >
            {t('common.commentThread.reject')}
          </Button>
        </div>
      ) : null}

      {item.replies.length > 0 ? (
        <ul
          id={repliesId}
          aria-label={t('common.a11y.replies')}
          className="flex flex-col gap-8 border-l-2 border-border-default pl-12"
        >
          {item.replies.map((reply) => (
            <li
              key={reply.id}
              className="flex flex-col gap-4"
              data-testid={`comment-reply-${reply.id}`}
            >
              <Meta author={reply.author} createdAt={reply.createdAt} now={now} />
              <p className="text-small whitespace-pre-line text-text-body">{reply.text}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {permissions.canReply ? (
        replying ? (
          <CommentComposer
            label={t('common.a11y.replyLabel')}
            placeholder={t('common.comments.replyPlaceholder')}
            submitLabel={t('common.comments.send')}
            focusOnMount
            testId={`comment-reply-composer-${item.id}`}
            className="pl-12"
            onSubmit={async (text) => {
              await onReply(item.id, text);
              setReplying(false);
            }}
          />
        ) : (
          <Button
            variant="link"
            size="sm"
            className="self-start text-small"
            testId={`comment-reply-${item.id}-toggle`}
            onClick={() => {
              setReplying(true);
            }}
          >
            {t('common.comments.reply')}
          </Button>
        )
      ) : null}
    </li>
  );
}
