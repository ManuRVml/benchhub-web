import { CompanyLogoChip } from './CompanyLogoChip';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Company names and colour keys are data (V-03 peerNews, V-10 companies), not UI copy.
const meta = {
  title: 'Composites/CompanyLogoChip',
  component: CompanyLogoChip,
  args: { slug: 'shell', name: 'Shell', size: 'sm' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof CompanyLogoChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shell: Story = {};

export const Ecopetrol: Story = { args: { slug: 'ecopetrol', name: 'Ecopetrol' } };

export const DarkColour: Story = { args: { slug: 'petrobras', name: 'Petrobras' } };

/** Unknown colour key: `company.fallback`. */
export const UnknownCompany: Story = { args: { slug: 'acme', name: 'Acme Energy' } };

/** Chip alone (36px): an image named by the company. */
export const ChipOnly: Story = {
  args: { slug: 'equinor', name: 'Equinor', size: 'md', showName: false },
};

/** Every company colour of the token set. */
export const AllCompanies: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(
        [
          ['ecopetrol', 'Ecopetrol'],
          ['bp', 'BP'],
          ['equinor', 'Equinor'],
          ['shell', 'Shell'],
          ['totalEnergies', 'TotalEnergies'],
          ['oxy', 'Oxy'],
          ['petrobras', 'Petrobras'],
          ['chevron', 'Chevron'],
          ['isa', 'ISA'],
          ['exxon', 'Exxon'],
          ['pttep', 'PTTEP'],
          ['repsol', 'Repsol'],
          ['acme', 'Acme Energy'],
        ] as const
      ).map(([slug, name]) => (
        <CompanyLogoChip key={slug} slug={slug} name={name} testId={`chip-${slug}`} />
      ))}
    </div>
  ),
};
