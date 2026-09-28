import { useEffect, useRef, useState } from 'react';

import {
  useEvaluateSensitivity,
  useSensitivityDriversView,
  useValidateSensitivitySuggestion,
} from '@/entities/sensitivity';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { badgeVariants } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { ChipGroup } from '@/shared/ui/primitives/chip';
import { RangeSlider } from '@/shared/ui/primitives/inputs';

import { formatGapPts, formatSensitivityValue, gapTone } from './sensitivity-format';

import type {
  SectionResult,
  SensitivityDriversView,
  SensitivityLever,
  SensitivityUnit,
} from '@/shared/api';

export interface SensitivityDriversProps {
  indicatorId: string;
  onIndicatorChange: (indicatorId: string) => void;
}

interface Evaluation {
  simulatedValue: number;
  gap: number;
  /** leverId (see finding on `linked[].indicatorId` in P5-55's reply) -> server-computed variation. */
  linkedByLeverId: Record<string, number>;
}

const defaultLeverValues = (levers: readonly SensitivityLever[]): Record<string, number> =>
  Object.fromEntries(levers.map((lever) => [lever.id, lever.default]));

/** No lever has moved yet: simulated equals base and the gap is the view's own base/target distance (no C-21 call). */
function identityEvaluation(view: SensitivityDriversView): Evaluation {
  return {
    simulatedValue: view.base.value,
    gap: view.target.value - view.base.value,
    linkedByLeverId: {},
  };
}

