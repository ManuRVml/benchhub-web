import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarketIndicatorsCard } from './MarketIndicatorsCard';

import type { MarketIndicator } from './MarketIndicatorsCard';

describe('MarketIndicatorsCard', () => {
  it('does not render when items is empty', () => {
    const { container } = render(<MarketIndicatorsCard items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the 5 SCR-05 mock items with their labels', () => {
    const items: MarketIndicator[] = [
      { id: 'COLCAP', label: 'COLCAP', value: 42563.5, unit: 'points', deltaPct: 1.2, trend: 'up' },
      {
        id: 'cop_per_usd',
        label: 'COP/USD',
        value: 3945.8,
        unit: 'cop_per_usd',
        deltaPct: -0.8,
        trend: 'down',
      },
      { id: 'usd_bn', label: 'USD/B', value: 12.4, unit: 'usd_bn', deltaPct: 0.5, trend: 'up' },
      { id: 'kboe', label: 'KBOE', value: 712.3, unit: 'kboe', deltaPct: -1.1, trend: 'down' },
      {
        id: 'percent',
        label: 'Tasa de desempleo',
        value: 11.2,
        unit: 'percent',
        deltaPct: 0.3,
        trend: 'up',
      },
    ];
    render(<MarketIndicatorsCard items={items} />);

    expect(screen.getByText('COLCAP')).toBeInTheDocument();
    expect(screen.getByText('COP/USD')).toBeInTheDocument();
    expect(screen.getByText('USD/B')).toBeInTheDocument();
    expect(screen.getByText('KBOE')).toBeInTheDocument();
    expect(screen.getByText('Tasa de desempleo')).toBeInTheDocument();
  });

  it('formats a usd_b value as "USD/B"', () => {
    const items: MarketIndicator[] = [
      { id: 'usd_bn', label: 'USD/B', value: 12.4, unit: 'usd_bn', deltaPct: 0.5, trend: 'up' },
    ];
    render(<MarketIndicatorsCard items={items} />);

    expect(screen.getByText('USD/B')).toBeInTheDocument();
  });

  it('is a 16px card with the uppercase group label and the prototype cell type (L361-L375)', () => {
    const items: MarketIndicator[] = [
      { id: 'brent', label: 'Brent', value: 71.4, unit: 'usd_b', deltaPct: 0.6, trend: 'up' },
    ];
    render(<MarketIndicatorsCard items={items} />);

    const card = screen.getByTestId('market-indicators');
    expect(card).toHaveClass('p-16', 'border', 'bg-surface-card');
    expect(card).not.toHaveClass('p-20');
    const heading = screen.getByRole('heading', { level: 2, name: 'Indicadores de mercado' });
    expect(heading).toHaveClass('uppercase', 'text-eyebrow');
    expect(screen.getByTestId('market-indicators-info-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('market-indicators-grid')).toHaveClass('grid-cols-5', 'gap-10');
    expect(screen.getByText('Brent')).toHaveClass('text-11', 'mb-3');
    expect(screen.getByText('71,4 USD/B')).toHaveClass('font-mono', 'text-mono-market');
    expect(screen.getByText('+0,6%')).toHaveClass('text-11', 'font-semibold');
  });

  it('formats a positive delta with + prefix and success class', () => {
    const items: MarketIndicator[] = [
      { id: 'COLCAP', label: 'COLCAP', value: 42563.5, unit: 'points', deltaPct: 1.2, trend: 'up' },
    ];
    render(<MarketIndicatorsCard items={items} />);

    const delta = screen.getByText('+1,2%');
    expect(delta).toBeInTheDocument();
    expect(delta).toHaveClass('text-status-success-text');
  });

  it('formats a negative delta with - prefix and danger class', () => {
    const items: MarketIndicator[] = [
      {
        id: 'COLCAP',
        label: 'COLCAP',
        value: 42563.5,
        unit: 'points',
        deltaPct: -1.2,
        trend: 'down',
      },
    ];
    render(<MarketIndicatorsCard items={items} />);

    const delta = screen.getByText('-1,2%');
    expect(delta).toBeInTheDocument();
    expect(delta).toHaveClass('text-status-danger-text');
  });
});
