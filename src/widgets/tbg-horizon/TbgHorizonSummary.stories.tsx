import { TbgHorizonSummary } from './TbgHorizonSummary';

import type { TbgHorizonSummaryComposition } from './TbgHorizonSummary';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/TbgHorizonSummary',
  component: TbgHorizonSummary,
} satisfies Meta<typeof TbgHorizonSummary>;

export default meta;
type Story = StoryObj;

// A sample of docs/design/screen-inventory/SCR-08-resultados.md's module 7 capture: at least one 'over', one 'ok'
// and one 'under' company, plus one with a Financiera/Operativa hybrid segment.
const COMPOSITION: TbgHorizonSummaryComposition[] = [
  {
    companyId: 'bp',
    name: 'BP',
    finPct: 55,
    opPct: 15,
    transPct: 31,
    totalPct: 101,
    sumStatus: 'over',
  },
  {
    companyId: 'equinor',
    name: 'Equinor',
    finPct: 34,
    opPct: 34,
    transPct: 34,
    totalPct: 102,
    sumStatus: 'over',
  },
  {
    companyId: 'oxy',
    name: 'Oxy',
    finPct: 70,
    opPct: 10,
    transPct: 20,
    totalPct: 100,
    sumStatus: 'ok',
  },
  {
    companyId: 'petrobras',
    name: 'Petrobras',
    finPct: 33,
    opPct: 0,
    finOpPct: 33,
    transPct: 66,
    totalPct: 99,
    sumStatus: 'under',
  },
  {
    companyId: 'shell',
    name: 'Shell',
    finPct: 35,
    opPct: 40,
    transPct: 26,
    totalPct: 101,
    sumStatus: 'over',
  },
];

export const Default: Story = {
  args: {
    kpis: { companies: 11, avgFinPct: 47, avgOpPct: 22, avgTransPct: 33 },
    composition: COMPOSITION,
  },
};

export const Empty: Story = {
  args: {
    kpis: { companies: 0, avgFinPct: 0, avgOpPct: 0, avgTransPct: 0 },
    composition: [],
  },
};
