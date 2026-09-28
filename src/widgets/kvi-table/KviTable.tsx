import { useMemo, useState } from 'react';

import { useT } from '@/shared/i18n';
import { EMPTY, formatNumber, formatPercent } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/composites/empty-state';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { ChipGroup } from '@/shared/ui/primitives/chip';
import { NumberInput } from '@/shared/ui/primitives/inputs';
import { DataTable, createDataTableColumnHelper } from '@/shared/ui/table';

import { bandOf, calcPct, KVI_BAND_TO_COVERAGE } from './kvi-band';
import { KviTraceabilityModal } from './KviTraceabilityModal';
import { kviTableTestIds } from './test-ids';

import type { KviBand } from './kvi-band';
import type { ChipGroupItem } from '@/shared/ui/primitives/chip';
import type { KeyboardEvent } from 'react';

/** OVL-11 fields beyond what the row's own columns already carry (category, owner, unit). */
export interface KviTraceability {
  source: string;
  /** ISO date. */
  capturedAt: string;
}

/** A row of the SCR-11 KVI table (V-30). */
export interface KviTableRow {
  kviId: string;
  /** Display code shown next to the indicator name, e.g. "KVI-FCL". */
  code: string;
  /** Display text of the category cell and the filter chip's label. */
  category: string;
  /** Stable id the category filter (and its `categoria` URL param / V-30 `categories` query) actually matches on —
   * V-30's own lowercase slug (`financiero`/`mercado`/…), not `category`'s display text. */
  categoryId: string;
  /** Indicator name. */
  label: string;
  unit: string;
  weightPct: number | null;
  owner: string | null;
  meta: number | null;
  metaReto: number | null;
  /** Raw value; `null` on TBD rows. */
  real: number | null;
  /** Set only on the text-mode row (e.g. a credit rating): shown verbatim instead of `meta`. */
  metaText?: string;
  metaRetoText?: string;
  realText?: string;
  /** Uncapped, rounded; `null` on TBD rows. */
  resultPct: number | null;
  retoPct: number | null;
  resultBand: KviBand;
  retoBand: KviBand;
  /** No formula or data yet: Meta / Meta Reto are not editable and every value column shows the TBD marker. */
  isTbd: boolean;
  /** Fixed values (e.g. a rating): Meta / Meta Reto / Real show text instead of inputs. */
  isTextMode: boolean;
  /** Result = Meta/Real·100 instead of Real/Meta·100 (e.g. a debt ratio). */
  lowerIsBetter: boolean;
  /** Whether this row's Meta / Meta Reto render as `NumberInput`s (role permissions, snapshot not latest, …). */
  isEditable: boolean;
  traceability: KviTraceability;
}

export interface KviTargetsChange {
  kviId: string;
  meta: number;
  metaReto?: number;
}

export interface KviTableProps {
  rows: readonly KviTableRow[];
  /** Year shown in the "Meta {{year}}" / "Real {{year}}" column headers. */
  year: number;
  /** Called on commit (blur / Enter) with the row's current Meta / Meta Reto; the page persists it via `C-16`. */
  onTargetsChange: (change: KviTargetsChange) => void;
  /** Controlled category filter (e.g. the page's URL `categoria`); omit to let the table keep its own state. */
  categoryFilter?: readonly string[];
  onCategoryFilterChange?: (ids: string[]) => void;
  /** Controlled compliance filter (e.g. the page's URL `cumplimiento`); omit to let the table keep its own state. */
  complianceFilter?: readonly string[];
  onComplianceFilterChange?: (ids: string[]) => void;
}

const kviCol = createDataTableColumnHelper<KviTableRow>();

/** Applies `patch` to `row` and recomputes its result % and band client-side (see `kvi-band.ts`). */
function recomputeRow(row: KviTableRow, patch: { meta?: number; metaReto?: number }): KviTableRow {
  const meta = patch.meta ?? row.meta;
  const metaReto = patch.metaReto ?? row.metaReto;
  if (row.real === null || meta === null) return { ...row, meta, metaReto };
  const resultPct = calcPct(row.real, meta, row.lowerIsBetter);
  const retoPct = metaReto === null ? row.retoPct : calcPct(row.real, metaReto, row.lowerIsBetter);
  return {
    ...row,
    meta,
    metaReto,
    resultPct,
    resultBand: bandOf(resultPct),
    retoPct,
    retoBand: bandOf(retoPct),
  };
}

function BandChip({ pct, band, testId }: { pct: number | null; band: KviBand; testId: string }) {
  const t = useT();
  if (band === 'tbd') {
    return (
      <Badge kind="tbd" data-testid={testId}>
        {t('value-monitor.banners.tbd')}
      </Badge>
    );
  }
  return (
    <Badge kind="coverage" coverage={KVI_BAND_TO_COVERAGE[band]} data-testid={testId}>
      {formatPercent(pct, { decimals: 0 })}
    </Badge>
  );
}

/**
 * SCR-11 "Monitor de Valor Grupo Ecopetrol · KVIs" table: category / compliance filters (client-side, ANDed across
 * groups, ORed within one), inline Meta / Meta Reto editing with a live result recompute, and the OVL-11
 * traceability modal. Presentational: `rows` in, `onTargetsChange` out on commit — the page (P5-50) reads and
 * persists the edited targets.
 */
