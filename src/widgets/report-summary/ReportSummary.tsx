import { useCallback, useMemo, useState } from 'react';

import { ExecutiveNarrativeButton } from '@/features/executive-narrative';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SpreadsheetIcon } from '@/shared/ui/icons';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { ChipGroup } from '@/shared/ui/primitives/chip';
import { DataTable, createDataTableColumnHelper } from '@/shared/ui/table';

import { reportSummaryTestIds } from './test-ids';

import type { ReportSummaryRow } from './types';

/**
 * Build category items from rows (distinct category values in first-appearance order).
 */
const buildCategoryItems = (rows: readonly ReportSummaryRow[]) => {
  const categories = [...new Set(rows.map((r) => r.category))];
  return categories.map((c) => ({ id: c, label: c }));
};

export interface ReportSummaryProps {
  rows: readonly ReportSummaryRow[];
  onValueChange: (rowId: string, field: 'geValue' | 'peerAvg', value: number | null) => void;
  onExport: () => void;
  exporting: boolean;
  /** Given, the "Narrativa" pill opens OVL-08 (C-15, section `overview`); omitted, it stays disabled. */
  analysisId?: string;
}

/**
 * "Resumen del informe" table widget (SCR-08 module 10, slice A): presentational table with tier dots,
 * category filter chips, editable GE/Promedio cells with 500ms debounce, and Excel export.
 *
 * The AI pill opens the OVL-08 executive-narrative modal (P5-43d) when `analysisId` is given; otherwise it stays a
 * disabled placeholder. C-15's section enum has no literal "resumen" value (overview | performance | trends |
 * recommendations) — `overview` is the closest fit for a whole-report summary, flagged for PO confirmation.
 */
