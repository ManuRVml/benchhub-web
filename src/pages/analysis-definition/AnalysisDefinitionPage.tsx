import { useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { useAnalysisDefinitionView, useAnalysisValidationView } from '@/entities/analysis';
import { GeneralInfoStep } from '@/features/analysis-draft-general';
import { SourcesStep } from '@/features/analysis-draft-sources';
import { useGenerateFromDraft, ValidationStep } from '@/features/analysis-draft-validation';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { useTypedSearchParams } from '@/shared/lib/url';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { Stepper } from '@/shared/ui/composites/stepper';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { Button } from '@/shared/ui/primitives/button';
import { CompetitorPickerStep } from '@/widgets/competitor-picker';
import { IndicatorPickerStep } from '@/widgets/indicator-picker';

import { stepperStatus } from './stepper-status';

import type { V05Response } from '@/shared/api';
import type { StepperStep } from '@/shared/ui/composites/stepper';

/** `paso` 1..5 in the URL (SCR-07); absent or invalid (`?paso=9`, `?paso=x`) is step 1 (navigation-map, note #53). */
export const DEFINITION_SEARCH = z.object({
  paso: z.coerce.number().int().min(1).max(5).default(1),
});

export type WizardStep = 1 | 2 | 3 | 4 | 5;
const STEPS: readonly WizardStep[] = [1, 2, 3, 4, 5];
/** Steps whose validity gates "Generar análisis" (SCR-07 step 5: steps 1–3; step 4 is read-only). */
const GATING_STEPS: readonly WizardStep[] = [1, 2, 3];

const STEP_LABEL_KEY = {
  1: 'analysis-definition.stepper.step1',
  2: 'analysis-definition.stepper.step2',
  3: 'analysis-definition.stepper.step3',
  4: 'analysis-definition.stepper.step4',
  5: 'analysis-definition.stepper.step5',
} as const satisfies Record<WizardStep, string>;

const CARD_TITLE_KEY = {
  1: 'analysis-definition.stepCards.step1',
  2: 'analysis-definition.stepCards.step2',
  3: 'analysis-definition.stepCards.step3',
  4: 'analysis-definition.stepCards.step4',
  5: 'analysis-definition.stepCards.step5',
} as const satisfies Record<WizardStep, string>;

function WizardSkeleton() {
  return (
    <div className="grid gap-20" data-testid="analysis-definition-loading">
      <Skeleton shape="line" />
      <Skeleton shape="block" />
    </div>
  );
}

function StepCard({ step, children }: { step: WizardStep; children?: React.ReactNode }) {
  const t = useT();
  const info = {
    1: t('analysis-definition.step1.info'),
    2: undefined,
    3: t('analysis-definition.step3.info'),
    4: t('analysis-definition.step4.info'),
    5: t('analysis-definition.step5.info'),
  }[step];
  const subtitle = {
    1: undefined,
    2: t('analysis-definition.step2.subTitle'),
    3: undefined,
    4: t('analysis-definition.step4.subTitle'),
    5: undefined,
  }[step];
  return (
    <SectionCard
      title={t(CARD_TITLE_KEY[step])}
      headingLevel={2}
      {...(info === undefined ? {} : { info })}
      {...(subtitle === undefined ? {} : { subtitle })}
      testId={`analysis-definition-step-${String(step)}`}
    >
      {children}
    </SectionCard>
  );
}

function DefinitionWizard({ draftId, view }: { draftId: string; view: V05Response }) {
  const t = useT();
  const [{ paso }, setSearch] = useTypedSearchParams(DEFINITION_SEARCH);
  const step = paso as WizardStep;
  const validation = useAnalysisValidationView(step === 5 ? draftId : '');
  const { generate, isGenerating, failed } = useGenerateFromDraft(draftId);

  // Steps opened in this session: a later step counts as visited once the user has been there (SCR-07 States).
  const [seen, setSeen] = useState<readonly WizardStep[]>([step]);
  if (!seen.includes(step)) setSeen([...seen, step]);

  const statusOf = (value: WizardStep) =>
    view.stepStatus.find((entry) => entry.step === value)?.status;
  const goTo = (value: number) => {
    setSearch({ paso: Math.min(5, Math.max(1, value)) });
  };

  const steps: StepperStep[] = STEPS.map((value) => ({
    id: value,
    label: t(STEP_LABEL_KEY[value]),
    status: stepperStatus(value, step, statusOf(value), seen),
  }));
  const blockingSteps = GATING_STEPS.filter((value) => statusOf(value) !== 'valid').map((value) =>
    t(STEP_LABEL_KEY[value]),
  );
  const canGenerate =
    view.permissions.canGenerate === true &&
    validation.data?.permissions.canGenerate === true &&
    blockingSteps.length === 0;

  return (
    <div
      className="grid max-w-240 gap-20"
      data-testid="analysis-definition-wizard"
      data-step={step}
    >
      <Stepper
        steps={steps}
        onStepClick={goTo}
        testIds={{ scope: 'analysis-definition', component: 'stepper' }}
      />
      <StepCard step={step}>
        {step === 1 ? (
          <GeneralInfoStep
            key={draftId}
            draftId={draftId}
            draft={view.draft}
            options={view.options}
            canEdit={view.permissions.canEdit === true}
          />
        ) : null}
        {step === 2 ? (
          <CompetitorPickerStep
            key={draftId}
            draftId={draftId}
            competitorIds={view.draft.competitorIds}
            canEdit={view.permissions.canEdit === true}
          />
        ) : null}
        {step === 3 ? (
          <IndicatorPickerStep
            key={draftId}
            draftId={draftId}
            indicatorIds={view.draft.indicatorIds}
            canEdit={view.permissions.canEdit === true}
          />
        ) : null}
        {step === 4 ? <SourcesStep sources={view.draft.sources} /> : null}
        {step === 5 ? <ValidationStep draftId={draftId} blockingSteps={blockingSteps} /> : null}
      </StepCard>
      {step === 5 && failed ? (
        <p
          role="alert"
          data-testid="analysis-definition-generate-error"
          className="rounded-control border border-status-danger-pill-border bg-status-danger-missing-row-bg px-12 py-10 text-small text-status-danger-text"
        >
          {t('common.draftWizard.generateError')}
        </p>
      ) : null}
      <div className="flex justify-between gap-10">
        <Button
          variant="outline"
          disabled={step === 1}
          onClick={() => {
            goTo(step - 1);
          }}
          testId="analysis-definition-previous"
        >
          {t('analysis-definition.navigation.previous')}
        </Button>
        {step === 5 ? (
          <Button
            variant="cyan"
            disabled={!canGenerate}
            loading={isGenerating}
            onClick={generate}
            testId="analysis-definition-generate"
          >
            {t('analysis-definition.navigation.generateAnalysis')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              goTo(step + 1);
            }}
            testId="analysis-definition-next"
          >
            {t('analysis-definition.navigation.next')}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * The analysis tab bar above the wizard (BencHUD.dc.html:238-244, "Configuración" active), the SCR-08 SegmentedTabs.
 * The wizard edits a draft, which has no results or presentation yet, and V-05 carries no `analysisTabs` (V-09 does):
 * "Resultados" and "Presentación" stay disabled here.
 */
function AnalysisTabs() {
  const t = useT();
  return (
    <SegmentedTabs
      aria-label={t('common.a11y.analysisTabs')}
      variant="brand"
      value="configuration"
      items={[
        { id: 'configuration', label: t('common.analysisTabs.definition') },
        { id: 'results', label: t('common.analysisTabs.results'), disabled: true },
        { id: 'presentation', label: t('common.analysisTabs.presentation'), disabled: true },
      ]}
      onChange={() => undefined}
      testIds={{ scope: 'analysis-definition', component: 'analysis-tabs' }}
    />
  );
}

function DefinitionScreen() {
  const t = useT();
  const { analysisId = '' } = useParams();
  const definition = useAnalysisDefinitionView(analysisId);

  let content: React.ReactNode;
  if (definition.isPending) content = <WizardSkeleton />;
  else if (definition.isError) {
    const { error } = definition;
    content = (
      <SectionErrorPanel
        testId="analysis-definition-error"
        retryTestId="analysis-definition-retry"
        errorCode={isApiError(error) ? error.code : 'UNKNOWN'}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        onRetry={() => {
          void definition.refetch();
        }}
      />
    );
  } else content = <DefinitionWizard draftId={analysisId} view={definition.data} />;

  // The app shell header already shows "Definición del análisis" as the page h1: no in-content title (F0-3).
  return (
    <section data-testid="analysis-definition-page" className="grid gap-20">
      <AnalysisTabs />
      {content}
    </section>
  );
}

/**
 * SCR-07 "Definición del análisis": the 5-step wizard of a draft (`/analisis/:analysisId/definicion?paso=1..5`, the id
 * is the draft's). Stepper, one step card and the footer ("‹ Anterior" · "Siguiente ›" / "Generar análisis"); the step
 * lives in the URL. Step 1 (P5-36) edits and autosaves the general information; steps 2 and 3 (P5-37) pick
 * competitors and indicators, each autosaving through its own debounced C-02 path; step 4 (P5-37) is the read-only
 * sources list of the selection; step 5 shows the V-08 summary and generates. The page mounts its own ToastProvider
 * for the autosave and operation toasts until the app shell (P5-30) mounts the app-wide one.
 */
export function AnalysisDefinitionPage() {
  return (
    <ToastProvider>
      <DefinitionScreen />
    </ToastProvider>
  );
}
