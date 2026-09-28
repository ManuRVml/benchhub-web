import { IndicatorPicker } from './IndicatorPicker';

import type { V07Response } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/indicator-picker/IndicatorPicker',
  component: IndicatorPicker,
} satisfies Meta<typeof IndicatorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

const PARES_CATALOG: V07Response = {
  source: 'pares',
  groups: [
    {
      id: 'rentabilidad',
      label: 'Rentabilidad',
      items: [
        {
          id: 'ind_roace',
          code: 'PAR-01',
          label: 'ROACE',
          unit: 'percent',
          concept: 'rentabilidad',
          horizon: null,
          sources: ['capital_iq'],
        },
        {
          id: 'ind_ebitda',
          code: 'PAR-02',
          label: 'Margen EBITDA',
          unit: 'percent',
          concept: 'rentabilidad',
          horizon: null,
          sources: ['capital_iq'],
        },
      ],
    },
    {
      id: 'liquidez',
      label: 'Liquidez',
      items: [
        {
          id: 'ind_razon',
          code: 'PAR-14',
          label: 'Razón corriente',
          unit: 'ratio_x',
          concept: 'liquidez',
          horizon: null,
          sources: ['bloomberg'],
        },
      ],
    },
  ],
  totals: { groups: 5, indicators: 27 },
  filterOptions: { concepts: ['rentabilidad', 'liquidez'], horizons: [] },
  permissions: {},
};

export const Default: Story = {
  args: {
    source: 'pares',
    onSourceChange: () => {
      /* noop */
    },
    catalog: PARES_CATALOG,
    selectedIds: ['ind_roace', 'ind_ebitda', 'ind_razon'],
    onChange: () => {
      /* noop */
    },
    canEdit: true,
  },
};
