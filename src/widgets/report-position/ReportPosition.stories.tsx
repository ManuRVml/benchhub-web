import { MemoryRouter } from 'react-router';

import { ReportKpiTiles, ReportPosition } from './ReportPosition';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/report-position/ReportPosition',
  component: ReportPosition,
} satisfies Meta<typeof ReportPosition>;
export default meta;
type Story = StoryObj<typeof meta>;

const KPI_TILES = [
  { dimension: 'fin', sectorAvg: 43, ecopetrol: 45, min: 33, max: 62 },
  { dimension: 'op', sectorAvg: 30, ecopetrol: 30, min: 15, max: 40 },
  { dimension: 'trans', sectorAvg: 28, ecopetrol: 25, min: 24, max: 33 },
] as const;

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    analysisId: 'ana_1',
    position: {
      tierId: 2,
      periodLabel: { year: 2025, quarter: 4 },
      indicatorCount: 34,
      peerCount: 14,
    },
    kpiTilesSlot: <ReportKpiTiles kpiTiles={KPI_TILES} />,
    canCreatePresentation: true,
  },
};

export const WithPresentationAction: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    analysisId: 'ana_1',
    position: {
      tierId: 2,
      periodLabel: { year: 2025, quarter: 4 },
      indicatorCount: 34,
      peerCount: 14,
    },
    kpiTilesSlot: <ReportKpiTiles kpiTiles={KPI_TILES} />,
    canCreatePresentation: true,
  },
};
