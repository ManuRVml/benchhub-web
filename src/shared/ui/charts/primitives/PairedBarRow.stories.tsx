import { useState } from 'react';

import { maxAbs } from './bar-math';
import { PairedBarRow } from './PairedBarRow';

import type { PairedBarRowProps } from './PairedBarRow';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const narrow: Decorator = (Story) => (
  <div className="max-w-xl">
    <Story />
  </div>
);

// Prototype C1 "GE vs promedio de pares": one indicator per row, one max shared by the whole chart.
const ROWS = [
  { label: 'ROACE', ge: 10.2, peers: 7.4 },
  { label: 'Margen EBITDA', ge: 38.5, peers: 31.2 },
  { label: 'Flujo de caja libre / ingresos', ge: -13.8, peers: 5.5 },
  { label: 'Deuda neta / EBITDA', ge: null, peers: 1.6 },
] as const;
const MAX = maxAbs(ROWS.flatMap((row) => [row.ge, row.peers]));

const meta = {
  title: 'Charts/Primitives/PairedBarRow',
  component: PairedBarRow,
  args: {
    label: 'ROACE',
    primary: { label: 'GE', value: 10.2 },
    secondary: { label: 'Pares', value: 7.4 },
    max: MAX,
    size: 18,
  },
  argTypes: { size: { control: 'inline-radio', options: [14, 18] } },
  decorators: [narrow],
} satisfies Meta<typeof PairedBarRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** OQ-10: a negative value keeps its absolute length and a signed label. */
export const Negative: Story = {
  args: {
    label: 'Flujo de caja libre / ingresos',
    primary: { label: 'GE', value: -13.8 },
    secondary: { label: 'Pares', value: 5.5 },
  },
};

export const Missing: Story = {
  args: {
    label: 'Deuda neta / EBITDA',
    primary: { label: 'GE', value: null },
    secondary: { label: 'Pares', value: 1.6 },
  },
};

function EditableRow(props: PairedBarRowProps) {
  const [values, setValues] = useState({
    primary: props.primary.value,
    secondary: props.secondary.value,
  });
  return (
    <PairedBarRow
      {...props}
      primary={{ ...props.primary, value: values.primary }}
      secondary={{ ...props.secondary, value: values.secondary }}
      editable="both"
      onValueChange={(side, value) => {
        setValues((current) => ({ ...current, [side]: value }));
      }}
    />
  );
}

export const Editable: Story = { render: (args) => <EditableRow {...args} /> };

export const Chart: Story = {
  render: (args) => (
    <div className="grid gap-16">
      {ROWS.map((row) => (
        <PairedBarRow
          key={row.label}
          {...args}
          label={row.label}
          primary={{ label: 'GE', value: row.ge }}
          secondary={{ label: 'Pares', value: row.peers }}
        />
      ))}
    </div>
  ),
};
