import { useT } from '@/shared/i18n';
import { InfoToggle } from '@/shared/ui/composites/section-card';

import { detailRowId, useDataTableScope } from './data-table-scope';
import { dataTableTestIds } from './test-ids';

/** The slice of a TanStack row the toggle needs (the cell context's `row`). */
export interface DataTableExpandableRow {
  id: string;
  getCanExpand: () => boolean;
  getIsExpanded: () => boolean;
  toggleExpanded: (expanded?: boolean) => void;
}

export interface DataTableRowInfoToggleProps {
  row: DataTableExpandableRow;
  /** Names the row in the toggle ("Detalle de {label}"), e.g. the analysis name. */
  label: string;
}

/**
 * Inline expand toggle of a `DataTable` with `expandToggle="inline"`: the blue "(i)" `InfoToggle` placed in a cell (SCR-06
 * after the analysis name), with `aria-expanded` + `aria-controls` on the row's detail row and the table's
 * `{testId}-expand-{rowId}` test id. Renders nothing for a row that cannot expand or outside a `DataTable`.
 */
export function DataTableRowInfoToggle({ row, label }: DataTableRowInfoToggleProps) {
  const t = useT();
  const scope = useDataTableScope();
  if (scope === null || !row.getCanExpand()) return null;
  return (
    <InfoToggle
      expanded={row.getIsExpanded()}
      controls={detailRowId(scope.idPrefix, row.id)}
      aria-label={t('common.a11y.rowDetails', { label })}
      onToggle={() => {
        row.toggleExpanded();
      }}
      {...(scope.testId === undefined
        ? {}
        : { testId: dataTableTestIds.expand(scope.testId, row.id) })}
      className="shrink-0"
    />
  );
}
