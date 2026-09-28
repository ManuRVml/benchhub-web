import { useState } from 'react';

import { ExecutiveNarrativeModal } from '@/features/executive-narrative';
import { testId } from '@/shared/config/test-ids';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { maxAbs, RankingBarRow } from '@/shared/ui/charts/primitives';
import { Eyebrow, SectionCard } from '@/shared/ui/composites/section-card';
import { Button } from '@/shared/ui/primitives/button';
import { Chip } from '@/shared/ui/primitives/chip';
import { Select } from '@/shared/ui/primitives/inputs';

import type { BarTone } from '@/shared/ui/charts/primitives';

// SCR-08 module 5 "Comparador de Indicadores TBG" (S-TBG / S-ILP, gated), read-only slice (P5-45b): the two selects
// are presentational (props in, callback out — the widget does not own the fetch); editing the Ecopetrol value
// (C-06) is still out of scope. "Generar narrativa ejecutiva" (OVL-08) opens ExecutiveNarrativeModal directly
// (P5-43d) — not ExecutiveNarrativeButton, since this trigger is the spec's full-width primary Button, not an
// AiPill — only when `analysisId` is given; otherwise the button stays disabled (P5-42a/P5-43a convention). C-15's
// `section` enum (overview | performance | trends | recommendations) has no literal "TBG ranking/gap" value, so
// this uses `performance` (closest fit: an indicator's Ecopetrol-vs-benchmark performance) — flagged for PO
// confirmation, same as the other three widgets wired in this task.
//
// i18n: `analysis-results.tbgIndicatorComparator.*` already had a scaffolded shape (kpiTiles / ranking / gapAnalysis)
// predating this task — reused as-is; only the missing leaves were added (controls.indicatorLabel/scopeLabel,
// kpiTiles.position, ranking.tbgMemberMarker/notTbgMemberMarker — decorative marker-only variants of the existing
// tbgMember/notTbgMember, which bake the company name into the translated string and so can't be aria-hidden on
// their own — and gapAnalysis.narrativeButton).
//
// The spec's "Cmp:KpiStatCard (grey tile variant)" has no grey-background variant in the actual component (only a
// value-colour `tone`), so the 4 tiles here are a small local block matching KpiStatCard's shape but on
// `bg-surface-page` (the grey token) — building it inline rather than editing shared/ui, which is out of this
// task's file scope.
//
// Ranking bar tones (no hex, tailwind-theme.generated.ts token names): TBG members get `success`
// (`bg-status-success-base`), everyone else `peer` (`bg-chart-peer`, the standard neutral/grey bar tone), and
// Ecopetrol overrides both via `RankingBarRow`'s own `highlight="ecopetrol"` (defaults to the `highlight` tone plus
// the eco-chip row background) — no tone not already in `BAR_TONE_CLASS` was invented.

export interface TbgIndicatorComparatorOption {
  id: string;
  label: string;
}

export interface TbgIndicatorComparatorRankingRow {
  companyId: string;
  name: string;
  value: number;
  isTbgMember: boolean;
  isEcopetrol: boolean;
}

export interface TbgIndicatorComparatorTiles {
  ecopetrolValue: number;
  tbgAvg: number;
  gapPts: number;
  rank: number;
  of: number;
}

export interface TbgIndicatorComparatorMembership {
  /** Company ids inside the TBG (Top Benchmark Group); resolved to names via `ranking`. */
  inside: readonly string[];
  /** Company ids outside the TBG; resolved to names via `ranking`. */
  outside: readonly string[];
}

export interface TbgIndicatorComparatorProps {
  indicators: readonly TbgIndicatorComparatorOption[];
  scopes: readonly TbgIndicatorComparatorOption[];
  selectedIndicator: string;
  selectedScope: string;
  onIndicatorChange: (id: string) => void;
  onScopeChange: (id: string) => void;
  tiles: TbgIndicatorComparatorTiles;
  ranking: readonly TbgIndicatorComparatorRankingRow[];
  membership: TbgIndicatorComparatorMembership;
  gapToLeader: number;
  /** V-15 `indicator.unit`, e.g. `"%"`; anything else formats as a plain number. */
  unit: string;
  /** Given, the "Generar narrativa ejecutiva" button opens OVL-08 (C-15); omitted, it stays disabled. */
  analysisId?: string;
  testId?: string;
}

