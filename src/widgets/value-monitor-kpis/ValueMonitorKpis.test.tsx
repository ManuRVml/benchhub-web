import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { valueMonitorKpisTestIds } from './test-ids';
import { ValueMonitorKpis } from './ValueMonitorKpis';

describe('ValueMonitorKpis', () => {
  it('renders the 4 tile values, formatted es-CO', () => {
    render(<ValueMonitorKpis globalPct={96.15} retoPct={78.56} atRiskCount={1} tbdCount={3} />);
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.global}-value`)).toHaveTextContent('96%');
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.reto}-value`)).toHaveTextContent('78,6%');
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.atRisk}-value`)).toHaveTextContent('1');
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.tbd}-value`)).toHaveTextContent('3');
  });

  it('tones the global and reto tiles by band (>=90 success, 70-89 warning, <70 danger)', () => {
    const { rerender } = render(
      <ValueMonitorKpis globalPct={96} retoPct={78.6} atRiskCount={1} tbdCount={3} />,
    );
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.global}-value`)).toHaveClass(
      'text-status-success-text',
    );
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.reto}-value`)).toHaveClass(
      'text-status-warning-text',
    );

    rerender(<ValueMonitorKpis globalPct={65} retoPct={40} atRiskCount={1} tbdCount={3} />);
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.global}-value`)).toHaveClass(
      'text-status-danger-text',
    );
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.reto}-value`)).toHaveClass(
      'text-status-danger-text',
    );
  });

  it('always tones "KVIs en riesgo" danger and "KVIs pendientes (TBD)" neutral, regardless of count', () => {
    render(<ValueMonitorKpis globalPct={96} retoPct={78.6} atRiskCount={0} tbdCount={0} />);
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.atRisk}-value`)).toHaveClass(
      'text-status-danger-text',
    );
    expect(screen.getByTestId(`${valueMonitorKpisTestIds.tbd}-value`)).toHaveClass(
      'text-text-heading',
    );
  });

  it('renders four standalone card tiles, label above the value, no wrapping card (SCR-11 fidelity)', () => {
    render(<ValueMonitorKpis globalPct={96} retoPct={78.6} atRiskCount={1} tbdCount={3} />);
    expect(screen.getByTestId(valueMonitorKpisTestIds.root)).not.toHaveClass('border');
    const ids = [
      valueMonitorKpisTestIds.global,
      valueMonitorKpisTestIds.reto,
      valueMonitorKpisTestIds.atRisk,
      valueMonitorKpisTestIds.tbd,
    ];
    for (const id of ids) {
      const tile = screen.getByTestId(id);
      expect(tile).toHaveClass('rounded-card', 'p-16');
      expect(tile.firstElementChild).toBe(screen.getByTestId(`${id}-label`));
    }
  });

  it('one shared info toggle opens and closes the info panel', () => {
    render(<ValueMonitorKpis globalPct={96} retoPct={78.6} atRiskCount={1} tbdCount={3} />);
    const panel = screen.getByTestId(valueMonitorKpisTestIds.infoPanel);
    expect(panel).toHaveAttribute('hidden');
    fireEvent.click(screen.getByTestId(valueMonitorKpisTestIds.infoToggle));
    expect(panel).not.toHaveAttribute('hidden');
    expect(panel).toHaveTextContent('KVIs en riesgo');
  });
});
