import { cn } from '@/shared/lib';

import { chipVariants, PRESSABLE_VARIANTS } from './chip-variants';

import type { ChipSize, ChipVariant } from './chip-variants';
import type { ComponentProps, ReactNode } from 'react';

export type ChipProps = Omit<ComponentProps<'button'>, 'children'> & {
  variant?: ChipVariant;
  size?: ChipSize;
  /** Pressed state of choice / toggle / estimate chips (controlled). */
  selected?: boolean;
  /** Called with the next pressed state when a choice / toggle / estimate chip is clicked. */
  onPressedChange?: (pressed: boolean) => void;
  /** Display code of an indicator chip ("PAR-01"), rendered in mono after the label. */
  code?: string;
  /** Filter chips: removes the chip; renders a "✕" button labelled by `removeLabel`. */
  onRemove?: () => void;
  /** Accessible name of the remove button, already translated by the caller. */
  removeLabel?: string;
  /** data-testid of the remove button (build it with `chipTestIds.remove`). */
  removeTestId?: string;
  /** Visible text, already translated by the caller (never a literal inside the component). */
  children: ReactNode;
};

/**
 * Small pill used as a static tag or as a selectable option (catalogue "Chip"; aliases StaticChip, ChoiceChip,
 * ToggleChip, FilterChip, SuggestionChip, EstimateToggleChip, IndicatorPill). Controlled and hook-free.
 * - static / indicator: `<span>`; filter: `<span>` with a native remove `<button>`;
 * - choice / toggle / estimate: native `<button aria-pressed>` with `data-selected`; suggestion / dashed: `<button>`.
 * Extends native button props, `ref` included (React 19 ref-as-prop, the successor of forwardRef); `data-testid` is
 * configurable through the native props (build it with `chipTestIds.root`).
 */
export function Chip({
  variant = 'static',
  size,
  selected = false,
  onPressedChange,
  code,
  onRemove,
  removeLabel,
  removeTestId,
  className,
  children,
  onClick,
  type,
  ...native
}: ChipProps) {
  const classes = cn(chipVariants({ variant, selected, size }), className);
  const content = (
    <>
      {children}
      {/* text.secondary, not text.muted: the code must reach 4.5:1 on the chip fill (CF-141). */}
      {code ? <span className="font-mono text-text-secondary">{code}</span> : null}
    </>
  );

  if (variant === 'static' || variant === 'indicator' || variant === 'filter') {
    const { ref: _ref, ...spanProps } = native;
    return (
      <span {...spanProps} data-variant={variant} className={classes}>
        {content}
        {variant === 'filter' && onRemove ? (
          <button
            type="button"
            aria-label={removeLabel}
            data-testid={removeTestId}
            onClick={onRemove}
            className="cursor-pointer text-brand-primary"
          >
            {'✕'}
          </button>
        ) : null}
      </span>
    );
  }

  const pressable = PRESSABLE_VARIANTS.includes(variant);
  return (
    <button
      {...native}
      type={type ?? 'button'}
      data-variant={variant}
      {...(pressable ? { 'aria-pressed': selected, 'data-selected': selected } : {})}
      className={classes}
      onClick={(event) => {
        onClick?.(event);
        if (pressable) onPressedChange?.(!selected);
      }}
    >
      {variant === 'toggle' && selected ? <span aria-hidden="true">{'✓'}</span> : null}
      {content}
    </button>
  );
}
