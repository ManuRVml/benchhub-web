import { FutureAspiration } from './FutureAspiration';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/FutureAspiration',
  component: FutureAspiration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FutureAspiration>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTiles = {
  ecopetrolProductionKbped: 855,
  totalRank: 9,
  of: 10,
  lowEmissionsSharePct: {
    ecopetrol: 11,
    peers: 9,
  },
};

const mockSegments: {
  id: 'total' | 'crude' | 'gas' | 'unconventional' | 'lowEmissions';
  label: string;
  colorKey?: string;
}[] = [
  { id: 'total', label: 'Total' },
  { id: 'crude', label: 'Crudo convencional', colorKey: 'crude' },
  { id: 'gas', label: 'Gas natural', colorKey: 'gas' },
  { id: 'unconventional', label: 'No convencional / offshore', colorKey: 'unconventional' },
  { id: 'lowEmissions', label: 'Bajas emisiones (boe eq.)', colorKey: 'lowEmissions' },
];

const mockRows = [
  {
    rank: 1,
    companyId: 'exxon',
    name: 'Exxon',
    isEcopetrol: false,
    segments: { crude: 2000, gas: 1500, unconventional: 500, lowEmissions: 750 },
    total: 4750,
  },
  {
    rank: 2,
    companyId: 'petrobras',
    name: 'Petrobras',
    isEcopetrol: false,
    segments: { crude: 1500, gas: 1000, unconventional: 400, lowEmissions: 470 },
    total: 3370,
  },
  {
    rank: 3,
    companyId: 'chevron',
    name: 'Chevron',
    isEcopetrol: false,
    segments: { crude: 1400, gas: 1000, unconventional: 300, lowEmissions: 420 },
    total: 3120,
  },
  {
    rank: 4,
    companyId: 'shell',
    name: 'Shell',
    isEcopetrol: false,
    segments: { crude: 1300, gas: 950, unconventional: 320, lowEmissions: 500 },
    total: 3070,
  },
  {
    rank: 5,
    companyId: 'totalenergies',
    name: 'TotalEnergies',
    isEcopetrol: false,
    segments: { crude: 1200, gas: 900, unconventional: 250, lowEmissions: 580 },
    total: 2930,
  },
  {
    rank: 6,
    companyId: 'bp',
    name: 'BP',
    isEcopetrol: false,
    segments: { crude: 1000, gas: 800, unconventional: 200, lowEmissions: 410 },
    total: 2410,
  },
  {
    rank: 7,
    companyId: 'equinor',
    name: 'Equinor',
    isEcopetrol: false,
    segments: { crude: 800, gas: 700, unconventional: 180, lowEmissions: 380 },
    total: 2060,
  },
  {
    rank: 8,
    companyId: 'pemex',
    name: 'Pemex',
    isEcopetrol: false,
    segments: { crude: 700, gas: 600, unconventional: 150, lowEmissions: 480 },
    total: 1930,
  },
  {
    rank: 9,
    companyId: 'ecopetrol',
    name: 'Ecopetrol',
    isEcopetrol: true,
    segments: { crude: 300, gas: 250, unconventional: 100, lowEmissions: 205 },
    total: 855,
  },
  {
    rank: 10,
    companyId: 'ypf',
    name: 'YPF',
    isEcopetrol: false,
    segments: { crude: 250, gas: 200, unconventional: 100, lowEmissions: 200 },
    total: 750,
  },
];

export const Default: Story = {
  args: {
    tiles: mockTiles,
    segments: mockSegments,
    rows: mockRows,
    selectedSegment: 'total',
    onSegmentChange: () => undefined,
  },
};

export const WithCrudeSegment: Story = {
  args: {
    tiles: mockTiles,
    segments: mockSegments,
    rows: mockRows,
    selectedSegment: 'crude',
    onSegmentChange: () => undefined,
  },
};

export const WithEcopetrolHighlight: Story = {
  args: {
    tiles: mockTiles,
    segments: mockSegments,
    rows: mockRows,
    selectedSegment: 'total',
    onSegmentChange: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the Ecopetrol row with a light mint highlight tone.',
      },
    },
  },
};
