import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';

import { Popover, PopoverGroup } from './Popover';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Copy comes from the i18n catalogue (no hard-coded UI copy); any existing key works as sample text.
const meta = {
  title: 'Composites/Popover',
  component: Popover,
  args: {
    label: t('analyses.filters.status.label'),
    trigger: <Button variant="outline">{t('analyses.filters.status.label')}</Button>,
    children: t('analyses.empty.noResults'),
    onOpenChange: fn(),
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  decorators: [
    (Story) => (
      <div className="p-48">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { open: true } };

/** Opening one popover of the group closes the other (CF-61). */
export const SingleOpenGroup: Story = {
  render: () => (
    <PopoverGroup>
      <div className="flex gap-16">
        <Popover
          label={t('analyses.filters.date.label')}
          trigger={<Button variant="outline">{t('analyses.filters.date.label')}</Button>}
        >
          {t('analyses.table.columns.createdAt')}
        </Popover>
        <Popover
          label={t('analyses.filters.creator.label')}
          trigger={<Button variant="outline">{t('analyses.filters.creator.label')}</Button>}
        >
          {t('analyses.table.columns.createdBy')}
        </Popover>
      </div>
    </PopoverGroup>
  ),
};
