import { t } from '@/shared/i18n';

import { Button, type ButtonVariant } from './Button';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Labels come from the i18n catalogue (no hard-coded UI copy); any existing common key works as sample text.
const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: t('common.analysisTabs.results'), variant: 'primary', size: 'md' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'outline', 'link', 'forward', 'dashed', 'gradient', 'cyan'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };

export const Outline: Story = {
  args: { variant: 'outline', children: t('common.analysisTabs.definition') },
};

export const Link: Story = { args: { variant: 'link', children: t('common.nav.collapse') } };

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const FullWidth: Story = { args: { fullWidth: true } };

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

// P5-11 variants, each with its hover, focus-visible and disabled state. Hover and focus-visible are reached with the
// play function (pointer over the button / keyboard Tab); a static screenshot shows :hover only with a real pointer.

/** Hover: moves the pointer over the button. */
const hover = (variant: ButtonVariant): Story => ({
  args: { variant },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button'));
  },
});

/** Focus-visible: tabs to the button, so the `focus.color` ring shows. */
const focusVisible = (variant: ButtonVariant): Story => ({
  args: { variant },
  play: async ({ userEvent }) => {
    await userEvent.tab();
  },
});

export const Forward: Story = { args: { variant: 'forward' } };
export const ForwardHover: Story = hover('forward');
export const ForwardFocusVisible: Story = focusVisible('forward');
export const ForwardDisabled: Story = { args: { variant: 'forward', disabled: true } };

export const Dashed: Story = { args: { variant: 'dashed', size: 'sm' } };
export const DashedHover: Story = hover('dashed');
export const DashedFocusVisible: Story = focusVisible('dashed');
export const DashedDisabled: Story = { args: { variant: 'dashed', disabled: true } };

export const Gradient: Story = {
  args: { variant: 'gradient', size: 'lg', fullWidth: true, children: t('login.form.submit') },
};
export const GradientHover: Story = {
  ...hover('gradient'),
  args: { variant: 'gradient', children: t('login.form.submit') },
};
export const GradientFocusVisible: Story = {
  ...focusVisible('gradient'),
  args: { variant: 'gradient', children: t('login.form.submit') },
};
export const GradientDisabled: Story = {
  args: { variant: 'gradient', disabled: true, children: t('login.form.submit') },
};

export const Cyan: Story = { args: { variant: 'cyan', size: 'lg' } };
export const CyanHover: Story = hover('cyan');
export const CyanFocusVisible: Story = focusVisible('cyan');
export const CyanDisabled: Story = { args: { variant: 'cyan', disabled: true } };
