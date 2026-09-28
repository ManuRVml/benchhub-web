import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';

import { Modal, MODAL_WIDTHS } from './Modal';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Copy comes from the i18n catalogue (no hard-coded UI copy); any existing key works as sample text.
const meta = {
  title: 'Composites/Modal',
  component: Modal,
  args: {
    open: true,
    onOpenChange: fn(),
    title: t('analyses.page.title'),
    description: t('analyses.search.placeholder'),
    width: 480,
    children: t('analyses.empty.noResults'),
    footer: (
      <>
        <Button variant="outline">{t('analyses.filters.clear')}</Button>
        <Button>{t('analyses.actions.viewDetails')}</Button>
      </>
    ),
  },
  argTypes: {
    width: { control: 'select', options: MODAL_WIDTHS },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Narrow: Story = { args: { width: 420 } };

export const Wide: Story = { args: { width: 640 } };

/** No visible subtitle: the description stays available to screen readers only. */
export const HiddenDescription: Story = { args: { hideDescription: true } };

/** Esc and scrim clicks do nothing (e.g. while an upload is running); only the footer closes it. */
export const NotDismissible: Story = {
  args: { closeOnEscape: false, closeOnOverlayClick: false, showCloseButton: false },
};

/** Uncontrolled: the trigger opens it and focus returns to the trigger on close. */
export const WithTrigger: Story = {
  render: (args) => (
    <Modal
      title={args.title}
      description={args.description}
      trigger={<Button>{t('analyses.actions.viewDetails')}</Button>}
    >
      {args.children}
    </Modal>
  ),
};
