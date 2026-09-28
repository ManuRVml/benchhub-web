import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpPorts, ServiceContext } from '@/shared/api';

import { ReportComments } from './ReportComments';

import type { CommentThreadView, HttpClient, ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const THREAD: CommentThreadView = {
  items: [
    {
      id: 'cmt_01',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
      createdAt: '2026-09-24T10:00:00-05:00',
      status: 'in_analysis',
      decision: null,
      replies: [],
    },
    {
      id: 'cmt_02',
      kind: 'comment',
      author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
      text: '¿Podemos agregar exportación a PDF del dashboard completo?',
      createdAt: '2026-09-25T06:00:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 2,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

// The widget owns its V-26 thread + C-10/C-13 mutations (not in @eco/bff-contract 0.1.0 yet), so its stories need the
// service + query providers (docs/architecture/adding-a-screen.md §8) — a stub `http` answers V-26/C-10 in memory
// instead of a live BFF or MSW, so the story also renders in `stories.smoke.test.tsx`.
function makeServices(): ServiceContainer {
  const http = {
    get: () => Promise.resolve(THREAD),
    post: () =>
      Promise.resolve({
        id: 'cmt_new',
        createdAt: '2026-09-25T10:00:00-05:00',
        status: 'pending',
      }),
  } as unknown as HttpClient;
  return { ...createHttpPorts(http), http, mode: 'http' };
}

const meta = {
  title: 'Widgets/ReportComments',
  component: ReportComments,
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
} satisfies Meta<typeof ReportComments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    canComment: true,
  },
};
