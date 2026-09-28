import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and the optional description', () => {
    render(<EmptyState title="Sin datos" description="Prueba otro corte." />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('Prueba otro corte.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the action as a button that calls onClick', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Sin resultados" action={{ label: 'Limpiar filtros', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('centres the block variant', () => {
    render(<EmptyState title="Sin datos" variant="block" />);
    expect(screen.getByTestId('empty-state')).toHaveClass('items-center', 'text-center');
  });
});
