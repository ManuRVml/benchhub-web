import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { HomePage } from './HomePage';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

// No msw-storybook-addon is wired up (see .storybook/preview.ts): the mock ports return canned fixtures with no
// network call, so the story renders without a live MSW handler. `mockData` below documents the intended payload
// for reference; the widgets P5-50 wires will read the same shape once the real query replaces the mock service.
const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'pages/home/HomePage',
  component: HomePage,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={mockServices}>
        <QueryClientProvider client={storyQueryClient}>
          <Story />
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    mockData: {
      homeView: {
        banner: {
          status: 'ok',
          data: {
            text: 'Este es un insight clave de Yarbis para el dashboard de Inicio.',
          },
        },
        executiveSummary: {
          status: 'ok',
          data: {
            total: 24,
            active: 18,
            published: 10,
            inProgress: 6,
            avgCoveragePct: 95,
          },
        },
        enabledAnalyses: {
          status: 'ok',
          data: [
            {
              id: 'an-001',
              title: 'Análisis de rentabilidad sectorial',
              status: 'published',
              description: 'Comparación de rentabilidad por sector vs pares',
              updatedAt: Date.now() - 86400000,
              ownerName: 'Ana López',
              targetRoute: '/analisis/an-001/resultados',
            },
            {
              id: 'an-002',
              title: 'Análisis de cobertura geográfica',
              status: 'in_progress',
              description: 'Evaluación de cobertura en regiones prioritarias',
              updatedAt: Date.now() - 172800000,
              ownerName: 'Carlos Ruiz',
              targetRoute: '/analisis/an-002/resultados',
            },
          ],
        },
        peerNews: {
          status: 'ok',
          data: [
            {
              id: 'pn-001',
              companyId: 'cmp-001',
              companyName: 'Competidor A',
              colorKey: 'cmp-001',
              initials: 'CA',
              impact: 'up',
              headline: 'Competidor A reporta crecimiento de mercado del 5%',
              source: 'Reporte trimestral',
            },
            {
              id: 'pn-002',
              companyId: 'cmp-002',
              companyName: 'Competidor B',
              colorKey: 'cmp-002',
              initials: 'CB',
              impact: 'down',
              headline: 'Competidor B reduce precios en línea principal',
              source: 'Noticia financiera',
            },
          ],
        },
        marketIndicators: {
          status: 'ok',
          data: [
            {
              id: 'mi-001',
              label: 'TCU',
              value: 1125.5,
              unit: 'cop_per_usd',
              deltaPct: 2.3,
              trend: 'up',
            },
            {
              id: 'mi-002',
              label: 'PIB crecimiento',
              value: 3.8,
              unit: 'percent',
              deltaPct: -0.5,
              trend: 'down',
            },
            {
              id: 'mi-003',
              label: 'Inflación',
              value: 5.2,
              unit: 'percent',
              deltaPct: 0.8,
              trend: 'up',
            },
          ],
        },
      },
    },
  },
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
