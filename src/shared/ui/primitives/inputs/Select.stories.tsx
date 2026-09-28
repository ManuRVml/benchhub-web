import { t } from '@/shared/i18n';

import { Select } from './Select';

import type { Meta, StoryObj } from '@storybook/react-vite';

const TYPE_OPTIONS = [
  { value: 'estrategico_tbg', label: t('analysis-definition.step1.typeOptions.estrategicoTBG') },
  { value: 'estrategico_ilp', label: t('analysis-definition.step1.typeOptions.estrategicoILP') },
  { value: 'desempeno_pares', label: t('analysis-definition.step1.typeOptions.desempenoPares') },
];

const meta = {
  title: 'Primitives/Inputs/Select',
  component: Select,
  args: { label: t('analysis-definition.step1.typeLabel'), options: TYPE_OPTIONS },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** SCR-06 list filter: the first option is the "all" label. */
export const Filter: Story = {
  args: {
    label: t('analyses.filters.status.label'),
    allLabel: t('analyses.filters.status.all'),
    size: 'sm',
    options: [
      { value: 'draft', label: t('analyses.status.draft') },
      { value: 'in_progress', label: t('analyses.status.inProgress') },
      { value: 'published', label: t('analyses.status.published') },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true } };
