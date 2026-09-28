import { t } from '@/shared/i18n';
import { formatDate, formatNumber, formatPercent } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';

import { createDataTableColumnHelper } from './data-table-features';
import { DataTable } from './DataTable';
import { DataTableRowInfoToggle } from './DataTableRowInfoToggle';

import type { AnalysisStatus, CoverageStatus } from '@/shared/ui/primitives/badge';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Table/DataTable',
  component: DataTable,
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj;

// SCR-06 analyses list (HTML L3262–3264) plus one row per remaining status.
interface AnalysisRow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  status: AnalysisStatus;
}

const ANALYSES: AnalysisRow[] = [
  {
    id: 'an-001',
    name: 'Desempeño comparativo — 4T 2025',
    description:
      'Referenciamiento competitivo trimestral de Ecopetrol frente a pares del sector energético en solvencia, rentabilidad, liquidez, OPEX y crecimiento.',
    createdAt: '2025-10-03',
    createdBy: 'Camila Bravo',
    status: 'in_review',
  },
  {
    id: 'an-002',
    name: 'Análisis anual 2024 vs. pares',
    description:
      'Comparación anual de indicadores financieros y operativos frente al grupo de pares del sector energético.',
    createdAt: '2025-01-14',
    createdBy: 'Jorge Salas',
    status: 'published',
  },
  {
    id: 'an-003',
    name: 'Sensibilidad ROACE — Escenario optimista',
    description:
      'Simulación de productividad y costos operativos para evaluar el cierre de brecha en ROACE frente a pares.',
    createdAt: '2025-08-22',
    createdBy: 'Camila Bravo',
    status: 'draft',
  },
  {
    id: 'an-004',
    name: 'Benchmark OPEX upstream 2025',
    description: 'Costos operativos por barril frente a pares de producción.',
    createdAt: '2025-11-18',
    createdBy: 'Jorge Salas',
    status: 'in_progress',
  },
];

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  draft: t('analyses.status.draft'),
  in_progress: t('analyses.status.inProgress'),
  in_review: t('analyses.status.inReview'),
  published: t('analyses.status.published'),
};

const analysisCol = createDataTableColumnHelper<AnalysisRow>();

const analysisColumns = (sortable: boolean, inlineInfo = false) => [
  analysisCol.accessor('name', {
    header: () => t('analyses.table.columns.name'),
    enableSorting: sortable,
    meta: { rowHeader: true, width: 'minmax(260px, 2.4fr)' },
    cell: (info) => (
      <span className="flex items-center gap-6">
        <span className="text-body-strong text-text-heading">{info.getValue()}</span>
        {inlineInfo ? <DataTableRowInfoToggle row={info.row} label={info.getValue()} /> : null}
      </span>
    ),
  }),
  analysisCol.accessor('createdAt', {
    header: () => t('analyses.table.columns.createdAt'),
    enableSorting: sortable,
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
    cell: (info) => (
      <Badge kind="status" status={info.getValue()}>
        {STATUS_LABEL[info.getValue()]}
      </Badge>
    ),
  }),
  analysisCol.display({
    id: 'actions',
    header: () => <span className="sr-only">{t('common.a11y.rowActions')}</span>,
    meta: { width: '130px', align: 'end' },
    cell: () => <Button size="sm">{t('analyses.actions.viewDetails')}</Button>,
  }),
];

/** SCR-06: row header = analysis name, status badges, the description as a detail row (one open at a time). */
export const AnalysesList: Story = {
  render: () => (
    <DataTable
      columns={analysisColumns(false)}
      data={ANALYSES}
      caption={t('analyses.page.title')}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      renderExpanded={(row) => row.description}
      singleExpand
      minWidth="860px"
      testId="analyses-list-table"
    />
  ),
};

