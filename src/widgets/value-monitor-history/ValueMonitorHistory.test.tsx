import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ValueMonitorHistory } from './ValueMonitorHistory';

const POINTS = [
  { year: 2024, value: 6.2 },
  { year: 2025, value: 7.8 },
];

describe('ValueMonitorHistory', () => {
  it('renders a range chip per option and the "Actual" chip pressed', () => {
    render(<ValueMonitorHistory range="actual" onRangeChange={vi.fn()} points={POINTS} />);
    expect(screen.getByRole('button', { name: 'Actual' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '5 años' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '8 años' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10 años' })).toBeInTheDocument();
  });

  it('calls onRangeChange when a different range chip is clicked', () => {
    const onRangeChange = vi.fn();
    render(<ValueMonitorHistory range="actual" onRangeChange={onRangeChange} points={POINTS} />);
    fireEvent.click(screen.getByRole('button', { name: '5 años' }));
    expect(onRangeChange).toHaveBeenCalledWith('5y');
  });

  it('does not call onRangeChange when the already-selected chip is clicked', () => {
    const onRangeChange = vi.fn();
    render(<ValueMonitorHistory range="actual" onRangeChange={onRangeChange} points={POINTS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actual' }));
    expect(onRangeChange).not.toHaveBeenCalled();
  });
});
