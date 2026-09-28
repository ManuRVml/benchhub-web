import { ChartLegend } from './ChartLegend';

import type { ChartLegendItem } from './ChartLegend';
import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-08 L380: "9px square Grupo Ecopetrol + 9px square per company + company name".
const COMPANY_LEGEND: ChartLegendItem[] = [
  { id: 'ge', label: 'Grupo Ecopetrol', tone: 'highlight' },
  { id: 'chevron', label: 'Chevron', tone: 'series1' },
  { id: 'shell', label: 'Shell', tone: 'series2' },
];

const meta = {
  title: 'Charts/ChartLegend',
  component: ChartLegend,
  args: { items: COMPANY_LEGEND, 'aria-label': 'Compañías' },
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompanyComparison: Story = { name: 'Comparativo por compañía (L380)' };

/** SCR-08 L587: FutureAspiration adds an outlined "Grupo Ecopetrol" marker next to the segment chips. */
export const OutlinedMarker: Story = {
  name: 'Marcador de fila (L587, contorno)',
  args: { items: [{ id: 'ge', label: 'Grupo Ecopetrol', tone: 'highlight', variant: 'outlined' }] },
};
