import { ValueMonitorComments } from './ValueMonitorComments';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/ValueMonitorComments',
  component: ValueMonitorComments,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ValueMonitorComments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      items: [
        {
          id: 'cmt_01',
          kind: 'comment',
          author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
          text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
          createdAt: '2026-09-24T10:00:00-05:00',
          status: 'pending',
          decision: null,
          replies: [],
        },
        {
          id: 'cmt_02',
          kind: 'comment',
          author: { name: 'Alejandra Ríos', roleLabelKey: 'role.executiveIntegral' },
          text: '¿Podemos agregar exportación a PDF del dashboard completo?',
          createdAt: '2026-09-25T06:00:00-05:00',
          status: 'in_analysis',
          decision: null,
          replies: [],
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 2,
      permissions: {
        canComment: true,
        canReply: false,
        canRequestChange: false,
        canResolve: false,
      },
    },
    onSubmit: () => Promise.resolve(),
  },
};

export const Empty: Story = {
  args: {
    data: { ...Default.args.data, items: [], totalItems: 0 },
    onSubmit: () => Promise.resolve(),
  },
};

export const ReadOnly: Story = {
  args: {
    data: {
      ...Default.args.data,
      permissions: { ...Default.args.data.permissions, canComment: false },
    },
    onSubmit: () => Promise.resolve(),
  },
};
