import { AnalysesTable } from './AnalysesTable';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/AnalysesTable',
  component: AnalysesTable,
} satisfies Meta<typeof AnalysesTable>;

export default meta;
type Story = StoryObj;

const ROWS = [
  {
    id: 'an-001',
    name: 'Desempeño comparativo — 4T 2025',
    description:
      'Referenciamiento competitivo trimestral de Ecopetrol frente a pares del sector energético en solvencia, rentabilidad, liquidez, OPEX y crecimiento.',
    createdAt: '2025-10-03',
    createdBy: 'Camila Bravo',
    status: 'in_review' as const,
  },
  {
    id: 'an-002',
    name: 'Análisis anual 2024 vs. pares',
    description:
      'Comparación anual de indicadores financieros y operativos frente al grupo de pares del sector energético.',
    createdAt: '2025-01-14',
    createdBy: 'Jorge Salas',
    status: 'published' as const,
  },
  {
    id: 'an-003',
    name: 'Sensibilidad ROACE — Escenario optimista',
    description:
      'Simulación de productividad y costos operativos para evaluar el cierre de brecha en ROACE.',
    createdAt: '2025-08-22',
    createdBy: 'Camila Bravo',
    status: 'draft' as const,
  },
];

export const List: Story = {
  args: {
    rows: ROWS,
    onViewDetails: (_id: string) => {
      // log for debugging: console.log('View details:', id);
    },
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    onViewDetails: (_id: string) => {
      // log for debugging: console.log('View details:', id);
    },
  },
};
