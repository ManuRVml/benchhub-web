import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IndicatorPicker } from './IndicatorPicker';
import { indicatorPickerTestIds } from './test-ids';

import type { V07Response } from '@/shared/api';

// SCR-07 step 3, V-07 pares source: two concept groups, trimmed.
const PARES_CATALOG: V07Response = {
  source: 'pares',
  groups: [
    {
      id: 'rentabilidad',
      label: 'Rentabilidad',
      items: [
        {
          id: 'ind_roace',
          code: 'PAR-01',
          label: 'ROACE',
          unit: 'percent',
          concept: 'rentabilidad',
          horizon: null,
          sources: ['capital_iq'],
        },
        {
          id: 'ind_ebitda',
          code: 'PAR-02',
          label: 'Margen EBITDA',
          unit: 'percent',
          concept: 'rentabilidad',
          horizon: null,
          sources: ['capital_iq'],
        },
      ],
    },
    {
      id: 'liquidez',
      label: 'Liquidez',
      items: [
        {
          id: 'ind_razon',
          code: 'PAR-14',
          label: 'Razón corriente',
          unit: 'ratio_x',
          concept: 'liquidez',
          horizon: null,
          sources: ['bloomberg'],
        },
      ],
    },
  ],
  totals: { groups: 5, indicators: 27 },
  filterOptions: { concepts: ['rentabilidad', 'liquidez'], horizons: [] },
  permissions: {},
};

// V-07 tbg_ilp source: one dimension group mixing both horizons.
const TBG_ILP_CATALOG: V07Response = {
  source: 'tbg_ilp',
  groups: [
    {
      id: 'financiero',
      label: 'Financiero',
      items: [
        {
          id: 'ind_tbg01',
          code: 'TBG-01',
          label: 'ROACE TBG',
          unit: 'percent',
          dimension: 'financiero',
          horizon: 'tbg',
          sources: ['capital_iq'],
        },
        {
          id: 'ind_ilp01',
          code: 'ILP-01',
          label: 'ROACE ILP',
          unit: 'percent',
          dimension: 'financiero',
          horizon: 'ilp',
          sources: ['capital_iq'],
        },
      ],
    },
  ],
  totals: { groups: 3, indicators: 64 },
  filterOptions: { concepts: [], horizons: ['tbg', 'ilp'] },
  permissions: {},
};

function renderPicker(
  overrides: Partial<{
    catalog: V07Response;
    source: V07Response['source'];
    selectedIds: readonly string[];
    canEdit: boolean;
    error: string;
  }> = {},
) {
  const onChange = vi.fn<(ids: string[]) => void>();
  const onSourceChange = vi.fn<(source: V07Response['source']) => void>();
  render(
    <IndicatorPicker
      source={overrides.source ?? 'pares'}
      onSourceChange={onSourceChange}
      catalog={overrides.catalog ?? PARES_CATALOG}
      selectedIds={overrides.selectedIds ?? []}
      onChange={onChange}
      canEdit={overrides.canEdit ?? true}
      {...(overrides.error === undefined ? {} : { error: overrides.error })}
    />,
  );
  return { onChange, onSourceChange };
}

describe('IndicatorPicker', () => {
  it('renders every group with the code and the given selection pressed', () => {
    renderPicker({ selectedIds: ['ind_roace'] });
    const roace = screen.getByTestId(indicatorPickerTestIds.item('ind_roace'));
    expect(roace).toHaveAttribute('aria-pressed', 'true');
    expect(roace).toHaveTextContent('PAR-01');
    expect(screen.getByTestId(indicatorPickerTestIds.item('ind_ebitda'))).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('toggles one indicator on click, reporting the full next selection', () => {
    const { onChange } = renderPicker({ selectedIds: ['ind_roace'] });
    fireEvent.click(screen.getByTestId(indicatorPickerTestIds.item('ind_ebitda')));
    expect(onChange).toHaveBeenCalledWith(['ind_roace', 'ind_ebitda']);
  });

  it('the group select-all toggle selects every member, and a partial selection shows mixed', () => {
    const { onChange } = renderPicker();
    const toggle = screen.getByTestId(indicatorPickerTestIds.groupToggle('rentabilidad'));
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(['ind_roace', 'ind_ebitda']);
  });

  it('shows the mixed state for a partially selected group', () => {
    renderPicker({ selectedIds: ['ind_roace'] });
    expect(screen.getByTestId(indicatorPickerTestIds.groupToggle('rentabilidad'))).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('filters items by concept, hiding a group left empty, without touching the selection', () => {
    const { onChange } = renderPicker({ selectedIds: ['ind_roace'] });
    fireEvent.click(screen.getByRole('button', { name: 'Liquidez' }));
    expect(screen.queryByTestId(indicatorPickerTestIds.item('ind_roace'))).toBeNull();
    expect(screen.getByTestId(indicatorPickerTestIds.item('ind_razon'))).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onSourceChange when the source tab changes, without fetching itself', () => {
    const { onSourceChange } = renderPicker();
    fireEvent.click(screen.getByRole('tab', { name: 'TBG e ILP' }));
    expect(onSourceChange).toHaveBeenCalledWith('tbg_ilp');
  });

  it('shows a horizon badge for TBG e ILP items, filterable by horizon', () => {
    renderPicker({ source: 'tbg_ilp', catalog: TBG_ILP_CATALOG });
    const tbgItem = screen.getByTestId(indicatorPickerTestIds.item('ind_tbg01'));
    expect(within(tbgItem).getByText('TBG')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ILP' }));
    expect(screen.queryByTestId(indicatorPickerTestIds.item('ind_tbg01'))).toBeNull();
    expect(screen.getByTestId(indicatorPickerTestIds.item('ind_ilp01'))).toBeInTheDocument();
  });

  it('shows the total categories and indicators of the catalog', () => {
    renderPicker();
    expect(screen.getByTestId('indicator-picker-totals')).toHaveTextContent('5 categorías');
    expect(screen.getByTestId('indicator-picker-totals')).toHaveTextContent('27 indicadores');
  });

  it('renders the C-02 field error and disables every item without canEdit', () => {
    renderPicker({ canEdit: false, error: 'Selecciona al menos una opción.' });
    expect(screen.getByTestId(indicatorPickerTestIds.error)).toHaveTextContent(
      'Selecciona al menos una opción.',
    );
    expect(screen.getByTestId(indicatorPickerTestIds.item('ind_roace'))).toBeDisabled();
    expect(screen.getByTestId(indicatorPickerTestIds.groupToggle('rentabilidad'))).toBeDisabled();
  });
});
