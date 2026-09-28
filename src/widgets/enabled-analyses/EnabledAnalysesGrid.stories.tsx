import { MemoryRouter } from 'react-router';

import { EnabledAnalysesGrid } from './EnabledAnalysesGrid';

import type { EnabledAnalysis } from './EnabledAnalysesGrid';
import type { Meta, StoryObj } from '@storybook/react';

const mockItems: EnabledAnalysis[] = [
  {
    id: '1',
    title: 'Informe de referenciamiento de pares',
    description: 'Seguimiento trimestral de Ecopetrol vs. 14 compañías del sector.',
    status: 'published',
    updatedAt: '2024-01-01T10:00:00Z',
    ownerName: 'Alejandra',
    targetRoute: '/analisis/1/visualizacion',
  },
  {
    id: '2',
    title: 'Referentes estratégicos',
    description: 'TBG e ILP frente a pares del sector energético.',
    status: 'in_review',
    updatedAt: '2024-01-15T10:00:00Z',
    ownerName: 'Andrea',
    targetRoute: '/analisis/2/resultados',
  },
  {
    id: '3',
    title: 'Monitor de Valor',
    description: 'Drivers financieros y sensibilidades de generación de valor.',
    status: 'draft',
    updatedAt: '2024-01-08T10:00:00Z',
    ownerName: 'Mauricio',
    targetRoute: '/analisis/3/definicion',
  },
  {
    id: '4',
    title: 'Comparativo sectorial oil & gas',
    description: 'Rentabilidad y solvencia frente a majors internacionales.',
    status: 'published',
    updatedAt: '2024-01-10T10:00:00Z',
    ownerName: 'Camila',
    targetRoute: '/analisis/4/visualizacion',
  },
];

export default {
  title: 'Widgets/EnabledAnalysesGrid',
  component: EnabledAnalysesGrid,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

export const Default = {
  args: {
    items: mockItems,
  },
} satisfies StoryObj;
