import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ValueMonitorDimensionWeights } from './ValueMonitorDimensionWeights';

describe('ValueMonitorDimensionWeights', () => {
  it('renders the 3 dimensions with Ecopetrol’s weight', () => {
    render(<ValueMonitorDimensionWeights fin={45} op={30} trans={25} />);
    expect(screen.getByText('★ Grupo Ecopetrol')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Financiera: 45%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Operativa: 30%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transversal: 25%' })).toBeInTheDocument();
  });
});
