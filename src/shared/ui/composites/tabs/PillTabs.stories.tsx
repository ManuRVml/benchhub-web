import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { PillTabs } from './PillTabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype labels from the i18n catalogue: SCR-07 step 3 source tabs and concept options.
const meta = {
  title: 'Composites/PillTabs',
  component: PillTabs,
  args: {
    items: [
      { id: 'pares', label: t('analysis-definition.step3.sourceTabs.pares') },
      { id: 'tbg-ilp', label: t('analysis-definition.step3.sourceTabs.tbgIlp') },
    ],
    defaultValue: 'pares',
    'aria-label': t('analysis-definition.stepper.step4'),
    variant: 'solid',
    onChange: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'subtle'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
  },
} satisfies Meta<typeof PillTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SourceTabs: Story = {};

/** SCR-12 pattern: subtle pills where items without data are disabled and skipped by the arrow keys. */
export const WithDisabledPills: Story = {
  args: {
    variant: 'subtle',
    defaultValue: 'profitability',
    'aria-label': t('analysis-definition.step3.conceptFilterLabel'),
    items: [
      { id: 'profitability', label: t('analysis-definition.step3.conceptOptions.profitability') },
      {
        id: 'liquidity',
        label: t('analysis-definition.step3.conceptOptions.liquidity'),
        disabled: true,
      },
      { id: 'operational', label: t('analysis-definition.step3.conceptOptions.operational') },
      {
        id: 'solvency',
        label: t('analysis-definition.step3.conceptOptions.solvency'),
        disabled: true,
      },
      { id: 'opex', label: t('analysis-definition.step3.conceptOptions.opex') },
    ],
  },
};
