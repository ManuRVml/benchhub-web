import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { Accordion } from './Accordion';

import type { AccordionItem } from './Accordion';
import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-08 module 4 category groups. Category and indicator names are data (V-12 categoryRef.label), so they are not
// i18n keys; the summary and row copy come from the catalogue.
const row = (text: string) => <p className="px-16 py-12 text-body text-text-heading">{text}</p>;

const ITEMS: AccordionItem[] = [
  {
    id: 'profitability',
    title: 'Rentabilidad',
    summary: t('analysis-results.companyComparison.wins', { wins: 2, total: 3 }),
    content: row('ROACE'),
  },
  {
    id: 'liquidity',
    title: 'Liquidez',
    summary: t('analysis-results.companyComparison.wins', { wins: 1, total: 2 }),
    content: row(t('analysis-results.companyComparison.polarity.lowerIsBetter')),
  },
  {
    id: 'solvency',
    title: 'Solvencia',
    content: row(t('analysis-results.companyComparison.outcome.below')),
  },
];

const meta = {
  title: 'Composites/Accordion',
  component: Accordion,
  args: { items: ITEMS, onValueChange: fn() },
  argTypes: { headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

/** SCR-08 opens every category by default. */
export const AllOpen: Story = { args: { defaultOpen: ITEMS.map((item) => item.id) } };

export const OneOpen: Story = { args: { defaultOpen: ['liquidity'] } };
