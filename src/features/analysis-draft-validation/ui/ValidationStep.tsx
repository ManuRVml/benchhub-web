import { useAnalysisValidationView } from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { formatPeriod } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { Chip } from '@/shared/ui/primitives/chip';

import type { V08Response } from '@/shared/api';

export interface ValidationStepProps {
  draftId: string;
  /** Names of the wizard steps that block generation (invalid), already translated; empty when none does. */
  blockingSteps: readonly string[];
}

const SCOPE_LABEL_KEY = {
  grupo_ecopetrol: 'analysis-definition.step1.scopes.grupoEcopetrol',
  isa: 'analysis-definition.step1.scopes.isa',
} as const;

const rowLabelClass = 'text-label text-text-secondary uppercase';

function Summary({ view, blockingSteps }: { view: V08Response; blockingSteps: readonly string[] }) {
  const t = useT();
  const cadence =
    view.scope.cadence === 'quarterly'
      ? t('analysis-definition.step5.cadence.quarterly')
      : t('common.draftWizard.cadenceAnnual');
  // "Grupo Ecopetrol · Trimestral T4 2025" (SCR-07 L278), built from the V-08 scope.
  const scopeText = [
    ...view.scope.entities.map((entity) => t(SCOPE_LABEL_KEY[entity])),
    `${cadence} ${formatPeriod(view.scope.currentPeriod)}`,
  ].join(' · ');
  const excluded = view.exclusionAlert?.companies ?? [];

  return (
    <div className="grid gap-16">
      <dl className="grid gap-16">
        <div className="grid gap-6">
          <dt className={rowLabelClass}>{t('analysis-definition.step5.summaryLabels.scope')}</dt>
          <dd className="text-body text-text-heading" data-testid="definition-validation-scope">
            {scopeText}
          </dd>
        </div>
        <div className="grid gap-6">
          <dt className={rowLabelClass}>
            {`${t('analysis-definition.step5.summaryLabels.competitors')} (${String(view.competitors.length)})`}
          </dt>
          <dd className="flex flex-wrap gap-6" data-testid="definition-validation-competitors">
            {view.competitors.map((competitor) => (
              <Chip key={competitor.id} variant="static">
                {competitor.name}
              </Chip>
            ))}
          </dd>
        </div>
        <div className="grid gap-6">
          <dt className={rowLabelClass}>
            {t('analysis-definition.step5.summaryLabels.indicators')}
          </dt>
          <dd className="grid gap-10" data-testid="definition-validation-indicators">
            {view.indicatorGroups.map((group) => (
              <div key={group.id} className="grid gap-6">
                <p className="text-small-strong text-text-heading">
                  {`${group.label} (${String(group.count)})`}
                </p>
                <div className="flex flex-wrap gap-6">
                  {group.items.map((item) => (
                    <Chip key={item.id} variant="static">
                      {item.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </dd>
        </div>
      </dl>
      {excluded.length > 0 && view.exclusionAlert ? (
        <p
          role="status"
          data-testid="definition-validation-exclusion-alert"
          className="rounded-control border border-status-warning-note-border bg-status-warning-note-bg px-12 py-10 text-small text-status-warning-note-text"
        >
          {t('common.draftWizard.exclusionAlert', {
            companies: excluded.map((company) => company.name).join(', '),
            threshold: view.exclusionAlert.thresholdPct,
          })}
        </p>
      ) : null}
      {blockingSteps.length > 0 ? (
        <p
          role="status"
          data-testid="definition-validation-blocked"
          className="rounded-control border border-status-danger-pill-border bg-status-danger-missing-row-bg px-12 py-10 text-small text-status-danger-text"
        >
          {t('common.draftWizard.blocked', { steps: blockingSteps.join(', ') })}
        </p>
      ) : null}
    </div>
  );
}

/**
 * SCR-07 step 5 "Validación": the V-08 summary (alcance, competidores seleccionados (n), indicadores a analizar by
 * group), the exclusion alert when companies fall under the homologation threshold, and why generation is blocked
 * when a wizard step is invalid. "Generar análisis" itself is the wizard footer's (see `useGenerateFromDraft`).
 */
export function ValidationStep({ draftId, blockingSteps }: ValidationStepProps) {
  const t = useT();
  const validation = useAnalysisValidationView(draftId);

  if (validation.isPending) {
    return (
      <div className="grid gap-10" data-testid="definition-validation-loading">
        <Skeleton shape="line" />
        <Skeleton shape="line" />
        <Skeleton shape="block" />
      </div>
    );
  }
  if (validation.isError) {
    const code = isApiError(validation.error) ? validation.error.code : 'UNKNOWN';
    return (
      <SectionErrorPanel
        testId="definition-validation-error"
        retryTestId="definition-validation-retry"
        errorCode={code}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        onRetry={() => {
          void validation.refetch();
        }}
      />
    );
  }
  return <Summary view={validation.data} blockingSteps={blockingSteps} />;
}
