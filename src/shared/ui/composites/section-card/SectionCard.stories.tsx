import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';

import { InfoGroup } from './info-group';
import { SectionCard } from './SectionCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype copy from the i18n catalogue (SCR-08 "Resumen del informe", SCR-09 "Composición de peso").
const meta = {
  title: 'Composites/SectionCard',
  component: SectionCard,
  args: {
    title: t('analysis-results.reportSummary.title'),
    info: t('analysis-results.reportSummary.info'),
    actions: (
      <Button variant="outline" size="sm">
        {t('analysis-results.reportSummary.excelButton')}
      </Button>
    ),
    children: t('analysis-report.indicatorPanel.headerInfo'),
    onInfoOpenChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-160">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InfoOpen: Story = { args: { defaultInfoOpen: true } };

export const WithEyebrowAndSubtitle: Story = {
  args: {
    eyebrow: t('analysis-results.findingsRail.eyebrow'),
    title: t('analysis-report.weightComposition.title'),
    subtitle: t('analysis-report.weightComposition.subtitle'),
    info: t('analysis-report.weightComposition.info'),
  },
};

export const WithoutInfo: Story = { args: { info: undefined, actions: undefined } };

/** SCR-05 group: uppercase eyebrow title with its "(i)" toggle, straight on the page (prototype L255). */
export const EyebrowGroup: Story = {
  args: {
    title: t('home.sectionTitles.enabledAnalyses'),
    info: t('home.sectionInfo.enabledAnalyses'),
    titleVariant: 'eyebrow',
    surface: 'none',
    headingLevel: 2,
  },
};

/** Two cards in one InfoGroup: opening one "(i)" panel closes the other (CF-61). */
export const SingleOpenGroup: Story = {
  render: () => (
    <InfoGroup defaultOpenId="report">
      <div className="flex flex-col gap-16">
        <SectionCard
          infoId="report"
          title={t('analysis-results.reportSummary.title')}
          info={t('analysis-results.reportSummary.info')}
        >
          {t('analysis-report.indicatorPanel.headerInfo')}
        </SectionCard>
        <SectionCard
          infoId="categories"
          title={t('analysis-report.categories.title')}
          info={t('analysis-report.categories.info')}
        >
          {t('analysis-report.weightComposition.subtitle')}
        </SectionCard>
      </div>
    </InfoGroup>
  ),
};
