import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpPorts, ServiceContext } from '@/shared/api';

import { PeerWeightRanking } from './PeerWeightRanking';

import type { HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const ROWS = [
  { companyId: 'cmp_total', name: 'TotalEnergies', pct: 62, isLeader: true, isEcopetrol: false },
  { companyId: 'cmp_bp', name: 'BP', pct: 55, isLeader: false, isEcopetrol: false },
  { companyId: 'cmp_ecopetrol', name: 'Ecopetrol', pct: 45, isLeader: false, isEcopetrol: true },
];

// The widget owns its V-21 query (not in @eco/bff-contract 0.1.0 yet), so its stories need the service + query
// providers (docs/architecture/adding-a-screen.md §8) — a stub `http.get` answers V-21 in memory instead of a live
// BFF or MSW, so the story also renders in `stories.smoke.test.tsx`.
function makeServices(): ServiceContainer {
  const http = {
    get: () => Promise.resolve({ rows: ROWS }),
  } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/PeerWeightRanking',
  component: PeerWeightRanking,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={makeServices()}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
  parameters: { layout: 'padded' },
  argTypes: {
    onDimensionChange: { action: 'onDimensionChange' },
  },
} satisfies Meta<typeof PeerWeightRanking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    dimension: 'fin',
    onDimensionChange: () => {
      /* noop for story */
    },
  },
};
