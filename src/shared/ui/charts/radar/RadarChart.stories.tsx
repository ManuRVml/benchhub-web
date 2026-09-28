import { RadarChart } from './RadarChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Axis labels, company names and values are data of the contracts, not UI copy.

// SCR-09 radar: Ecopetrol's declared weights vs the sector average (prototype ECOPETROL_PESO 45/30/25, peer
// average 43/30/28, BencHUD.dc.html L4607).
const DIMENSIONS = [
  { id: 'fin', label: 'Financiera' },
  { id: 'op', label: 'Operativa' },
  { id: 'trans', label: 'Transversal' },
];

// SCR-11 benchmark radar (V-36): 20 non-TBD KVIs of the Monitor; Ecopetrol = min(Resultado Monitor, 100) from the
// prototype (SENS_INDICATORS, L4085–4101; EFI / TIR Pareto from the V-36 prose). Peer values are seeded fixtures (the
// prototype has no peer KVI dataset, SCR-11 A9).
const KVIS: [string, number | null, number | null][] = [
  ['Flujo de Caja Libre', 100, 88],
  ['Deuda Bruta / EBITDA', 72, 92],
  ['Cobertura de Intereses', 75, 81],
  ['Eficiencias', 100, 77],
  ['ROACE', 94, 86],
  ['ROACE menos WACC', 90, 70],
  ['Calificación de Riesgo Crediticio', 100, 95],
  ['TRR (renta variable)', 100, 84],
  ['Bond Spread (renta fija)', 97, 90],
  ['Precio Objetivo Analistas', 89, 93],
  ['Dividendos Recibidos', 97, 66],
  ['CT+i', 93, 72],
  ['Dividendos recibidos / intereses pagados', 34, 58],
  ['Margen EBITDA ISA', 75, null],
  ['Costo Energía GE', 100, 79],
  ['IRR', 100, 85],
  ['Estrategia Diversificación', 61, 74],
  ['EFI Activos Pareto Upstream', 80, 88],
  ['TIR Activos Pareto Upstream', 83, 91],
  ['Aporte al PIB', 91, 62],
];

const meta = {
  title: 'Charts/RadarChart',
  component: RadarChart,
  args: {
    ariaLabel: 'Peso por dimensión · Ecopetrol vs. promedio del sector',
    axes: DIMENSIONS,
    unit: 'percent',
    series: [
      { id: 'ecopetrol', label: 'Ecopetrol', colorKey: 'ecopetrol', values: [45, 30, 25] },
      { id: 'sector', label: 'Promedio sector', colorKey: 'chart.average', values: [43, 30, 28] },
    ],
  },
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SCR-09: three dimension axes. */
export const EcopetrolVsSector: Story = { name: 'Ecopetrol vs. sector (3 ejes)' };

/** SCR-11: 20 KVI axes, Ecopetrol vs Shell (Shell has no "Margen EBITDA ISA": "—", no vertex). */
export const MonitorBenchmark: Story = {
  name: 'Benchmark radial del Monitor (20 ejes)',
  args: {
    ariaLabel: 'Benchmark radial · Ecopetrol vs. Shell 2025',
    axes: KVIS.map(([label], index) => ({ id: `kvi_${String(index + 1)}`, label, max: 100 })),
    unit: 'number',
    height: 420,
    series: [
      {
        id: 'ecopetrol',
        label: 'Ecopetrol 2025',
        colorKey: 'ecopetrol',
        values: KVIS.map(([, eco]) => eco),
      },
      {
        id: 'shell',
        label: 'Shell 2025',
        colorKey: 'shell',
        values: KVIS.map(([, , shell]) => shell),
      },
    ],
  },
};
