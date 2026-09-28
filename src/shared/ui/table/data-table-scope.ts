import { createContext, useContext } from 'react';

/** Ids of the table a cell is rendered in, so an inline expand toggle can point at its row's detail row. */
export interface DataTableScope {
  idPrefix: string;
  testId?: string;
}

export const DataTableScopeContext = createContext<DataTableScope | null>(null);

export function useDataTableScope(): DataTableScope | null {
  return useContext(DataTableScopeContext);
}

/** DOM ids cannot hold spaces; row ids otherwise pass through. */
export const domSafe = (rowId: string) => rowId.replace(/\s+/g, '_');

/** Id of a row's detail row (`aria-controls` of its expand toggle). */
export const detailRowId = (idPrefix: string, rowId: string) =>
  `${idPrefix}-detail-${domSafe(rowId)}`;