const SCOPE = 'tbg-indicator-comparator';
const NS = 'analysis-results.tbgIndicatorComparator';

/** `formatPercent` for `unit === '%'` (V-15), `formatNumber` otherwise. */
function formatByUnit(value: number, unit: string): string {
  return unit === '%' ? formatPercent(value) : formatNumber(value);
}

/** `-7 pts` / `7 pts` — a level, not a signed delta (OQ-38), so no forced "+"; the minus sign is Intl's own. */
function formatPts(value: number): string {
  // No fixed `decimals`: formatNumber's default (up to 2, no trailing zero) matches the spec captures verbatim —
  // "-7 pts" (Brecha, a whole number) and "-9,3 pts" (Distancia al líder, one decimal) — with a single helper.
  return `${formatNumber(value)} pts`;
}

function nameOf(ranking: readonly TbgIndicatorComparatorRankingRow[], companyId: string): string {
  return ranking.find((row) => row.companyId === companyId)?.name ?? companyId;
}

function toneOf(row: TbgIndicatorComparatorRankingRow): BarTone | undefined {
  if (row.isEcopetrol) return undefined;
  return row.isTbgMember ? 'success' : 'peer';
}

interface TileProps {
  label: string;
  value: string;
  toneClassName?: string | undefined;
  tileTestId: string;
}

function Tile({ label, value, toneClassName, tileTestId }: TileProps) {
  return (
    <div
      data-testid={tileTestId}
      className="flex flex-col gap-4 rounded-md bg-surface-page px-16 py-14"
    >
      <span
        data-testid={`${tileTestId}-value`}
        className={cn('text-kpi', toneClassName ?? 'text-text-heading')}
      >
        {value}
      </span>
      <span className="text-12 text-text-secondary">{label}</span>
    </div>
  );
}

