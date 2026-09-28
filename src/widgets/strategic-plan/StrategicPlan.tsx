import { useState } from 'react';

import {
  useExportStrategicPlan,
  useGenerateStrategicPlan,
  useUpdateStrategicPlan,
  useWeightSimulatorView,
} from '@/entities/sensitivity';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { useToast } from '@/shared/ui/composites/toast';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { badgeVariants } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';

import { strategicPlanTestIds } from './test-ids';

import type {
  SectionResult,
  WeightSimulatorRecommendation,
  WeightSimulatorView,
} from '@/shared/api';

export interface StrategicPlanProps {
  /** Resolves C-14's export params (Descargar); the session default until the real session query lands (P5-04b),
   * same fallback P5-57 used for presentations. */
  analysisId: string;
  className?: string;
}

interface PlanRow {
  kviId: string;
  indicatorLabel: string;
  urgency: 'high' | 'medium' | 'low';
  gapPts: number;
  weightPct: number;
  action: string;
  termDays: number;
}

const URGENCY_LABEL_KEY = {
  high: 'sensitivities.sections.strategicPlanModal.urgencyHigh',
  medium: 'sensitivities.sections.strategicPlanModal.urgencyMedium',
  low: 'sensitivities.sections.strategicPlanModal.urgencyLow',
} as const;

const URGENCY_TONE = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
} as const satisfies Record<PlanRow['urgency'], 'danger' | 'warning' | 'success'>;

