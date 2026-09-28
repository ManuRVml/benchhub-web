import { CategoryTiers } from './CategoryTiers';

import type { VisualizationCategory } from '@/entities/analysis';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Widgets/CategoryTiers',
  component: CategoryTiers,
  parameters: { layout: 'padded' },
  argTypes: {
    categories: { control: false },
    onSelectCategory: { action: 'onSelectCategory' },
  },
} satisfies Meta<typeof CategoryTiers>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATEGORIES: VisualizationCategory[] = [
  {
    id: 'rentabilidad',
    label: 'Rentabilidad',
    tierId: 2,
    message: 'Ecopetrol mantiene margen sólido pese a la contracción.',
  },
  { id: 'liquidez', label: 'Liquidez', tierId: 1, message: 'Liquidez sana frente a pares.' },
  {
    id: 'operacional',
    label: 'Operacional',
    tierId: 3,
    message: 'Seguimiento cercano a la operación.',
  },
  {
    id: 'competitividad_opex',
    label: 'Competitividad OPEX',
    tierId: 1,
    message: 'Costos competitivos frente al sector.',
  },
  { id: 'solvencia', label: 'Solvencia', tierId: 4, message: 'Requiere atención prioritaria.' },
  { id: 'esg', label: 'ESG', tierId: 2, message: 'Desempeño alineado con el sector.' },
];

export const Default: Story = {
  args: {
    categories: CATEGORIES,
    selectedCategory: 'rentabilidad',
    onSelectCategory: () => {
      /* noop for story */
    },
  },
};
