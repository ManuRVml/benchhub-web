import { GroupedBarChart } from './GroupedBarChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

// ROACE (%) of the Monitor de Valor peer ranking (synthesis §1.11 item 4) with the 2024 and 2025 values of the
// prototype's PEER_SETS.roace (BencHUD.dc.html L3320). Company names and years are data, not UI copy.
const COMPANIES = [
  'Ecopetrol',
  'ConocoPhillips',
  'PTTEP',
  'Exxon',
  'Shell',
  'Total',
  'Equinor',
  'Oxy',
  'BP',
];
const ROACE_2024 = [10.2, 9.0, 8.5, 7.5, 6.3, 7.8, 8.7, 6.4, 0.9];
const ROACE_2025 = [7.4, 7.2, 6.7, 6.7, 6.5, 6.1, 5.4, 3.8, 1.3];

const meta = {
  title: 'Charts/GroupedBarChart',
  component: GroupedBarChart,
  args: {
    ariaLabel: 'ROACE por compañía',
    categoryLabel: 'Compañía',
    unit: 'percent',
    categories: COMPANIES,
    series: [
      { id: 'roace-2024', label: '2024', values: ROACE_2024 },
      { id: 'roace-2025', label: '2025', values: ROACE_2025 },
    ],
  },
} satisfies Meta<typeof GroupedBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoacePorCompania: Story = { name: 'ROACE por compañía' };

/** A missing 2025 value (null) leaves a gap and reads "—" in the data table, never 0. */
export const DatoFaltante: Story = {
  name: 'ROACE por compañía · dato faltante',
  args: {
    series: [
      { id: 'roace-2024', label: '2024', values: ROACE_2024 },
      { id: 'roace-2025', label: '2025', values: ROACE_2025.map((v, i) => (i === 7 ? null : v)) },
    ],
  },
};