/** SCR-06 prototype (L425-L427): no chevron column; the blue "(i)" after the name opens the description row. */
export const InlineInfoToggle: Story = {
  render: () => {
    return (
      <DataTable
        columns={analysisColumns(false, true)}
        data={ANALYSES}
        caption={t('analyses.page.title')}
        getRowId={(row) => row.id}
        renderExpanded={(row) => row.description}
        expandToggle="inline"
        singleExpand
        minWidth="860px"
        testId="analyses-list-table"
      />
    );
  },
};

/** Sortable name and date headers, opened on creation date descending (server order, SCR-06 [inference]). */
export const Sorted: Story = {
  render: () => (
    <DataTable
      columns={analysisColumns(true)}
      data={ANALYSES}
      caption={t('analyses.page.title')}
      getRowId={(row) => row.id}
      defaultSorting={[{ id: 'createdAt', desc: true }]}
      minWidth="860px"
      testId="analyses-sorted-table"
    />
  ),
};

/** Filters with no match: the single empty row spans every column. */
export const Empty: Story = {
  render: () => (
    <DataTable
      columns={analysisColumns(false)}
      data={[]}
      caption={t('analyses.page.title')}
      getRowId={(row) => row.id}
      emptyState={t('analyses.empty.noResults')}
      testId="analyses-empty-table"
    />
  ),
};

// SCR-11 KVI table: the 22 rows of `KVI_DATA_BASE` (HTML L4159–4180). `null` = TBD, a string = text mode (rating).
type KviValue = number | string | null;

interface KviRow {
  id: string;
  category: string;
  name: string;
  unit: string;
  weight: number | null;
  owner: string | null;
  meta: KviValue;
  reto: KviValue;
  real: KviValue;
  resultMonitor: number | null;
  resultReto: number | null;
}

const kvi = (
  id: string,
  category: string,
  name: string,
  unit: string,
  weight: number | null,
  owner: string | null,
  values: [KviValue, KviValue, KviValue, number | null, number | null],
): KviRow => {
  const [metaValue, reto, real, resultMonitor, resultReto] = values;
  return {
    id,
    category,
    name,
    unit,
    weight,
    owner,
    meta: metaValue,
    reto,
    real,
    resultMonitor,
    resultReto,
  };
};

const TBD: [null, null, null, null, null] = [null, null, null, null, null];
const FIN = 'Financiero';
const MKT = 'Mercado';
const EST = 'Estratégico';

