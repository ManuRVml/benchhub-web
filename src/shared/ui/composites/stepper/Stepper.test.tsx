import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Stepper } from './Stepper';

import type { StepperStep } from './Stepper';

// SCR-07 wizard: step 3 on screen, steps 1–2 done.
const STEPS: StepperStep[] = [
  { id: 1, label: 'Información general', status: 'done' },
  { id: 2, label: 'Competidores', status: 'done' },
  { id: 3, label: 'Indicadores', status: 'current' },
  { id: 4, label: 'Fuentes', status: 'pending' },
  { id: 5, label: 'Validación', status: 'invalid' },
];

describe('Stepper', () => {
  it('is an ordered list named "Pasos" with aria-current on the current step only', () => {
    render(<Stepper steps={STEPS} />);
    const list = screen.getByRole('list', { name: 'Pasos' });
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    const current = screen.getByText('Indicadores').parentElement;
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('announces done and invalid steps', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getAllByText('(completado)')).toHaveLength(2);
    expect(screen.getByText('(requiere revisión)')).toBeInTheDocument();
  });

  it('is static without onStepClick', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('reports the clicked step and is keyboard reachable', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} onStepClick={onStepClick} />);

    await user.click(screen.getByRole('button', { name: /Fuentes/ }));
    expect(onStepClick).toHaveBeenLastCalledWith(4);

    const first = screen.getByRole('button', { name: /Información general/ });
    first.focus();
    await user.tab();
    expect(screen.getByRole('button', { name: /Competidores/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onStepClick).toHaveBeenLastCalledWith(2);

    expect(screen.getByRole('button', { name: /Indicadores/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('does not report disabled steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(
      <Stepper
        steps={[
          { id: 1, label: 'Información general', status: 'current' },
          { id: 2, label: 'Competidores', status: 'pending', disabled: true },
        ]}
        onStepClick={onStepClick}
      />,
    );
    const locked = screen.getByRole('button', { name: /Competidores/ });
    expect(locked).toBeDisabled();
    await user.click(locked);
    expect(onStepClick).not.toHaveBeenCalled();
  });
});
