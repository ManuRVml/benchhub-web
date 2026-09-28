import { flexRender, useTable } from '@tanstack/react-table';
import { Fragment, useId, useMemo, useState } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { ArrowDownIcon, ArrowUpIcon } from '@/shared/ui/icons';

import { dataTableFeatures } from './data-table-features';
import { DataTableScopeContext, detailRowId } from './data-table-scope';
import { dataTableTestIds } from './test-ids';

import type {
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableFeatures,
  DataTableSorting,
} from './data-table-features';
import type { DataTableScope } from './data-table-scope';
import type { ExpandedState, Header, RowData, Updater } from '@tanstack/react-table';
import type { CSSProperties, ReactNode } from 'react';

export type DataTableDensity = 'sm' | 'md';

export interface DataTableProps<T extends RowData> {
  /** Column definitions (build them with `createDataTableColumnHelper<T>()`); headers are translated by the caller. */
  columns: DataTableColumnDef<T>[];
  data: readonly T[];
  /** Table name, already translated: rendered as `<caption>` and naming the scroll region. */
  caption: string;
  /** Shows the caption above the table; by default it is visually hidden (the card title usually says it). */
  captionVisible?: boolean;
  /** Stable row id (entity id, never the index): keys the rows, the expanded state and the test ids. */
  getRowId: (row: T, index: number) => string;
  /** Controlled sort state; pair with `onSortingChange`. Omit it to let the table keep its own state. */
  sorting?: DataTableSorting;
  /** Initial sort state when uncontrolled. */
  defaultSorting?: DataTableSorting;
  /** Called with the next sort state; clicking a sortable header cycles none → ascending → descending → none. */
  onSortingChange?: (sorting: DataTableSorting) => void;
  /** Detail row under an expanded row (full width). Adds a leading toggle column unless `expandToggle="inline"`. */
  renderExpanded?: (row: T) => ReactNode;
  /**
   * Where the expand toggle lives: `column` (default) a leading "›" column; `inline` no extra column, a cell renders
   * `DataTableRowInfoToggle` (the blue "(i)" after the analysis name, SCR-06 prototype L425-L427).
   */
  expandToggle?: 'column' | 'inline';
  /** Which rows have a detail row; default every row when `renderExpanded` is set. */
  getRowCanExpand?: (row: T) => boolean;
  /** Names the row in its toggle ("Detalle de {label}"); default the 1-based row position. */
  getRowLabel?: (row: T) => string;
  /** Opening a row closes the others (SCR-06: one description open at a time). */
  singleExpand?: boolean;
  /** Row ids expanded on mount. */
  defaultExpanded?: Record<string, boolean>;
  /** Content of the single row shown when `data` is empty; default `common.section.empty`. */
  emptyState?: ReactNode;
  /** Header row sticks to the top of the scroll container (set `maxHeight` so the container scrolls vertically). */
  stickyHeader?: boolean;
  /** CSS max-height of the scroll container, e.g. `"480px"`. */
  maxHeight?: string;
  /** Minimum table width; narrower containers scroll horizontally (SCR-11 KVI table: `"1080px"`). The table is
   * also never narrower than the sum of the column tracks' minimums. */
  minWidth?: string;
  /** Row and header padding: `md` 12 / 10 × 20px (default), `sm` 8 × 12px. */
  density?: DataTableDensity;
  /**
   * The scroll region is a tab stop (default) so keyboard users can scroll it; pass `false` only for a table that can
   * never overflow its container.
   */
  scrollFocusable?: boolean;
  /** Row drawn with the highlight background (active profile). */
  highlightedRowId?: string;
  /** `data-testid` of the scroll container and prefix of the row ids (see `dataTableTestIds`). */
  testId?: string;
  className?: string;
}

const EXPAND_COLUMN_ID = '__expand';
const EXPAND_COLUMN_WIDTH = '44px';
const DEFAULT_TRACK = 'minmax(0, 1fr)';

const ALIGN_CLASS: Record<NonNullable<DataTableColumnMeta['align']>, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

const HEADER_PADDING: Record<DataTableDensity, string> = { sm: 'px-12 py-8', md: 'px-20 py-10' };
const CELL_PADDING: Record<DataTableDensity, string> = { sm: 'px-12 py-8', md: 'px-20 py-12' };

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

function applyUpdater<S>(updater: Updater<S>, previous: S): S {
  return typeof updater === 'function' ? (updater as (old: S) => S)(previous) : updater;
}

/** In single mode keeps only the row that was just opened. */
function nextExpanded(
  previous: ExpandedState,
  next: ExpandedState,
  single: boolean,
): ExpandedState {
  if (!single || next === true) return next;
  const opened = Object.keys(next).filter((id) => next[id] && (previous === true || !previous[id]));
  const [only] = opened;
  return opened.length === 1 && only !== undefined ? { [only]: true } : next;
}

