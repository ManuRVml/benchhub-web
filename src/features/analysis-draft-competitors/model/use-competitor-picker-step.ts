import { useState } from 'react';

import { useUpdateAnalysisDraft } from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { useToast } from '@/shared/ui/composites/toast';

// Step 2 "Competidores" of the definition wizard (SCR-07): autosave of the draft's `competitorIds`, the same debounced
// C-02 path as step 1 (P5-36 `GeneralInfoStep`) — a burst of tile / group toggles is merged into one PATCH, sent 500 ms
// after the last one, with only this step's field.

/** C-02 key of the field this step saves. */
const DRAFT_FIELD = 'competitorIds';

/** Error codes the wizard shows (same table as step 1). */
const FIELD_ERROR_CODES = [
  'required',
  'tooShort',
  'tooLong',
  'invalid',
  'periodOrder',
  'atLeastOne',
  'futureDate',
] as const;
type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** An unknown C-02 code reads as `invalid`; the literal return type keeps the translation key statically checked. */
function fieldErrorCode(code: string): FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(code)
    ? (code as FieldErrorCode)
    : 'invalid';
}

export interface UseCompetitorPickerStepOptions {
  draftId: string;
  /** Selection to start from (the widget resolves the V2 default for a brand-new draft). */
  initialSelectedIds: readonly string[];
  /** Quiet time before a burst of edits is saved (C-02); default 500 ms. */
  autosaveDelayMs?: number;
}

export interface CompetitorPickerStepState {
  selectedIds: string[];
  /** Replaces the selection and queues `competitorIds` for the next autosave. */
  onSelectedIdsChange: (ids: string[]) => void;
  /** C-02 `competitorIds` error, already translated; absent once the field has none. */
  error?: string;
}

/**
 * Autosave of step 2's competitor selection. `selectedIds` is local state (not the draft's own, so a burst of clicks
 * updates the UI at once); every change is queued and merged into one `PATCH { step: 2, fields: { competitorIds } }`
 * per burst.
 */
export function useCompetitorPickerStep({
  draftId,
  initialSelectedIds,
  autosaveDelayMs = 500,
}: UseCompetitorPickerStepOptions): CompetitorPickerStepState {
  const t = useT();
  const toast = useToast();
  const updateDraft = useUpdateAnalysisDraft();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...initialSelectedIds]);
  const [errorCode, setErrorCode] = useState<string>();

  const autosave = useDebouncedAutosave<string[]>(
    async (ids) => {
      toast.autosave(t('analysis-definition.autosave.saving'));
      const result = await updateDraft.mutateAsync({
        draftId,
        body: { step: 2, fields: { [DRAFT_FIELD]: ids } },
      });
      setErrorCode(result.validationState.errors.find((e) => e.field === DRAFT_FIELD)?.code);
      toast.autosave(t('analysis-definition.autosave.saved'));
    },
    {
      delayMs: autosaveDelayMs,
      onError: () => {
        toast.error(t('common.draftWizard.autosaveError'));
      },
    },
  );

  return {
    selectedIds,
    onSelectedIdsChange: (ids) => {
      setSelectedIds(ids);
      autosave.schedule(ids);
    },
    ...(errorCode === undefined
      ? {}
      : { error: t(`common.draftWizard.fieldErrors.${fieldErrorCode(errorCode)}`) }),
  };
}
