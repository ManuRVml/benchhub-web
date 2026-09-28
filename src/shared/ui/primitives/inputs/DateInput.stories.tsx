import { t } from '@/shared/i18n';

import { DateInput } from './DateInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Inputs/DateInput',
  component: DateInput,
  args: { label: t('analysis-definition.step1.cutOffDateLabel'), defaultValue: '2025-12-31' },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { defaultValue: '' } };

export const Disabled: Story = { args: { disabled: true } };
