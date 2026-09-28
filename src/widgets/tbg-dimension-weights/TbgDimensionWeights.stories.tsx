import { TbgDimensionWeights } from './TbgDimensionWeights';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TbgDimensionWeights> = {
  title: 'Widgets/TbgDimensionWeights',
  component: TbgDimensionWeights,
};

export default meta;

type Story = StoryObj<typeof TbgDimensionWeights>;

export const Default: Story = {
  args: {
    dimension: 'fin',
    onDimensionChange: () => undefined,
    ecopetrolPct: 45,
    peerAvgPct: 43,
    diffPts: 2,
    detail: [
      { rank: 1, companyId: 'tfe', name: 'TotalEnergies', pct: 62 },
      { rank: 2, companyId: 'bp', name: 'BP', pct: 55 },
      { rank: 3, companyId: 'oxy', name: 'Oxy', pct: 40 },
      { rank: 4, companyId: 'shl', name: 'Shell', pct: 35 },
      { rank: 5, companyId: 'eqn', name: 'Equinor', pct: 33 },
      { rank: 6, companyId: 'ptr', name: 'Petrobras', pct: 33 },
    ],
  },
};
