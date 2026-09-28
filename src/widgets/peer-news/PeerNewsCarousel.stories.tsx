import { PeerNewsCarousel, type PeerNewsItem } from './PeerNewsCarousel';

import type { StoryObj } from '@storybook/react';

const createMockItem = (overrides: Partial<PeerNewsItem> = {}): PeerNewsItem => ({
  id: `item-${overrides.id ?? '1'}`,
  companyId: 'company-1',
  companyName: 'Company Name',
  colorKey: 'ecopetrol',
  initials: 'CN',
  impact: 'up',
  headline: 'Headline text',
  source: 'Source name',
  ...overrides,
});

export default {
  component: PeerNewsCarousel,
  title: 'widgets/peer-news/PeerNewsCarousel',
};

type Story = StoryObj<typeof PeerNewsCarousel>;

export const Default: Story = {
  args: {
    items: Array.from({ length: 5 }).map((_, i) => createMockItem({ id: String(i) })),
  },
};

export const Paged: Story = {
  args: {
    items: Array.from({ length: 7 }).map((_, i) => createMockItem({ id: String(i) })),
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
