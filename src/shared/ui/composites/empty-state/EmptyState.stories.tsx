import { t } from '@/shared/i18n';

import { EmptyState } from './EmptyState';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Composites/EmptyState',
  component: EmptyState,
  args: { title: t('home.news.empty') },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SCR-05 "Noticias de los pares" with no news. */
export const Inline: Story = {};

export const Block: Story = { args: { variant: 'block', title: t('common.section.empty') } };

/** With a recovery action (any common copy works as sample label). */
export const WithAction: Story = {
  args: {
    variant: 'block',
    title: t('common.section.error.title'),
    action: { label: t('common.section.error.retry'), onClick: () => undefined },
  },
};