export function ReportSummary({
  rows,
  onValueChange,
  onExport,
  exporting,
  analysisId,
}: ReportSummaryProps) {
  const t = useT();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Build category items from rows (distinct category values in first-appearance order)
  const categoryItems = useMemo(() => buildCategoryItems(rows), [rows]);

  // Filter rows by selected categories; empty selection = show all
  const filteredRows = useMemo(() => {
    if (selectedCategories.length === 0) return rows;
    return rows.filter((row) => selectedCategories.includes(row.category));
  }, [rows, selectedCategories]);

  // Debounce timer ids per cell
  const timers = useMemo(
    () => ({ ge: new Map<string, number>(), peerAvg: new Map<string, number>() }),
    [],
  );

  const handleGeChange = useCallback(
    (rowId: string, value: number | null) => {
      // Clear existing timer for this cell
      if (timers.ge.has(rowId)) {
        window.clearTimeout(timers.ge.get(rowId));
        timers.ge.delete(rowId);
      }

      // If value is null (cleared), call immediately
      if (value === null) {
        onValueChange(rowId, 'geValue', null);
        return;
      }

      // Set 500ms debounce timer
      const timerId = window.setTimeout(() => {
        onValueChange(rowId, 'geValue', value);
        timers.ge.delete(rowId);
      }, 500);

      timers.ge.set(rowId, timerId);
    },
    [timers, onValueChange],
  );

  const handlePeerAvgChange = useCallback(
    (rowId: string, value: number | null) => {
      // Clear existing timer for this cell
      if (timers.peerAvg.has(rowId)) {
        window.clearTimeout(timers.peerAvg.get(rowId));
        timers.peerAvg.delete(rowId);
      }

      // If value is null (cleared), call immediately
      if (value === null) {
        onValueChange(rowId, 'peerAvg', null);
        return;
      }

      // Set 500ms debounce timer
      const timerId = window.setTimeout(() => {
        onValueChange(rowId, 'peerAvg', value);
        timers.peerAvg.delete(rowId);
      }, 500);

      timers.peerAvg.set(rowId, timerId);
    },
    [timers, onValueChange],
  );

  // Column definitions
  const columnHelper = createDataTableColumnHelper<ReportSummaryRow>();

  const columns = [
    columnHelper.accessor('category', {
      header: t('analysis-results.reportSummary.tableHeaders.category'),
      id: 'category',
      meta: { width: 'minmax(140px, 1fr)', align: 'start', rowHeader: true },
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block size-4 rounded-full',
              getValue() === 'Rentabilidad'
                ? 'bg-tier-1-card'
                : getValue() === 'Liquidez'
                  ? 'bg-tier-2-card'
                  : getValue() === 'Operacional'
                    ? 'bg-tier-3-card'
                    : getValue() === 'Competitividad OPEX'
                      ? 'bg-tier-4-card'
                      : getValue() === 'Solvencia'
                        ? 'bg-tier-5-card'
                        : 'bg-tier-6-card',
            )}
          />
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('kpi', {
      header: t('analysis-results.reportSummary.tableHeaders.kpi'),
      id: 'kpi',
      meta: { width: 'minmax(200px, 2fr)', align: 'start', rowHeader: true },
    }),
    columnHelper.accessor('unit', {
      header: 'Unidad',
      id: 'unit',
      meta: { width: '80px', align: 'start' },
      cell: ({ getValue }) => getValue(),
    }),
    columnHelper.accessor('geValue', {
      header: t('analysis-results.reportSummary.tableHeaders.geValue'),
      id: 'geValue',
      meta: { width: '140px', align: 'end' },
      cell: ({ getValue, row }) => (
        <input
          type="number"
          value={getValue()}
          onChange={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value);
            handleGeChange(row.original.rowId, val);
          }}
          aria-label={`${row.original.kpi} · ${t('analysis-results.reportSummary.tableHeaders.geValue')}`}
          className="rounded-input w-full border border-border-default bg-surface-page px-10 py-8 text-right text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          min="0"
          step="0.01"
        />
      ),
    }),
    columnHelper.accessor('peerAvg', {
      header: t('analysis-results.reportSummary.tableHeaders.peerAverage'),
      id: 'peerAvg',
      meta: { width: '140px', align: 'end' },
      cell: ({ getValue, row }) => (
        <input
          type="number"
          value={getValue()}
          onChange={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value);
            handlePeerAvgChange(row.original.rowId, val);
          }}
          aria-label={`${row.original.kpi} · ${t('analysis-results.reportSummary.tableHeaders.peerAverage')}`}
          className="rounded-input w-full border border-border-default bg-surface-page px-10 py-8 text-right text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          min="0"
          step="0.01"
        />
      ),
    }),
  ];

  return (
    <SectionCard
      padding="prototype"
      title={t('analysis-results.reportSummary.title')}
      subtitle={t('analysis-results.reportSummary.info')}
      info={t('analysis-results.reportSummary.info')}
      actions={
        analysisId === undefined ? (
          <AiPill disabled size="sm" testId={reportSummaryTestIds.aiPill}>
            {t('analysis-results.actionRow.aiPill.narrative')}
          </AiPill>
        ) : (
          <ExecutiveNarrativeButton
            analysisId={analysisId}
            section="overview"
            title={t('analysis-results.reportSummary.title')}
            testId={reportSummaryTestIds.aiPill}
          />
        )
      }
      testId={reportSummaryTestIds.root}
      className="mt-16"
    >
      {/* Category filter chips */}
      <div className="mb-12">
        <ChipGroup
          items={categoryItems}
          mode="multi"
          value={selectedCategories}
          onChange={setSelectedCategories}
          aria-label={t('analysis-results.reportSummary.filterLabel')}
        />
      </div>

      {/* Export button */}
      <div className="mb-12 flex items-center gap-8">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          data-testid={reportSummaryTestIds.exportButton}
          className={cn(
            'inline-flex items-center gap-4 rounded-control px-12 py-8 text-sm font-medium transition-colors',
            exporting
              ? 'cursor-not-allowed border border-border-default bg-surface-page text-text-secondary'
              : 'border border-border-default bg-transparent text-text-heading hover:bg-surface-page',
          )}
        >
          <SpreadsheetIcon className="size-16" />
          {t('analysis-results.reportSummary.excelButton')}
        </button>
      </div>

      {/* Exporting band */}
      {exporting && (
        <div
          className="bg-overlay-dim fixed inset-x-0 top-0 z-50 flex items-center justify-center py-12"
          data-testid={reportSummaryTestIds.exportingBand}
        >
          <div className="shadow-lg rounded-card border border-border-default bg-surface-card px-20 py-12">
            <p className="text-text-heading">
              {t('analysis-results.reportSummary.exportFeedback')}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        caption={t('analysis-results.reportSummary.title')}
        getRowId={(row) => row.rowId}
        columns={columns}
        data={filteredRows}
        testId={reportSummaryTestIds.table}
        density="sm"
        maxHeight="480px"
      />
    </SectionCard>
  );
}
