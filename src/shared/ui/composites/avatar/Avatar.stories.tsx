import { Avatar } from './Avatar';

import type { Meta, StoryObj } from '@storybook/react-vite';

// The user name is sample data of A-04 session (`user.displayName`, mock "Camila Bravo").
const meta = {
  title: 'Composites/Avatar',
  component: Avatar,
  args: { name: 'Camila Bravo', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    tone: { control: 'inline-radio', options: ['subtle', 'brand'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No photo: initials on `brand.primarySubtle`. */
export const Initials: Story = {};

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

/** SCR-16 settings profile: 52px, initials on `brand.primary`. */
export const ProfileBrand: Story = { args: { size: 'xl', tone: 'brand' } };

/** A photo that fails to load falls back to the initials. */
export const BrokenPhoto: Story = { args: { src: 'missing-avatar.png' } };
