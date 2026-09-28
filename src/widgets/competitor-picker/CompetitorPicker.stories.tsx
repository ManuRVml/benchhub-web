import { CompetitorPicker } from './CompetitorPicker';

import type { CompetitorGroup, CompetitorSuggestion } from './CompetitorPicker';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/competitor-picker/CompetitorPicker',
  component: CompetitorPicker,
} satisfies Meta<typeof CompetitorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

const SUPER_MAJORS: CompetitorGroup = {
  id: 'super_majors',
  label: 'Super Majors',
  businessLine: 'oil_gas',
  companies: [
    {
      id: 'cmp_exxon',
      name: 'Exxon',
      country: 'Estados Unidos',
      category: 'Super Major',
      colorKey: 'exxon',
    },
    {
      id: 'cmp_chevron',
      name: 'Chevron',
      country: 'Estados Unidos',
      category: 'Super Major',
      colorKey: 'chevron',
    },
  ],
};

const UTILITIES: CompetitorGroup = {
  id: 'utilities_renovables',
  label: 'Utilities & Renovables',
  businessLine: 'energeticos',
  companies: [
    { id: 'cmp_enel', name: 'Enel', country: null, category: null, colorKey: 'enel' },
    {
      id: 'cmp_iberdrola',
      name: 'Iberdrola',
      country: 'España',
      category: 'Utility',
      colorKey: 'iberdrola',
    },
  ],
};

const GROUPS: CompetitorGroup[] = [SUPER_MAJORS, UTILITIES];

const SUGGESTION: CompetitorSuggestion = {
  text: 'te sugiero incluir Petrobras — comparte características NOC con Ecopetrol.',
  companyId: 'cmp_petrobras',
  aiStatus: 'suggestion',
};

export const Default: Story = {
  args: {
    groups: GROUPS,
    suggestion: SUGGESTION,
    selectedIds: [
      'cmp_exxon',
      'cmp_chevron',
      'cmp_shell',
      'cmp_equinor',
      'cmp_total',
      'cmp_bp',
      'cmp_pttep',
    ],
    onChange: () => {
      /* noop */
    },
    canEdit: true,
  },
};

export const EmptySelection: Story = {
  args: {
    groups: GROUPS,
    suggestion: SUGGESTION,
    selectedIds: [],
    onChange: () => {
      /* noop */
    },
    canEdit: true,
  },
};