/** V-39 is a single, non-sectioned payload (brief §5, `fetchPendingView`): a failure is the whole view's ApiError. */
function toSectionResult(
  data: WeightSimulatorView | undefined,
  error: unknown,
): SectionResult<WeightSimulatorView> | undefined {
  if (data) return { status: 'ok', data };
  if (!error) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-12 §7 "Recomendaciones de Yarbis para el plan estratégico" (V-39 `recommendations`, C-25, C-26): the top 3
 * priority tips and "Generar plan estratégico", which opens OVL-03 with the generated plan. "Descargar" starts a
 * C-14 export (kind `strategic-plan`) — its progress/mediated-download UI (OVL-07b) is a bigger subsystem than this
 * task needs and is a natural follow-up; "Guardar en el análisis" is the real C-26 save. Reuses V-39 from
 * `@/widgets/weight-simulator`'s own query (same query key, one request on the page either widget mounts first).
 */
export function StrategicPlan({ analysisId, className }: StrategicPlanProps) {
  const t = useT();
  const toast = useToast();
  const query = useWeightSimulatorView();
  const generatePlan = useGenerateStrategicPlan();
  const exportPlan = useExportStrategicPlan();

  const [plan, setPlan] = useState<{ planId: string; rows: PlanRow[] } | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const updatePlan = useUpdateStrategicPlan(plan?.planId ?? '');

  const result = toSectionResult(query.data, query.error);
  const retry = () => {
    void query.refetch();
  };

  const handleGenerate = () => {
    generatePlan.mutate(
      {},
      {
        onSuccess: (response) => {
          setPlan(response.plan);
          setModalOpen(true);
        },
      },
    );
  };

  const handleDownload = () => {
    // TODO(OVL-07b): wire the progress modal + mediated download once this screen gets one; for now the export just
    // starts (202 `operationId`), matching "Descargar calls its handler".
    void exportPlan.mutateAsync(analysisId);
  };

  const handleSave = () => {
    if (!plan) return;
    updatePlan.mutate(
      {
        plan: {
          rows: plan.rows.map((row) => ({
            kviId: row.kviId,
            indicatorLabel: row.indicatorLabel,
            urgency: row.urgency,
            gapPts: row.gapPts,
            weightPct: row.weightPct,
            action: row.action,
            termDays: row.termDays,
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success(t('sensitivities.sections.strategicPlanModal.savedToast'));
          setModalOpen(false);
        },
        onError: () => {
          toast.error(t('sensitivities.sections.strategicPlanModal.saveError'));
        },
      },
    );
  };

  return (
    <SectionCard
      title={t('sensitivities.sections.yarbisRecommendations.title')}
      info={t('sensitivities.sections.yarbisRecommendations.infoText')}
      subtitle={t('sensitivities.sections.yarbisRecommendations.subtitle')}
      testId={strategicPlanTestIds.root}
      {...(className === undefined ? {} : { className })}
    >
      <SectionBoundary
        scope="strategic-plan"
        result={result}
        isEmpty={(data) => data.recommendations.length === 0}
        onRetry={retry}
      >
        {(data) => {
          const top3 = data.recommendations.slice(0, 3);
          const canGeneratePlan = data.permissions.canGeneratePlan === true;
          return (
            <div className="flex flex-col gap-16">
              <ul className="flex flex-col gap-8">
                {top3.map((tip: WeightSimulatorRecommendation) => (
                  <li
                    key={tip.kviId}
                    className="flex items-start gap-8 rounded-card bg-surface-page p-14 text-13 text-text-body"
                    data-testid={strategicPlanTestIds.recommendation(tip.kviId)}
                  >
                    <span aria-hidden="true" className="text-ai-text">
                      ✦
                    </span>
                    <p>
                      <span className="font-semibold">
                        {tip.label}
                        {'.'}
                      </span>{' '}
                      {tip.tone === 'action'
                        ? t('sensitivities.sections.yarbisRecommendations.criticalVariant', {
                            pts: tip.gapPts,
                            weight: tip.weightPct,
                          })
                        : t('sensitivities.sections.yarbisRecommendations.watchVariant', {
                            pts: tip.gapPts,
                            weight: tip.weightPct,
                          })}
                    </p>
                  </li>
                ))}
              </ul>
              {canGeneratePlan ? (
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  loading={generatePlan.isPending}
                  testId={strategicPlanTestIds.generateButton}
                >
                  {t('sensitivities.sections.yarbisRecommendations.generateButton')}
                </Button>
              ) : null}

              <Modal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={t('sensitivities.sections.strategicPlanModal.title')}
                description={t('sensitivities.sections.strategicPlanModal.subtitle')}
                width={640}
                testId={strategicPlanTestIds.modal}
                footer={
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      loading={exportPlan.isPending}
                      testId={strategicPlanTestIds.downloadButton}
                    >
                      {t('sensitivities.sections.strategicPlanModal.downloadButton')}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      loading={updatePlan.isPending}
                      testId={strategicPlanTestIds.saveButton}
                    >
                      {t('sensitivities.sections.strategicPlanModal.saveButton')}
                    </Button>
                  </>
                }
              >
                <div className="flex flex-col gap-12">
                  {plan?.rows.map((row) => (
                    <div
                      key={row.kviId}
                      className="flex flex-col gap-6 rounded-card border border-border-default p-14"
                      data-testid={strategicPlanTestIds.planRow(row.kviId)}
                    >
                      <div className="flex items-center justify-between gap-8">
                        <p className="text-13 font-semibold text-text-heading">
                          {row.indicatorLabel}
                        </p>
                        <p
                          className={badgeVariants({ tone: URGENCY_TONE[row.urgency], size: 'sm' })}
                        >
                          {t('sensitivities.sections.strategicPlanModal.urgencyLabel', {
                            urgency: t(URGENCY_LABEL_KEY[row.urgency]),
                          })}
                        </p>
                      </div>
                      <p className="text-13 text-text-body">{row.action}</p>
                      <p className="text-12 text-text-secondary">
                        {t('sensitivities.sections.strategicPlanModal.rowSummary', {
                          gap: row.gapPts,
                          weight: row.weightPct,
                          term: row.termDays,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </Modal>
            </div>
          );
        }}
      </SectionBoundary>
    </SectionCard>
  );
}
