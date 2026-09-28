import { HeatmapChart } from './HeatmapChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-09 heatmap: declared weight per dimension of Ecopetrol and the peers (prototype ECOPETROL_PESO + pesosCompania,
// BencHUD.dc.html L3608–3615, L4607); ramp colours are the dimension share tokens (prototype #2C699A / #0DB39E /
// #F1C453). Company names and values are data, not UI copy.
const ROWS = ['Ecopetrol', 'BP', 'Equinor', 'Shell', 'TotalEnergies', 'Oxy', 'Petrobras'];
const VALUES = [
  [45, 30, 25],
  [55, 15, 30],
  [33, 34, 33],
  [35, 40, 25],
  [62, 20, 24],
  [40, 35, 25],
  [33, 35, 32],
];

const meta = {
  title: 'Charts/HeatmapChart',
  component: HeatmapChart,
  args: {
    ariaLabel: 'Composición de peso por compañía y dimensión',
    rowHeader: 'Compañía',
    rows: ROWS,
    columns: ['Financiera', 'Operativa', 'Transversal'],
    values: VALUES,
    unit: 'percent',
    columnColorKeys: [
      'dimension.share.financiera',
      'dimension.share.operativa',
      'dimension.share.transversal',
    ],
    height: 300,
  },
} satisfies Meta<typeof HeatmapChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeightComposition: Story = { name: 'Composición de peso por compañía' };

/** A missing value (null) is an empty cell and "—" in the data table, never 0. */
export const MissingValue: Story = {
  name: 'Composición de peso · dato faltante',
  args: {
    values: VALUES.map((row, index) =>
      index === 5 ? [row[0] ?? null, null, row[2] ?? null] : row,
    ),
  },
};
