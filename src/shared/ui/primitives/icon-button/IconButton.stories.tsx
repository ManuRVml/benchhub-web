import { t } from '@/shared/i18n';
import { BellIcon, HelpIcon } from '@/shared/ui/icons';

import { IconButton } from './IconButton';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Accessible names come from the i18n catalogue (common.ariaLabel.*); icons from the P5-10 set.
const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  args: {
    'aria-label': t('common.ariaLabel.notifications'),
    icon: BellIcon,
    variant: 'surface',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['surface', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header bell (SCR-04): 36px round `surface.page`. */
export const Surface: Story = {};

/** Header help "?" (opens OVL-12). */
export const Help: Story = { args: { 'aria-label': t('common.ariaLabel.help'), icon: HelpIcon } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Small: Story = { args: { size: 'sm' } };

/** Hover: moves the pointer over the button (a static screenshot shows :hover only with a real pointer). */
export const Hover: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button'));
  },
};

/** Focus-visible: tabs to the button, so the `focus.color` ring shows. */
export const FocusVisible: Story = {
  play: async ({ userEvent }) => {
    await userEvent.tab();
  },
};

export const Disabled: Story = { args: { disabled: true } };
