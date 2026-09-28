// Comparison table UI state (brief §5.3, ADR-0005): ephemeral view state only, such as which rows are expanded.
// Comparison data itself is server state and lives in TanStack Query, never here. Not persisted.
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { storeDevtools } from '@/shared/lib/store';

type RowSet = Readonly<Record<string, true>>;

export interface ComparisonUiState {
  /** Ids of the expanded rows (e.g. a category row showing its indicators). */
  readonly expandedRows: RowSet;
}

export interface ComparisonUiActions {
  readonly toggleRow: (rowId: string) => void;
  readonly setRowExpanded: (rowId: string, expanded: boolean) => void;
  readonly collapseAll: () => void;
}

export type ComparisonUiStore = ComparisonUiState & ComparisonUiActions;

const withRow = (rows: RowSet, rowId: string, expanded: boolean): RowSet => {
  if (expanded) return { ...rows, [rowId]: true };
  return Object.fromEntries(Object.entries(rows).filter(([id]) => id !== rowId));
};

export const useComparisonUiStore = create<ComparisonUiStore>()(
  devtools(
    (set) => ({
      expandedRows: {},
      toggleRow: (rowId) => {
        set(
          (state) => ({
            expandedRows: withRow(state.expandedRows, rowId, state.expandedRows[rowId] !== true),
          }),
          false,
          'comparisonUi/toggleRow',
        );
      },
      setRowExpanded: (rowId, expanded) => {
        set(
          (state) =>
            (state.expandedRows[rowId] === true) === expanded
              ? state
              : { expandedRows: withRow(state.expandedRows, rowId, expanded) },
          false,
          'comparisonUi/setRowExpanded',
        );
      },
      collapseAll: () => {
        set({ expandedRows: {} }, false, 'comparisonUi/collapseAll');
      },
    }),
    storeDevtools('comparison-ui'),
  ),
);

/** Selector factory: whether row `rowId` is expanded. */
export const selectRowExpanded =
  (rowId: string) =>
  (state: ComparisonUiStore): boolean =>
    state.expandedRows[rowId] === true;
export const selectExpandedCount = (state: ComparisonUiStore): number =>
  Object.keys(state.expandedRows).length;
export const selectToggleRow = (state: ComparisonUiStore): ComparisonUiActions['toggleRow'] =>
  state.toggleRow;
export const selectSetRowExpanded = (
  state: ComparisonUiStore,
): ComparisonUiActions['setRowExpanded'] => state.setRowExpanded;
export const selectCollapseAll = (state: ComparisonUiStore): ComparisonUiActions['collapseAll'] =>
  state.collapseAll;
