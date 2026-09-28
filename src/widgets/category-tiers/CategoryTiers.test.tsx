import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CategoryTiers } from './CategoryTiers';
import { categoryTiersTestIds } from './test-ids';

import type { VisualizationCategory } from '@/entities/analysis';

// The 6 mock categories of the spec (SCR-09 module: rentabilidad/liquidez/operacional/competitividad_opex/
// solvencia/esg), each with its own tier.
const CATEGORIES: VisualizationCategory[] = [
  {
    id: 'rentabilidad',
    label: 'Rentabilidad',
    tierId: 2,
    message: 'Ecopetrol mantiene margen sólido.',
  },
  { id: 'liquidez', label: 'Liquidez', tierId: 1, message: 'Liquidez sana.' },
  { id: 'operacional', label: 'Operacional', tierId: 3, message: 'Seguimiento cercano.' },
  {
    id: 'competitividad_opex',
    label: 'Competitividad OPEX',
    tierId: 1,
    message: 'Costos competitivos.',
  },
  { id: 'solvencia', label: 'Solvencia', tierId: 4, message: 'Requiere atención.' },
  { id: 'esg', label: 'ESG', tierId: 2, message: 'Desempeño alineado.' },
];

function renderTiers(selectedCategory = 'rentabilidad') {
  const onSelectCategory = vi.fn();
  render(
    <CategoryTiers
      categories={CATEGORIES}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
    />,
  );
  return { onSelectCategory };
}

describe('CategoryTiers', () => {
  it('renders the 6 cards with their category label and tier chip', () => {
    renderTiers();
    const expectations: [string, string][] = [
      ['rentabilidad', 'Estratégico'],
      ['liquidez', 'Líder'],
      ['operacional', 'Seguimiento'],
      ['competitividad_opex', 'Líder'],
      ['solvencia', 'Prioritario'],
      ['esg', 'Estratégico'],
    ];
    for (const [id, tierName] of expectations) {
      const card = screen.getByTestId(categoryTiersTestIds.card(id));
      expect(card).toHaveTextContent(tierName);
    }
    expect(screen.getAllByTestId(/^category-tiers-card-/)).toHaveLength(6);
  });

  it('marks the selected category card as pressed, and the others as not', () => {
    renderTiers('liquidez');
    expect(screen.getByTestId(categoryTiersTestIds.card('liquidez'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId(categoryTiersTestIds.card('rentabilidad'))).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onSelectCategory with the clicked card id', () => {
    const { onSelectCategory } = renderTiers();
    fireEvent.click(screen.getByTestId(categoryTiersTestIds.card('solvencia')));
    expect(onSelectCategory).toHaveBeenCalledWith('solvencia');
  });

  it('renders the info text with the bold tier names', () => {
    renderTiers();
    const root = screen.getByTestId(categoryTiersTestIds.root);
    const strong = within(root).getByText((_, element) => element?.tagName === 'STRONG');
    expect(strong).toHaveTextContent('Líder');
    expect(strong).toHaveTextContent('Estratégico');
    expect(strong).toHaveTextContent('Seguimiento');
    expect(strong).toHaveTextContent('Prioritario');
  });
});
