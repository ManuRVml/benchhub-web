import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpPorts, ServiceContext } from '@/shared/api';

import { ValueMonitorBenchmarkRadar } from './ValueMonitorBenchmarkRadar';

import type { HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const AXES = [
  { kviId: 'kvi_fcf', label: 'Flujo de Caja Libre' },
  { kviId: 'kvi_debt', label: 'Deuda Bruta / EBITDA' },
  { kviId: 'kvi_efi', label: 'Eficiencias' },
  { kviId: 'kvi_cobertura', label: 'Cobertura de Intereses' },
  { kviId: 'kvi_efi_pareto', label: 'EFI Activos Pareto Upstream' },
  { kviId: 'kvi_tir_pareto', label: 'TIR Activos Pareto Upstream' },
];

function seriesFor(companyId: string, colorKey: string, name: string, values: number[]) {
  return { companyId, name, year: 2025, colorKey, values };
}

const VIEW = {
  radar: {
    status: 'ok',
    data: {
      axes: AXES,
      series: [
        seriesFor('cmp_ecopetrol', 'ecopetrol', 'Ecopetrol', [100, 100, 100, 75, 80, 83]),
        seriesFor('cmp_shell', 'shell', 'Shell', [85, 90, 78, 88, 70, 76]),
        seriesFor('cmp_bp', 'bp', 'BP', [70, 65, 82, 60, 74, 68]),
        seriesFor('cmp_equinor', 'equinor', 'Equinor', [90, 72, 66, 95, 60, 71]),
        seriesFor('cmp_chevron', 'chevron', 'Chevron', [60, 80, 74, 70, 85, 90]),
        seriesFor('cmp_total', 'total-energies', 'TotalEnergies', [75, 78, 60, 80, 65, 72]),
      ],
    },
  },
  ranking: {
    status: 'ok',
    data: {
      strengths: [
        { kviId: 'kvi_fcf', label: 'Flujo de Caja Libre', pct: 100 },
        { kviId: 'kvi_debt', label: 'Deuda Bruta / EBITDA', pct: 100 },
        { kviId: 'kvi_efi', label: 'Eficiencias', pct: 100 },
      ],
      opportunities: [
        { kviId: 'kvi_cobertura', label: 'Cobertura de Intereses', pct: 75 },
        { kviId: 'kvi_efi_pareto', label: 'EFI Activos Pareto Upstream', pct: 80 },
        { kviId: 'kvi_tir_pareto', label: 'TIR Activos Pareto Upstream', pct: 83 },
      ],
    },
  },
  insight: {
    status: 'ok',
    data: {
      text: 'Ecopetrol muestra un desempeño sólido en Flujo de Caja Libre, Deuda Bruta / EBITDA, Eficiencias, con brechas relevantes frente al líder en Cobertura de Intereses, EFI Activos Pareto Upstream, TIR Activos Pareto Upstream.',
      tone: 'ok',
      status: 'suggestion',
      generatedBy: { model: 'template', version: '1' },
    },
  },
  companyOptions: [
    { id: 'cmp_ecopetrol', name: 'Ecopetrol' },
    { id: 'cmp_shell', name: 'Shell' },
    { id: 'cmp_bp', name: 'BP' },
    { id: 'cmp_equinor', name: 'Equinor' },
    { id: 'cmp_chevron', name: 'Chevron' },
    { id: 'cmp_total', name: 'TotalEnergies' },
  ],
  yearOptions: [2025, 2024, 2023],
  permissions: {},
};

// The widget owns its V-36 query + C-14 export mutation (P5-54, both through the app's http client — V-36 via the
// typed port, the export via a raw post since C-14's analysisId shape doesn't fit Monitor de Valor), so its stories
// need the service + query providers (docs/architecture/adding-a-screen.md §8) — a stub `http` answers both in
// memory instead of a live BFF or MSW, so the story also renders in `stories.smoke.test.tsx`.
function makeServices(): ServiceContainer {
  const http = {
    get: () => Promise.resolve(VIEW),
    post: () => Promise.resolve({ operationId: 'op_1', status: 'accepted' }),
  } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/ValueMonitorBenchmarkRadar',
  component: ValueMonitorBenchmarkRadar,
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
} satisfies Meta<typeof ValueMonitorBenchmarkRadar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
