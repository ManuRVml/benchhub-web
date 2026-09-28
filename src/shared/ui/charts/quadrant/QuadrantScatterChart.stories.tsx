import { QuadrantScatterChart } from './QuadrantScatterChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype QUADRANT_TOP / QUADRANT_BOTTOM positions (BencHUD.dc.html L3331–3345; computed-only logic, never rendered
// in V2). Axis and quadrant texts are illustrative sample data for the SCR-08 comparison-profile map; company names
// and colour keys are data. YPF / Pemex have no company token and use the fallback colour.
const POINTS = [
  { id: 'chevron', label: 'Chevron', x: 22, y: 20, colorKey: 'chevron' },
  { id: 'exxon', label: 'Exxon', x: 50, y: 12, colorKey: 'exxon' },
  { id: 'oxy', label: 'Oxy', x: 10, y: 52, colorKey: 'oxy' },
  { id: 'petrobras', label: 'Petrobras', x: 35, y: 82, colorKey: 'petrobras' },
  { id: 'shell', label: 'Shell', x: 55, y: 48, colorKey: 'shell' },
  { id: 'bp', label: 'BP', x: 55, y: 82, colorKey: 'bp' },
  { id: 'equinor', label: 'Equinor', x: 72, y: 48, colorKey: 'equinor' },
  { id: 'ecopetrol', label: 'Ecopetrol', x: 72, y: 82, colorKey: 'ecopetrol' },
  { id: 'repsol', label: 'Repsol', x: 82, y: 24, colorKey: 'repsol' },
  { id: 'totalenergies', label: 'TotalEnergies', x: 90, y: 60, colorKey: 'totalenergies' },
  { id: 'ypf', label: 'YPF', x: 30, y: 35, colorKey: 'ypf' },
  { id: 'pemex', label: 'Pemex', x: 44, y: 72, colorKey: 'pemex' },
];

const meta = {
  title: 'Charts/QuadrantScatterChart',
  component: QuadrantScatterChart,
  args: {
    ariaLabel: 'Mapa de posicionamiento de pares',
    points: POINTS,
    xLabel: 'Hidrocarburos',
    yLabel: 'Transición energética',
    xMid: 50,
    yMid: 50,
    quadrantLabels: {
      topLeft: 'Transición',
      topRight: 'Integradas',
      bottomLeft: 'Nicho',
      bottomRight: 'Tradicionales',
    },
  },
} satisfies Meta<typeof QuadrantScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PeerPositioning: Story = { name: 'Posicionamiento de pares (cuadrantes)' };
