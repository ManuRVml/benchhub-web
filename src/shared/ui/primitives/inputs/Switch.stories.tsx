import { t } from '@/shared/i18n';

import { Switch } from './Switch';

import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-16 "Accesibilidad" preferences.
const meta = {
  title: 'Primitives/Inputs/Switch',
  component: Switch,
  args: { label: t('settings.accessibility.highContrast.label') },
  decorators: [
    (Story) => (
      <div className="max-w-140">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { label: t('settings.accessibility.emailNotifications.label'), defaultChecked: true },
};

export const Disabled: Story = { args: { disabled: true } };

// SCR-16 prototype on-colour (#10B981 = status.success.base).
export const SuccessTone: Story = {
  args: {
    label: t('settings.accessibility.emailNotifications.label'),
    defaultChecked: true,
    tone: 'success',
  },
};
