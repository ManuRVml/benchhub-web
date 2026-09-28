import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { useCommentThreadView } from '@/entities/analysis';
import { useOperationStatus } from '@/entities/presentation';
import {
  useSaveValueMonitorView,
  useUpdateKviTargets,
  useUpdateValueMonitorConfiguration,
  useValueMonitorCompositionView,
  useValueMonitorConfigurationView,
  useValueMonitorHistoryView,
  useValueMonitorKvisView,
  useValueMonitorPeerRankingView,
  useValueMonitorView,
  VALUE_MONITOR_HISTORY_RANGES,
  VALUE_MONITOR_PREFIX,
} from '@/entities/value-monitor';
import { isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useTypedSearchParams } from '@/shared/lib/url';
import { ProgressBar } from '@/shared/ui/charts/primitives';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { Button } from '@/shared/ui/primitives/button';
import { Select } from '@/shared/ui/primitives/inputs';
import { KviTable } from '@/widgets/kvi-table';
import { ValueMonitorBenchmarkRadar } from '@/widgets/value-monitor-benchmark-radar';
import { usePostValueMonitorComment, ValueMonitorComments } from '@/widgets/value-monitor-comments';
import { ValueMonitorComposition } from '@/widgets/value-monitor-composition';
import { AddKviModal, ValueMonitorConfig } from '@/widgets/value-monitor-config';
import { ValueMonitorDimensionWeights } from '@/widgets/value-monitor-dimension-weights';
import { ValueMonitorHistory } from '@/widgets/value-monitor-history';
import { ValueMonitorKpis } from '@/widgets/value-monitor-kpis';
import { ValueMonitorRanking } from '@/widgets/value-monitor-ranking';

import { SavedViewsSelect } from './ui/SavedViewsSelect';
import { ValueMonitorNarrativeModal } from './ui/ValueMonitorNarrativeModal';
import { ValueMonitorRecommendationsModal } from './ui/ValueMonitorRecommendationsModal';

import type { SavedView } from '@/entities/saved-view';
import type {
  ValueMonitorCompositionView,
  ValueMonitorConfigurationView,
  ValueMonitorHistoryView,
  ValueMonitorKviRow,
  ValueMonitorKvisView,
  ValueMonitorPeerRankingView,
  ValueMonitorView,
} from '@/entities/value-monitor';
import type { CommentThreadView } from '@/shared/api';
import type { SectionResult } from '@/shared/api/section-result';
import type { KviTableRow, KviTargetsChange } from '@/widgets/kvi-table';
import type { ValueMonitorConfigApply } from '@/widgets/value-monitor-config';
import type { ValueMonitorHistoryRangeId } from '@/widgets/value-monitor-history';
import type { ReactNode } from 'react';

// SCR-11 Monitor de Valor (docs/design/screen-inventory/SCR-11-monitor-valor.md): the header card, KPI tiles
// (P5-50a), dimension weights, peer ranking, history, the KVI table (P5-50b), composition, comments (P5-53), the
// configuration card (P5-52b) and the gated Benchmark radial (P5-54b). Narrativa (OVL-09) and OVL-02 "Recomendaciones
// estratégicas IA" open their modals (P5-53); "Descargar" and "Compartir" stay inert placeholders (same
// convention as P5-42a/43a/45b's `ResultsActionRow`): a disabled control, not a missing one.

/** URL state of this screen (routes.valueMonitor's query params). */
const valueMonitorSearchSchema = z.object({
  /** Selected snapshot id; empty = latest. */
  corte: z.string().default(''),
  /** History range (section 5). */
  historico: z.enum(VALUE_MONITOR_HISTORY_RANGES).default('actual'),
  /** KVI table category filter, comma list; empty = all. */
  categoria: z.array(z.string()).default([]),
  /** KVI table compliance-band filter, comma list; empty = all. */
  cumplimiento: z.array(z.string()).default([]),
  /** Saved view shown ("Mis vistas", V-47); empty = "Vista actual". */
  vista: z.string().default(''),
});

/** Converts a query's `data`/`error` into one SectionResult: ok, forbidden, or an error (never both loading states). */
function toSectionResult<T>(data: T | undefined, error: unknown): SectionResult<T> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/** V-30's unit enum into the KVI table's own display abbreviation (the widget's "Unit" column and its Real-cell
 * percent-vs-number branch both expect the OLD hand-written mirror's ad-hoc strings, `'%'` above all — KviTable.tsx
 * is unchanged, so the mapping happens here instead). */