const KVIS: KviRow[] = [
  kvi('fcl', FIN, 'Flujo de Caja Libre', 'BCOP', 10, 'Diego Gómez', [7.19, 10.53, 10.69, 149, 102]),
  kvi(
    'deuda',
    FIN,
    'Deuda Bruta / EBITDA',
    'Veces',
    5,
    'Kellin Sánchez',
    [2.5, 1.5, 2.32, 108, 65],
  ),
  kvi(
    'cobertura',
    FIN,
    'Cobertura de Intereses',
    'MUSD',
    5,
    'Juan Carlos López',
    [8.14, 26.5, 6.1, 75, 23],
  ),
  kvi(
    'efipareto',
    FIN,
    'EFI Activos Pareto Upstream',
    'Veces',
    null,
    'GMV',
    [0.35, 0.35, 0.28, 80, 80],
  ),
  kvi(
    'tirpareto',
    FIN,
    'TIR Activos Pareto Upstream',
    '%',
    null,
    'GMV',
    [25.1, 25.1, 20.8, 83, 83],
  ),
  kvi('efic', FIN, 'Eficiencias', 'mMCOP', 15, 'Jimmy Morales', [4.56, 6.63, 6.64, 146, 100]),
  kvi('roace', FIN, 'ROACE', '%', 15, 'Liz Cardona', [7.9, 12.3, 7.4, 94, 60]),
  kvi('roacewacc', FIN, 'ROACE menos WACC', '%', null, 'Liz Cardona', TBD),
  kvi('kviport', FIN, 'KVI del portafolio', '-', null, null, TBD),
  kvi('trr', MKT, 'TRR (renta variable)', '%', 5, 'Bloomberg · JVD', [7, 7, 24, 343, 343]),
  kvi(
    'bond',
    MKT,
    'Bond Spread (renta fija)',
    'COP',
    5,
    'Valentina Rodríguez',
    [87.4, 87.4, 90.4, 103, 103],
  ),
  kvi(
    'precio',
    MKT,
    'Precio Objetivo Analistas',
    'COP',
    5,
    'Bloomberg · JVD',
    [2104, 2500, 1870, 89, 75],
  ),
  kvi('riesgocred', MKT, 'Calificación de Riesgo Crediticio', 'Rating', null, 'GMV', [
    'BB',
    'BB',
    'BB',
    100,
    100,
  ]),
  kvi('divid', EST, 'Dividendos Recibidos', 'mMCOP', 2, 'Diego Gómez', [5819, 8730, 8480, 146, 97]),
  kvi('cti', EST, 'CT+i', 'MUSD', 2, 'M. Alejandra Rodríguez', [304.45, 587.24, 548.59, 180, 93]),
  kvi(
    'ebitdacapex',
    EST,
    'EBITDA / Capex (ISA)',
    'Veces',
    null,
    'Daniel González',
    [1.1, 1.4, 1.4, 127, 100],
  ),
  kvi(
    'divint',
    EST,
    'Dividendos recibidos / intereses pagados',
    'Veces',
    2,
    null,
    [0.6, 3.2, 1.1, 183, 34],
  ),
  kvi('margenebitda', EST, 'Margen EBITDA ISA', '%', 2, null, [53.3, 72.2, 54.2, 102, 75]),
  kvi(
    'costoenergia',
    EST,
    'Costo Energía GE',
    '$/kWh',
    2,
    'Margarita García / Paola Molina',
    [441, 424, 425, 104, 100],
  ),
  kvi('irr', EST, 'IRR', '%', 8, 'Fidel Delgado', [80, 100, 121, 151, 121]),
  kvi(
    'diversif',
    EST,
    'Estrategia Diversificación',
    '%',
    2,
    'Carolina Vargas',
    [19, 19, 27, 142, 142],
  ),
  kvi(
    'pib',
    'Grupos de Interés',
    'Aporte al PIB',
    'BCOP',
    5,
    'Mauricio Orozco',
    [1.69, 1.86, 1.71, 101, 92],
  ),
];

const YEAR = 2025;
const KVI_SOURCE = 'Capital IQ';

/** Bands of SCR-11 (≥90 / 70–89 / <70) map onto the coverage badge tones. */
const band = (value: number): CoverageStatus =>
  value >= 90 ? 'complete' : value >= 70 ? 'partial' : 'missing';

function KviValueCell({ value }: { value: KviValue }) {
  if (value === null) {
    return <span className="text-text-secondary">{t('value-monitor.banners.tbd')}</span>;
  }
  return (
    <span className="font-mono text-mono-input text-text-heading">
      {typeof value === 'number' ? formatNumber(value) : value}
    </span>
  );
}

function ResultCell({ value }: { value: number | null }) {
  if (value === null) {
    // The TBD badge tone (text.muted on surface.page) is 2.4:1; text.secondary keeps it AA.
    return (
      <Badge kind="tbd" className="text-text-secondary">
        {t('value-monitor.banners.tbd')}
      </Badge>
    );
  }
  return (
    <Badge kind="coverage" coverage={band(value)}>
      {formatPercent(value, { decimals: 0 })}
    </Badge>
  );
}

const kviCol = createDataTableColumnHelper<KviRow>();
const numeric = { width: '96px', align: 'end' } as const;

