/** Selection of one group of items against the full set the user can pick from. */
export type GroupSelectState = 'all' | 'none' | 'mixed';

/**
 * Tri-state of a group's bulk toggle (`Cmp:SelectAllToggle`, SCR-07 steps 2-3, BR-13): `all` when every member of
 * `memberIds` is selected, `none` when none is, `mixed` otherwise. A group with no members reads `none` (nothing to
 * toggle).
 */
export function groupSelectionState(
  memberIds: readonly string[],
  selectedIds: readonly string[],
): GroupSelectState {
  if (memberIds.length === 0) return 'none';
  const selected = new Set(selectedIds);
  const selectedCount = memberIds.filter((id) => selected.has(id)).length;
  if (selectedCount === 0) return 'none';
  if (selectedCount === memberIds.length) return 'all';
  return 'mixed';
}

/**
 * Next `selectedIds` after clicking a group's bulk toggle: `all` or `mixed` clears every member (deselect all),
 * `none` selects every member (select all) — order preserved, members inserted where the first one used to be.
 */
export function toggleGroupSelection(
  memberIds: readonly string[],
  selectedIds: readonly string[],
): string[] {
  const state = groupSelectionState(memberIds, selectedIds);
  const members = new Set(memberIds);
  if (state === 'none') {
    const kept = selectedIds.filter((id) => !members.has(id));
    return [...kept, ...memberIds];
  }
  return selectedIds.filter((id) => !members.has(id));
}