const KVI_UNIT_DISPLAY: Record<ValueMonitorKviRow['unit'], string> = {
  percent: '%',
  ratio_x: 'x',
  bcop: 'BCOP',
  mmcop: 'MMCOP',
  musd: 'MUSD',
  cop: 'COP',
  cop_per_kwh: '$/kWh',
  rating: 'Rating',
};

/** V-30 rows into the KVI table's own row shape. `category` becomes `categoryLabel` (the display text) while the
 * raw lowercase slug survives as `categoryId` — the table's category filter (and this page's `categoria` URL param
 * / the V-30 `categories` query it round-trips into) must match on that slug, not the display text, or the server
 * side of the filter silently matches nothing. `unit` becomes its display abbreviation (`KVI_UNIT_DISPLAY`).
 * `traceability` is synthesised (V-33 per-KVI traceability is not wired — flagged for Nilo/BFF): a static source,
 * matching V2, and the current snapshot id as a stand-in for the cut-off date (`formatDate` renders it as "—" until
 * it is a real ISO date; the OVL-11 modal is otherwise correct). */
function toKviTableRows(view: ValueMonitorKvisView, snapshotId: string): KviTableRow[] {
  return view.rows.map(
    ({ metaText, metaRetoText, realText, category, categoryLabel, unit, ...row }) => ({
      ...row,
      category: categoryLabel,
      categoryId: category,
      unit: KVI_UNIT_DISPLAY[unit],
      ...(metaText === undefined ? {} : { metaText }),
      ...(metaRetoText === undefined ? {} : { metaRetoText }),
      ...(realText === undefined ? {} : { realText }),
      traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: snapshotId },
    }),
  );
}

/** Fiscal year of the KVI table's "Meta {{year}}" / "Real {{year}}" columns: V-30 no longer has its own `year` field
 * (that was this entity's own hand-written addition, flagged for Nilo/BFF — not a real V-30 field). Every snapshot id
 * in this codebase is a `YYYY-MM` cut-off (V-27's `header.snapshots[].id`), so the selected snapshot's id supplies it;
 * `new Date().getFullYear()` is only a defensive fallback for a malformed id. */
