import { useState } from 'react';

import { useUpdateAnalysisDraft } from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { useToast } from '@/shared/ui/composites/toast';

// Step 3 "Selección de indicadores" of the definition wizard (SCR-07): autosave of the draft's `indicatorIds`, the
// same debounced C-02 path as step 1 and step 2 — a burst of item / group toggles is merged into one PATCH, sent
// 500 ms after the last one, with only this step's field. The source tab and the concept / horizon filters are the
// picker widget's own view state, not saved (SCR-07 Filters & controls).

const DRAFT_FIELD = 'indicatorIds';

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

export interface UseIndicatorPickerStepOptions {
  draftId: string;
  initialSelectedIds: readonly string[];
  /** Quiet time before a burst of edits is saved (C-02); default 500 ms. */
  autosaveDelayMs?: number;
}

export interface IndicatorPickerStepState {
  selectedIds: string[];
  /** Replaces the selection and queues `indicatorIds` for the next autosave. */
  onSelectedIdsChange: (ids: string[]) => void;
  /** C-02 `indicatorIds` error, already translated; absent once the field has none. */
  error?: string;
}

/**
 * Autosave of step 3's indicator selection, mirroring `useCompetitorPickerStep` for `indicatorIds` /
 * `PATCH { step: 3, ... }`.
 */
export function useIndicatorPickerStep({
  draftId,
  initialSelectedIds,
  autosaveDelayMs = 500,
}: UseIndicatorPickerStepOptions): IndicatorPickerStepState {
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
        body: { step: 3, fields: { [DRAFT_FIELD]: ids } },
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
