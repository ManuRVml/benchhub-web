import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

import { createHttpPorts, ServiceContext } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { CompanyComparison } from './CompanyComparison';

import type { CompanyComparisonCompanyOption } from './CompanyComparison';
import type { HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const COMPANIES: CompanyComparisonCompanyOption[] = [
  { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
  { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
  { id: 'cmp_shell', name: 'Shell', colorKey: 'shell' },
];

const VIEW = {
  company: { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
  summary: { wins: 6, total: 10, winPct: 60 },
  groups: [
    {
      category: { id: 'rentabilidad', label: 'Rentabilidad' },
      wins: 2,
      total: 3,
      rows: [
        {
          indicatorId: 'roace',
          code: 'IND-ROACE',
          label: 'ROACE (%)',
          unit: 'percent',
          geValue: 7.4,
          companyValue: 6.3,
          diff: 1.1,
          diffUnit: 'percent',
          lowerIsBetter: false,
          outcome: 'above',
          hasDetail: true,
        },
        {
          indicatorId: 'margen_ebitda',
          code: 'IND-MARGEN-EBITDA',
          label: 'Margen EBITDA (%)',
          unit: 'percent',
          geValue: 39,
          companyValue: 29.8,
          diff: 9.2,
          diffUnit: 'percent',
          lowerIsBetter: false,
          outcome: 'above',
          hasDetail: true,
        },
        {
          indicatorId: 'crecimiento_ebitda',
          code: 'IND-CRECIMIENTO-EBITDA',
          label: 'Crecimiento EBITDA (%)',
          unit: 'percent',
          geValue: -13.8,
          companyValue: -2,
          diff: -11.8,
          diffUnit: 'percent',
          lowerIsBetter: false,
          outcome: 'below',
          hasDetail: false,
        },
      ],
    },
    {
      category: { id: 'competitividad-opex', label: 'Competitividad OPEX' },
      wins: 1,
      total: 2,
      rows: [
        {
          indicatorId: 'costo_levantamiento',
          code: 'IND-COSTO-LEVANTAMIENTO',
          label: 'Costo de Levantamiento (USD/B)',
          unit: 'usd_b',
          geValue: 12.2,
          companyValue: 4.7,
          diff: 7.5,
          diffUnit: 'usd_b',
          lowerIsBetter: true,
          outcome: 'below',
          hasDetail: true,
        },
        {
          indicatorId: 'costo_ventas',
          code: 'IND-COSTO-VENTAS',
          label: 'Costo de ventas/BI (USD/B)',
          unit: 'usd_b',
          geValue: 66.1,
          companyValue: 151.6,
          diff: -85.5,
          diffUnit: 'usd_b',
          lowerIsBetter: true,
          outcome: 'above',
          hasDetail: true,
        },
      ],
    },
  ],
  permissions: {},
};

// The widget owns its V-12 query (its port doesn't forward companyId/horizon yet, P5-42b), so its stories need the
// service + query providers (docs/architecture/adding-a-screen.md §8) — a stub `http.get` answers V-12 in memory
// instead of a live BFF or MSW, so the story also renders in `stories.smoke.test.tsx`.
function makeServices(): ServiceContainer {
  const http = { get: () => Promise.resolve(VIEW) } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/CompanyComparison',
  component: CompanyComparison,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={makeServices()}>
        <QueryClientProvider client={new QueryClient()}>
          <ToastProvider>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </ToastProvider>
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
  parameters: { layout: 'padded' },
  argTypes: {
    companies: { control: false },
  },
} satisfies Meta<typeof CompanyComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    companies: COMPANIES,
  },
};
