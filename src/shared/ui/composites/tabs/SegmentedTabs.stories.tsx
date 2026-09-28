import { useState } from 'react';
import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { SegmentedTabs } from './SegmentedTabs';
import { TabPanel } from './TabBar';

import type { SegmentedTabsProps } from './SegmentedTabs';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype labels from the i18n catalogue: SCR-04/07/08 analysis tabs, SCR-08 horizon, SCR-09 dimension tabs, SCR-16
// font size (A- / A / A+). Company names in the withDot story are data.
const ANALYSIS_TABS = [
  { id: 'definition', label: t('common.analysisTabs.definition') },
  { id: 'results', label: t('common.analysisTabs.results') },
  { id: 'presentation', label: t('common.analysisTabs.presentation') },
];

const meta = {
  title: 'Composites/SegmentedTabs',
  component: SegmentedTabs,
  args: {
    items: ANALYSIS_TABS,
    defaultValue: 'results',
    'aria-label': t('common.a11y.analysisTabs'),
    variant: 'brand',
    size: 'md',
    onChange: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['brand', 'dark', 'dimension', 'buttons', 'withDot'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
  },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnalysisTabs: Story = {};

export const Horizon: Story = {
  args: {
    variant: 'dark',
    defaultValue: 'tbg',
    'aria-label': t('analysis-definition.step3.horizonFilterLabel'),
    items: [
      { id: 'tbg', label: t('analysis-results.frame.horizon.tbg') },
      { id: 'ilp', label: t('analysis-results.frame.horizon.ilp') },
      { id: 'union', label: t('analysis-results.frame.horizon.tbgAndIlp') },
    ],
  },
};

export const Dimension: Story = {
  args: {
    variant: 'dimension',
    size: 'sm',
    defaultValue: 'operativa',
    'aria-label': t('analysis-results.tbgDimensionWeights.title'),
    items: [
      {
        id: 'financiera',
        label: t('analysis-results.tbgDimensionWeights.dimensionTabs.financiera'),
        dimension: 'financiera',
      },
      {
        id: 'operativa',
        label: t('analysis-results.tbgDimensionWeights.dimensionTabs.operativa'),
        dimension: 'operativa',
      },
      {
        id: 'transversal',
        label: t('analysis-results.tbgDimensionWeights.dimensionTabs.transversal'),
        dimension: 'transversal',
      },
    ],
  },
};

export const FontSizeControls: Story = {
  args: {
    variant: 'buttons',
    size: 'sm',
    defaultValue: 'normal',
    'aria-label': t('settings.accessibility.fontSize.label'),
    items: [
      {
        id: 'decrease',
        label: t('settings.accessibility.fontSize.decrease'),
        className: 'text-11 font-medium',
      },
      {
        id: 'normal',
        label: t('settings.accessibility.fontSize.normal'),
        className: 'text-13 font-semibold',
      },
      {
        id: 'increase',
        label: t('settings.accessibility.fontSize.increase'),
        className: 'text-14 font-semibold',
      },
    ],
  },
};

export const WithDot: Story = {
  args: {
    variant: 'withDot',
    defaultValue: 'shell',
    'aria-label': t('analysis-results.companyComparison.title'),
    items: [
      { id: 'shell', label: 'Shell', dotClassName: 'bg-company-shell' },
      { id: 'chevron', label: 'Chevron', dotClassName: 'bg-company-chevron' },
      { id: 'petrobras', label: 'Petrobras', dotClassName: 'bg-company-petrobras' },
    ],
  },
};

export const WithDisabledTab: Story = {
  args: {
    items: [
      ...ANALYSIS_TABS.slice(0, 2),
      { id: 'presentation', label: t('common.analysisTabs.presentation'), disabled: true },
    ],
  },
};

const PANEL_TEXT: Record<string, string> = {
  definition: t('analysis-definition.placeholder.title'),
  results: t('analysis-results.placeholder.title'),
  presentation: t('common.analysisTabs.presentation'),
};

function TabsWithPanels(props: SegmentedTabsProps) {
  const [value, setValue] = useState('definition');
  return (
    <div className="grid gap-12">
      <SegmentedTabs {...props} value={value} onChange={setValue} idPrefix="story-analysis" />
      {ANALYSIS_TABS.map((item) => (
        <TabPanel
          key={item.id}
          idPrefix="story-analysis"
          itemId={item.id}
          hidden={item.id !== value}
        >
          {PANEL_TEXT[item.id]}
        </TabPanel>
      ))}
    </div>
  );
}

/** Tabs that switch panels: pass `idPrefix` and render one `TabPanel` per tab. */
export const WithPanels: Story = { render: (args) => <TabsWithPanels {...args} /> };
