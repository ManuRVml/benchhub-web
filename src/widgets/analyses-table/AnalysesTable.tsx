import { useT } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { DataTable, DataTableRowInfoToggle, createDataTableColumnHelper } from '@/shared/ui/table';

import type { AnalysisStatus } from '@/shared/ui/primitives/badge';

export interface AnalysesTableRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  status: AnalysisStatus;
}

export interface AnalysesTableProps {
  rows: readonly AnalysesTableRow[];
  onViewDetails: (id: string) => void;
}

const analysisCol = createDataTableColumnHelper<AnalysesTableRow>();

export function AnalysesTable({ rows, onViewDetails }: AnalysesTableProps) {
  const t = useT();
  const columns = [
    analysisCol.accessor('name', {
      header: () => t('analyses.table.columns.name'),
      enableSorting: true,
      meta: { rowHeader: true, width: 'minmax(260px, 2.4fr)' },
      // Prototype L425-L427: the name, then the blue "(i)" that opens the description row (no chevron column).
      cell: (info) => (
        <span className="flex min-w-0 items-center gap-6">
          <span className="text-body-strong font-semibold text-text-heading">
            {info.getValue()}
          </span>
          <DataTableRowInfoToggle row={info.row} label={info.getValue()} />
        </span>
      ),
    }),
    analysisCol.accessor('createdAt', {
      header: () => t('analyses.table.columns.createdAt'),
      enableSorting: true,
      meta: { width: 'minmax(130px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
    }),
    analysisCol.accessor('createdBy', {
      header: () => t('analyses.table.columns.createdBy'),
      meta: { width: 'minmax(130px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    analysisCol.accessor('status', {
      header: () => t('analyses.table.columns.status'),
      meta: { width: '140px' },
      cell: (info) => {
        const status = info.getValue();
        const statusLabels: Record<AnalysisStatus, string> = {
          draft: t('analyses.status.draft'),
          in_progress: t('analyses.status.inProgress'),
          in_review: t('analyses.status.inReview'),
          published: t('analyses.status.published'),
        };
        return (
          <Badge kind="status" status={status}>
            {statusLabels[status]}
          </Badge>
        );
      },
    }),
    analysisCol.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('common.a11y.rowActions')}</span>,
      meta: { width: '130px', align: 'end' },
      cell: ({ row }) => {
        return (
          <Button
            variant="primary"
            size="sm"
            aria-label={t('analyses.actions.viewDetailsOf', { name: row.original.name })}
            onClick={() => {
              onViewDetails(row.original.id);
            }}
          >
            {t('analyses.actions.viewDetails')}
          </Button>
        );
      },
    }),
  ];

  const emptyState = (
    <div className="py-24 text-center">
      <p className="text-text-secondary">{t('analyses.empty.noResults')}</p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      caption={t('analyses.page.title')}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      renderExpanded={(row) => (row.description ? <p>{row.description}</p> : null)}
      getRowCanExpand={(row) => row.description !== null}
      expandToggle="inline"
      singleExpand
      emptyState={emptyState}
      minWidth="860px"
      testId="analyses-table"
    />
  );
}
