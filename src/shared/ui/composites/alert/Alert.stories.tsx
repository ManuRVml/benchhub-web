import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { Alert } from './Alert';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Composites/Alert',
  component: Alert,
  args: {
    children: t('common.section.empty'),
    variant: 'danger',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const onClose = fn();

/** Default danger alert with title and close button. */
export const Danger: Story = {
  args: {
    title: t('common.section.error.title'),
    onClose,
  },
};

/** Informational alert with brand colors. */
export const Info: Story = {
  args: {
    variant: 'info',
    title: t('common.a11y.closeDialog'),
    onClose,
  },
};

/** Alert without title, just message. */
export const WithoutTitle: Story = {
  args: { onClose },
};

/** Alert without close button. */
export const WithoutCloseButton: Story = {
  args: { title: t('common.section.error.title') },
};
