import { ValueMonitorConfig } from './ValueMonitorConfig';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/ValueMonitorConfig',
  component: ValueMonitorConfig,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ValueMonitorConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cutOffDate: '2025-12-31',
    rangeFrom: 2023,
    rangeTo: 2025,
    sources: [
      { id: 'capital_iq', label: 'Capital IQ', isEnabled: true },
      { id: 'bloomberg', label: 'Bloomberg', isEnabled: true },
      { id: 'platts', label: 'Platts', isEnabled: false },
      { id: 'interna_ecp', label: 'Fuentes internas Ecopetrol', isEnabled: true },
    ],
    exceptionsText: '',
    assistantContext: '',
    indicators: [
      { id: 'ind_roace', label: 'ROACE', isIncluded: true },
      { id: 'ind_margen_ebitda', label: 'Margen EBITDA', isIncluded: true },
      { id: 'ind_deuda_ebitda', label: 'Deuda Bruta / EBITDA', isIncluded: false },
    ],
    thresholds: { alert: 70, warning: 90 },
    period: 'quarter',
    onApply: () => undefined,
    onAddIndicator: () => undefined,
    applying: false,
  },
};

export const Applying: Story = {
  args: { ...Default.args, applying: true },
};
