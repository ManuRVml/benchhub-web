import { TbgIndicatorComparator } from './TbgIndicatorComparator';

import type { TbgIndicatorComparatorRankingRow } from './TbgIndicatorComparator';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/TbgIndicatorComparator',
  component: TbgIndicatorComparator,
} satisfies Meta<typeof TbgIndicatorComparator>;

export default meta;
type Story = StoryObj;

// SCR-08 module 5 capture (3_Tablero_Alejandra_Cuantitativo.png): ROACE 12,8 % Ecopetrol vs. 19,8 % promedio TBG,
// rank 7 de 9, TBG members Shell / ExxonMobil / TotalEnergies / BP, others Chevron / Equinor / Ecopetrol / Petrobras
// / ISA, gap al líder -9,3 pts.
const RANKING: TbgIndicatorComparatorRankingRow[] = [
  { companyId: 'shell', name: 'Shell', value: 22.1, isTbgMember: true, isEcopetrol: false },
  { companyId: 'exxon', name: 'ExxonMobil', value: 20.4, isTbgMember: true, isEcopetrol: false },
  {
    companyId: 'totalenergies',
    name: 'TotalEnergies',
    value: 19.5,
    isTbgMember: true,
    isEcopetrol: false,
  },
  { companyId: 'bp', name: 'BP', value: 17.2, isTbgMember: true, isEcopetrol: false },
  { companyId: 'chevron', name: 'Chevron', value: 15.9, isTbgMember: false, isEcopetrol: false },
  { companyId: 'equinor', name: 'Equinor', value: 14.6, isTbgMember: false, isEcopetrol: false },
  { companyId: 'ecopetrol', name: 'Ecopetrol', value: 12.8, isTbgMember: false, isEcopetrol: true },
  {
    companyId: 'petrobras',
    name: 'Petrobras',
    value: 11.3,
    isTbgMember: false,
    isEcopetrol: false,
  },
  { companyId: 'isa', name: 'ISA', value: 9.7, isTbgMember: false, isEcopetrol: false },
];

export const Default: Story = {
  args: {
    indicators: [
      { id: 'roace', label: 'ROACE' },
      { id: 'ebitdaMargin', label: 'Margen EBITDA' },
    ],
    scopes: [{ id: 'all', label: 'Todas las compañías' }],
    selectedIndicator: 'roace',
    selectedScope: 'all',
    onIndicatorChange: () => undefined,
    onScopeChange: () => undefined,
    tiles: { ecopetrolValue: 12.8, tbgAvg: 19.8, gapPts: -7, rank: 7, of: 9 },
    ranking: RANKING,
    membership: {
      inside: ['shell', 'exxon', 'totalenergies', 'bp'],
      outside: ['ecopetrol', 'chevron', 'equinor', 'petrobras', 'isa'],
    },
    gapToLeader: -9.3,
    unit: '%',
  },
};

export const PositiveGap: Story = {
  args: {
    ...Default.args,
    tiles: { ecopetrolValue: 24.5, tbgAvg: 19.8, gapPts: 4.7, rank: 1, of: 9 },
    gapToLeader: 0,
  },
};