export function TbgIndicatorComparator({
  indicators,
  scopes,
  selectedIndicator,
  selectedScope,
  onIndicatorChange,
  onScopeChange,
  tiles,
  ranking,
  membership,
  gapToLeader,
  unit,
  analysisId,
  testId: rootTestId = 'analysis-module-tbgIndicatorComparator',
}: TbgIndicatorComparatorProps) {
  const t = useT();
  const indicatorLabel = indicators.find((option) => option.id === selectedIndicator)?.label ?? '';
  const sortedRanking = [...ranking].sort((a, b) => b.value - a.value);
  const max = maxAbs(ranking.map((row) => row.value));
  const [narrativeOpen, setNarrativeOpen] = useState(false);

  return (
    <>
      <SectionCard title={t(`${NS}.title`)} subtitle={t(`${NS}.subtitle`)} testId={rootTestId}>
        <div className="flex flex-col gap-20">
          <div className="grid grid-cols-1 gap-12 tablet:grid-cols-2">
            <Select
              label={t(`${NS}.controls.indicatorLabel`)}
              hideLabel
              value={selectedIndicator}
              onValueChange={onIndicatorChange}
              options={indicators.map((option) => ({ value: option.id, label: option.label }))}
              testId={testId(SCOPE, 'select', 'indicator')}
            />
            <Select
              label={t(`${NS}.controls.scopeLabel`)}
              hideLabel
              value={selectedScope}
              onValueChange={onScopeChange}
              options={scopes.map((option) => ({ value: option.id, label: option.label }))}
              testId={testId(SCOPE, 'select', 'scope')}
            />
          </div>

          <div className="grid grid-cols-2 gap-12 tablet:grid-cols-4">
            <Tile
              tileTestId={testId(SCOPE, 'tile', 'ecopetrol-value')}
              label={t(`${NS}.kpiTiles.ecopetrol`, { indicator: indicatorLabel })}
              value={formatByUnit(tiles.ecopetrolValue, unit)}
            />
            <Tile
              tileTestId={testId(SCOPE, 'tile', 'tbg-avg')}
              label={t(`${NS}.kpiTiles.tbgAverage`)}
              value={formatByUnit(tiles.tbgAvg, unit)}
              toneClassName="text-status-success-text"
            />
            <Tile
              tileTestId={testId(SCOPE, 'tile', 'gap')}
              label={t(`${NS}.kpiTiles.gap`)}
              value={formatPts(tiles.gapPts)}
              toneClassName={tiles.gapPts < 0 ? 'text-status-danger-text' : undefined}
            />
            <Tile
              tileTestId={testId(SCOPE, 'tile', 'position')}
              label={t(`${NS}.kpiTiles.rankingPosition`)}
              value={t(`${NS}.kpiTiles.position`, { rank: tiles.rank, of: tiles.of })}
            />
          </div>

          <section>
            <h4 className="m-0 mb-12 text-body-strong text-text-heading">
              {t(`${NS}.ranking.title`)}
            </h4>
            <div className="flex flex-col gap-4">
              {sortedRanking.map((row, index) => {
                const tone = toneOf(row);
                return (
                  <RankingBarRow
                    key={row.companyId}
                    data-testid={testId(SCOPE, 'ranking-row', row.companyId)}
                    rank={index + 1}
                    label={row.name}
                    value={row.value}
                    max={max}
                    format={(value) => (value == null ? '' : formatByUnit(value, unit))}
                    {...(tone === undefined ? {} : { tone })}
                    {...(row.isEcopetrol ? { highlight: 'ecopetrol' as const } : {})}
                    {...(row.isEcopetrol ? { className: 'font-semibold' } : {})}
                  />
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="m-0 mb-12 text-body-strong text-text-heading">
              {t(`${NS}.ranking.inTbg`)}
            </h4>
            <div className="flex flex-col gap-12">
              <div>
                <Eyebrow className="mb-6 text-status-success-text">
                  {t(`${NS}.ranking.inTbgLabel`)}
                </Eyebrow>
                <div
                  role="list"
                  aria-label={t(`${NS}.ranking.inTbgLabel`)}
                  className="flex flex-wrap gap-8"
                >
                  {membership.inside.map((companyId) => (
                    <div key={companyId} role="listitem">
                      <Chip
                        variant="static"
                        className="bg-status-success-bg text-status-success-text"
                        data-testid={testId(SCOPE, 'membership-inside-chip', companyId)}
                      >
                        <span aria-hidden="true">{t(`${NS}.ranking.tbgMemberMarker`)}</span>
                        {nameOf(ranking, companyId)}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Eyebrow className="mb-6">{t(`${NS}.ranking.outTbgLabel`)}</Eyebrow>
                <div
                  role="list"
                  aria-label={t(`${NS}.ranking.outTbgLabel`)}
                  className="flex flex-wrap gap-8"
                >
                  {membership.outside.map((companyId) => (
                    <div key={companyId} role="listitem">
                      <Chip
                        variant="static"
                        data-testid={testId(SCOPE, 'membership-outside-chip', companyId)}
                      >
                        <span aria-hidden="true">{t(`${NS}.ranking.notTbgMemberMarker`)}</span>
                        {nameOf(ranking, companyId)}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="m-0 mb-12 text-body-strong text-text-heading">
              {t(`${NS}.gapAnalysis.title`)}
            </h4>
            <div className="flex flex-col gap-16">
              <div className="flex items-center justify-between">
                <span className="text-small text-text-secondary">
                  {t(`${NS}.gapAnalysis.toLeader`)}
                </span>
                <span
                  data-testid={testId(SCOPE, 'gap-to-leader', 'value')}
                  className={cn(
                    'font-mono text-body-strong',
                    gapToLeader < 0 ? 'text-status-danger-text' : 'text-text-heading',
                  )}
                >
                  {formatPts(gapToLeader)}
                </span>
              </div>
              <Button
                variant="primary"
                fullWidth
                disabled={analysisId === undefined}
                onClick={
                  analysisId === undefined
                    ? undefined
                    : () => {
                        setNarrativeOpen(true);
                      }
                }
                testId={testId(SCOPE, 'narrativa-button', 'trigger')}
              >
                {t(`${NS}.gapAnalysis.narrativeButton`)}
              </Button>
            </div>
          </section>
        </div>
      </SectionCard>
      {analysisId === undefined ? null : (
        <ExecutiveNarrativeModal
          open={narrativeOpen}
          onOpenChange={setNarrativeOpen}
          analysisId={analysisId}
          section="performance"
          title={t(`${NS}.title`)}
          testId={testId(SCOPE, 'narrativa-modal', 'root')}
        />
      )}
    </>
  );
}