const KVI_COLUMNS = [
  kviCol.accessor('category', {
    header: () => t('value-monitor.kviTable.columnCategory'),
    meta: { width: '120px' },
    cell: (info) => (
      <span className="text-small-strong text-text-secondary">{info.getValue()}</span>
    ),
  }),
  kviCol.accessor('name', {
    header: () => t('value-monitor.kviTable.columnIndicator'),
    meta: { rowHeader: true, width: 'minmax(220px, 2fr)' },
    cell: (info) => (
      <span className="flex flex-col gap-2">
        <span className="text-body text-text-heading">{info.getValue()}</span>
        <span className="font-mono text-micro text-text-secondary">
          {`KVI-${info.row.original.id.toUpperCase()}`}
        </span>
      </span>
    ),
  }),
  kviCol.accessor('unit', {
    header: () => t('value-monitor.kviTable.columnUnit'),
    meta: { width: '80px' },
    cell: (info) => <span className="text-label text-text-secondary">{info.getValue()}</span>,
  }),
  kviCol.accessor('weight', {
    header: () => t('value-monitor.kviTable.columnWeight'),
    meta: { width: '72px', align: 'end' },
    cell: (info) => (
      <span className="text-small text-text-secondary">
        {formatPercent(info.getValue(), { decimals: 0 })}
      </span>
    ),
  }),
  kviCol.accessor('owner', {
    header: () => t('value-monitor.kviTable.columnOwner'),
    meta: { width: 'minmax(140px, 1.2fr)' },
    cell: (info) => (
      <span className="text-label text-text-secondary">{info.getValue() ?? '—'}</span>
    ),
  }),
  kviCol.accessor('meta', {
    header: () => t('value-monitor.kviTable.columnMeta', { year: YEAR }),
    meta: numeric,
    cell: (info) => <KviValueCell value={info.getValue()} />,
  }),
  kviCol.accessor('reto', {
    header: () => t('value-monitor.kviTable.columnMetaReto'),
    meta: numeric,
    cell: (info) => <KviValueCell value={info.getValue()} />,
  }),
  kviCol.accessor('real', {
    header: () => t('value-monitor.kviTable.columnReal', { year: YEAR }),
    meta: numeric,
    cell: (info) => <KviValueCell value={info.getValue()} />,
  }),
  kviCol.accessor('resultMonitor', {
    header: () => t('value-monitor.kviTable.columnResultMonitor'),
    meta: { width: '120px', align: 'end' },
    cell: (info) => <ResultCell value={info.getValue()} />,
  }),
  kviCol.accessor('resultReto', {
    header: () => t('value-monitor.kviTable.columnResultReto'),
    meta: { width: '120px', align: 'end' },
    cell: (info) => <ResultCell value={info.getValue()} />,
  }),
];

/** OVL-11 traceability pairs, shown in the detail row. */
function KviTraceability({ row }: { row: KviRow }) {
  const pairs: [string, string][] = [
    [t('value-monitor.modal.traceability.category'), row.category],
    [t('value-monitor.modal.traceability.source'), KVI_SOURCE],
    [t('value-monitor.modal.traceability.owner'), row.owner ?? '—'],
    [t('value-monitor.modal.traceability.unit'), row.unit],
  ];
  return (
    <dl className="grid grid-cols-4 gap-12">
      {pairs.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-2">
          <dt className="text-eyebrow text-text-secondary">{label}</dt>
          <dd className="text-small text-text-heading">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * SCR-11 "Monitor de Valor · KVIs": 22 rows, result bands, TBD rows (ROACE menos WACC, KVI del portafolio), the text
 * mode rating row, min-width 1080 → horizontal scroll, sticky header in a 480px scroll box, traceability detail rows.
 */
export const KviTable: Story = {
  render: () => (
    <DataTable
      columns={KVI_COLUMNS}
      data={KVIS}
      caption={t('value-monitor.kviTable.title')}
      captionVisible
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      renderExpanded={(row) => <KviTraceability row={row} />}
      getRowCanExpand={(row) => row.resultMonitor !== null}
      defaultExpanded={{ fcl: true }}
      stickyHeader
      maxHeight="480px"
      minWidth="1080px"
      density="sm"
      testId="value-monitor-kvi-table"
    />
  ),
};
