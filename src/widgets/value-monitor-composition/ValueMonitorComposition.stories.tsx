import { ValueMonitorComposition } from './ValueMonitorComposition';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/ValueMonitorComposition',
  component: ValueMonitorComposition,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ValueMonitorComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      centerPct: 96.1,
      categories: [
        {
          id: 'financiero',
          label: 'Financiero',
          colorKey: 'chart.category.financiero',
          weightPct: 60,
          kviCount: 9,
          compliancePct: 90,
        },
        {
          id: 'mercado',
          label: 'Mercado',
          colorKey: 'chart.category.mercado',
          weightPct: 15,
          kviCount: 4,
          compliancePct: 97,
        },
        {
          id: 'estrategico',
          label: 'Estratégico',
          colorKey: 'chart.category.estrategico',
          weightPct: 20,
          kviCount: 8,
          compliancePct: 100,
        },
        {
          id: 'grupos_interes',
          label: 'Grupos de Interés',
          colorKey: 'chart.category.gruposInteres',
          weightPct: 5,
          kviCount: 1,
          compliancePct: 100,
        },
      ],
      permissions: {},
    },
  },
};

export const WithATbdCategory: Story = {
  args: {
    data: {
      ...Default.args.data,
      categories: [
        ...Default.args.data.categories.slice(0, 3),
        {
          id: 'grupos_interes',
          label: 'Grupos de Interés',
          colorKey: 'chart.category.gruposInteres',
          weightPct: 5,
          kviCount: 1,
          compliancePct: null,
        },
      ],
    },
  },
};
