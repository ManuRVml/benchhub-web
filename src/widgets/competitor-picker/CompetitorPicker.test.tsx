import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  CompetitorPicker,
  DEFAULT_COMPETITOR_IDS,
  resolveInitialCompetitorIds,
} from './CompetitorPicker';
import { competitorPickerTestIds } from './test-ids';

import type { CompetitorGroup, CompetitorSuggestion } from './CompetitorPicker';

// SCR-07 step 2 (V-06), trimmed: two groups across the two business lines.
const SUPER_MAJORS: CompetitorGroup = {
  id: 'super_majors',
  label: 'Super Majors',
  businessLine: 'oil_gas',
  companies: [
    {
      id: 'cmp_exxon',
      name: 'Exxon',
      country: 'Estados Unidos',
      category: 'Super Major',
      colorKey: 'exxon',
    },
    {
      id: 'cmp_chevron',
      name: 'Chevron',
      country: 'Estados Unidos',
      category: 'Super Major',
      colorKey: 'chevron',
    },
  ],
};
const UTILITIES: CompetitorGroup = {
  id: 'utilities_renovables',
  label: 'Utilities & Renovables',
  businessLine: 'energeticos',
  companies: [
    { id: 'cmp_enel', name: 'Enel', country: null, category: null, colorKey: 'enel' },
    {
      id: 'cmp_iberdrola',
      name: 'Iberdrola',
      country: 'España',
      category: 'Utility',
      colorKey: 'iberdrola',
    },
  ],
};
const GROUPS: CompetitorGroup[] = [SUPER_MAJORS, UTILITIES];
const SUGGESTION: CompetitorSuggestion = {
  text: 'te sugiero incluir Petrobras — comparte características NOC con Ecopetrol.',
  companyId: 'cmp_petrobras',
  aiStatus: 'suggestion',
};

function renderPicker(
  selectedIds: readonly string[],
  overrides: { canEdit?: boolean; error?: string } = {},
) {
  const onChange = vi.fn<(ids: string[]) => void>();
  render(
    <CompetitorPicker
      groups={GROUPS}
      suggestion={SUGGESTION}
      selectedIds={selectedIds}
      onChange={onChange}
      canEdit={overrides.canEdit ?? true}
      {...(overrides.error === undefined ? {} : { error: overrides.error })}
    />,
  );
  return { onChange };
}

describe('resolveInitialCompetitorIds', () => {
  it('defaults a brand-new draft (no competitorIds) to the 7 V2 companies', () => {
    expect(resolveInitialCompetitorIds([])).toEqual(DEFAULT_COMPETITOR_IDS);
    expect(resolveInitialCompetitorIds([])).toHaveLength(7);
  });

  it('keeps the draft own selection when it already has one', () => {
    expect(resolveInitialCompetitorIds(['cmp_enel'])).toEqual(['cmp_enel']);
  });
});

describe('CompetitorPicker', () => {
  it('renders every group with the given selection pressed, unpressed companies as well', () => {
    renderPicker(['cmp_exxon']);
    expect(screen.getByTestId(competitorPickerTestIds.company('cmp_exxon'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId(competitorPickerTestIds.company('cmp_chevron'))).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('starts with the default 7 companies selected, shown pressed (both this fixture holds)', () => {
    renderPicker(resolveInitialCompetitorIds([]));
    expect(screen.getByTestId(competitorPickerTestIds.company('cmp_exxon'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId(competitorPickerTestIds.company('cmp_chevron'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors'))).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('toggles one company on click, reporting the full next selection', () => {
    const { onChange } = renderPicker(['cmp_exxon']);
    fireEvent.click(screen.getByTestId(competitorPickerTestIds.company('cmp_chevron')));
    expect(onChange).toHaveBeenCalledWith(['cmp_exxon', 'cmp_chevron']);

    onChange.mockClear();
    fireEvent.click(screen.getByTestId(competitorPickerTestIds.company('cmp_exxon')));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('the group select-all toggle selects every member of an unselected group', () => {
    const { onChange } = renderPicker([]);
    const groupToggle = screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors'));
    expect(groupToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(groupToggle);
    expect(onChange).toHaveBeenCalledWith(['cmp_exxon', 'cmp_chevron']);
  });

  it('shows the mixed state when only some of a group is selected, and deselects the whole group from mixed', () => {
    const { onChange } = renderPicker(['cmp_exxon']);
    const groupToggle = screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors'));
    expect(groupToggle).toHaveAttribute('aria-checked', 'mixed');

    fireEvent.click(groupToggle);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('reflects "all" once every member of a group is selected', () => {
    render(
      <CompetitorPicker
        groups={GROUPS}
        suggestion={SUGGESTION}
        selectedIds={['cmp_exxon', 'cmp_chevron']}
        onChange={vi.fn()}
        canEdit
      />,
    );
    expect(screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors'))).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('filters the visible groups by business line without touching the selection', () => {
    const { onChange } = renderPicker(['cmp_exxon']);
    expect(screen.getByText('Super Majors')).toBeInTheDocument();
    expect(screen.getByText('Utilities & Renovables')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Energéticos' }));
    expect(screen.queryByText('Super Majors')).toBeNull();
    expect(screen.getByText('Utilities & Renovables')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: 'Todas' }));
    expect(screen.getByText('Super Majors')).toBeInTheDocument();
  });

  it('shows an unknown-profile fallback when the company has no country/category', () => {
    renderPicker([]);
    const enel = screen.getByTestId(competitorPickerTestIds.company('cmp_enel'));
    expect(within(enel).getByText('— · Par sectorial')).toBeInTheDocument();
  });

  it('renders the V-06 Yarbis suggestion box', () => {
    renderPicker([]);
    expect(screen.getByTestId(competitorPickerTestIds.suggestion)).toHaveTextContent(
      'Yarbis: te sugiero incluir Petrobras',
    );
  });

  it('renders the C-02 field error and disables every tile without canEdit', () => {
    renderPicker([], { canEdit: false, error: 'Selecciona al menos una opción.' });
    expect(screen.getByTestId(competitorPickerTestIds.error)).toHaveTextContent(
      'Selecciona al menos una opción.',
    );
    expect(screen.getByTestId(competitorPickerTestIds.company('cmp_exxon'))).toBeDisabled();
    expect(screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors'))).toBeDisabled();
  });
});
