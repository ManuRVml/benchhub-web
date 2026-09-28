import { t } from '@/shared/i18n';

import { TextField } from './TextField';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype labels from the i18n catalogue (SCR-07 step 1, SCR-08 estimate justification).
const meta = {
  title: 'Primitives/Inputs/TextField',
  component: TextField,
  args: {
    label: t('analysis-definition.step1.nameLabel'),
    placeholder: t('analysis-definition.step1.namePlaceholder'),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    variant: { control: 'inline-radio', options: ['default', 'dashedEstimate'] },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: 'sm' } };

export const WithDescription: Story = {
  args: { description: t('analysis-definition.step1.info') },
};

export const WithError: Story = { args: { error: t('common.section.error.title') } };

export const Disabled: Story = { args: { disabled: true } };

export const Password: Story = {
  args: {
    label: t('login.form.passwordLabel'),
    placeholder: t('login.form.passwordPlaceholder'),
    type: 'password',
    autoComplete: 'current-password',
  },
};

export const DashedEstimate: Story = {
  args: {
    label: t('analysis-results.companyCoverage.editArea.estimated'),
    placeholder: t('analysis-results.companyCoverage.editArea.justificationPlaceholder'),
    variant: 'dashedEstimate',
  },
};
