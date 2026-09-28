import { useState } from 'react';
import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { Stepper } from './Stepper';

import type { StepperProps, StepperStep, StepStatus } from './Stepper';
import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-07 wizard steps (analysis-definition.stepper.*).
const LABELS = [
  t('analysis-definition.stepper.step1'),
  t('analysis-definition.stepper.step2'),
  t('analysis-definition.stepper.step3'),
  t('analysis-definition.stepper.step4'),
  t('analysis-definition.stepper.step5'),
];

const stepsAt = (current: number, invalid: number[] = []): StepperStep[] =>
  LABELS.map((label, index) => {
    const id = index + 1;
    let status: StepStatus = id < current ? 'done' : id === current ? 'current' : 'pending';
    if (invalid.includes(id)) status = 'invalid';
    return { id, label, status };
  });

const meta = {
  title: 'Composites/Stepper',
  component: Stepper,
  args: { steps: stepsAt(3) },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const FirstStep: Story = { args: { steps: stepsAt(1) } };

export const WithInvalidStep: Story = { args: { steps: stepsAt(5, [2]) } };

function ClickableStepper(props: StepperProps) {
  const [current, setCurrent] = useState(1);
  return (
    <Stepper
      {...props}
      steps={stepsAt(current)}
      onStepClick={(id) => {
        props.onStepClick?.(id);
        setCurrent(id);
      }}
    />
  );
}

/** SCR-07: every step is clickable in any order. */
export const Clickable: Story = {
  args: { onStepClick: fn() },
  render: (args) => <ClickableStepper {...args} />,
};
