import { useState } from 'react';

import {
  useEvaluateWeightSimulation,
  useSensitivityScenariosView,
  useWeightSimulatorView,
} from '@/entities/sensitivity';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { BAR_TONE_CLASS, ProgressBar } from '@/shared/ui/charts/primitives';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { badgeVariants } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { RangeSlider } from '@/shared/ui/primitives/inputs';

import { weightSimulatorTestIds } from './test-ids';
import {
  CATEGORY_STATUS_TONE,
  categoryStatus,
  formatRoacePct,
  formatVariationPts,
  formatWeightPct,
  GAP_CLOSED_TIP_THRESHOLD,
  KVI_BAND_TONE,
} from './weight-simulator-format';

import type { CategoryStatus } from './weight-simulator-format';
import type { SectionResult, SensitivityScenariosView, WeightSimulatorView } from '@/shared/api';

export interface WeightSimulatorProps {
  className?: string;
}

interface CombinedView {
  scenarios: SensitivityScenariosView;
  weightSim: WeightSimulatorView;
}

/** Two independent GETs (V-38, V-39) as one `SectionResult` for the outer boundary (SCR-12 §2-6). */
function toCombinedResult(
  scenarios: SensitivityScenariosView | undefined,
  scenariosError: unknown,
  weightSim: WeightSimulatorView | undefined,
  weightSimError: unknown,
): SectionResult<CombinedView> | undefined {
  if (scenarios && weightSim) return { status: 'ok', data: { scenarios, weightSim } };
  const error = scenariosError ?? weightSimError;
  if (!error) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

const STATUS_LABEL_KEY = {
  on_target: 'sensitivities.sections.weightSimulator.status.onTarget',
  above: 'sensitivities.sections.weightSimulator.status.above',
  below: 'sensitivities.sections.weightSimulator.status.below',
} as const satisfies Record<CategoryStatus, string>;

type Variables = Record<'productivity' | 'operating_costs', number>;

const defaultVariables = (view: SensitivityScenariosView): Variables =>
  Object.fromEntries(view.variables.map((v) => [v.id, v.default])) as Variables;

const defaultWeights = (view: WeightSimulatorView): Record<string, number> =>
  Object.fromEntries(
    view.categories.flatMap((category) => category.kvis.map((kvi) => [kvi.kviId, kvi.weightPct])),
  );

/** C-24 `mode: 'scenario'` response shape, narrowed to the fields the ROACE strip and Yarbis tip read. */
interface ScenarioEval {
  baseRoace: number;
  simulatedRoace: number;
  peerAvgRoace: number;
  gapClosedPct: number;
  status: 'calculated' | 'above_peers';
}

/** No lever moved yet: simulated equals base ROACE, 0% of the gap closed (CF-68's `above_peers` still applies if
 * Ecopetrol's base already clears the peer average). */
const defaultScenarioEval = (view: SensitivityScenariosView): ScenarioEval => ({
  baseRoace: view.baseRoace,
  simulatedRoace: view.baseRoace,
  peerAvgRoace: view.peerAvgRoace,
  gapClosedPct: 0,
  status: view.baseRoace >= view.peerAvgRoace ? 'above_peers' : 'calculated',
});

/**
 * SCR-12 §2-6 (V-38, V-39, C-24): scenario presets + the productivity/operating-costs sliders, the ROACE
 * before/after strip with the gap-closed bar, the Yarbis tip, and the weight simulator (score strip + 4 categories +
 * weight rows). One widget, one `SectionBoundary`, because §2-4's data and §6's data are independent GETs that load
 * and fail together in practice (both idle the instant the page mounts) — splitting them into two boundaries would
 * only duplicate the skeleton/error/forbidden branches for no real independence benefit. §7 (recommendations) and the
 * OVL-03 modal are `@/widgets/strategic-plan`.
 */
export function WeightSimulator({ className }: WeightSimulatorProps) {
  const t = useT();
  const scenariosQuery = useSensitivityScenariosView();
  const weightSimQuery = useWeightSimulatorView();
  const evaluateWeights = useEvaluateWeightSimulation();

  const [variables, setVariables] = useState<Variables | undefined>(undefined);
  const [weights, setWeights] = useState<Record<string, number> | undefined>(undefined);
  const [initialWeights, setInitialWeights] = useState<Record<string, number> | undefined>(
    undefined,
  );
  const [weightEval, setWeightEval] = useState<{ score: number; variation: number } | undefined>(
    undefined,
  );
  const [scenarioEval, setScenarioEval] = useState<ScenarioEval | undefined>(undefined);

  const result = toCombinedResult(
    scenariosQuery.data,
    scenariosQuery.error,
    weightSimQuery.data,
    weightSimQuery.error,
  );
  // "Adjusting state when a prop changes" (conditional setState during render, guarded so it only runs once): a ref
  // would need reading/writing during render too, which the newer react-hooks rules forbid outright.
  if (result?.status === 'ok' && variables === undefined) {
    setVariables(defaultVariables(result.data.scenarios));
    setWeights(defaultWeights(result.data.weightSim));
    setInitialWeights(defaultWeights(result.data.weightSim));
    setWeightEval({ score: result.data.weightSim.baseScore, variation: 0 });
    // No lever has moved yet: simulated equals base, closing none of the gap (no C-24 call, same convention as
    // weightEval above — CF-68's `above_peers` follows from the base/peer comparison alone in that untouched state).
    setScenarioEval(defaultScenarioEval(result.data.scenarios));
  }

  const evaluate = async (nextWeights: Record<string, number>) => {
    const response = await evaluateWeights.mutateAsync({
      mode: 'weights',
      weights: Object.entries(nextWeights).map(([kviId, weight]) => ({ kviId, weight })),
    });
    if (response.mode !== 'weights') return;
    setWeightEval({ score: response.score, variation: response.variation });
  };
  const autosave = useDebouncedAutosave<Record<string, number>>(evaluate, { delayMs: 250 });

  const evaluateScenario = async (nextVariables: Variables) => {
    const response = await evaluateWeights.mutateAsync({
      mode: 'scenario',
      productivity: nextVariables.productivity,
      operatingCosts: nextVariables.operating_costs,
    });
    if (response.mode !== 'scenario') return;
    setScenarioEval({
      baseRoace: response.baseRoace,
      simulatedRoace: response.simulatedRoace,
      peerAvgRoace: response.peerAvgRoace,
      gapClosedPct: response.gapClosedPct,
      status: response.status,
    });
  };
  const scenarioAutosave = useDebouncedAutosave<Variables>(evaluateScenario, { delayMs: 250 });

  const retry = () => {
    void scenariosQuery.refetch();
    void weightSimQuery.refetch();
  };

  return (
    <div className={className}>
      <SectionBoundary scope="weight-simulator" result={result} onRetry={retry}>
        {({ scenarios, weightSim }) => {
          const vars = variables ?? defaultVariables(scenarios);
          const currentWeights = weights ?? defaultWeights(weightSim);
          const evalResult = weightEval ?? { score: weightSim.baseScore, variation: 0 };
          const scenario = scenarioEval ?? defaultScenarioEval(scenarios);
          const abovePeers = scenario.status === 'above_peers';

          const changeVariable = (id: keyof Variables, value: number) => {
            const next = { ...vars, [id]: value };
            setVariables(next);
            scenarioAutosave.schedule(next);
          };

          const changeWeight = (kviId: string, value: number) => {
            const next = { ...currentWeights, [kviId]: value };
            setWeights(next);
            autosave.schedule(next);
          };

          const resetWeights = () => {
            autosave.cancel();
            const original = initialWeights ?? defaultWeights(weightSim);
            setWeights(original);
            setWeightEval({ score: weightSim.baseScore, variation: 0 });
          };

          return (
            <div className="flex flex-col gap-16" data-testid={weightSimulatorTestIds.root}>
              {/* §2 Escenarios — CF-10: V2 renders no preset cards; the contract now sends `presets`, so show them
                  when present and keep the eyebrow-only fallback otherwise. */}
              <div className="flex flex-col gap-6">
                <p className="text-label text-text-secondary uppercase">
                  {t('sensitivities.sections.scenarios.eyebrow')}
                </p>
                <p className="text-13 text-text-secondary">
                  {t('sensitivities.sections.scenarios.infoText')}
                </p>
                {scenarios.presets && scenarios.presets.length > 0 ? (
                  <div className="flex flex-wrap gap-8">
                    {scenarios.presets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVariables(preset.values);
                          scenarioAutosave.schedule(preset.values);
                        }}
                        testId={weightSimulatorTestIds.preset(preset.id)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* §3 Variables de simulación */}
              <SectionCard
                title={t('sensitivities.sections.simulationVariables.title')}
                info={t('sensitivities.sections.simulationVariables.infoText')}
                testId="weight-simulator-variables-card"
              >
                <div className="flex flex-col gap-16">
                  {scenarios.variables.map((variable) => (
                    <RangeSlider
                      key={variable.id}
                      testId={weightSimulatorTestIds.variableSlider(variable.id)}
                      label={t(
                        variable.id === 'productivity'
                          ? 'sensitivities.sections.simulationVariables.productivityLabel'
                          : 'sensitivities.sections.simulationVariables.operatingCostsLabel',
                      )}
                      min={variable.min}
                      max={variable.max}
                      step={variable.step}
                      value={vars[variable.id]}
                      formatValue={formatRoacePct}
                      onValueChange={(value) => {
                        changeVariable(variable.id, value);
                      }}
                    />
                  ))}
                </div>
              </SectionCard>

              {/* §4 ROACE · Before / After */}
              <SectionCard
                title={t('sensitivities.sections.roaceBeforeAfter.title')}
                info={t('sensitivities.sections.roaceBeforeAfter.infoText')}
                testId="weight-simulator-roace-card"
              >
                <div className="flex flex-wrap items-center gap-32 rounded-card bg-surface-page p-14">
                  <div>
                    <p className="text-12 text-text-muted">
                      {t('sensitivities.sections.roaceBeforeAfter.baseLabel')}
                    </p>
                    <p className="text-title-detail text-text-heading">
                      {formatRoacePct(scenario.baseRoace)}
                    </p>
                  </div>
                  <span aria-hidden="true" className="text-text-muted">
                    ›
                  </span>
                  <div>
                    <p className="text-12 text-text-muted">
                      {t('sensitivities.sections.roaceBeforeAfter.simulatedLabel')}
                    </p>
                    <p
                      className="text-title-detail text-text-heading"
                      data-testid={weightSimulatorTestIds.roaceSimulated}
                    >
                      {formatRoacePct(scenario.simulatedRoace)}
                    </p>
                  </div>
                  {abovePeers ? null : (
                    <div className="ml-auto min-w-160 flex-1">
                      <p className="mb-4 text-12 text-text-muted">
                        {t('sensitivities.sections.roaceBeforeAfter.gapClosedLabel', {
                          peerValue: formatRoacePct(scenario.peerAvgRoace),
                        })}
                      </p>
                      <ProgressBar
                        value={scenario.gapClosedPct}
                        height={8}
                        aria-label={t('sensitivities.sections.roaceBeforeAfter.gapClosedLabel', {
                          peerValue: formatRoacePct(scenario.peerAvgRoace),
                        })}
                        valueText={formatPct0(scenario.gapClosedPct)}
                        data-testid={weightSimulatorTestIds.gapClosedBar}
                      />
                      <p
                        className="mt-4 text-12 font-semibold text-status-success-text"
                        data-testid={weightSimulatorTestIds.gapClosedPct}
                      >
                        {formatPct0(scenario.gapClosedPct)}
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* §5 Yarbis tip */}
              {abovePeers ? null : (
                <div
                  className="flex items-start gap-8 rounded-card border border-ai-border bg-ai-bg p-14 text-13 text-ai-text"
                  data-testid={weightSimulatorTestIds.tip}
                >
                  <span aria-hidden="true">✦</span>
                  <p>
                    {scenario.gapClosedPct >= GAP_CLOSED_TIP_THRESHOLD
                      ? t('sensitivities.sections.yarbisTip.gapClosed', {
                          pct: Math.round(scenario.gapClosedPct),
                        })
                      : t('sensitivities.sections.yarbisTip.gapOpen')}
                  </p>
                </div>
              )}

              {/* §6 Simulador de pesos por indicador */}
              <SectionCard
                title={t('sensitivities.sections.weightSimulator.title')}
                subtitle={t('sensitivities.sections.weightSimulator.subtitle')}
                testId="weight-simulator-weights-card"
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetWeights}
                    testId={weightSimulatorTestIds.resetButton}
                  >
                    {t('sensitivities.sections.weightSimulator.resetButton')}
                  </Button>
                }
              >
                <div className="flex flex-col gap-20">
                  <div className="flex flex-wrap items-center gap-32 rounded-card bg-surface-page p-14">
                    <div>
                      <p className="text-12 text-text-muted">
                        {t('sensitivities.sections.weightSimulator.scoreStrip.baseLabel')}
                      </p>
                      <p className="text-title-detail text-text-heading">
                        {formatRoacePct(weightSim.baseScore)}
                      </p>
                    </div>
                    <span aria-hidden="true" className="text-text-muted">
                      ›
                    </span>
                    <div>
                      <p className="text-12 text-text-muted">
                        {t('sensitivities.sections.weightSimulator.scoreStrip.simulatedLabel')}
                      </p>
                      <p
                        className="text-title-detail text-text-heading"
                        data-testid={weightSimulatorTestIds.scoreSimulated}
                      >
                        {formatRoacePct(evalResult.score)}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-12 text-text-muted">
                        {t('sensitivities.sections.weightSimulator.scoreStrip.variationLabel')}
                      </p>
                      <p
                        className="text-title-detail text-text-heading"
                        data-testid={weightSimulatorTestIds.scoreVariation}
                      >
                        {formatVariationPts(evalResult.variation)}
                      </p>
                    </div>
                  </div>

                  {weightSim.categories.map((category) => {
                    const total = category.kvis.reduce(
                      (sum, kvi) => sum + (currentWeights[kvi.kviId] ?? kvi.weightPct),
                      0,
                    );
                    const status = categoryStatus(total, category.targetPct);
                    return (
                      <div key={category.id} className="flex flex-col gap-8">
                        <div className="flex items-center justify-between gap-8">
                          <h4 className="text-12 font-semibold text-text-heading">
                            {category.label}
                          </h4>
                          <p
                            className={badgeVariants({
                              tone: CATEGORY_STATUS_TONE[status],
                              size: 'sm',
                            })}
                            data-testid={weightSimulatorTestIds.categoryStatus(category.id)}
                          >
                            {t('sensitivities.sections.weightSimulator.categoryHeader', {
                              total: formatWeightPct(total),
                              target: formatWeightPct(category.targetPct),
                              status: t(STATUS_LABEL_KEY[status]),
                            })}
                          </p>
                        </div>
                        <ProgressBar
                          value={Math.min(100, (total / category.targetPct) * 100)}
                          height={6}
                          tone={CATEGORY_STATUS_TONE[status]}
                          aria-label={category.label}
                          data-testid={weightSimulatorTestIds.categoryBar(category.id)}
                        />
                        <div className="grid grid-cols-1 gap-14 tablet:grid-cols-[1fr_160px_60px]">
                          {category.kvis.map((kvi) => (
                            <div key={kvi.kviId} className="flex items-center gap-8">
                              <span
                                aria-hidden="true"
                                data-testid={`${weightSimulatorTestIds.weightRow(kvi.kviId)}-band`}
                                className={cn(
                                  'size-8 shrink-0 rounded-pill',
                                  BAR_TONE_CLASS[KVI_BAND_TONE[kvi.band]],
                                )}
                              />
                              <RangeSlider
                                testId={weightSimulatorTestIds.weightRow(kvi.kviId)}
                                label={kvi.label}
                                min={0}
                                max={30}
                                step={1}
                                value={currentWeights[kvi.kviId] ?? kvi.weightPct}
                                formatValue={formatWeightPct}
                                onValueChange={(value) => {
                                  changeWeight(kvi.kviId, value);
                                }}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          );
        }}
      </SectionBoundary>
    </div>
  );
}

const formatPct0 = (value: number): string => `${String(Math.round(value))}%`;
