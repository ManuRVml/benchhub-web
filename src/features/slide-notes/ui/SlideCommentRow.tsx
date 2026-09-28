import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { Button } from '@/shared/ui/primitives/button';
import { Textarea } from '@/shared/ui/primitives/inputs';

import type { SlideNoteRow } from '../model/types';

export interface SlideCommentRowProps {
  row: SlideNoteRow;
  /** The saved note, `''` when the slide has none. */
  note: string;
  drafting: boolean;
  canEdit: boolean;
  canDraft: boolean;
  onSave: (slideKey: string, text: string) => void;
  onRemove: (slideKey: string) => void;
  onDraft: (slideKey: string) => Promise<string | undefined>;
  testId: string;
}

/**
 * One chart-slide of "Comentarios por slide" (HTML L2494-2528): without a note, "+ Agregar comentario" and "✦ Sugerir
 * con Yarbis" (the draft is saved as the note); with a note, the amber note line with "Editar · Quitar"; editing, a text
 * area with "✦ Redactar con Yarbis" (the draft fills the text area), "Cancelar" and "Guardar".
 */
export function SlideCommentRow({
  row,
  note,
  drafting,
  canEdit,
  canDraft,
  onSave,
  onRemove,
  onDraft,
  testId,
}: SlideCommentRowProps) {
  const t = useT();
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;

  const draftingLabel = (
    <span className="text-11 font-medium whitespace-nowrap text-ai-text" aria-live="polite">
      {t('presentations.yarbis.draft.drafting')}
    </span>
  );

  return (
    <div className="grid gap-6" data-testid={testId}>
      <div className="flex min-w-0 items-center gap-8">
        <span className="shrink-0 text-small-strong text-text-body">{row.label}</span>
        {note === '' ? (
          canEdit && !editing ? (
            <>
              <Button
                variant="link"
                size="sm"
                testId={`${testId}-add`}
                onClick={() => {
                  setDraft('');
                }}
              >
                {t('presentations.builder.module.addComment')}
              </Button>
              {canDraft ? (
                drafting ? (
                  draftingLabel
                ) : (
                  <AiPill
                    size="sm"
                    testId={`${testId}-suggest`}
                    onClick={() => {
                      void onDraft(row.slideKey).then((text) => {
                        if (text !== undefined) onSave(row.slideKey, text);
                      });
                    }}
                  >
                    {t('presentations.yarbis.draft.suggestLabel')}
                  </AiPill>
                )
              ) : null}
            </>
          ) : null
        ) : (
          <>
            <p
              className="m-0 min-w-0 flex-1 truncate rounded-sm border border-status-warning-note-border bg-status-warning-note-bg px-8 py-4 text-small text-status-warning-note-text"
              data-testid={`${testId}-text`}
            >
              {note}
            </p>
            {canEdit && !editing ? (
              <>
                <Button
                  variant="link"
                  size="sm"
                  testId={`${testId}-edit`}
                  onClick={() => {
                    setDraft(note);
                  }}
                >
                  {t('presentations.builder.module.editComment')}
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="text-text-secondary"
                  testId={`${testId}-remove`}
                  onClick={() => {
                    onRemove(row.slideKey);
                  }}
                >
                  {t('presentations.builder.module.removeComment')}
                </Button>
              </>
            ) : null}
          </>
        )}
      </div>
      {editing ? (
        <div className="grid gap-8">
          <Textarea
            label={row.label}
            hideLabel
            value={draft}
            maxLength={1000}
            placeholder={t('presentations.builder.module.notePlaceholder')}
            onValueChange={setDraft}
            testId={`${testId}-input`}
          />
          <div className="flex items-center justify-end gap-8">
            {canDraft ? (
              <span className="mr-auto">
                {drafting ? (
                  draftingLabel
                ) : (
                  <AiPill
                    size="sm"
                    testId={`${testId}-draft`}
                    onClick={() => {
                      void onDraft(row.slideKey).then((text) => {
                        if (text !== undefined) setDraft(text);
                      });
                    }}
                  >
                    {t('presentations.yarbis.draft.withYarbisLabel')}
                  </AiPill>
                )}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              testId={`${testId}-cancel`}
              onClick={() => {
                setDraft(null);
              }}
            >
              {t('presentations.yarbis.note.cancel')}
            </Button>
            <Button
              size="sm"
              testId={`${testId}-save`}
              disabled={draft.trim() === ''}
              onClick={() => {
                onSave(row.slideKey, draft.trim());
                setDraft(null);
              }}
            >
              {t('presentations.yarbis.note.save')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
