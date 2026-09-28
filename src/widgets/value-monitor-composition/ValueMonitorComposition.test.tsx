import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ValueMonitorComposition } from './ValueMonitorComposition';

import type { ValueMonitorCompositionView } from '@/entities/value-monitor';

const VIEW: ValueMonitorCompositionView = {
  centerPct: 96.1,
  categories: [
    {
      id: 'financiero',
      label: 'Financiero',
      colorKey: 'chart.category.financiero',
      weightPct: 60,
      kviCount: 9,
      compliancePct: 90,
    },
    {
      id: 'mercado',
      label: 'Mercado',
      colorKey: 'chart.category.mercado',
      weightPct: 15,
      kviCount: 4,
      compliancePct: 97,
    },
    {
      id: 'estrategico',
      label: 'Estratégico',
      colorKey: 'chart.category.estrategico',
      weightPct: 20,
      kviCount: 8,
      compliancePct: 100,
    },
    {
      id: 'grupos_interes',
      label: 'Grupos de Interés',
      colorKey: 'chart.category.gruposInteres',
      weightPct: 5,
      kviCount: 1,
      compliancePct: 100,
    },
  ],
  permissions: {},
};

describe('ValueMonitorComposition (SCR-11 §9)', () => {
  it('the donut has an accessible table with one row per category', () => {
    render(<ValueMonitorComposition data={VIEW} />);
    const table = screen.getByTestId('value-monitor-composition-donut-data-table');
    const [, ...rows] = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.textContent)).toEqual([
      'Financiero60%',
      'Mercado15%',
      'Estratégico20%',
      'Grupos de Interés5%',
    ]);
  });

  it('gives the donut a fixed 180px box and the table a 280px minimum (the ring collapsed to 0px)', () => {
    render(<ValueMonitorComposition data={VIEW} />);
    const donutBox = screen.getByTestId('value-monitor-composition-donut-center').parentElement;
    expect(donutBox).toHaveClass('w-(--size-chart-donut)', 'shrink-0');
    const tableBox = screen.getByTestId('value-monitor-composition-table').parentElement;
    expect(tableBox).toHaveClass('min-w-(--size-chart-donut-table)');
    expect(tableBox).not.toHaveClass('min-w-280');
  });

  it('shows the global compliance at the donut centre', () => {
    render(<ValueMonitorComposition data={VIEW} />);
    expect(screen.getByTestId('value-monitor-composition-donut-center')).toHaveTextContent('96,1%');
  });

  it('a different snapshot value renders a different centre (the page re-fetches V-31 per snapshot)', () => {
    const { rerender } = render(<ValueMonitorComposition data={VIEW} />);
    expect(screen.getByTestId('value-monitor-composition-donut-center')).toHaveTextContent('96,1%');
    rerender(<ValueMonitorComposition data={{ ...VIEW, centerPct: 93.2 }} />);
    expect(screen.getByTestId('value-monitor-composition-donut-center')).toHaveTextContent('93,2%');
  });

  it('lists the category table with # KVIs, % weight and compliance', () => {
    render(<ValueMonitorComposition data={VIEW} />);
    expect(screen.getByTestId('value-monitor-composition-table')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '9' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '90%' })).toBeInTheDocument();
  });

  it('shows a TBD badge for a category with no compliance data', () => {
    const [financiero] = VIEW.categories;
    render(
      <ValueMonitorComposition
        data={{
          ...VIEW,
          categories: financiero ? [{ ...financiero, compliancePct: null }] : [],
        }}
      />,
    );
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });
});
