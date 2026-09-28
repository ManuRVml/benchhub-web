import { useT } from '@/shared/i18n';
import { Eyebrow } from '@/shared/ui/composites/section-card';

import { SlideCommentRow } from './SlideCommentRow';

import type { SlideNoteProps } from '../model/types';

export type SlideNotesProps = SlideNoteProps;

/**
 * "COMENTARIOS POR SLIDE" block of one selected slide group (SCR-13 builder, HTML L2491-2530): a dashed divider, the
 * eyebrow and one {@link SlideCommentRow} per selected chart. Renders nothing when the group has no selected chart. The
 * batch "✦ Redactar comentarios con Yarbis (n)" lives in the builder header (it spans every group).
 */
export function SlideNotes({
  rows,
  notes,
  draftingKeys,
  canEdit,
  canDraft,
  onSave,
  onRemove,
  onDraft,
  testId = 'slide-notes',
}: SlideNotesProps) {
  const t = useT();
  if (rows.length === 0) return null;
  return (
    <div
      className="grid gap-8 border-t border-dashed border-brand-primary-divider pt-10"
      data-testid={testId}
    >
      <Eyebrow className="m-0">{t('presentations.builder.module.comments')}</Eyebrow>
      {rows.map((row) => (
        <SlideCommentRow
          key={row.slideKey}
          row={row}
          note={notes[row.slideKey] ?? ''}
          drafting={draftingKeys.has(row.slideKey)}
          canEdit={canEdit}
          canDraft={canDraft}
          onSave={onSave}
          onRemove={onRemove}
          onDraft={onDraft}
          testId={`${testId}-${row.slideKey.replace('|', '-')}`}
        />
      ))}
    </div>
  );
}
