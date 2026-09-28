import { useState } from 'react';

import { t } from '@/shared/i18n';

import { NumberInput } from './NumberInput';

import type { NumberInputProps } from './NumberInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

function Controlled(props: NumberInputProps) {
  const [value, setValue] = useState(props.value);
  return <NumberInput {...props} value={value} onValueChange={setValue} />;
}

// SCR-08 editable values: mono, right-aligned, "%" suffix; the estimate variant marks an "Estimado" value.
const meta = {
  title: 'Primitives/Inputs/NumberInput',
  component: NumberInput,
  render: (args) => <Controlled {...args} />,
  args: {
    label: t('analysis-results.reportSummary.tableHeaders.geValue'),
    value: 7.4,
    onValueChange: () => undefined,
    step: 0.1,
    suffix: '%',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'estimate'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Missing value: null renders an empty field, never 0. */
export const Missing: Story = { args: { value: null } };

export const Estimate: Story = {
  args: { variant: 'estimate', label: t('analysis-results.companyCoverage.editArea.estimated') },
};

export const Small: Story = { args: { size: 'sm', step: 1, value: 45 } };

export const WithError: Story = { args: { error: t('common.section.error.title') } };

export const ReadOnly: Story = { args: { readOnly: true } };
