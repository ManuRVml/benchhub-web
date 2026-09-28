import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpPorts, ServiceContext } from '@/shared/api';

import { ReportHeatmap, ReportPanorama, ReportRadar } from './ReportPanorama';

import type { VisualizationHeatmapRow, VisualizationRadar } from '@/entities/analysis';
import type { HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

// ReportPanorama owns a `useCompanyProfile()` (OVL-13, its own V-25 query), so its stories need the service + query
// providers (docs/architecture/adding-a-screen.md §8) — a stub `http.get` never resolves here, the story just needs
// to render without throwing.
function makeServices(): ServiceContainer {
  const http = { get: () => new Promise(() => undefined) } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/ReportPanorama',
  component: ReportPanorama,
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
    heatmapSlot: { control: false },
    radarSlot: { control: false },
    rankingSlot: { control: false },
    recommendationsSlot: { control: false },
  },
} satisfies Meta<typeof ReportPanorama>;

export default meta;
type Story = StoryObj<typeof meta>;

const HEATMAP: VisualizationHeatmapRow[] = [
  { companyId: 'cmp_ecopetrol', name: 'Ecopetrol', isEcopetrol: true, fin: 45, op: 30, trans: 25 },
  { companyId: 'cmp_total', name: 'TotalEnergies', isEcopetrol: false, fin: 62, op: 20, trans: 24 },
  { companyId: 'cmp_bp', name: 'BP', isEcopetrol: false, fin: 55, op: 15, trans: 30 },
  { companyId: 'cmp_shell', name: 'Shell', isEcopetrol: false, fin: 35, op: 40, trans: 25 },
  { companyId: 'cmp_equinor', name: 'Equinor', isEcopetrol: false, fin: 33, op: 34, trans: 33 },
  { companyId: 'cmp_oxy', name: 'Oxy', isEcopetrol: false, fin: 40, op: 35, trans: 25 },
  { companyId: 'cmp_petrobras', name: 'Petrobras', isEcopetrol: false, fin: 33, op: 35, trans: 32 },
];

const RADAR: VisualizationRadar = {
  axes: ['fin', 'op', 'trans'],
  ecopetrol: [45, 30, 25],
  sector: [43, 30, 28],
};

export const Default: Story = {
  args: {
    heatmapSlot: <ReportHeatmap heatmap={HEATMAP} />,
    rankingSlot: (
      <div className="rounded-card bg-surface-page p-16 text-small text-text-secondary">
        {'Ranking slot (PeerWeightRanking)'}
      </div>
    ),
    radarSlot: <ReportRadar radar={RADAR} />,
    recommendationsSlot: (
      <div className="rounded-pill bg-ai-bg px-14 py-8 text-12 text-ai-text">
        {'Recommendations slot (YarbisRecommendationsTrigger)'}
      </div>
    ),
  },
};
