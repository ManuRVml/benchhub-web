import { ValueMonitorRanking } from './ValueMonitorRanking';

import type { ValueMonitorRankingRow } from './ValueMonitorRanking';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/ValueMonitorRanking',
  component: ValueMonitorRanking,
} satisfies Meta<typeof ValueMonitorRanking>;

export default meta;
type Story = StoryObj;

const ROWS: ValueMonitorRankingRow[] = [
  { rank: 1, companyId: 'ecopetrol', displayName: 'Ecopetrol', value: 7.4, isEcopetrol: true },
  {
    rank: 2,
    companyId: 'conocophillips',
    displayName: 'ConocoPhillips',
    value: 7.2,
    isEcopetrol: false,
  },
  { rank: 3, companyId: 'pttep', displayName: 'PTTEP', value: 6.7, isEcopetrol: false },
  { rank: 4, companyId: 'exxon', displayName: 'Exxon', value: 6.7, isEcopetrol: false },
  { rank: 5, companyId: 'shell', displayName: 'Shell', value: 6.5, isEcopetrol: false },
  {
    rank: 6,
    companyId: 'totalenergies',
    displayName: 'TotalEnergies',
    value: 6.1,
    isEcopetrol: false,
  },
];

export const Default: Story = {
  args: { rows: ROWS },
};

export const Clickable: Story = {
  args: {
    rows: ROWS,
    onCompanyClick: (_companyId: string) => {
      // TODO(Nilo/BFF): no view carries a peer profile's country/category/business/segments/news yet.
    },
  },
};
