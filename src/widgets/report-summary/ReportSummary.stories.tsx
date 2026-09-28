import { ReportSummary } from './ReportSummary';

import type { ReportSummaryRow } from './types';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/report-summary/ReportSummary',
  component: ReportSummary,
  argTypes: {},
} satisfies Meta<typeof ReportSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockRows: readonly ReportSummaryRow[] = [
  {
    rowId: 'env-1',
    category: 'Rentabilidad',
    tier: 1,
    kpi: 'ROACE (%)',
    unit: '%',
    geValue: 7.4,
    peerAvg: 5.5,
  },
  {
    rowId: 'env-2',
    category: 'Liquidez',
    tier: 2,
    kpi: 'Prueba ácida (x)',
    unit: 'x',
    geValue: 85000,
    peerAvg: 92000,
  },
  {
    rowId: 'gov-1',
    category: 'Operacional',
    tier: 3,
    kpi: 'Costo de extracción ($/barril)',
    unit: '$/barril',
    geValue: 32.5,
    peerAvg: 35.8,
  },
  {
    rowId: 'soc-1',
    category: 'Competitividad OPEX',
    tier: 4,
    kpi: 'Eficiencia operativa',
    unit: 'índice',
    geValue: 85,
    peerAvg: 78,
  },
  {
    rowId: 'soc-2',
    category: 'Solvencia',
    tier: 1,
    kpi: 'Ratio de deuda/EBITDA',
    unit: 'x',
    geValue: 1.8,
    peerAvg: 2.1,
  },
  {
    rowId: 'esg-1',
    category: 'ESG',
    tier: 2,
    kpi: 'Score ESG',
    unit: 'puntos',
    geValue: 72,
    peerAvg: 68,
  },
];

export const Default: Story = {
  args: {
    rows: mockRows,
    onValueChange: () => {
      /* noop */
    },
    onExport: () => {
      /* noop */
    },
    exporting: false,
  },
};

export const WithExporting: Story = {
  args: {
    rows: mockRows,
    onValueChange: () => {
      /* noop */
    },
    onExport: () => {
      /* noop */
    },
    exporting: true,
  },
};
