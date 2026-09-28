import { ComparisonProfilesSummary } from './ComparisonProfilesSummary';

import type {
  ComparisonProfileResult,
  ComparisonProfileSummaryRow,
} from './ComparisonProfilesSummary';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Widgets/ComparisonProfilesSummary',
  component: ComparisonProfilesSummary,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    result: { control: false },
    summaryTable: { control: false },
    onSelectProfile: { action: 'onSelectProfile' },
  },
} satisfies Meta<typeof ComparisonProfilesSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

const SUMMARY_TABLE: ComparisonProfileSummaryRow[] = [
  {
    profileId: 'prf_1',
    name: 'Perfil 1 · Descarbonización',
    subtitle: 'Descarbonización · Renovables · Shell, Equinor',
    year: 2025,
    ecopetrolScore: 64.8,
    peerAvg: 77.2,
    gapPts: -12.4,
    position: 3,
    of: 3,
    isActive: true,
  },
  {
    profileId: 'prf_2',
    name: 'Perfil 2 · Hidrocarburos',
    subtitle: 'Hidrocarburos · Upstream · Exxon, Chevron, Petrobras, Pemex',
    year: 2025,
    ecopetrolScore: 66.2,
    peerAvg: 70.5,
    gapPts: -4.3,
    position: 4,
    of: 5,
    isActive: false,
  },
  {
    profileId: 'prf_3',
    name: 'Perfil 3 · Gas',
    subtitle: 'Gas y GNL · Equinor, Shell, TotalEnergies, YPF',
    year: 2024,
    ecopetrolScore: 62.1,
    peerAvg: 70.8,
    gapPts: -8.7,
    position: 4,
    of: 5,
    isActive: false,
  },
];

// P4-22 oracle, 2-peer scenario (SCR-08 module 9).
const RESULT_2_PEERS: ComparisonProfileResult = {
  score: 64.8,
  gapPts: -12.4,
  position: 3,
  of: 3,
  peerAvg: 77.2,
  ranking: [
    { companyId: 'cmp_shell', name: 'Shell', score: 77.6, isEcopetrol: false },
    { companyId: 'cmp_equinor', name: 'Equinor', score: 76.7, isEcopetrol: false },
    { companyId: 'cmp_ecopetrol', name: 'Ecopetrol', score: 64.8, isEcopetrol: true },
  ],
  insight:
    'Ecopetrol ocupa el puesto 3 de 3 con 64.8 pts (-12.4 vs. pares). Su mayor brecha está en la dimensión ' +
    'Transversal (-20 pts): subir su peso en el perfil amplifica el rezago, bajarlo mejora la posición relativa. ' +
    'Entre los perfiles, el escenario más favorable es "Perfil 2 · Hidrocarburos" y el más exigente ' +
    '"Perfil 1 · Descarbonización".',
};

// P4-22 oracle, 4-peer scenario (SCR-08 module 9).
const RESULT_4_PEERS: ComparisonProfileResult = {
  score: 64.8,
  gapPts: -11.6,
  position: 5,
  of: 5,
  peerAvg: 76.4,
  ranking: [
    { companyId: 'cmp_totalenergies', name: 'TotalEnergies', score: 78.4, isEcopetrol: false },
    { companyId: 'cmp_shell', name: 'Shell', score: 77.6, isEcopetrol: false },
    { companyId: 'cmp_equinor', name: 'Equinor', score: 76.7, isEcopetrol: false },
    { companyId: 'cmp_bp', name: 'BP', score: 73, isEcopetrol: false },
    { companyId: 'cmp_ecopetrol', name: 'Ecopetrol', score: 64.8, isEcopetrol: true },
  ],
  insight:
    'Ecopetrol ocupa el puesto 5 de 5 con 64.8 pts (-11.6 vs. pares). Su mayor brecha está en la dimensión ' +
    'Transversal (-21 pts).',
};

export const Default: Story = {
  args: {
    result: RESULT_2_PEERS,
    summaryTable: SUMMARY_TABLE,
    onSelectProfile: () => {
      /* noop for story */
    },
  },
};

const SUMMARY_TABLE_4_PEERS: ComparisonProfileSummaryRow[] = [
  {
    profileId: 'prf_1',
    name: 'Perfil 1 · Descarbonización',
    subtitle: 'Descarbonización · Renovables · Shell, BP, TotalEnergies, Equinor',
    year: 2025,
    ecopetrolScore: 64.8,
    peerAvg: 76.4,
    gapPts: -11.6,
    position: 5,
    of: 5,
    isActive: true,
  },
  {
    profileId: 'prf_2',
    name: 'Perfil 2 · Hidrocarburos',
    subtitle: 'Hidrocarburos · Upstream · Exxon, Chevron, Petrobras, Pemex',
    year: 2025,
    ecopetrolScore: 66.2,
    peerAvg: 70.5,
    gapPts: -4.3,
    position: 4,
    of: 5,
    isActive: false,
  },
  {
    profileId: 'prf_3',
    name: 'Perfil 3 · Gas',
    subtitle: 'Gas y GNL · Equinor, Shell, TotalEnergies, YPF',
    year: 2024,
    ecopetrolScore: 62.1,
    peerAvg: 70.8,
    gapPts: -8.7,
    position: 4,
    of: 5,
    isActive: false,
  },
];

export const FourPeers: Story = {
  args: {
    result: RESULT_4_PEERS,
    summaryTable: SUMMARY_TABLE_4_PEERS,
    onSelectProfile: () => {
      /* noop for story */
    },
  },
};
