import { useState } from 'react';

import {
  useAddAnalysisCompany,
  useCompanyCoverageView,
  usePendingOverrides,
  useRemoveAnalysisCompany,
  useUpdateValueOverrides,
} from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { CompanyLogoChip } from '@/shared/ui/composites/company-logo-chip';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { useToast } from '@/shared/ui/composites/toast';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Chip } from '@/shared/ui/primitives/chip';
import { NumberInput, Select, TextField } from '@/shared/ui/primitives/inputs';

import { companyCoverageTestIds } from './test-ids';

import type { ValueOverride } from '@/entities/analysis';
import type { ResultsHorizon, V09Response, V10Response } from '@/shared/api';
import type { SectionResult } from '@/shared/api/section-result';
import type { CoverageStatus } from '@/shared/ui/primitives/badge';

// SCR-08 module 2 "Detalle y edición de datos por compañía" (V-10). `usePendingOverrides` lives in
// `entities/analysis` (P5-41): the `PendingOverridesProvider` the page mounts stages every value edit; `Guardar
// cambios` commits the widget's staged edits with C-06, `Cancelar cambios` discards them.
//
// `CompanyCoverageProps` is spelled out here (`V09Response`, `@/shared/api`), not imported as the registry's
// `ModuleViewProps` (`@/widgets/analysis-modules`): a widget may import only a lower layer, never a sibling widget
// (FSD boundary, `tools/architecture/fsd-rules.js`, verified with `pnpm check:architecture`). The two types are
// structurally identical, so a `ModuleView` still accepts this component; the page composes the registry override
// (`{...RESULTS_MODULE_REGISTRY, companyCoverage: CompanyCoverage}`) instead of `ModuleFrame.tsx` importing it
// directly, for the same reason. `horizon` is unused (V-10 has no horizon-scoped data) but kept so the shape matches.
export interface CompanyCoverageProps {
  analysisId: string;
  horizon: ResultsHorizon;
  module: V09Response['modules'][number];
}

type Companies = Extract<V10Response['companies'], { status: 'ok' }>['data'];
type CompanyCard = Companies['items'][number];
type Selected = Extract<V10Response['selected'], { status: 'ok' }>['data'];
type Group = Selected['groups'][number];
type GroupItem = Group['items'][number];
type MissingItem = Selected['missing'][number];

/**
 * A cell edit: an omitted field is unchanged, `null` clears it (never `0` — CF-37). `stageValue` converts a `null`
 * justification to "no `justification` key" when it builds the `ValueOverride` (its own field is `string |
 * undefined`, never `null`).
 */
interface ValuePatch {
  value?: number | null;
  isEstimate?: boolean;
  justification?: string | null;
}

const STATUS_TO_COVERAGE: Readonly<Record<CompanyCard['coverageStatus'], CoverageStatus>> = {
  complete: 'complete',
  needs_review: 'partial',
  incomplete: 'missing',
};

const STATUS_LABEL_KEY = {
  complete: 'analysis-results.companyCoverage.status.complete',
  needs_review: 'analysis-results.companyCoverage.status.needsReview',
  incomplete: 'analysis-results.companyCoverage.status.incomplete',
} as const satisfies Record<CompanyCard['coverageStatus'], string>;

const BAR_TONE_CLASS: Readonly<Record<CompanyCard['coverageStatus'], string>> = {
  complete: 'bg-status-success-base',
  needs_review: 'bg-status-warning-base',
  incomplete: 'bg-status-danger-base',
};

const DIMENSION_COLOR_CLASS: Readonly<Record<Group['dimension'], string>> = {
  fin: 'bg-brand-primary',
  op: 'bg-ai-accent',
  trans: 'bg-status-warning-base',
};

const DIMENSION_LABEL_KEY = {
  fin: 'analysis-results.companyCoverage.dimension.fin',
  op: 'analysis-results.companyCoverage.dimension.op',
  trans: 'analysis-results.companyCoverage.dimension.trans',
} as const satisfies Record<Group['dimension'], string>;

/** The whole V-10 query as one SectionResult (the fetch itself can fail before any section status exists). */
function toSectionResult(
  data: V10Response | undefined,
  error: unknown,
): SectionResult<V10Response> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-08 module 2 (V-10): KPI band, AI insights, the company grid (add / remove with undo) and the edit area of the
 * selected company (dimension groups + missing indicators). Registered as an override of the registry's
 * `companyCoverage` placeholder (see the file banner above).
 */
