import { useT } from '@/shared/i18n';
import { formatRelativeTime } from '@/shared/lib/format';
import { CommentComposer } from '@/shared/ui/composites/comment-thread';

import type { CommentThreadView } from '@/shared/api';

export interface ValueMonitorCommentsProps {
  data: CommentThreadView;
  /** New top-level comment (the hand-written C-10 bypass — see `usePostValueMonitorComment`). */
  onSubmit: (text: string) => Promise<void>;
}

/** Role label of a V-26 `roleLabelKey` (CF-133 English keys); "" for one this screen has never seen. */
function roleLabel(t: ReturnType<typeof useT>, key: string): string {
  switch (key) {
    case 'role.analystCreator':
      return t('value-monitor.comments.roles.analystCreator');
    case 'role.executiveViewer':
      return t('value-monitor.comments.roles.executiveViewer');
    case 'role.executiveIntegral':
      return t('value-monitor.comments.roles.executiveIntegral');
    case 'role.explorerViewer':
      return t('value-monitor.comments.roles.explorerViewer');
    case 'role.explorerIntegral':
      return t('value-monitor.comments.roles.explorerIntegral');
    default:
      return '';
  }
}

/**
 * SCR-11 §11 "Comentarios" (V-26 read, hand-written C-10 write — see `usePostValueMonitorComment`): one flat thread
 * per snapshot, author · role · relative time, no status chip and no replies (A13: unlike the richer M-05 threads
 * elsewhere, Monitor comments are display-only besides posting). Change requests are not part of this screen, so
 * `change_request` items (if any ever arrive) are not rendered. Presentational, like its Monitor siblings — the page
 * owns the V-26 query and its SectionBoundary.
 */
export function ValueMonitorComments({ data, onSubmit }: ValueMonitorCommentsProps) {
  const t = useT();
  const comments = data.items.filter((item) => item.kind === 'comment');

  return (
    <section
      aria-labelledby="value-monitor-comments-title"
      className="rounded-card border border-border-default bg-surface-card p-14"
      data-testid="value-monitor-comments"
    >
      <p
        id="value-monitor-comments-title"
        className="mb-12 text-eyebrow text-text-secondary uppercase"
      >
        {t('value-monitor.comments.title')}
      </p>
      <div className="flex flex-col gap-16">
        {comments.length === 0 ? (
          <p className="text-small text-text-secondary" data-testid="value-monitor-comments-empty">
            {t('common.section.empty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-12" data-testid="value-monitor-comments-list">
            {comments.map((item) => (
              <li key={item.id} className="flex flex-col gap-4">
                <p className="flex flex-wrap items-baseline gap-4 text-small text-text-secondary">
                  <span className="font-semibold text-text-heading">{item.author.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{roleLabel(t, item.author.roleLabelKey)}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                </p>
                <p className="text-small whitespace-pre-line text-text-body">{item.text}</p>
              </li>
            ))}
          </ul>
        )}
        {data.permissions.canComment ? (
          <CommentComposer
            label={t('common.comments.composerLabel')}
            placeholder={t('value-monitor.comments.inputPlaceholder')}
            submitLabel={t('value-monitor.comments.send')}
            testId="value-monitor-comments-composer"
            onSubmit={onSubmit}
          />
        ) : null}
      </div>
    </section>
  );
}