export function KviTable({
  rows,
  year,
  onTargetsChange,
  categoryFilter: categoryFilterProp,
  onCategoryFilterChange,
  complianceFilter: complianceFilterProp,
  onComplianceFilterChange,
}: KviTableProps) {
  const t = useT();
  const [overrides, setOverrides] = useState<Record<string, KviTableRow>>({});
  const [innerCategoryFilter, setInnerCategoryFilter] = useState<readonly string[]>([]);
  const [innerComplianceFilter, setInnerComplianceFilter] = useState<readonly string[]>([]);
  const categoryFilter = categoryFilterProp ?? innerCategoryFilter;
  const complianceFilter = complianceFilterProp ?? innerComplianceFilter;
  const setCategoryFilter = (ids: string[]) => {
    if (categoryFilterProp === undefined) setInnerCategoryFilter(ids);
    onCategoryFilterChange?.(ids);
  };
  const setComplianceFilter = (ids: string[]) => {
    if (complianceFilterProp === undefined) setInnerComplianceFilter(ids);
    onComplianceFilterChange?.(ids);
  };
  const [selectedKviId, setSelectedKviId] = useState<string | null>(null);

  const displayRows = rows.map((row) => overrides[row.kviId] ?? row);

  const categoryItems = useMemo<ChipGroupItem[]>(() => {
    const seen = new Set<string>();
    const items: ChipGroupItem[] = [];
    for (const row of rows) {
      if (seen.has(row.categoryId)) continue;
      seen.add(row.categoryId);
      items.push({ id: row.categoryId, label: row.category });
    }
    return items;
  }, [rows]);

  const complianceItems: ChipGroupItem[] = [
    { id: 'ok', label: t('value-monitor.band.ok') },
    { id: 'watch', label: t('value-monitor.band.watch') },
    { id: 'risk', label: t('value-monitor.band.risk') },
    { id: 'tbd', label: t('value-monitor.banners.tbd') },
  ];

  const filteredRows = displayRows.filter(
    (row) =>
      (categoryFilter.length === 0 || categoryFilter.includes(row.categoryId)) &&
      (complianceFilter.length === 0 || complianceFilter.includes(row.resultBand)),
  );

  const clearFilters = () => {
    setCategoryFilter([]);
    setComplianceFilter([]);
  };

  // Only a row the user actually touched (has a local override) is committed; an unedited blur — tabbing through the
  // row, or an emptied field that was ignored — sends nothing.
  const commitTargets = (row: KviTableRow) => {
    if (!(row.kviId in overrides) || row.meta === null) return;
    onTargetsChange({
      kviId: row.kviId,
      meta: row.meta,
      ...(row.metaReto === null ? {} : { metaReto: row.metaReto }),
    });
  };

  const onEnterCommit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  const columns = [
    kviCol.accessor('category', {
      header: () => t('value-monitor.kviTable.columnCategory'),
      meta: { width: 'minmax(110px, 1fr)' },
      cell: (info) => (
        <span className="text-body-strong text-text-secondary">{info.getValue()}</span>
      ),
    }),
    kviCol.accessor('label', {
      header: () => t('value-monitor.kviTable.columnIndicator'),
      meta: { rowHeader: true, width: 'minmax(220px, 2.2fr)' },
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="flex flex-wrap items-baseline gap-6">
            <Button
              variant="link"
              size="sm"
              className="px-0 py-0 text-start font-normal text-text-body"
              testId={kviTableTestIds.indicator(row.kviId)}
              onClick={() => {
                setSelectedKviId(row.kviId);
              }}
            >
              {info.getValue()}
            </Button>
            <span className="font-mono text-12 text-text-secondary">{row.code}</span>
          </span>
        );
      },
    }),
    kviCol.accessor('unit', {
      header: () => t('value-monitor.kviTable.columnUnit'),
      meta: { width: 'minmax(80px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    kviCol.accessor('weightPct', {
      header: () => t('value-monitor.kviTable.columnWeight'),
      meta: { width: '80px', align: 'end' },
      cell: (info) => (
        <span className="text-text-secondary">
          {formatPercent(info.getValue(), { decimals: 0 })}
        </span>
      ),
    }),
    kviCol.accessor('owner', {
      header: () => t('value-monitor.kviTable.columnOwner'),
      meta: { width: 'minmax(130px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{info.getValue() ?? EMPTY}</span>,
    }),
    kviCol.display({
      id: 'meta',
      header: () => t('value-monitor.kviTable.columnMeta', { year }),
      meta: { width: '110px', align: 'end' },
      cell: ({ row }) => {
        const data = row.original;
        if (data.isTbd)
          return <span className="text-text-secondary">{t('value-monitor.banners.tbd')}</span>;
        if (data.isTextMode) {
          return (
            <span className="font-mono text-mono-input text-text-heading">{data.metaText}</span>
          );
        }
        if (!data.isEditable) {
          return (
            <span className="font-mono text-mono-input text-text-heading">
              {formatNumber(data.meta, { decimals: 2 })}
            </span>
          );
        }
        return (
          <NumberInput
            label={t('value-monitor.kviTable.columnMeta', { year })}
            hideLabel
            value={data.meta}
            step={0.01}
            testId={kviTableTestIds.metaInput(data.kviId)}
            onValueChange={(value) => {
              if (value === null) return;
              setOverrides((previous) => ({
                ...previous,
                [data.kviId]: recomputeRow(data, { meta: value }),
              }));
            }}
            onBlur={() => {
              commitTargets(data);
            }}
            onKeyDown={onEnterCommit}
          />
        );
      },
    }),
    kviCol.display({
      id: 'metaReto',
      header: () => t('value-monitor.kviTable.columnMetaReto'),
      meta: { width: '110px', align: 'end' },
      cell: ({ row }) => {
        const data = row.original;
        if (data.isTbd)
          return <span className="text-text-secondary">{t('value-monitor.banners.tbd')}</span>;
        if (data.isTextMode) {
          return (
            <span className="font-mono text-mono-input text-text-heading">{data.metaRetoText}</span>
          );
        }
        if (!data.isEditable) {
          return (
            <span className="font-mono text-mono-input text-text-heading">
              {formatNumber(data.metaReto, { decimals: 2 })}
            </span>
          );
        }
        return (
          <NumberInput
            label={t('value-monitor.kviTable.columnMetaReto')}
            hideLabel
            value={data.metaReto}
            step={0.01}
            testId={kviTableTestIds.metaRetoInput(data.kviId)}
            onValueChange={(value) => {
              if (value === null) return;
              setOverrides((previous) => ({
                ...previous,
                [data.kviId]: recomputeRow(data, { metaReto: value }),
              }));
            }}
            onBlur={() => {
              commitTargets(data);
            }}
            onKeyDown={onEnterCommit}
          />
        );
      },
    }),
    kviCol.display({
      id: 'real',
      header: () => t('value-monitor.kviTable.columnReal', { year }),
      meta: { width: '100px', align: 'end' },
      cell: ({ row }) => {
        const data = row.original;
        const text = data.isTbd
          ? t('value-monitor.banners.tbd')
          : data.isTextMode
            ? (data.realText ?? EMPTY)
            : data.unit === '%'
              ? formatPercent(data.real)
              : formatNumber(data.real, { decimals: 2 });
        return <span className="font-mono text-mono-input text-text-heading">{text}</span>;
      },
    }),
    kviCol.display({
      id: 'resultPct',
      header: () => t('value-monitor.kviTable.columnResultMonitor'),
      meta: { width: '130px', align: 'end' },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <BandChip
            pct={data.resultPct}
            band={data.isTbd ? 'tbd' : data.resultBand}
            testId={kviTableTestIds.resultChip(data.kviId)}
          />
        );
      },
    }),
    kviCol.display({
      id: 'retoPct',
      header: () => t('value-monitor.kviTable.columnResultReto'),
      meta: { width: '120px', align: 'end' },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <BandChip
            pct={data.retoPct}
            band={data.isTbd ? 'tbd' : data.retoBand}
            testId={kviTableTestIds.retoChip(data.kviId)}
          />
        );
      },
    }),
  ];

  const selectedRow =
    selectedKviId === null
      ? null
      : (displayRows.find((row) => row.kviId === selectedKviId) ?? null);

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap gap-24">
        <div className="flex flex-col gap-8" data-testid={kviTableTestIds.categoryFilter}>
          <span className="text-eyebrow text-text-secondary uppercase">
            {t('value-monitor.kviTable.filters.category')}
          </span>
          <ChipGroup
            items={categoryItems}
            mode="multi"
            value={categoryFilter}
            onChange={setCategoryFilter}
            aria-label={t('value-monitor.kviTable.filters.category')}
            testIds={{ scope: 'kvi-table', component: 'category-filter' }}
          />
        </div>
        <div className="flex flex-col gap-8" data-testid={kviTableTestIds.complianceFilter}>
          <span className="text-eyebrow text-text-secondary uppercase">
            {t('value-monitor.kviTable.filters.compliance')}
          </span>
          <ChipGroup
            items={complianceItems}
            mode="multi"
            value={complianceFilter}
            onChange={setComplianceFilter}
            aria-label={t('value-monitor.kviTable.filters.compliance')}
            testIds={{ scope: 'kvi-table', component: 'compliance-filter' }}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredRows}
        caption={t('value-monitor.kviTable.title')}
        getRowId={(row) => row.kviId}
        getRowLabel={(row) => row.label}
        emptyState={
          <EmptyState
            title={t('value-monitor.empty.noKVIFilters')}
            action={{ label: t('value-monitor.empty.clearFilters'), onClick: clearFilters }}
            variant="block"
            testId={`${kviTableTestIds.table}-empty-state`}
          />
        }
        minWidth="1080px"
        testId={kviTableTestIds.table}
      />
      <KviTraceabilityModal
        row={selectedRow}
        onOpenChange={(open) => {
          if (!open) setSelectedKviId(null);
        }}
      />
    </div>
  );
}
