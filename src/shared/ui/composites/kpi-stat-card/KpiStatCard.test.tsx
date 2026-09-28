import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KpiStatCard, formatKpiValue } from './KpiStatCard';

const value = () => screen.getByTestId('kpi-stat-card-value');
const delta = () => screen.getByTestId('kpi-stat-card-delta');

describe('KpiStatCard', () => {
  it('puts the label under the value by default and above it with labelPosition="above" (SCR-11)', () => {
    const { rerender } = render(<KpiStatCard label="ROACE" value={7.4} unit="percent" />);
    const card = screen.getByTestId('kpi-stat-card');
    const label = () => screen.getByTestId('kpi-stat-card-label');
    expect(
      value().compareDocumentPosition(label()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    rerender(<KpiStatCard label="ROACE" value={7.4} unit="percent" labelPosition="above" />);
    expect(card.firstElementChild).toBe(label());
    expect(label()).toHaveClass('text-11', 'text-text-muted');
  });

  it('formats a percent value with the es-CO formatter (P5-06)', () => {
    render(<KpiStatCard label="ROACE" value={7.4} unit="percent" />);
    expect(value()).toHaveTextContent('7,4%');
  });

  it('renders null as "—" (CF-37), never 0', () => {
    render(<KpiStatCard label="ROACE" value={null} unit="percent" delta={{ value: null }} />);
    expect(value()).toHaveTextContent('—');
    expect(value()).toHaveClass('text-text-muted');
    expect(delta()).toHaveTextContent('—');
    expect(delta().querySelector('svg')).toBeNull();
  });

  it('signs the delta and draws the trend arrow in the matching tone', () => {
    const { rerender } = render(
      <KpiStatCard label="WTI" value={67.8} unit="USD/B" delta={{ value: -0.3 }} />,
    );
    expect(value()).toHaveTextContent('67,8 USD/B');
    expect(delta()).toHaveTextContent('-0,3%');
    expect(delta()).toHaveClass('text-status-danger-text');
    expect(delta().querySelector('svg')).not.toBeNull();
    rerender(<KpiStatCard label="Brent" value={71.4} unit="USD/B" delta={{ value: 0.6 }} />);
    expect(delta()).toHaveTextContent('+0,6%');
    expect(delta()).toHaveClass('text-status-success-text');
    rerender(<KpiStatCard label="Brecha" value={2} delta={{ value: 0, unit: 'pts' }} />);
    expect(delta()).toHaveTextContent('0,0 pts');
    expect(delta().querySelector('svg')).toBeNull();
  });

  it('names the card with one full sentence', () => {
    render(
      <KpiStatCard
        label="Brent"
        value={71.4}
        unit="USD/B"
        delta={{ value: 0.6 }}
        info="Corte abril 2026"
      />,
    );
    expect(
      screen.getByRole('group', { name: 'Brent: 71,4 USD/B, +0,6%, sube, Corte abril 2026' }),
    ).toBeInTheDocument();
  });

  it('applies the tone token to the value', () => {
    render(<KpiStatCard label="Publicados" value={3} tone="success" />);
    expect(value()).toHaveClass('text-status-success-text', 'text-kpi');
  });

  it('aligns to the start by default and centres value and label with align="center"', () => {
    const { rerender } = render(<KpiStatCard label="Activos" value={6} testId="kpi" />);
    expect(screen.getByTestId('kpi')).not.toHaveClass('items-center', 'text-center');
    rerender(<KpiStatCard label="Activos" value={6} testId="kpi" align="center" />);
    expect(screen.getByTestId('kpi')).toHaveClass('items-center', 'text-center');
  });

  it.each([
    ['percent', 82, '82,0%'],
    ['number', 4102, '4.102'],
    ['multiple', 1.3, '1,3x'],
    ['KBOE', 12.3, '12,3 KBOE'],
  ] as const)('formats %s values', (unit, input, expected) => {
    expect(formatKpiValue(input, unit)).toBe(expected);
  });
});
