import { t } from '@/shared/i18n';

import { Textarea } from './Textarea';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Inputs/Textarea',
  component: Textarea,
  args: {
    label: t('analysis-definition.step1.objectiveLabel'),
    placeholder: t('analysis-definition.step1.objectivePlaceholder'),
  },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'compact'] } },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The counter under the field is announced through aria-describedby. */
export const WithMaxLength: Story = { args: { maxLength: 280 } };

export const Compact: Story = { args: { variant: 'compact', rows: 2 } };

export const WithError: Story = { args: { error: t('common.section.error.title') } };
