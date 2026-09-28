import { fn } from 'storybook/test';

import { CompanyProfileModal } from '../ui/CompanyProfileModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Features/CompanyProfile/CompanyProfileModal',
  component: CompanyProfileModal,
  args: {
    open: true,
    onOpenChange: fn(),
    profile: {
      company: { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
      country: 'Estados Unidos',
      category: 'Super Major',
      business: 'Integrado global',
      segments: ['Upstream', 'Downstream', 'Chemicals'],
      news: [
        {
          id: 'nws_01J9Y9C3D4',
          headline: 'Producción récord en el Pérmico impulsa el flujo de caja.',
          impact: 'up',
        },
      ],
    },
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    profile: { control: false },
    isLoading: { control: 'boolean' },
    error: { control: false },
  },
} satisfies Meta<typeof CompanyProfileModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chevron: Story = {
  args: {
    onOpenChange: fn(),
    profile: {
      company: { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
      country: 'Estados Unidos',
      category: 'Super Major',
      business: 'Integrado global',
      segments: ['Upstream', 'Downstream', 'Chemicals'],
      news: [
        {
          id: 'nws_01J9Y9C3D4',
          headline: 'Producción récord en el Pérmico impulsa el flujo de caja.',
          impact: 'up',
        },
        {
          id: 'nws_01J9Y9C3D5',
          headline: 'Nueva plataforma offshore en el Golfo de México.',
          impact: 'neutral',
        },
      ],
    },
  },
};

export const EmptyNews: Story = {
  args: {
    onOpenChange: fn(),
    profile: {
      company: { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
      country: 'Estados Unidos',
      category: 'Super Major',
      business: 'Integrado global',
      segments: ['Upstream', 'Downstream', 'Chemicals'],
      news: [],
    },
  },
};