export function CompanyCoverage({ analysisId, module }: CompanyCoverageProps) {
  const t = useT();
  const toast = useToast();
  const query = useCompanyCoverageView(analysisId);
  const addCompany = useAddAnalysisCompany();
  const removeCompany = useRemoveAnalysisCompany();
  const updateOverrides = useUpdateValueOverrides();
  const { overrides, stage, clear } = usePendingOverrides();

  // Optimistic hide during the 5 s undo window: the company keeps its place in `companies.items` (and its staged
  // overrides, never touched here) until the toast expires, only then is C-05 actually sent.
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const overrideFor = (companyId: string, indicatorId: string): ValueOverride | undefined =>
    overrides.find((o) => o.companyId === companyId && o.indicatorId === indicatorId);

  const stageValue = (
    companyId: string,
    indicatorId: string,
    patch: ValuePatch,
    fallback: { value: number | null; isEstimate: boolean; justification: string | null },
  ) => {
    const current = overrideFor(companyId, indicatorId);
    const value = patch.value !== undefined ? patch.value : (current?.value ?? fallback.value);
    const isEstimate = patch.isEstimate ?? current?.isEstimate ?? fallback.isEstimate;
    const justification =
      patch.justification !== undefined
        ? patch.justification
        : (current?.justification ?? fallback.justification);
    stage({
      companyId,
      indicatorId,
      value,
      isEstimate,
      ...(justification ? { justification } : {}),
    });
  };

  const handleRemove = (company: CompanyCard) => {
    setHiddenIds((previous) => new Set(previous).add(company.id));
    if (selectedCompanyId === company.id) setSelectedCompanyId(null);
    toast.undo({
      message: t('analysis-results.toasts.companyRemoved', { company: company.name }),
      onUndo: () => {
        setHiddenIds((previous) => {
          const next = new Set(previous);
          next.delete(company.id);
          return next;
        });
      },
      onExpire: () => {
        removeCompany.mutate({ analysisId, companyId: company.id });
      },
    });
  };

  const handleSave = () => {
    if (overrides.length === 0) return;
    updateOverrides.mutate(
      { analysisId, body: { overrides: [...overrides] } },
      {
        onSuccess: () => {
          clear();
          setSavedFlash(true);
          globalThis.setTimeout(() => {
            setSavedFlash(false);
          }, 2200);
        },
      },
    );
  };

  return (
    <div data-module={module.id} data-order={module.order}>
      <SectionCard
        padding="prototype"
        title={t('analysis-results.companyCoverage.header.title')}
        info={t('analysis-results.companyCoverage.header.subtitle')}
        testId="analysis-module-companyCoverage"
      >
        <SectionBoundary
          scope="company-coverage"
          result={toSectionResult(query.data, query.error)}
          isLoading={query.isFetching && query.data === undefined}
          onRetry={() => {
            void query.refetch();
          }}
          skeleton={
            <div className="flex flex-col gap-16">
              <Skeleton shape="block" size={72} />
              <Skeleton shape="block" size={160} />
            </div>
          }
        >
          {(data) => {
            const companyNameById =
              data.companies.status === 'ok'
                ? new Map(data.companies.data.items.map((c) => [c.id, c.name]))
                : new Map<string, string>();
            return (
              <div className="flex flex-col gap-20">
                <SectionBoundary scope="company-coverage-kpis" result={data.kpis} isLoading={false}>
                  {(kpis) => (
                    <dl className="grid grid-cols-4 gap-12">
                      <KpiTile
                        value={kpis.companies}
                        label={t('analysis-results.companyCoverage.kpiBand.companies')}
                        className="text-text-heading"
                      />
                      <KpiTile
                        value={kpis.complete}
                        label={t('analysis-results.companyCoverage.kpiBand.complete')}
                        className="text-status-success-text"
                      />
                      <KpiTile
                        value={kpis.incomplete}
                        label={t('analysis-results.companyCoverage.kpiBand.incomplete')}
                        className="text-status-danger-text"
                      />
                      <KpiTile
                        value={kpis.pendingIndicators}
                        label={t('analysis-results.companyCoverage.kpiBand.pendingIndicators')}
                        className="text-brand-primary"
                      />
                    </dl>
                  )}
                </SectionBoundary>

                <SectionBoundary
                  scope="company-coverage-insights"
                  result={data.insights}
                  isLoading={false}
                  isEmpty={(items) => items.length === 0}
                  empty={null}
                >
                  {(insights) => (
                    <ul className="m-0 flex list-none flex-col gap-4 p-0">
                      {insights.map((insight) => (
                        <li key={insight.id} className="text-small text-text-body">
                          {'✦ '}
                          {insight.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionBoundary>

                <SectionBoundary
                  scope="company-coverage-companies"
                  result={data.companies}
                  isLoading={false}
                >
                  {(companies) => (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-10">
                      {companies.items
                        .filter((company) => !hiddenIds.has(company.id))
                        .map((company) => (
                          <CompanyCardTile
                            key={company.id}
                            company={company}
                            selected={company.id === selectedCompanyId}
                            onSelect={() => {
                              setSelectedCompanyId(company.id);
                            }}
                            onRemove={() => {
                              handleRemove(company);
                            }}
                          />
                        ))}
                      {companies.addableCompanies.length === 0 ? null : (
                        <div className="flex min-h-96 flex-col gap-8 rounded-md border-2 border-dashed border-border-default p-12">
                          <span className="text-11 font-semibold text-text-secondary">
                            {t('analysis-results.companyCoverage.addTile.title')}
                          </span>
                          <Select
                            label={t('analysis-results.companyCoverage.addTile.title')}
                            hideLabel
                            options={companies.addableCompanies.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            allLabel={t(
                              'analysis-results.companyCoverage.addTile.selectPlaceholder',
                            )}
                            value=""
                            testId={companyCoverageTestIds.addSelect}
                            onValueChange={(value) => {
                              if (value === '') return;
                              addCompany.mutate({ analysisId, body: { companyId: value } });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </SectionBoundary>

                <SectionBoundary
                  scope="company-coverage-selected"
                  result={data.selected}
                  isLoading={false}
                >
                  {(selected) => (
                    <EditArea
                      selected={selected}
                      companyName={companyNameById.get(selected.companyId) ?? selected.companyId}
                      overrideFor={overrideFor}
                      onValueChange={stageValue}
                      onSave={handleSave}
                      onCancel={clear}
                      saving={updateOverrides.isPending}
                      savedFlash={savedFlash}
                      hasStagedEdits={overrides.length > 0}
                    />
                  )}
                </SectionBoundary>
              </div>
            );
          }}
        </SectionBoundary>
      </SectionCard>
    </div>
  );
}

function KpiTile({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <dd className={cn('text-title-lg m-0 font-bold', className)}>{formatNumber(value)}</dd>
      <dt className="text-11 text-text-secondary">{label}</dt>
    </div>
  );
}

interface CompanyCardTileProps {
  company: CompanyCard;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function CompanyCardTile({ company, selected, onSelect, onRemove }: CompanyCardTileProps) {
  const t = useT();
  return (
    <div
      data-testid={companyCoverageTestIds.card(company.id)}
      data-selected={selected}
      className={cn(
        'relative rounded-md border-2 p-12',
        selected ? 'border-brand-primary' : 'border-border-default',
      )}
    >
      <button
        type="button"
        aria-label={t('analysis-results.companyCoverage.companyCard.remove', {
          company: company.name,
        })}
        data-testid={companyCoverageTestIds.cardRemove(company.id)}
        onClick={onRemove}
        className="absolute top-8 right-8 grid size-16 cursor-pointer place-items-center rounded-pill bg-surface-page text-text-secondary hover:bg-status-danger-base hover:text-text-inverse"
      >
        <span aria-hidden="true">✕</span>
      </button>
      <button
        type="button"
        aria-pressed={selected}
        data-testid={companyCoverageTestIds.cardSelect(company.id)}
        onClick={onSelect}
        className="flex w-full cursor-pointer flex-col gap-8 text-left"
      >
        <CompanyLogoChip
          slug={company.colorKey}
          name={company.name}
          initials={company.initials}
          size="sm"
        />
        <span
          className={cn(
            'text-title-lg font-bold',
            `text-status-${company.coverageStatus === 'complete' ? 'success' : company.coverageStatus === 'incomplete' ? 'danger' : 'warning'}-text`,
          )}
        >
          {formatPercent(company.coveragePct, { decimals: 0 })}
        </span>
        <Badge kind="coverage" coverage={STATUS_TO_COVERAGE[company.coverageStatus]}>
          {t(STATUS_LABEL_KEY[company.coverageStatus])}
        </Badge>
        <div className="h-5 w-full rounded-pill bg-surface-page">
          <div
            className={cn('h-5 rounded-pill', BAR_TONE_CLASS[company.coverageStatus])}
            style={{ width: `${String(Math.max(0, Math.min(100, company.coveragePct)))}%` }}
          />
        </div>
        <span className="text-11 text-text-secondary">
          {t('analysis-results.companyCoverage.companyCard.missingCount', {
            count: company.missingCount,
          })}
        </span>
      </button>
    </div>
  );
}

interface EditAreaProps {
  selected: Selected;
  companyName: string;
  overrideFor: (companyId: string, indicatorId: string) => ValueOverride | undefined;
  onValueChange: (
    companyId: string,
    indicatorId: string,
    patch: ValuePatch,
    fallback: { value: number | null; isEstimate: boolean; justification: string | null },
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  savedFlash: boolean;
  hasStagedEdits: boolean;
}

function EditArea({
  selected,
  companyName,
  overrideFor,
  onValueChange,
  onSave,
  onCancel,
  saving,
  savedFlash,
  hasStagedEdits,
}: EditAreaProps) {
  const t = useT();
  return (
    <div className="flex flex-col gap-16">
      <p className="m-0 text-11 font-semibold text-text-body uppercase">
        {t('analysis-results.companyCoverage.editArea.eyebrow')}
      </p>
      {selected.groups.map((group) => (
        <DimensionGroup
          key={group.dimension}
          companyId={selected.companyId}
          group={group}
          overrideFor={overrideFor}
          onValueChange={onValueChange}
        />
      ))}
      {selected.missing.length === 0 ? (
        <p className="m-0 rounded-md bg-status-success-bg p-12 text-small text-status-success-text">
          {t('analysis-results.companyCoverage.editArea.successBanner')}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <p className="m-0 rounded-md bg-status-danger-bg p-12 text-small text-status-danger-text">
            {'⚠ '}
            {t('analysis-results.companyCoverage.editArea.dangerBanner', {
              count: selected.missing.length,
              company: companyName,
            })}
          </p>
          <p className="m-0 text-11 font-semibold text-text-secondary uppercase">
            {t('analysis-results.companyCoverage.editArea.missingSection')}
          </p>
          {selected.missing.map((item) => (
            <MissingRow
              key={item.indicatorId}
              companyId={selected.companyId}
              item={item}
              overrideFor={overrideFor}
              onValueChange={onValueChange}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-12">
        {savedFlash ? (
          <span
            data-testid={companyCoverageTestIds.savedFlash}
            className="text-small-medium text-status-success-text"
          >
            {t('analysis-results.companyCoverage.editArea.changesSaved')}
          </span>
        ) : null}
        <Button
          variant="outline"
          testId={companyCoverageTestIds.cancel}
          onClick={onCancel}
          disabled={!hasStagedEdits}
        >
          {t('analysis-results.companyCoverage.editArea.cancelChanges')}
        </Button>
        <Button
          variant="primary"
          testId={companyCoverageTestIds.save}
          onClick={onSave}
          loading={saving}
          disabled={!hasStagedEdits}
        >
          {t('analysis-results.companyCoverage.editArea.saveChanges')}
        </Button>
      </div>
    </div>
  );
}

interface DimensionGroupProps {
  companyId: string;
  group: Group;
  overrideFor: (companyId: string, indicatorId: string) => ValueOverride | undefined;
  onValueChange: EditAreaProps['onValueChange'];
}

function DimensionGroup({ companyId, group, overrideFor, onValueChange }: DimensionGroupProps) {
  const t = useT();
  return (
    <div className="flex flex-col gap-10 rounded-md border border-border-default p-14">
      <div className="flex items-center gap-8">
        <span
          aria-hidden="true"
          className={cn('size-8 rounded-xs', DIMENSION_COLOR_CLASS[group.dimension])}
        />
        <span className="text-body-strong text-text-heading">
          {t(DIMENSION_LABEL_KEY[group.dimension])}
        </span>
        <span className="ml-auto text-body-strong text-text-heading">
          {formatPercent(group.totalPct, { decimals: 0 })}
        </span>
      </div>
      {group.items.map((item) => (
        <IndicatorRow
          key={item.indicatorId}
          companyId={companyId}
          item={item}
          overrideFor={overrideFor}
          onValueChange={onValueChange}
        />
      ))}
    </div>
  );
}

interface IndicatorRowProps {
  companyId: string;
  item: GroupItem;
  overrideFor: (companyId: string, indicatorId: string) => ValueOverride | undefined;
  onValueChange: EditAreaProps['onValueChange'];
}

function IndicatorRow({ companyId, item, overrideFor, onValueChange }: IndicatorRowProps) {
  const t = useT();
  const override = overrideFor(companyId, item.indicatorId);
  const value = override ? override.value : item.value;
  const isEstimate = override ? override.isEstimate : item.isEstimate;
  const justification = (override ? (override.justification ?? null) : item.justification) ?? null;
  const fallback = {
    value: item.value,
    isEstimate: item.isEstimate,
    justification: item.justification,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-10">
        <span className="min-w-0 flex-1 text-small text-text-body">{item.label}</span>
        <Chip
          variant="toggle"
          selected={isEstimate}
          data-testid={companyCoverageTestIds.estimateToggle(companyId, item.indicatorId)}
          className={
            isEstimate
              ? 'bg-status-warning-bg text-status-warning-text'
              : 'bg-status-success-bg text-status-success-text'
          }
          onPressedChange={(pressed) => {
            onValueChange(companyId, item.indicatorId, { isEstimate: pressed }, fallback);
          }}
        >
          {isEstimate
            ? t('analysis-results.companyCoverage.editArea.estimated')
            : t('analysis-results.companyCoverage.editArea.real')}
        </Chip>
        <NumberInput
          label={item.label}
          hideLabel
          value={value}
          step={1}
          size="sm"
          suffix="%"
          testId={companyCoverageTestIds.metaInput(companyId, item.indicatorId)}
          onValueChange={(next) => {
            onValueChange(companyId, item.indicatorId, { value: next }, fallback);
          }}
        />
      </div>
      {isEstimate ? (
        <TextField
          label={t('analysis-results.companyCoverage.editArea.justificationPlaceholder')}
          hideLabel
          variant="dashedEstimate"
          size="sm"
          value={justification ?? ''}
          placeholder={t('analysis-results.companyCoverage.editArea.justificationPlaceholder')}
          testId={companyCoverageTestIds.justificationInput(companyId, item.indicatorId)}
          onValueChange={(text) => {
            onValueChange(
              companyId,
              item.indicatorId,
              { justification: text === '' ? null : text },
              fallback,
            );
          }}
        />
      ) : null}
    </div>
  );
}

interface MissingRowProps {
  companyId: string;
  item: MissingItem;
  overrideFor: (companyId: string, indicatorId: string) => ValueOverride | undefined;
  onValueChange: EditAreaProps['onValueChange'];
}

function MissingRow({ companyId, item, overrideFor, onValueChange }: MissingRowProps) {
  const t = useT();
  const override = overrideFor(companyId, item.indicatorId);
  const value = override ? override.value : item.value;
  const fallback = { value: null, isEstimate: false, justification: null };
  return (
    <div className="flex items-center gap-10 rounded-sm border border-dashed border-status-warning-base bg-status-warning-bg p-8">
      <Badge kind="tbd">{t('analysis-results.companyCoverage.editArea.missingChip')}</Badge>
      <span className="min-w-0 flex-1 text-small text-text-body">{item.label}</span>
      <NumberInput
        label={item.label}
        hideLabel
        value={value}
        step={1}
        size="sm"
        suffix="%"
        testId={companyCoverageTestIds.missingInput(companyId, item.indicatorId)}
        onValueChange={(next) => {
          onValueChange(companyId, item.indicatorId, { value: next, isEstimate: false }, fallback);
        }}
      />
      <button
        type="button"
        aria-label={t('analysis-results.companyCoverage.editArea.missingClear', {
          indicator: item.label,
        })}
        data-testid={companyCoverageTestIds.missingClear(companyId, item.indicatorId)}
        onClick={() => {
          onValueChange(companyId, item.indicatorId, { value: null, isEstimate: false }, fallback);
        }}
        className="cursor-pointer rounded-sm px-4 text-13 text-text-secondary hover:text-status-danger-base"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