/** V-37 is a single, non-sectioned payload (brief §5, `fetchPendingView`): a failure is the whole view's ApiError. */
function toSectionResult(
  data: SensitivityDriversView | undefined,
  error: unknown,
): SectionResult<SensitivityDriversView> | undefined {
  if (data) return { status: 'ok', data };
  if (!error) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-12 §1 "Sensibilidad por indicador" (V-37, C-21, C-22): indicator pills, formula, 3 lever sliders with debounced
 * evaluation, the result strip and the Yarbis suggestion. Scenarios (§2), simulation variables (§3) and the rest of the
 * screen are out of Part 1 scope (P5-55). The caller renders `<SensitivityDrivers key={indicatorId} .../>`: a fresh
 * key per indicator remounts the widget on switch, so lever values, the evaluation and the suggestion state always
 * start clean for the new indicator (§1 "switching resets levers and the suggestion state") instead of racing a
 * debounced evaluate of the old one.
 */
export function SensitivityDrivers({ indicatorId, onIndicatorChange }: SensitivityDriversProps) {
  const t = useT();
  const query = useSensitivityDriversView(indicatorId);
  const evaluateMutation = useEvaluateSensitivity();
  const validateMutation = useValidateSensitivitySuggestion();

  const [leverValues, setLeverValues] = useState<Record<string, number>>({});
  const [evaluation, setEvaluation] = useState<Evaluation | undefined>(undefined);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [validated, setValidated] = useState<{ validatedBy: string; validatedAt: string } | null>(
    null,
  );

  const view = query.data;
  // Runs once, the first time this indicator's view arrives (the `key={indicatorId}` remount on the caller side is
  // what actually resets state on a pill switch); a later background refetch of the same indicator must not clobber
  // in-progress lever edits.
  const initialized = useRef(false);
  useEffect(() => {
    if (view && !initialized.current) {
      initialized.current = true;
      setLeverValues(defaultLeverValues(view.levers));
      setEvaluation(identityEvaluation(view));
    }
  }, [view]);

  const evaluate = async (levers: Record<string, number>) => {
    if (!view) return;
    const response = await evaluateMutation.mutateAsync({
      indicatorId,
      levers: Object.entries(levers).map(([leverId, value]) => ({ leverId, value })),
    });
    setEvaluation({
      simulatedValue: response.simulated.value,
      gap: response.gap,
      linkedByLeverId: Object.fromEntries(
        response.linked.map((item) => [item.indicatorId, item.variation]),
      ),
    });
  };
  const autosave = useDebouncedAutosave<Record<string, number>>(evaluate, { delayMs: 250 });

  const changeLever = (leverId: string, value: number) => {
    const next = { ...leverValues, [leverId]: value };
    setLeverValues(next);
    autosave.schedule(next);
  };

  const loadSuggestion = (view2: SensitivityDriversView) => {
    const next = { ...defaultLeverValues(view2.levers), ...view2.suggestion.levers };
    setLeverValues(next);
    autosave.cancel();
    void evaluate(next);
  };

  const validateSuggestion = async (suggestionId: string) => {
    const response = await validateMutation.mutateAsync(suggestionId);
    setValidated({ validatedBy: response.validatedBy, validatedAt: response.validatedAt });
  };

  const result = toSectionResult(query.data, query.error);
  const retry = () => {
    void query.refetch();
  };

  return (
    <SectionCard
      title={t('sensitivities.sections.indicatorSensitivity.title')}
      info={t('sensitivities.sections.indicatorSensitivity.infoText')}
      actions={
        <p className={badgeVariants({ tone: 'warning', size: 'sm' })}>
          {t('sensitivities.sections.indicatorSensitivity.statusChip')}
        </p>
      }
      testId="sensitivity-drivers-card"
    >
      <SectionBoundary
        scope="sensitivity-drivers"
        result={result}
        isLoading={query.isFetching && !view}
        isEmpty={(data) => data.levers.length === 0}
        onRetry={retry}
      >
        {(data) => {
          const unit: SensitivityUnit = data.base.unit;
          const isValidated = validated !== null || data.suggestion.status === 'validated';
          const validatedBy = validated?.validatedBy ?? data.suggestion.validatedBy ?? '';

          return (
            <div className="flex flex-col gap-16">
              <ChipGroup
                mode="single"
                value={[indicatorId]}
                onChange={(ids) => {
                  const [next] = ids;
                  if (next) onIndicatorChange(next);
                }}
                aria-label={t('common.a11y.indicatorPills')}
                testIds={{ scope: 'sensitivity-drivers', component: 'indicator' }}
                items={data.indicators.map((indicator) => ({
                  id: indicator.id,
                  label: indicator.label,
                  disabled: !indicator.isReady,
                }))}
              />

              <div className="flex flex-col gap-4 rounded-card bg-surface-page p-14">
                <p className="text-13 font-semibold text-text-heading">{data.formula.expression}</p>
                {data.formula.terms.map((term) => (
                  <p key={term} className="text-12 text-text-secondary">
                    <span aria-hidden="true">· </span>
                    {term}
                  </p>
                ))}
              </div>

              <div className="flex flex-col gap-16">
                <h3 className="text-title-card text-text-heading">
                  {t('sensitivities.sections.indicatorSensitivity.leversTitle')}
                </h3>
                {data.levers.map((lever) => {
                  const linkedValue = evaluation?.linkedByLeverId[lever.id];
                  return (
                    <RangeSlider
                      key={lever.id}
                      testId={`sensitivity-drivers-lever-${lever.id}`}
                      label={lever.label}
                      min={lever.min}
                      max={lever.max}
                      step={lever.step}
                      value={leverValues[lever.id] ?? lever.default}
                      formatValue={(value) => formatSensitivityValue(value, lever.unit)}
                      onValueChange={(value) => {
                        changeLever(lever.id, value);
                      }}
                      {...(lever.linked && linkedValue !== undefined
                        ? {
                            description: (
                              <>
                                <span aria-hidden="true">{'› '}</span>
                                {lever.linked.label}
                                {': '}
                                {formatSensitivityValue(linkedValue, lever.linked.unit)}
                              </>
                            ),
                          }
                        : {})}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-32 rounded-card bg-surface-page p-14">
                <div>
                  <p className="text-12 text-text-muted">
                    {t('sensitivities.sections.indicatorSensitivity.resultStrip.baseLabel')}
                  </p>
                  <p className="text-title-detail text-text-heading">
                    {formatSensitivityValue(data.base.value, unit)}
                  </p>
                </div>
                <span aria-hidden="true" className="text-text-muted">
                  ›
                </span>
                <div>
                  <p className="text-12 text-text-muted">
                    {t('sensitivities.sections.indicatorSensitivity.resultStrip.simulatedLabel')}
                  </p>
                  <p
                    className="text-title-detail text-text-heading"
                    data-testid="sensitivity-drivers-simulated"
                  >
                    {formatSensitivityValue(evaluation?.simulatedValue ?? data.base.value, unit)}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-12 text-text-muted">
                    {t('sensitivities.sections.indicatorSensitivity.resultStrip.gapLabel', {
                      metaValue: formatSensitivityValue(data.target.value, unit),
                    })}
                  </p>
                  <p
                    className={badgeVariants({
                      tone: gapTone(evaluation?.gap ?? data.target.value - data.base.value),
                      size: 'sm',
                    })}
                    data-testid="sensitivity-drivers-gap"
                  >
                    {formatGapPts(evaluation?.gap ?? data.target.value - data.base.value)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-8 rounded-card border border-brand-primary-border bg-brand-primary-subtle p-14">
                <div className="flex items-center justify-between gap-8">
                  <p className="text-12 font-semibold text-brand-primary-dark">
                    {t('sensitivities.sections.indicatorSensitivity.yarbisSuggestion.title')}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    testId="sensitivity-drivers-suggestion-toggle"
                    aria-expanded={suggestionOpen}
                    onClick={() => {
                      setSuggestionOpen((open) => !open);
                    }}
                  >
                    {suggestionOpen
                      ? t('sensitivities.sections.indicatorSensitivity.yarbisSuggestion.toggleHide')
                      : t(
                          'sensitivities.sections.indicatorSensitivity.yarbisSuggestion.toggleShow',
                        )}
                  </Button>
                </div>
                {suggestionOpen ? (
                  <div className="flex flex-col gap-8">
                    <p className="text-13 text-text-body">
                      {t('sensitivities.sections.indicatorSensitivity.yarbisSuggestion.bodyText', {
                        result: formatSensitivityValue(data.suggestion.estimatedResult, unit),
                      })}
                    </p>
                    <p
                      className={badgeVariants({
                        tone: isValidated ? 'success' : 'warning',
                        size: 'sm',
                      })}
                      data-testid="sensitivity-drivers-suggestion-status"
                    >
                      {isValidated
                        ? t(
                            'sensitivities.sections.indicatorSensitivity.yarbisSuggestion.statusValidated',
                          )
                        : t(
                            'sensitivities.sections.indicatorSensitivity.yarbisSuggestion.statusRequiresValidation',
                          )}
                    </p>
                    <div className="flex gap-8">
                      <Button
                        variant="outline"
                        size="sm"
                        testId="sensitivity-drivers-suggestion-load"
                        onClick={() => {
                          loadSuggestion(data);
                        }}
                      >
                        {t(
                          'sensitivities.sections.indicatorSensitivity.yarbisSuggestion.loadButton',
                        )}
                      </Button>
                      {data.permissions.canValidateSuggestion && !isValidated ? (
                        <Button
                          variant="primary"
                          size="sm"
                          testId="sensitivity-drivers-suggestion-validate"
                          onClick={() => {
                            void validateSuggestion(data.suggestion.id);
                          }}
                        >
                          {t(
                            'sensitivities.sections.indicatorSensitivity.yarbisSuggestion.validateButton',
                          )}
                        </Button>
                      ) : null}
                    </div>
                    {isValidated && validatedBy ? (
                      <p className="text-12 text-text-secondary">{validatedBy}</p>
                    ) : null}
                  </div>
                ) : null}
                {/* text-secondary, not the usual text-muted (CF-139 precedent): text-muted is only 4.1:1 on this
                    brand-primary-subtle tint, below AA. */}
                <p className="text-11 text-text-secondary">
                  {t('sensitivities.sections.indicatorSensitivity.yarbisSuggestion.disclaimer')}
                </p>
              </div>
            </div>
          );
        }}
      </SectionBoundary>
    </SectionCard>
  );
}
