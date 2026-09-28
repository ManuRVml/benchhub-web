import {
  createColumnHelper,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

import type { ColumnHelper, RowData, SortingState } from '@tanstack/react-table';

/** Per-column layout, read by `DataTable` from `columnDef.meta`. */
export interface DataTableColumnMeta {
  /**
   * CSS grid track of the column (`"110px"`, `"minmax(220px, 2fr)"`); the row template is the tracks in column order.
   * Default `minmax(0, 1fr)`.
   */
  width?: string;
  /** Text alignment of the header and the cells; numbers use `end`. Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** The cells of this column name their row: rendered as `<th scope="row">` instead of `<td>`. */
  rowHeader?: boolean;
}

/** Type-only slot: its type types `columnDef.meta`, the value is stripped at runtime. */
const COLUMN_META: DataTableColumnMeta = {};

/**
 * TanStack Table features of every `DataTable`: sorting (sorted row model and the stock sort functions `auto` picks
 * from) and row expanding (the detail row under a row). `columnMeta` types `columnDef.meta`.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: COLUMN_META,
});

export type DataTableFeatures = typeof dataTableFeatures;

/**
 * A column of `DataTable<T>`, whatever its cell value type: TanStack's own `ColumnDef<F, T, any>`, taken from the
 * column helper's `columns()` result because `ColumnDef` is invariant in its value type (a `string` column is not a
 * `ColumnDef<F, T, unknown>`).
 */
export type DataTableColumnDef<T extends RowData> = ReturnType<
  ColumnHelper<DataTableFeatures, T>['columns']
>[number];

export type DataTableSorting = SortingState;

/**
 * Column helper typed for `DataTable<T>`: `accessor` infers the cell value, `display` builds non-data columns
 * (actions). Sorting is opt-in per column with `enableSorting: true`.
 *
 * @example
 * const col = createDataTableColumnHelper<AnalysisRow>();
 * const columns = [col.accessor('name', { header: () => t('analyses.table.columns.name'), meta: { rowHeader: true } })];
 */
export function createDataTableColumnHelper<T extends RowData>() {
  return createColumnHelper<DataTableFeatures, T>();
}
