import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from './NumberInput';

import type { NumberInputProps } from './NumberInput';

const LABEL = 'ROACE · Ecopetrol';

/** Renders the input under a parent that stores what it emits, like a real form. */
function renderInput(props: Partial<NumberInputProps> = {}) {
  const onValueChange = vi.fn<(value: number | null) => void>();
  function Parent() {
    const [value, setValue] = useState<number | null>(props.value ?? null);
    return (
      <NumberInput
        label={LABEL}
        {...props}
        value={value}
        onValueChange={(next) => {
          onValueChange(next);
          setValue(next);
        }}
      />
    );
  }
  render(<Parent />);
  return { onValueChange, input: screen.getByRole('textbox', { name: LABEL }) };
}

describe('NumberInput', () => {
  it('is labelled, decimal-keyboard text and shows null as an empty field', () => {
    const { input } = renderInput();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveClass('font-mono', 'text-right');
  });

  it("emits 7.4 for '7,4' and null (never 0) when emptied", async () => {
    const user = userEvent.setup();
    const { input, onValueChange } = renderInput({ value: 5 });
    expect(input).toHaveValue('5');
    await user.clear(input);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(onValueChange).not.toHaveBeenCalledWith(0);
    await user.type(input, '7,4');
    expect(onValueChange).toHaveBeenLastCalledWith(7.4);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('keeps invalid text on screen, sets aria-invalid and does not emit it', async () => {
    const user = userEvent.setup();
    const { input, onValueChange } = renderInput();
    await user.type(input, '7x');
    expect(input).toHaveValue('7x');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });

  it('treats values outside min / max as invalid', async () => {
    const user = userEvent.setup();
    const { input, onValueChange } = renderInput({ min: 0, max: 30 });
    await user.type(input, '31');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onValueChange).not.toHaveBeenCalledWith(31);
  });

  it('steps with the arrow keys within min / max', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<number | null>(0.2);
      return (
        <NumberInput label={LABEL} value={value} onValueChange={setValue} step={0.1} max={0.3} />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole('textbox', { name: LABEL });
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('0,3');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('0,3');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveValue('0,1');
  });

  it('shows a new value from the parent and describes the suffix', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberInput label={LABEL} value={7.4} onValueChange={onValueChange} suffix="%" />,
    );
    const input = screen.getByRole('textbox', { name: LABEL });
    expect(input).toHaveValue('7,4');
    expect(input).toHaveAccessibleDescription('%');
    rerender(<NumberInput label={LABEL} value={null} onValueChange={onValueChange} suffix="%" />);
    expect(input).toHaveValue('');
  });

  it('sizes from the spacing tokens: sm 64px (space.64), md 72px (space.72), never an arbitrary width', () => {
    const { input: sm } = renderInput({ size: 'sm' });
    expect(sm).toHaveClass('w-64');
    sm.remove();
    const { input: md } = renderInput({ size: 'md' });
    expect(md).toHaveClass('w-72');
    expect(md.className).not.toMatch(/(^|\s)w-\[/);
  });

  it('styles the estimate variant with the warning tokens', () => {
    const { input } = renderInput({ variant: 'estimate' });
    expect(input).toHaveClass(
      'border-dashed',
      'border-status-warning-base',
      'bg-status-warning-bg',
    );
  });

  it('announces the error message and marks the field invalid', () => {
    const { input } = renderInput({ error: 'Valor fuera de rango' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Valor fuera de rango');
  });
});
