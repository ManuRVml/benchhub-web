import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';

import type {
  ChangeRequestDecision,
  CommentStatus,
  CommentThreadItem,
  CommentThreadPermissions,
  MaybePromise,
} from './types';
import type { ReactNode } from 'react';

export interface CommentThreadProps {
  /** Threads of V-26 `items`, newest activity first, already mapped for display (see `types.ts`). */
  items: readonly CommentThreadItem[];
  permissions: CommentThreadPermissions;
  /** New top-level comment (C-10). */
  onSubmit: (text: string) => MaybePromise;
  /** Reply to a thread (C-10 with `parentId`). */
  onReply: (parentId: string, text: string) => MaybePromise;
  /** New change request (C-12, "Solicitar ajuste"); used only with `canRequestChange`. */
  onRequestChange: (text: string) => MaybePromise;
  /** Comment status change (C-11); used only with `canResolve`. */
  onStatusChange: (id: string, status: CommentStatus) => MaybePromise;
  /** Change-request decision (C-13); Aceptar / Rechazar appear only with `canResolve` and this callback. */
  onDecision?: (id: string, decision: ChangeRequestDecision) => MaybePromise;
  /** Shown instead of the list when there are no threads (copy of the host screen). */
  emptyLabel: ReactNode;
  /** Composer placeholder; defaults to "Escribe un comentario...". */
  placeholder?: string;
  /** Composer layout (see `CommentComposer`): `inline` is the one-line field + "Enviar" of SCR-13 / SCR-14. */
  composerLayout?: 'stacked' | 'inline';
  /** Reference time for relative dates (default: now; tests and stories pin it). */
  now?: number;
  /** `data-testid` of the root (default `comment-thread`). */
  testId?: string;
  className?: string;
}

/**
 * Review thread of one entity (component catalog "CommentThread", V-26): the list of comments and change requests with
 * their replies, then the composer. Presentational: data and callbacks come in through props (no fetching). Each
 * permission flag hides its controls entirely: no composer without `canComment`, no "Responder" without `canReply`, no
 * "Solicitar ajuste" without `canRequestChange`, no status select / decision buttons without `canResolve`. The list is a
 * polite live region, so added comments are announced.
 */
export function CommentThread({
  items,
  permissions,
  onSubmit,
  onReply,
  onRequestChange,
  onStatusChange,
  onDecision,
  emptyLabel,
  placeholder,
  composerLayout = 'stacked',
  now,
  testId = 'comment-thread',
  className,
}: CommentThreadProps) {
  const t = useT();
  return (
    <div className={cn('flex flex-col gap-16', className)} data-testid={testId}>
      <div aria-live="polite" aria-relevant="additions">
        {items.length === 0 ? (
          <p className="text-small text-text-secondary" data-testid={`${testId}-empty`}>
            {emptyLabel}
          </p>
        ) : (
          <ul className="flex flex-col gap-16" data-testid={`${testId}-list`}>
            {items.map((item) => (
              <CommentItem
                key={item.id}
                item={item}
                permissions={permissions}
                onReply={onReply}
                onStatusChange={onStatusChange}
                onDecision={onDecision}
                now={now}
              />
            ))}
          </ul>
        )}
      </div>
      {permissions.canComment ? (
        <CommentComposer
          label={t('common.comments.composerLabel')}
          placeholder={placeholder ?? t('common.comments.placeholder')}
          submitLabel={t('common.comments.send')}
          testId={`${testId}-composer`}
          layout={composerLayout}
          onSubmit={onSubmit}
          {...(permissions.canRequestChange
            ? {
                requestChange: {
                  label: t('common.commentThread.requestChange'),
                  onSubmit: onRequestChange,
                },
              }
            : {})}
        />
      ) : null}
    </div>
  );
}
