import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { PeerAverageComparison, type Category, type PeerAverageRow } from './PeerAverageComparison';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'Widgets/PeerAverageComparison',
  component: PeerAverageComparison,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={mockServices}>
        <QueryClientProvider client={storyQueryClient}>
          <ToastProvider>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </ToastProvider>
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    categories: {
      control: false,
    },
    rows: {
      control: false,
    },
    category: {
      control: { type: 'text' },
    },
    onCategoryChange: {
      action: 'onCategoryChange',
    },
    analysisId: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof PeerAverageComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultCategories: Category[] = [
  { id: 'rentabilidad', label: 'Rentabilidad' },
  { id: 'liquidez', label: 'Liquidez' },
  { id: 'endeudamiento', label: 'Endeudamiento' },
];

const defaultRows: PeerAverageRow[] = [
  {
    indicatorId: 'ind-1',
    label: 'ROACE (%)',
    unit: '%',
    geValue: 7.4,
    peerAvg: 5.5,
    hasDetail: true,
  },
  {
    indicatorId: 'ind-2',
    label: 'Margen EBITDA (%)',
    unit: '%',
    geValue: 39.0,
    peerAvg: 32.0,
    hasDetail: false,
  },
  {
    indicatorId: 'ind-3',
    label: 'Crecimiento EBITDA (%)',
    unit: '%',
    geValue: -13.8,
    peerAvg: -2.2,
    hasDetail: true,
  },
];

export const Default: Story = {
  args: {
    categories: defaultCategories,
    rows: defaultRows,
    category: 'rentabilidad',
    onCategoryChange: () => {
      /* noop for story */
    },
    analysisId: 'analysis-123',
  },
};

export const WithNegativeValues: Story = {
  args: {
    categories: defaultCategories,
    rows: [
      {
        indicatorId: 'ind-3',
        label: 'Crecimiento EBITDA (%)',
        unit: '%',
        geValue: -13.8,
        peerAvg: -2.2,
        hasDetail: false,
      },
    ],
    category: 'operacional',
    onCategoryChange: () => {
      /* noop for story */
    },
    analysisId: 'analysis-123',
  },
};

export const NoDetailLinks: Story = {
  args: {
    categories: defaultCategories,
    rows: defaultRows.map((row) => ({ ...row, hasDetail: false })),
    category: 'rentabilidad',
    onCategoryChange: () => {
      /* noop for story */
    },
    analysisId: 'analysis-123',
  },
};
