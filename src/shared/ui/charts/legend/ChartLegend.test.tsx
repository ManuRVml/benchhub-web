import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartLegend } from './ChartLegend';

import type { ChartLegendItem } from './ChartLegend';

const ITEMS: ChartLegendItem[] = [
  { id: 'ge', label: 'Grupo Ecopetrol', tone: 'highlight' },
  { id: 'chevron', label: 'Chevron', tone: 'series1' },
];

describe('ChartLegend', () => {
  it('renders a labelled list, one listitem per item, swatches decorative', () => {
    render(<ChartLegend items={ITEMS} aria-label="Compañías" />);

    const list = screen.getByRole('list', { name: 'Compañías' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    const [first, second] = rows;
    if (!first || !second) throw new Error('expected 2 rows');
    expect(within(first).getByText('Grupo Ecopetrol')).toBeInTheDocument();
    expect(within(second).getByText('Chevron')).toBeInTheDocument();
    // The swatch carries no accessible text of its own; the label alone names the item.
    for (const row of rows) {
      const swatch = row.querySelector('[aria-hidden="true"]');
      expect(swatch).not.toBeNull();
    }
  });

  it('a solid item is a filled square in its tone, no border', () => {
    render(<ChartLegend items={[{ id: 'ge', label: 'Grupo Ecopetrol', tone: 'highlight' }]} />);
    const swatch = screen
      .getByText('Grupo Ecopetrol')
      .closest('[role="listitem"]')
      ?.querySelector('[aria-hidden="true"]');
    expect(swatch).toHaveAttribute('data-variant', 'solid');
    expect(swatch).toHaveClass('bg-chart-highlight');
    expect(swatch).not.toHaveClass('border-2');
  });

  it('an outlined item is an unfilled square with a border in its tone (SCR-08 L587)', () => {
    render(
      <ChartLegend
        items={[{ id: 'ge', label: 'Grupo Ecopetrol', tone: 'highlight', variant: 'outlined' }]}
      />,
    );
    const swatch = screen
      .getByText('Grupo Ecopetrol')
      .closest('[role="listitem"]')
      ?.querySelector('[aria-hidden="true"]');
    expect(swatch).toHaveAttribute('data-variant', 'outlined');
    expect(swatch).toHaveClass('border-2');
    expect(swatch).toHaveClass('border-chart-highlight');
    expect(swatch).toHaveClass('bg-transparent');
    expect(swatch).not.toHaveClass('bg-chart-highlight');
  });

  it('a solid item with swatchClassName renders that class instead of the tone class', () => {
    render(
      <ChartLegend
        items={[
          {
            id: 'chevron',
            label: 'Chevron',
            tone: 'highlight',
            swatchClassName: 'bg-company-chevron',
          },
        ]}
      />,
    );
    const swatch = screen
      .getByText('Chevron')
      .closest('[role="listitem"]')
      ?.querySelector('[aria-hidden="true"]');
    expect(swatch).toHaveClass('bg-company-chevron');
    expect(swatch).not.toHaveClass('bg-chart-highlight');
  });

  it('an outlined item with swatchClassName renders that class instead of the tone border class', () => {
    render(
      <ChartLegend
        items={[
          {
            id: 'chevron',
            label: 'Chevron',
            tone: 'highlight',
            variant: 'outlined',
            swatchClassName: 'border-company-chevron',
          },
        ]}
      />,
    );
    const swatch = screen
      .getByText('Chevron')
      .closest('[role="listitem"]')
      ?.querySelector('[aria-hidden="true"]');
    expect(swatch).toHaveClass('border-company-chevron');
    expect(swatch).not.toHaveClass('border-chart-highlight');
  });

  it("builds test ids the charts' way ({scope}-{component}-legend[-item-{id}])", () => {
    render(<ChartLegend items={ITEMS} testIds={{ scope: 'future-aspiration', component: 'ge' }} />);
    expect(screen.getByTestId('future-aspiration-ge-legend')).toBeInTheDocument();
    expect(screen.getByTestId('future-aspiration-ge-legend-item-chevron')).toBeInTheDocument();
  });
});
