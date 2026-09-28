import { t } from '@/shared/i18n';

import { SearchInput } from './SearchInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-06 search box: no visible label in the prototype, so the label is kept for screen readers only.
const meta = {
  title: 'Primitives/Inputs/SearchInput',
  component: SearchInput,
  args: {
    label: t('analyses.search.placeholder'),
    hideLabel: true,
    placeholder: t('analyses.search.placeholder'),
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** With text: the clear button appears. */
export const WithText: Story = { args: { defaultValue: t('analyses.status.published') } };

export const Disabled: Story = { args: { disabled: true } };
