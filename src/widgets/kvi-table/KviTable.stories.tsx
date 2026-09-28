import { KviTable } from './KviTable';

import type { KviTableRow, KviTargetsChange } from './KviTable';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/KviTable',
  component: KviTable,
} satisfies Meta<typeof KviTable>;

export default meta;
type Story = StoryObj;

// A sample of docs/design/screen-inventory/SCR-11-monitor-valor.md's 22 KVI rows: one of each row kind (editable,
// lower-is-better, TBD, text mode).
const ROWS: KviTableRow[] = [
  {
    kviId: 'kvi-fcl',
    code: 'KVI-FCL',
    category: 'Financiero',
    categoryId: 'financiero',
    label: 'Flujo de Caja Libre',
    unit: 'BCOP',
    weightPct: 10,
    owner: 'Diego Gómez',
    meta: 7.19,
    metaReto: 10.53,
    real: 10.69,
    resultPct: 149,
    retoPct: 102,
    resultBand: 'ok',
    retoBand: 'ok',
    isTbd: false,
    isTextMode: false,
    lowerIsBetter: false,
    isEditable: true,
    traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
  },
  {
    kviId: 'kvi-deuda',
    code: 'KVI-DEUDA',
    category: 'Financiero',
    categoryId: 'financiero',
    label: 'Deuda Bruta / EBITDA',
    unit: 'Veces',
    weightPct: 5,
    owner: 'Kellin Sánchez',
    meta: 2.5,
    metaReto: 1.5,
    real: 2.32,
    resultPct: 108,
    retoPct: 65,
    resultBand: 'ok',
    retoBand: 'risk',
    isTbd: false,
    isTextMode: false,
    lowerIsBetter: true,
    isEditable: true,
    traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
  },
  {
    kviId: 'kvi-cobertura',
    code: 'KVI-COBERTURA',
    category: 'Financiero',
    categoryId: 'financiero',
    label: 'Cobertura de Intereses',
    unit: 'MUSD',
    weightPct: 5,
    owner: 'Juan Carlos López',
    meta: 8.14,
    metaReto: 26.5,
    real: 6.1,
    resultPct: 75,
    retoPct: 23,
    resultBand: 'watch',
    retoBand: 'risk',
    isTbd: false,
    isTextMode: false,
    lowerIsBetter: false,
    isEditable: true,
    traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
  },
  {
    kviId: 'kvi-roacewacc',
    code: 'KVI-ROACEWACC',
    category: 'Financiero',
    categoryId: 'financiero',
    label: 'ROACE menos WACC',
    unit: '%',
    weightPct: null,
    owner: 'Liz Cardona',
    meta: null,
    metaReto: null,
    real: null,
    resultPct: null,
    retoPct: null,
    resultBand: 'tbd',
    retoBand: 'tbd',
    isTbd: true,
    isTextMode: false,
    lowerIsBetter: false,
    isEditable: false,
    traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
  },
  {
    kviId: 'kvi-riesgocred',
    code: 'KVI-RIESGOCRED',
    category: 'Mercado',
    categoryId: 'mercado',
    label: 'Calificación de Riesgo Crediticio',
    unit: 'Rating',
    weightPct: null,
    owner: 'GMV',
    meta: null,
    metaReto: null,
    real: null,
    metaText: 'BB',
    metaRetoText: 'BB',
    realText: 'BB',
    resultPct: 100,
    retoPct: 100,
    resultBand: 'ok',
    retoBand: 'ok',
    isTbd: false,
    isTextMode: true,
    lowerIsBetter: false,
    isEditable: false,
    traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
  },
];

export const Table: Story = {
  args: {
    rows: ROWS,
    year: 2025,
    onTargetsChange: (_change: KviTargetsChange) => {
      // log for debugging: console.log('Targets changed:', change);
    },
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    year: 2025,
    onTargetsChange: (_change: KviTargetsChange) => {
      // log for debugging: console.log('Targets changed:', change);
    },
  },
};
