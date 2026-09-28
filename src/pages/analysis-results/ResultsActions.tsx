import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import {
  useCreateRecalculation,
  useRecalculationProgress,
  useUpdateValueOverrides,
} from '@/entities/analysis';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { useToast } from '@/shared/ui/composites/toast';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { Button } from '@/shared/ui/primitives/button';
import { usePendingOverrides } from '@/widgets/analysis-modules';

import type { V09Response } from '@/shared/api';

type Permissions = V09Response['permissions'];

/**
 * Module 1 of SCR-08 (action row): "✦ Generar narrativa ejecutiva" (OVL-08 / C-15, wired by `onGenerateNarrative`;
 * disabled until that overlay exists) and "Crear presentación" (→ SCR-13 builder), each behind its permission.
 */
export function ResultsActionRow({
  analysisId,
  permissions,
  busy,
  onGenerateNarrative,
}: {
  analysisId: string;
  permissions: Permissions;
  /** A recalculation or save is running: actions are disabled (SCR-08 operation state). */
  busy: boolean;
  onGenerateNarrative?: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  return (
    <div data-testid="results-action-row" className="flex flex-wrap items-center justify-end gap-8">
      {permissions.canGenerateNarrative === true ? (
        <AiPill
          testId="results-generate-narrative"
          disabled={busy || onGenerateNarrative === undefined}
          onClick={onGenerateNarrative}
        >
          {t('analysis-results.actionRow.aiPill.generatingExecutiveNarrative')}
        </AiPill>
      ) : null}
      {permissions.canCreatePresentation === true ? (
        <Button
          testId="results-create-presentation"
          disabled={busy}
          onClick={() => {
            void navigate(routes.presentationNew.build({}, { analysisId }));
          }}
        >
          {t('analysis-results.actionRow.createPresentation')}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Module 11 of SCR-08 (footer): "Guardar" persists the pending value edits (C-06, "✓ Cambios guardados"),
 * "Actualizar" starts a recalculation (C-08 → 202 operation, F22; "Recalculando resultados…") and "Generar vista de
 * reporte" opens Visualización. Hidden in the TBG + ILP horizon (the page does not render the slot there).
 */
export function ResultsFooter({
  analysisId,
  permissions,
  onBusyChange,
}: {
  analysisId: string;
  permissions: Permissions;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();
  const pending = usePendingOverrides();
  const save = useUpdateValueOverrides();
  const recalculate = useCreateRecalculation({ invalidateOnSuccess: false });
  const onRecalculationDone = useCallback(() => {
    toast.success(t('analysis-results.toasts.recalculated'));
    onBusyChange(false);
  }, [onBusyChange, t, toast]);
  const onRecalculationError = useCallback(() => {
    toast.error(t('common.section.error.title'));
    onBusyChange(false);
  }, [onBusyChange, t, toast]);
  const recalculationProgress = useRecalculationProgress({
    analysisId,
    onDone: onRecalculationDone,
    onError: onRecalculationError,
  });
  const busy = save.isPending || recalculate.isPending || recalculationProgress.isRunning;

  const onSave = () => {
    onBusyChange(true);
    save.mutate(
      { analysisId, body: { overrides: [...pending.overrides] } },
      {
        onSuccess: () => {
          pending.clear();
          toast.success(t('analysis-results.companyCoverage.editArea.changesSaved'));
        },
        onError: () => {
          toast.error(t('common.section.error.title'));
        },
        onSettled: () => {
          onBusyChange(false);
        },
      },
    );
  };

  const onRecalculate = () => {
    onBusyChange(true);
    recalculate.mutate(
      { analysisId, reason: 'manual-trigger' },
      {
        onSuccess: (operation) => {
          toast.show({
            id: `recalculation-${operation.operationId}`,
            variant: 'autosave',
            message: t('analysis-results.toasts.recalculating'),
          });
          recalculationProgress.start(operation.operationId);
        },
        onError: onRecalculationError,
        onSettled: (_data, error) => {
          if (error) onBusyChange(false);
        },
      },
    );
  };

  return (
    <div data-testid="results-footer" className="flex flex-wrap items-center justify-end gap-8">
      <Button
        variant="outline"
        testId="results-save"
        disabled={busy || pending.overrides.length === 0 || permissions.canEditValues !== true}
        loading={save.isPending}
        onClick={onSave}
      >
        {t('analysis-results.footer.save')}
      </Button>
      {permissions.canRecalculate === true ? (
        <Button
          variant="outline"
          testId="results-recalculate"
          disabled={busy}
          loading={recalculate.isPending}
          onClick={onRecalculate}
        >
          {t('analysis-results.footer.recalculate')}
        </Button>
      ) : null}
      <Button
        testId="results-generate-report"
        onClick={() => {
          void navigate(routes.analysisReport.build({ analysisId }));
        }}
      >
        {t('analysis-results.footer.generateReportView')}
      </Button>
    </div>
  );
}