function yearOfSnapshot(snapshotId: string): number {
  const year = Number(snapshotId.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
}

const STATUS_LABEL_KEY = {
  in_construction: 'value-monitor.header.meta.statusValues.in_construction',
  in_review: 'value-monitor.header.meta.statusValues.in_review',
  published: 'value-monitor.header.meta.statusValues.published',
} as const;

const STATUS_CLASS: Record<ValueMonitorView['header']['status'], string> = {
  in_construction: 'bg-status-warning-bg text-status-warning-text',
  in_review: 'bg-status-warning-bg text-status-warning-text',
  published: 'bg-status-success-bg text-status-success-text',
};

export function ValueMonitorPage() {
  const t = useT();
  return (
    <ToastProvider>
      <section data-testid="value-monitor-page">
        <h1 className="sr-only">{t('headerTitle.valueMonitor')}</h1>
        <ValueMonitorFrame />
      </section>
    </ToastProvider>
  );
}

function ValueMonitorFrame() {
  const t = useT();
  const navigate = useNavigate();
  const [search, setSearch] = useTypedSearchParams(valueMonitorSearchSchema);
  const snapshot = search.corte === '' ? undefined : search.corte;
  const query = useValueMonitorView(snapshot);
  const rankingQuery = useValueMonitorPeerRankingView(snapshot);
  const historyQuery = useValueMonitorHistoryView(search.historico);
  const kvisQuery = useValueMonitorKvisView({
    ...(snapshot ? { snapshot } : {}),
    categories: search.categoria,
    compliance: search.cumplimiento,
  });
  const compositionQuery = useValueMonitorCompositionView(snapshot);
  // The BFF names the resolved default in `header.selectedSnapshotId` (P7-SWAP-VM: previously this guessed the first
  // entry of `snapshots`); an empty `corte` means "whatever the BFF selected". V-26 needs a concrete entityId (unlike
  // the other V-2x views, it has no implicit-latest default), so the comment thread waits for the header view.
  const currentSnapshotId =
    search.corte === '' ? (query.data?.header.selectedSnapshotId ?? '') : search.corte;
  const commentsQuery = useCommentThreadView('value_monitor', currentSnapshotId);
  const postComment = usePostValueMonitorComment(currentSnapshotId);
  const configQuery = useValueMonitorConfigurationView(snapshot);
  const updateConfig = useUpdateValueMonitorConfiguration();
  const saveView = useSaveValueMonitorView();
  const updateKviTargets = useUpdateKviTargets();
  const [savedFlash, setSavedFlash] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [addKviOpen, setAddKviOpen] = useState(false);
  const [recalcOperationId, setRecalcOperationId] = useState<string | undefined>(undefined);
  const recalcStatus = useOperationStatus(recalcOperationId);
  const queryClient = useQueryClient();

  // F22: once the recalculation operation succeeds, every Monitor section (tiles, composition, KVI table) reloads
  // with the new result set (M-06 "widgets reload on done"). The banner (below) stays up showing the terminal state
  // -- done or failed -- until the next "Aplicar configuración" replaces `recalcOperationId`; there is no dismiss in
  // the spec.
  useEffect(() => {
    if (recalcStatus.data?.status !== 'succeeded') return;
    void queryClient.invalidateQueries({ queryKey: VALUE_MONITOR_PREFIX });
    // eslint-disable-next-line
  }, [recalcStatus.data?.status]);

  // "Mis vistas": a saved view's stored URL state (V-47 `state`) becomes the page's filters, next to `vista`.
  const applySavedView = useCallback(
    (view: SavedView) => {
      setSearch({
        vista: view.id,
        corte: view.state.corte,
        historico: view.state.historico,
        categoria: view.state.categoria,
        cumplimiento: view.state.cumplimiento,
      });
    },
    [setSearch],
  );
  const clearSavedView = useCallback(() => {
    setSearch({ vista: '' });
  }, [setSearch]);

  const handleTargetsChange = (change: KviTargetsChange) => {
    updateKviTargets.mutate({
      kviId: change.kviId,
      body: {
        meta: change.meta,
        ...(change.metaReto === undefined ? {} : { metaReto: change.metaReto }),
      },
    });
  };

  const handleApplyConfig = (next: ValueMonitorConfigApply) => {
    updateConfig.mutate(
      { config: next },
      {
        onSuccess: (result) => {
          if (result.recalculationOperationId !== undefined) {
            setRecalcOperationId(result.recalculationOperationId);
          }
        },
      },
    );
  };

  return (
    <SectionBoundary
      scope="value-monitor-header"
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={() => {
        void query.refetch();
      }}
      skeleton={
        <div className="flex flex-col gap-16">
          <Skeleton shape="block" size={140} />
          <Skeleton shape="block" size={96} />
        </div>
      }
    >
      {(data) => {
        const currentSnapshot =
          data.header.snapshots.find((snapshot) => snapshot.id === currentSnapshotId) ??
          data.header.snapshots[0];

        const handleSaveView = () => {
          saveView.mutate(currentSnapshotId, {
            onSuccess: () => {
              setSavedFlash(true);
              globalThis.setTimeout(() => {
                setSavedFlash(false);
              }, 2500);
            },
          });
        };

        return (
          // SCR-11 content column (BencHUD.dc.html:1686): max-width 840px, left-aligned, gap 20.
          <div
            data-testid="value-monitor-column"
            className="flex max-w-(--size-layout-max-width-monitor) flex-col gap-20"
          >
            <div
              data-testid="value-monitor-header"
              className="flex flex-col gap-12 rounded-card border border-border-default bg-surface-card px-22 py-18"
            >
              <div className="flex flex-wrap items-center justify-between gap-12">
                <div className="flex flex-wrap items-center gap-24">
                  <MetaField
                    label={t('value-monitor.header.meta.analyst')}
                    value={data.header.analystName}
                    testId="value-monitor-meta-analyst"
                  />
                  <MetaField
                    label={t('value-monitor.header.meta.updated')}
                    value={data.header.updatedLabel}
                    testId="value-monitor-meta-updated"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-11 text-text-secondary">
                      {t('value-monitor.header.meta.status')}
                    </span>
                    <span
                      data-testid="value-monitor-status-chip"
                      className={cn(
                        'w-fit rounded-pill px-8 py-2 text-11 font-semibold',
                        STATUS_CLASS[data.header.status],
                      )}
                    >
                      {t(STATUS_LABEL_KEY[data.header.status])}
                    </span>
                  </div>
                  {savedFlash ? (
                    <span
                      data-testid="value-monitor-saved-flash"
                      className="text-12 font-medium text-status-success-text"
                    >
                      {t('value-monitor.header.inlineSave')}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <AiPill
                    testId="value-monitor-ai-recommendations"
                    onClick={() => {
                      setRecommendationsOpen(true);
                    }}
                  >
                    {t('value-monitor.header.actions.aiRecommendations')}
                  </AiPill>
                  <AiPill
                    testId="value-monitor-generate-narrative"
                    onClick={() => {
                      setNarrativeOpen(true);
                    }}
                  >
                    {t('value-monitor.header.actions.generateNarrative')}
                  </AiPill>
                  <Button
                    variant="outline"
                    testId="value-monitor-go-to-sensitivities"
                    onClick={() => {
                      void navigate(routes.sensitivities.build());
                    }}
                  >
                    {t('value-monitor.header.actions.goToSensitivities')}
                  </Button>
                  <Button
                    variant="outline"
                    testId="value-monitor-save-view"
                    loading={saveView.isPending}
                    disabled={!data.permissions.canSaveView}
                    onClick={handleSaveView}
                  >
                    {t('value-monitor.header.actions.saveView')}
                  </Button>
                  <Button variant="outline" disabled testId="value-monitor-download">
                    {t('value-monitor.header.actions.download')}
                  </Button>
                  <Button variant="outline" disabled testId="value-monitor-share">
                    {t('value-monitor.header.actions.share')}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-10 border-t border-border-subtle pt-12">
                <span className="text-11 font-semibold text-text-secondary uppercase">
                  {t('value-monitor.header.snapshot.label')}
                </span>
                <Select
                  label={t('value-monitor.header.snapshot.label')}
                  hideLabel
                  options={data.header.snapshots.map((snapshot) => ({
                    value: snapshot.id,
                    label: snapshot.label,
                  }))}
                  value={currentSnapshotId}
                  testId="value-monitor-snapshot-select"
                  onValueChange={(value) => {
                    setSearch({ corte: value });
                  }}
                />
                {currentSnapshot === undefined ? null : (
                  <span
                    data-testid="value-monitor-snapshot-note"
                    className="text-12 text-text-secondary"
                  >
                    · {currentSnapshot.note}
                  </span>
                )}
                <SavedViewsSelect
                  activeViewId={search.vista}
                  onChoose={applySavedView}
                  onClear={clearSavedView}
                />
              </div>
            </div>

            {recalcOperationId === undefined ? null : (
              <div
                data-testid="value-monitor-recalc-banner"
                data-status={recalcStatus.data?.status ?? 'queued'}
                className="rounded-card border border-border-default bg-surface-page p-14"
              >
                <p className="text-small font-medium text-text-heading">
                  {recalcStatus.data?.status === 'failed'
                    ? t('value-monitor.configuration.recalculating.failed')
                    : recalcStatus.data?.status === 'succeeded'
                      ? t('value-monitor.configuration.recalculating.done')
                      : t('value-monitor.configuration.recalculating.inProgress')}
                </p>
                {recalcStatus.data?.status === 'succeeded' ||
                recalcStatus.data?.status === 'failed' ? null : (
                  <ProgressBar
                    className="mt-8"
                    value={recalcStatus.data?.progressPct ?? null}
                    aria-label={t('value-monitor.configuration.recalculating.inProgress')}
                  />
                )}
              </div>
            )}

            {data.kpis.status === 'ok' ? (
              <ValueMonitorKpis
                globalPct={data.kpis.data.globalPct}
                retoPct={data.kpis.data.retoPct}
                atRiskCount={data.kpis.data.atRiskCount}
                tbdCount={data.kpis.data.tbdCount}
              />
            ) : null}

            {data.dimensionWeights.status === 'ok' ? (
              <ValueMonitorDimensionWeights
                fin={data.dimensionWeights.data.fin}
                op={data.dimensionWeights.data.op}
                trans={data.dimensionWeights.data.trans}
              />
            ) : null}

            <SectionBoundary
              scope="value-monitor-ranking"
              result={toSectionResult<ValueMonitorPeerRankingView>(
                rankingQuery.data,
                rankingQuery.error,
              )}
              isLoading={rankingQuery.isFetching && rankingQuery.data === undefined}
              onRetry={() => {
                void rankingQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={220} />}
            >
              {(ranking) => <ValueMonitorRanking rows={ranking.rows} />}
            </SectionBoundary>

            <SectionBoundary
              scope="value-monitor-history"
              result={toSectionResult<ValueMonitorHistoryView>(
                historyQuery.data,
                historyQuery.error,
              )}
              isLoading={historyQuery.isFetching && historyQuery.data === undefined}
              onRetry={() => {
                void historyQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={220} />}
            >
              {(history) => (
                <ValueMonitorHistory
                  range={search.historico}
                  onRangeChange={(next: ValueMonitorHistoryRangeId) => {
                    setSearch({ historico: next });
                  }}
                  points={history.points}
                />
              )}
            </SectionBoundary>

            <SectionBoundary
              scope="value-monitor-configuration"
              result={toSectionResult<ValueMonitorConfigurationView>(
                configQuery.data,
                configQuery.error,
              )}
              isLoading={configQuery.isFetching && configQuery.data === undefined}
              onRetry={() => {
                void configQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={220} />}
            >
              {(config) => (
                <ValueMonitorConfig
                  cutOffDate={config.cutOffDate}
                  rangeFrom={config.rangeFrom}
                  rangeTo={config.rangeTo}
                  sources={config.sources}
                  exceptionsText={config.exceptionsText}
                  assistantContext={config.assistantContext}
                  indicators={config.kvis}
                  thresholds={config.thresholds}
                  period={config.period}
                  onApply={handleApplyConfig}
                  onAddIndicator={() => {
                    setAddKviOpen(true);
                  }}
                  applying={updateConfig.isPending}
                />
              )}
            </SectionBoundary>

            <SectionBoundary
              scope="value-monitor-kvis"
              result={toSectionResult<ValueMonitorKvisView>(kvisQuery.data, kvisQuery.error)}
              isLoading={kvisQuery.isFetching && kvisQuery.data === undefined}
              onRetry={() => {
                void kvisQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={320} />}
            >
              {(kvis) => (
                <KviTable
                  rows={toKviTableRows(kvis, currentSnapshotId)}
                  year={yearOfSnapshot(currentSnapshotId)}
                  onTargetsChange={handleTargetsChange}
                  categoryFilter={search.categoria}
                  onCategoryFilterChange={(ids) => {
                    setSearch({ categoria: ids });
                  }}
                  complianceFilter={search.cumplimiento}
                  onComplianceFilterChange={(ids) => {
                    setSearch({ cumplimiento: ids });
                  }}
                />
              )}
            </SectionBoundary>

            <SectionBoundary
              scope="value-monitor-composition"
              result={toSectionResult<ValueMonitorCompositionView>(
                compositionQuery.data,
                compositionQuery.error,
              )}
              isLoading={compositionQuery.isFetching && compositionQuery.data === undefined}
              onRetry={() => {
                void compositionQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={220} />}
            >
              {(composition) => <ValueMonitorComposition data={composition} />}
            </SectionBoundary>

            <SectionBoundary
              scope="value-monitor-comments"
              result={toSectionResult<CommentThreadView>(commentsQuery.data, commentsQuery.error)}
              isLoading={commentsQuery.isFetching && commentsQuery.data === undefined}
              onRetry={() => {
                void commentsQuery.refetch();
              }}
              skeleton={<Skeleton shape="block" size={120} />}
            >
              {(thread) => (
                <ValueMonitorComments
                  data={thread}
                  onSubmit={async (text) => {
                    await postComment.mutateAsync(text);
                  }}
                />
              )}
            </SectionBoundary>

            {/* SCR-11 §10, gated (CF-08): the widget owns its own fetch + SectionBoundary + SectionCard, unlike its
             * siblings above, and no scope-flag system exists yet to gate it -- `enabled` stays hardcoded `true`.
             * TODO(P1-20): wire to the real `benchmarkRadar` scope flag once it exists. */}
            <ValueMonitorBenchmarkRadar enabled />

            <ValueMonitorNarrativeModal open={narrativeOpen} onOpenChange={setNarrativeOpen} />
            <ValueMonitorRecommendationsModal
              open={recommendationsOpen}
              onOpenChange={setRecommendationsOpen}
              snapshot={snapshot}
            />
            <AddKviModal open={addKviOpen} onOpenChange={setAddKviOpen} snapshot={snapshot} />
          </div>
        );
      }}
    </SectionBoundary>
  );
}

function MetaField({
  label,
  value,
  testId,
}: {
  label: ReactNode;
  value: ReactNode;
  testId: string;
}) {
  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      <span className="text-11 text-text-secondary">{label}</span>
      <span className="text-body-strong text-text-heading">{value}</span>
    </div>
  );
}
