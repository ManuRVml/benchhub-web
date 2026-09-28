import { beforeEach, describe, expect, it } from 'vitest';

import {
  selectCollapseAll,
  selectExpandedCount,
  selectRowExpanded,
  selectSetRowExpanded,
  selectToggleRow,
  useComparisonUiStore,
} from './comparison-ui.store';

beforeEach(() => {
  useComparisonUiStore.setState(useComparisonUiStore.getInitialState(), true);
});

const state = () => useComparisonUiStore.getState();

describe('useComparisonUiStore', () => {
  it('starts with every row collapsed', () => {
    expect(selectExpandedCount(state())).toBe(0);
    expect(selectRowExpanded('agua')(state())).toBe(false);
  });

  it('toggles one row without touching the others', () => {
    selectToggleRow(state())('agua');
    selectToggleRow(state())('energia');
    expect(selectRowExpanded('agua')(state())).toBe(true);
    expect(selectRowExpanded('energia')(state())).toBe(true);
    selectToggleRow(state())('agua');
    expect(selectRowExpanded('agua')(state())).toBe(false);
    expect(selectRowExpanded('energia')(state())).toBe(true);
    expect(selectExpandedCount(state())).toBe(1);
  });

  it('sets a row explicitly and ignores no-op updates', () => {
    selectSetRowExpanded(state())('agua', true);
    const before = state().expandedRows;
    selectSetRowExpanded(state())('agua', true);
    expect(state().expandedRows).toBe(before);
    selectSetRowExpanded(state())('agua', false);
    expect(selectRowExpanded('agua')(state())).toBe(false);
  });

  it('collapses every row', () => {
    selectToggleRow(state())('agua');
    selectToggleRow(state())('residuos');
    selectCollapseAll(state())();
    expect(selectExpandedCount(state())).toBe(0);
  });

  it('holds only UI state, no server data, and does not persist', () => {
    expect(Object.keys(useComparisonUiStore.getInitialState()).sort()).toStrictEqual([
      'collapseAll',
      'expandedRows',
      'setRowExpanded',
      'toggleRow',
    ]);
    expect('persist' in useComparisonUiStore).toBe(false);
  });
});
