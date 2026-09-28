import { WeightComposition } from './WeightComposition';

import type {
  VisualizationLineLegendItem,
  VisualizationWeightComposition,
} from '@/entities/analysis';
import type { Meta, StoryObj } from '@storybook/react';

const DATA: VisualizationWeightComposition = {
  ecopetrol: { fin: 45, op: 30, trans: 25 },
  diffs: { fin: 2, op: 0, trans: -3 },
  companies: [
    {
      companyId: 'cmp_total',
      name: 'TotalEnergies',
      fin: 62,
      op: 20,
      trans: 24,
      totalPct: 106,
      sumStatus: 'over',
    },
    { companyId: 'cmp_bp', name: 'BP', fin: 55, op: 15, trans: 30, totalPct: 100, sumStatus: 'ok' },
    {
      companyId: 'cmp_oxy',
      name: 'Oxy',
      fin: 40,
      op: 35,
      trans: 25,
      totalPct: 100,
      sumStatus: 'ok',
    },
    {
      companyId: 'cmp_shell',
      name: 'Shell',
      fin: 35,
      op: 40,
      trans: 20,
      totalPct: 95,
      sumStatus: 'under',
    },
  ],
  groupAvg: { fin: 43, op: 30, trans: 28 },
  hasOverweight: true,
};

const LEGEND: VisualizationLineLegendItem[] = [
  {
    code: 'LIN-01',
    dimension: 'fin',
    formula: 'Promedio ponderado de ROACE, Margen EBITDA y Deuda Neta/EBITDA',
  },
  {
    code: 'LIN-02',
    dimension: 'op',
    formula: 'Promedio ponderado de crecimiento de producción y competitividad en OPEX',
  },
  {
    code: 'LIN-03',
    dimension: 'trans',
    formula: 'Promedio ponderado de gobernanza corporativa y factores ESG',
  },
];

const meta = {
  title: 'Widgets/WeightComposition',
  component: WeightComposition,
  parameters: { layout: 'padded' },
  argTypes: {
    data: { control: false },
    lineLegend: { control: false },
    onDimensionChange: { action: 'onDimensionChange' },
  },
} satisfies Meta<typeof WeightComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: DATA,
    lineLegend: LEGEND,
    dimension: 'fin',
    onDimensionChange: () => {
      /* noop for story */
    },
  },
};

export const NoOverweight: Story = {
  args: {
    ...Default.args,
    data: { ...DATA, hasOverweight: false },
  },
};
