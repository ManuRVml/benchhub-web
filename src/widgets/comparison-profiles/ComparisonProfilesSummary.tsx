import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatDelta, formatNumber } from '@/shared/lib/format';
import { maxAbs, RankingBarRow } from '@/shared/ui/charts/primitives';
import { createDataTableColumnHelper, DataTable } from '@/shared/ui/table';

import { comparisonProfilesTestIds } from './test-ids';

import type { ReactNode } from 'react';

export interface ComparisonProfileRankingRow {
  companyId: string;
  name: string;
  score: number;
  isEcopetrol: boolean;
}

export interface ComparisonProfileResult {
  score: number;
  gapPts: number;
  position: number;
  of: number;
  peerAvg: number;
  ranking: readonly ComparisonProfileRankingRow[];
  insight: string;
}

export interface ComparisonProfileSummaryRow {
  profileId: string;
  name: string;
  subtitle: string;
  year: number;
  ecopetrolScore: number;
  peerAvg: number;
  gapPts: number;
  position: number;
  of: number;
  isActive: boolean;
}

export interface ComparisonProfilesSummaryProps {
  result: ComparisonProfileResult;
  summaryTable: readonly ComparisonProfileSummaryRow[];
  onSelectProfile: (profileId: string) => void;
}

/**
 * SCR-08 module 9 slice A: the active profile's right column (result KPI tiles, ranking, Yarbis note) and the
 * "Ecopetrol en cada perfil" summary table below it. Profile tabs/switching, the "Configuración del perfil" left
 * column and the "Generar narrativa ejecutiva" AI pill are out of scope (a later task composes them around this
 * widget). `DataTable` has no row-click slot, so every summary-table column wraps its cell in a button that reports
 * `onSelectProfile`.
 */
export function ComparisonProfilesSummary({
  result,
  summaryTable,
  onSelectProfile,
}: ComparisonProfilesSummaryProps) {
  const t = useT();
  const rankingMax = maxAbs(result.ranking.map((row) => row.score));

  const columnHelper = createDataTableColumnHelper<ComparisonProfileSummaryRow>();
  const selectCell = (row: ComparisonProfileSummaryRow, content: ReactNode, testId?: string) => (
    <button
      type="button"
      className="block w-full text-start"
      {...(testId ? { 'data-testid': testId } : {})}
      onClick={() => {
        onSelectProfile(row.profileId);
      }}
    >
      {content}
    </button>
  );

  const columns = [
    columnHelper.accessor('name', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.profile'),
      id: 'profile',
      meta: { width: 'minmax(160px, 2fr)', align: 'start', rowHeader: true },
      cell: ({ row }) =>
        selectCell(
          row.original,
          <span className="grid gap-2">
            <span className="text-small-strong text-text-heading">{row.original.name}</span>
            <span className="text-micro text-text-secondary">{row.original.subtitle}</span>
          </span>,
          comparisonProfilesTestIds.select(row.original.profileId),
        ),
    }),
    columnHelper.accessor('year', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.year'),
      id: 'year',
      meta: { width: '80px', align: 'end' },
      cell: ({ row }) => selectCell(row.original, row.original.year),
    }),
    columnHelper.accessor('ecopetrolScore', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.ecopetrol'),
      id: 'ecopetrolScore',
      meta: { width: '100px', align: 'end' },
      cell: ({ row }) =>
        selectCell(row.original, formatNumber(row.original.ecopetrolScore, { decimals: 1 })),
    }),
    columnHelper.accessor('peerAvg', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.peers'),
      id: 'peerAvg',
      meta: { width: '100px', align: 'end' },
      cell: ({ row }) =>
        selectCell(row.original, formatNumber(row.original.peerAvg, { decimals: 1 })),
    }),
    columnHelper.accessor('gapPts', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.gap'),
      id: 'gapPts',
      meta: { width: '110px', align: 'end' },
      cell: ({ row }) =>
        selectCell(
          row.original,
          <span className={row.original.gapPts < 0 ? 'text-status-danger-text' : undefined}>
            {formatDelta(row.original.gapPts, { unit: 'pts' })}
          </span>,
        ),
    }),
    columnHelper.accessor('position', {
      header: t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.columns.position'),
      id: 'position',
      meta: { width: '110px', align: 'end' },
      cell: ({ row }) =>
        selectCell(
          row.original,
          t('analysis-results.comparisonProfiles.result.positionValue', {
            position: row.original.position,
            of: row.original.of,
          }),
        ),
    }),
  ];

  const activeRowId = summaryTable.find((row) => row.isActive)?.profileId;

  return (
    <div data-testid={comparisonProfilesTestIds.root} className="grid gap-20">
      <div className="grid grid-cols-1 gap-12 tablet:grid-cols-3">
        <KpiTile
          testId={comparisonProfilesTestIds.kpiTile('score')}
          label={t('analysis-results.comparisonProfiles.result.kpis.score')}
          value={formatNumber(result.score, { decimals: 1 })}
        />
        <KpiTile
          testId={comparisonProfilesTestIds.kpiTile('gap')}
          label={t('analysis-results.comparisonProfiles.result.kpis.gap')}
          value={formatDelta(result.gapPts, { unit: 'pts' })}
          {...(result.gapPts < 0 ? { tone: 'danger' as const } : {})}
        />
        <KpiTile
          testId={comparisonProfilesTestIds.kpiTile('position')}
          label={t('analysis-results.comparisonProfiles.result.kpis.position')}
          value={t('analysis-results.comparisonProfiles.result.positionValue', {
            position: result.position,
            of: result.of,
          })}
        />
      </div>
      <div
        role="group"
        aria-label={t('analysis-results.comparisonProfiles.result.kpis.position')}
        data-testid={comparisonProfilesTestIds.ranking}
        className="grid gap-4"
      >
        {result.ranking.map((row, index) => (
          <RankingBarRow
            key={row.companyId}
            rank={index + 1}
            label={row.name}
            value={row.score}
            max={rankingMax}
            tone={row.isEcopetrol ? 'highlight' : 'peer'}
            {...(row.isEcopetrol ? { highlight: 'ecopetrol' } : {})}
            data-testid={comparisonProfilesTestIds.rankingRow(row.companyId)}
          />
        ))}
      </div>
      <div
        data-testid={comparisonProfilesTestIds.yarbisNote}
        className="flex items-start gap-10 rounded-card border border-ai-border bg-ai-bg px-16 py-14"
      >
        <span aria-hidden="true" className="text-16 text-ai-accent">
          ✦
        </span>
        <p className="text-13 text-ai-text">
          <strong>{t('analysis-results.comparisonProfiles.result.yarbisNote.prefix')} </strong>
          {result.insight}
        </p>
      </div>
      <DataTable
        caption={t('analysis-results.comparisonProfiles.ecopetrolInEachProfile.title')}
        getRowId={(row) => row.profileId}
        columns={columns}
        data={summaryTable}
        testId={comparisonProfilesTestIds.table}
        density="sm"
        {...(activeRowId ? { highlightedRowId: activeRowId } : {})}
      />
    </div>
  );
}

function KpiTile({
  testId,
  label,
  value,
  tone,
}: {
  testId: string;
  label: string;
  value: string;
  tone?: 'danger';
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-4 rounded-md border-2 border-border-default bg-surface-page p-14"
    >
      <span className="text-11 font-semibold text-text-secondary uppercase">{label}</span>
      <span
        className={cn(
          'text-24 font-bold',
          tone === 'danger' ? 'text-status-danger-text' : 'text-text-heading',
        )}
      >
        {value}
      </span>
    </div>
  );
}
