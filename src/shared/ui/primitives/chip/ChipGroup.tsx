import { cn } from '@/shared/lib';

import { Chip } from './Chip';
import { chipTestIds } from './test-ids';

import type { ChipSize } from './chip-variants';

export type ChipGroupMode = 'single' | 'multi';

export interface ChipGroupItem {
  id: string;
  /** Visible text, already translated by the caller. */
  label: string;
  disabled?: boolean;
}

export interface ChipGroupProps {
  items: readonly ChipGroupItem[];
  /** single: one or none selected (none = all); multi: any subset. */
  mode: ChipGroupMode;
  /** Selected ids (controlled). */
  value: readonly string[];
  onChange: (ids: string[]) => void;
  /** Accessible name of the group, already translated by the caller. */
  'aria-label': string;
  size?: ChipSize;
  /**
   * Look of the multi-select `pill` chips: `toggle` (default, pill with a check mark) or `segment` (on/off filter
   * toggles, brand fill when on, muted when off, no check mark; SCR-15 severity filter). Single mode uses choice chips.
   */
  multiVariant?: 'toggle' | 'segment';
  /**
   * Look of the chips: `pill` (default: choice chips in single mode, `multiVariant` chips in multi mode) or
   * `option` (both modes: 8px-radius wizard options, lilac outline when selected, no check mark; SCR-07 step 1).
   */
  appearance?: 'pill' | 'option';
  /** Test-id owner: items get `{scope}-{component}-chip-{itemId}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

/**
 * Next selection after a click on `id`. single: select `id`, or clear it when it was already selected (none = all);
 * multi: add or remove `id`, keeping the items' order of first selection.
 */
export function nextChipSelection(
  value: readonly string[],
  id: string,
  mode: ChipGroupMode,
): string[] {
  const isSelected = value.includes(id);
  if (mode === 'single') return isSelected ? [] : [id];
  return isSelected ? value.filter((v) => v !== id) : [...value, id];
}

/**
 * Chips with single- or multi-select semantics (catalogue "ChipGroup"; aliases FilterChipGroup, CategoryChips,
 * SeverityFilterChips). Single mode uses choice chips, multi mode toggle chips; each is a native `aria-pressed`
 * button inside a labelled `role="group"`. Controlled and hook-free.
 */
export function ChipGroup({
  items,
  mode,
  value,
  onChange,
  'aria-label': ariaLabel,
  size,
  multiVariant = 'toggle',
  appearance = 'pill',
  testIds,
  className,
}: ChipGroupProps) {
  const variant = appearance === 'option' ? 'option' : mode === 'single' ? 'choice' : multiVariant;
  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex flex-wrap gap-8', className)}>
      {items.map((item) => (
        <Chip
          key={item.id}
          variant={variant}
          selected={value.includes(item.id)}
          onPressedChange={() => {
            onChange(nextChipSelection(value, item.id, mode));
          }}
          {...(item.disabled ? { disabled: true } : {})}
          {...(size ? { size } : {})}
          {...(testIds
            ? { 'data-testid': chipTestIds.root(testIds.scope, testIds.component, item.id) }
            : {})}
        >
          {item.label}
        </Chip>
      ))}
    </div>
  );
}

/** Task / board name of ChipGroup (P5-13). */
export const FilterChipGroup = ChipGroup;
