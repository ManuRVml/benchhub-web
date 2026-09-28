import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

import { createHttpPorts, ServiceContext } from '@/shared/api';

import { ReportIndicatorPanel } from './ReportIndicatorPanel';

import type { HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const V22 = {
  category: {
    id: 'rentabilidad',
    label: 'Rentabilidad',
    message: 'Ecopetrol mantiene margen sólido pese a la contracción.',
  },
  rows: [
    {
      indicatorId: 'ind_roace',
      code: 'IND-01',
      label: 'ROACE (%)',
      unit: 'percent',
      valueKind: 'level',
      ecopetrol: 7.4,
      peerAvg: 5.5,
      tierId: 2,
      hasDetail: true,
    },
    {
      indicatorId: 'ind_ebitda',
      code: 'IND-02',
      label: 'Margen EBITDA (%)',
      unit: 'percent',
      valueKind: 'level',
      ecopetrol: 39,
      peerAvg: 32,
      tierId: 1,
      hasDetail: false,
    },
    {
      indicatorId: 'ind_ebitda_growth',
      code: 'IND-03',
      label: 'Crecimiento EBITDA (%)',
      unit: 'percent',
      valueKind: 'growth',
      ecopetrol: -13.8,
      peerAvg: -2.2,
      tierId: 4,
      hasDetail: true,
    },
  ],
};

// The widget owns its V-22 query (shaped on the generated GetCategoryIndicatorsViewResponse, its port/adapter is
// landing separately), so its stories need the service + query + router providers (docs/architecture/
// adding-a-screen.md §8) — a stub `http.get` answers V-22 in memory.
function makeServices(): ServiceContainer {
  const http = { get: () => Promise.resolve(V22) } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/ReportIndicatorPanel',
  component: ReportIndicatorPanel,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ServiceContext.Provider value={makeServices()}>
          <QueryClientProvider client={new QueryClient()}>
            <Story />
          </QueryClientProvider>
        </ServiceContext.Provider>
      </MemoryRouter>
    ),
  ],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReportIndicatorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    category: 'rentabilidad',
    categoryLabel: 'Rentabilidad',
    categoryMessage: 'Ecopetrol mantiene margen sólido pese a la contracción.',
  },
};
