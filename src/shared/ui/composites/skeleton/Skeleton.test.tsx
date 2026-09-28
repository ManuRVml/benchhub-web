import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { t } from '@/shared/i18n';

import { SKELETON_PULSE_CLASS, Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is a busy status with a visually hidden loading label and hidden shapes', () => {
    render(<Skeleton lines={3} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent(t('common.section.loading'));
    const shapes = screen.getAllByTestId('skeleton-shape');
    expect(shapes).toHaveLength(3);
    expect(shapes.every((shape) => shape.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(shapes.at(-1)).toHaveClass('w-3/5');
  });

  it('pulses only when motion is allowed (reduced motion keeps it still)', () => {
    render(<Skeleton shape="block" />);
    const shape = screen.getByTestId('skeleton-shape');
    expect(SKELETON_PULSE_CLASS).toBe('motion-safe:animate-pulse');
    expect(shape).toHaveClass(SKELETON_PULSE_CLASS);
    expect(shape).not.toHaveClass('animate-pulse');
  });

  it('sizes blocks and circles', () => {
    const { rerender } = render(<Skeleton shape="block" size={200} />);
    expect(screen.getByTestId('skeleton-shape')).toHaveStyle({ height: '200px' });
    rerender(<Skeleton shape="circle" />);
    const circle = screen.getByTestId('skeleton-shape');
    expect(circle).toHaveClass('rounded-pill');
    expect(circle).toHaveStyle({ height: '36px', width: '36px' });
  });

  it('accepts a custom loading label', () => {
    render(<Skeleton label="Cargando noticias" />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando noticias');
  });
});
