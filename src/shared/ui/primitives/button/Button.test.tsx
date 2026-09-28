import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

const LABEL = 'Guardar';

describe('Button', () => {
  it('renders a native button with its label, type="button" and the default test id', () => {
    render(<Button>{LABEL}</Button>);
    const button = screen.getByRole('button', { name: LABEL });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-testid', 'button');
  });

  it('applies the token classes of each variant', () => {
    const { rerender } = render(<Button variant="primary">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-primary', 'text-text-inverse');
    rerender(<Button variant="outline">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-border-default', 'bg-surface-card');
    expect(screen.getByRole('button')).not.toHaveClass('bg-brand-primary');
    rerender(<Button variant="link">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-text-link', 'px-0');
  });

  it('applies the token classes of the P5-11 variants', () => {
    const { rerender } = render(<Button variant="forward">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-text-link', 'px-0', 'py-0');
    rerender(<Button variant="dashed">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'border-2',
      'border-dashed',
      'border-border-default',
      'text-text-secondary',
    );
    rerender(<Button variant="gradient">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-(image:--gradient-login-cta)',
      'text-text-inverse',
    );
    rerender(<Button variant="cyan">{LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-ai-accent', 'text-text-heading');
    expect(screen.getByRole('button')).not.toHaveClass('bg-brand-primary');
  });

  it('adds the forward "›" and dashed "+" glyphs as decoration outside the accessible name', () => {
    const { rerender } = render(<Button variant="forward">{LABEL}</Button>);
    const forward = screen.getByRole('button', { name: LABEL });
    expect(forward).toHaveTextContent(`${LABEL}›`);
    expect(forward.lastElementChild).toHaveAttribute('aria-hidden', 'true');
    rerender(<Button variant="dashed">{LABEL}</Button>);
    const dashed = screen.getByRole('button', { name: LABEL });
    expect(dashed).toHaveTextContent(`+${LABEL}`);
    expect(dashed.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    rerender(<Button variant="primary">{LABEL}</Button>);
    expect(screen.getByRole('button').children).toHaveLength(0);
  });

  it('defaults to primary, md and lets className override conflicting utilities', () => {
    render(<Button className="px-24">{LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-brand-primary', 'text-13', 'px-24');
    expect(button).not.toHaveClass('px-16');
  });

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>{LABEL}</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('calls onClick when clicked and accepts a custom test id', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} testId="save-view">
        {LABEL}
      </Button>,
    );
    await userEvent.click(screen.getByTestId('save-view'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks while loading and announces aria-busy', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        {LABEL}
      </Button>,
    );
    const button = screen.getByRole('button', { name: LABEL });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        {LABEL}
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
