import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useGenerateAnalysis } from '@/entities/analysis';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { useToast } from '@/shared/ui/composites/toast';

/** Id of the operation toast, so a second click replaces it instead of stacking. */
export const GENERATE_TOAST_ID = 'definition-generate';

export interface GenerateFromDraft {
  generate: () => void;
  /** C-03 is in flight. */
  isGenerating: boolean;
  /** C-03 failed (the wizard shows the error banner above its footer). */
  failed: boolean;
}

/**
 * "Generar análisis" (SCR-07 step 5): C-03 `POST /api/v1/analysis-drafts/:draftId/generation` → `202 { operationId }`,
 * with the "Generando análisis…" operation toast while it runs, then Resultados of the draft
 * (`routes.analysisResults`, `/analisis/:analysisId/resultados`). Contract 0.1.0 publishes no O-01 / O-02, so the
 * wizard navigates once C-03 accepts the operation and Resultados follows it [inference: V2 navigates at once,
 * HTML L711].
 */
export function useGenerateFromDraft(draftId: string): GenerateFromDraft {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const mutation = useGenerateAnalysis();
  const { mutate } = mutation;

  const generate = useCallback(() => {
    toast.show({
      id: GENERATE_TOAST_ID,
      variant: 'autosave',
      message: t('common.draftWizard.generating'),
      durationMs: null,
    });
    mutate(
      { draftId, body: {} },
      {
        onSuccess: () => {
          toast.dismiss(GENERATE_TOAST_ID);
          void navigate(routes.analysisResults.build({ analysisId: draftId }));
        },
        onError: () => {
          toast.dismiss(GENERATE_TOAST_ID);
        },
      },
    );
  }, [draftId, mutate, navigate, t, toast]);

  return { generate, isGenerating: mutation.isPending, failed: mutation.isError };
}
