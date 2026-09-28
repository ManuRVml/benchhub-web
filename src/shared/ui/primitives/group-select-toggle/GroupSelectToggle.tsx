import { cn } from '@/shared/lib';

import type { GroupSelectState } from './group-selection-state';

export interface GroupSelectToggleProps {
  state: GroupSelectState;
  onToggle: () => void;
  /** Accessible name, already translated by the caller (e.g. "Seleccionar todo · Super Majors"). */
  'aria-label': string;
  disabled?: boolean;
  /** `data-testid` of the rendered button; default `group-select-toggle`. */
  testId?: string;
  className?: string;
}

/**
 * Bulk select / deselect toggle of one group (component catalog `Cmp:SelectAllToggle`, SCR-07 steps 2-3, BR-13): a
 * tri-state checkbox (`all` checked, `mixed` a dash, `none` empty). Native `role="checkbox"` with `aria-checked`
 * (including `"mixed"`, which the ARIA checkbox pattern allows) so screen readers announce the partial state.
 */
export function GroupSelectToggle({
  state,
  onToggle,
  disabled,
  testId = 'group-select-toggle',
  className,
  ...rest
}: GroupSelectToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'mixed' ? 'mixed' : state === 'all'}
      disabled={disabled}
      data-testid={testId}
      data-state={state}
      onClick={onToggle}
      className={cn(
        'flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-xs border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        state === 'none'
          ? 'border-border-default bg-surface-card'
          : 'border-brand-primary bg-brand-primary',
        className,
      )}
      {...rest}
    >
      {state === 'all' ? (
        <span aria-hidden="true" className="text-micro-strong text-text-inverse">
          {'✓'}
        </span>
      ) : null}
      {state === 'mixed' ? <span aria-hidden="true" className="h-2 w-8 bg-text-inverse" /> : null}
    </button>
  );
}
