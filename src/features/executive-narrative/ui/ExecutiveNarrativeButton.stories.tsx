import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { ExecutiveNarrativeButton } from './ExecutiveNarrativeButton';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'Features/ExecutiveNarrativeButton',
  component: ExecutiveNarrativeButton,
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
} satisfies Meta<typeof ExecutiveNarrativeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    section: 'overview',
    title: 'Resumen del informe',
  },
};

export const FrameActionRowLabel: Story = {
  args: {
    ...Default.args,
    label: 'Generar narrativa ejecutiva',
    size: 'md',
  },
};