/**
 * Data table (catalogue "DataTable"; SCR-06 analyses list, SCR-08 report summary, SCR-11 KVI table) on TanStack
 * Table. A real `<table>` with a `<caption>`, `<th scope="col">` headers and `<th scope="row">` cells for columns
 * marked `meta.rowHeader`. Each row is a CSS grid whose template comes from the columns' `meta.width`, so header,
 * rows and detail rows line up without `table-layout`. Sortable headers (`enableSorting: true`) are buttons and their
 * `<th>` carries `aria-sort`; expand toggles are buttons with `aria-expanded` + `aria-controls` pointing at the detail
 * row. The table sits in a focusable, named scroll region so keyboard users can scroll it horizontally.
 */
export function DataTable<T extends RowData>({
  columns,
  data,
  caption,
  captionVisible = false,
  getRowId,
  sorting,
  defaultSorting,
  onSortingChange,
  renderExpanded,
  expandToggle = 'column',
  getRowCanExpand,
  getRowLabel,
  singleExpand = false,
  defaultExpanded,
  emptyState,
  stickyHeader = false,
  maxHeight,
  minWidth,
  density = 'md',
  scrollFocusable = true,
  highlightedRowId,
  testId,
  className,
}: DataTableProps<T>) {
  const t = useT();
  const idPrefix = useId();
  const captionId = `${idPrefix}-caption`;
  const detailId = (rowId: string) => detailRowId(idPrefix, rowId);

  const [innerSorting, setInnerSorting] = useState<DataTableSorting>(defaultSorting ?? []);
  const sortingState = sorting ?? innerSorting;
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpanded ?? {});

  const expandable = renderExpanded !== undefined;
  const allColumns = useMemo<DataTableColumnDef<T>[]>(() => {
    if (!expandable || expandToggle === 'inline') return columns;
    const toggleColumn: DataTableColumnDef<T> = {
      id: EXPAND_COLUMN_ID,
      enableSorting: false,
      meta: { width: EXPAND_COLUMN_WIDTH, align: 'center' },
      header: () => <span className="sr-only">{t('common.a11y.rowDetailsColumn')}</span>,
      cell: ({ row }) => {
        if (!row.getCanExpand()) return null;
        const isExpanded = row.getIsExpanded();
        const label = getRowLabel?.(row.original) ?? String(row.index + 1);
        return (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={detailRowId(idPrefix, row.id)}
            aria-label={t('common.a11y.rowDetails', { label })}
            onClick={row.getToggleExpandedHandler()}
            {...(testId ? { 'data-testid': dataTableTestIds.expand(testId, row.id) } : {})}
            className="inline-flex size-24 cursor-pointer items-center justify-center rounded-control text-text-secondary hover:bg-surface-page hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <span
              aria-hidden="true"
              className={cn('text-16 leading-none transition-transform', isExpanded && 'rotate-90')}
            >
              ›
            </span>
          </button>
        );
      },
    };
    return [toggleColumn, ...columns];
  }, [columns, expandable, expandToggle, getRowLabel, idPrefix, t, testId]);
  const scope = useMemo<DataTableScope>(
    () => (testId === undefined ? { idPrefix } : { idPrefix, testId }),
    [idPrefix, testId],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId: (row, index) => getRowId(row, index),
    defaultColumn: { enableSorting: false },
    sortDescFirst: false,
    enableExpanding: expandable,
    getRowCanExpand: (row) => expandable && (getRowCanExpand?.(row.original) ?? true),
    state: { sorting: sortingState, expanded },
    onSortingChange: (updater) => {
      const next = applyUpdater(updater, sortingState);
      if (sorting === undefined) setInnerSorting(next);
      onSortingChange?.(next);
    },
    onExpandedChange: (updater) => {
      setExpanded((previous) =>
        nextExpanded(previous, applyUpdater(updater, previous), singleExpand),
      );
    },
  });

  const leafColumns = table.getAllLeafColumns();
  const rowTemplate: CSSProperties = {
    gridTemplateColumns: leafColumns
      .map((column) => column.columnDef.meta?.width ?? DEFAULT_TRACK)
      .join(' '),
  };
  const rows = table.getRowModel().rows;
  // The region is a tab stop so keyboard users can scroll an overflowing table (WCAG 2.1.1, axe
  // scrollable-region-focusable). Spread because jsx-a11y/no-noninteractive-tabindex only exempts `tabpanel`, and a
  // disable directive would break `check:architecture`, whose config does not load jsx-a11y.
  const scrollRegionProps = scrollFocusable ? { tabIndex: 0 } : {};

  return (
    <DataTableScopeContext value={scope}>
      <div
        role="region"
        aria-labelledby={captionId}
        {...scrollRegionProps}
        data-testid={testId}
        style={maxHeight ? { maxHeight } : undefined}
        className={cn(
          'overflow-auto rounded-card border border-border-default bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          className,
        )}
      >
        {/* min-content: the table never gets narrower than the sum of the column minimums, so rows paint full width. */}
        <table
          className="block w-full min-w-min border-collapse"
          style={minWidth ? { width: `max(100%, ${minWidth})` } : undefined}
        >
          <caption
            id={captionId}
            className={
              captionVisible
                ? 'block px-20 pt-14 pb-8 text-start text-title-card-sm text-text-heading'
                : 'sr-only'
            }
          >
            {caption}
          </caption>
          <thead
            className={cn(
              'block border-b border-border-default bg-surface-page',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="grid" style={rowTemplate}>
                {headerGroup.headers.map((header) => (
                  <HeaderCell key={header.id} header={header} density={density} />
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="block">
            {rows.length === 0 ? (
              <tr className="grid">
                <td
                  {...(testId ? { 'data-testid': dataTableTestIds.empty(testId) } : {})}
                  className={cn(
                    'col-span-full text-center text-body text-text-secondary',
                    CELL_PADDING[density],
                  )}
                >
                  {emptyState ?? t('common.section.empty')}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const canExpand = row.getCanExpand();
                const isExpanded = canExpand && row.getIsExpanded();
                return (
                  <Fragment key={row.id}>
                    <tr
                      data-row-id={row.id}
                      {...(testId ? { 'data-testid': dataTableTestIds.row(testId, row.id) } : {})}
                      {...(row.id === highlightedRowId ? { 'data-highlighted': true } : {})}
                      style={rowTemplate}
                      className={cn(
                        'grid border-b border-border-subtle transition-colors hover:bg-brand-primary-faint',
                        row.id === highlightedRowId && 'bg-brand-primary-faint',
                      )}
                    >
                      {row.getAllCells().map((cell) => {
                        const meta = cell.column.columnDef.meta;
                        const cellClass = cn(
                          'min-w-0 self-center text-body font-normal text-text-body',
                          ALIGN_CLASS[meta?.align ?? 'start'],
                          cell.column.id === EXPAND_COLUMN_ID ? 'px-8 py-4' : CELL_PADDING[density],
                        );
                        const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                        return meta?.rowHeader ? (
                          <th key={cell.id} scope="row" className={cellClass}>
                            {content}
                          </th>
                        ) : (
                          <td key={cell.id} className={cellClass}>
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                    {canExpand ? (
                      <tr
                        id={detailId(row.id)}

                        hidden={!isExpanded}
                        {...(testId
                          ? { 'data-testid': dataTableTestIds.detail(testId, row.id) }
                          : {})}
                        className="grid border-b border-border-default bg-surface-page"
                      >
                        <td
                          className={cn(
                            'col-span-full text-small text-text-body',
                            CELL_PADDING[density],
                          )}
                        >
                          {isExpanded ? renderExpanded?.(row.original) : null}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </DataTableScopeContext>
  );
}

interface HeaderCellProps<T extends RowData> {
  header: Header<DataTableFeatures, T>;
  density: DataTableDensity;
}

/**
 * `<th scope="col">`; a sortable column wraps its label in a button and exposes the direction with `aria-sort`. The
 * header is the eyebrow role on `surface.page` in `text.secondary`: the prototype's `text.eyebrow` is 3.2:1 there,
 * below WCAG AA for 11px text.
 */
function HeaderCell<T extends RowData>({ header, density }: HeaderCellProps<T>) {
  const { column } = header;
  const meta = column.columnDef.meta;
  const canSort = column.getCanSort();
  const direction = column.getIsSorted();
  const label = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, header.getContext());
  const style: CSSProperties | undefined =
    header.colSpan > 1 ? { gridColumn: `span ${String(header.colSpan)}` } : undefined;

  return (
    <th
      scope="col"

      {...(canSort ? { 'aria-sort': direction ? ARIA_SORT[direction] : 'none' } : {})}
      style={style}
      className={cn(
        'min-w-0 self-center text-eyebrow text-text-secondary uppercase',
        ALIGN_CLASS[meta?.align ?? 'start'],
        column.id === EXPAND_COLUMN_ID ? 'px-8 py-4' : HEADER_PADDING[density],
      )}
    >
      {canSort ? (
        <button
          type="button"
          onClick={column.getToggleSortingHandler()}
          className="inline-flex cursor-pointer items-center gap-4 rounded-xs uppercase hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          {label}
          {direction === 'asc' ? <ArrowUpIcon size={12} /> : null}
          {direction === 'desc' ? <ArrowDownIcon size={12} /> : null}
        </button>
      ) : (
        label
      )}
    </th>
  );
}
