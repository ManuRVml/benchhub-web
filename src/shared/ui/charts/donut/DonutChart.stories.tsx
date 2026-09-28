import { t } from '@/shared/i18n';

import { DonutChart } from './DonutChart';

import type { DonutSegment } from './DonutChart';
import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-11 "Composición del Monitor por categoría" (V-31): category weights of CAT_TARGETS (BencHUD.dc.html L4103) and the
// global compliance of the Abril 2026 snapshot in the centre (96,1 %). Category names are data.
const CATEGORIES: DonutSegment[] = [
  { id: 'financiero', label: 'Financiero', value: 60, colorKey: 'chart.category.financiero' },
  { id: 'mercado', label: 'Mercado', value: 15, colorKey: 'chart.category.mercado' },
  { id: 'estrategico', label: 'Estratégico', value: 20, colorKey: 'chart.category.estrategico' },
  {
    id: 'grupos_interes',
    label: 'Grupos de Interés',
    value: 5,
    colorKey: 'chart.category.gruposInteres',
  },
];

const meta = {
  title: 'Charts/DonutChart',
  component: DonutChart,
  args: {
    segments: CATEGORIES,
    centerLabel: t('value-monitor.composition.centerLabel'),
    centerValue: 96.1,
    unit: 'percent',
    decimals: 0,
    ariaLabel: t('value-monitor.composition.title'),
    segmentLabel: t('value-monitor.composition.columnCategory'),
    valueLabel: t('value-monitor.composition.columnWeight'),
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MonitorComposition: Story = { name: 'Monitor · composición por categoría' };

/** A category without a weight draws no arc and reads "—" in the data table; the centre has no value yet. */
export const MissingData: Story = {
  args: {
    segments: CATEGORIES.map((segment) =>
      segment.id === 'mercado' ? { ...segment, value: null } : segment,
    ),
    centerValue: null,
  },
};
