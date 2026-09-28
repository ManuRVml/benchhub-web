import { forwardRef, useState } from 'react';

import { cn } from '@/shared/lib';
import { formatEditableNumber, parseEsCoNumber } from '@/shared/lib/format';

import { FieldFrame, controlClass, describedBy, useFieldIds } from './field';

import type { FieldProps } from './field';
import type { ComponentPropsWithoutRef, KeyboardEvent } from 'react';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'className'
  | 'size'
  | 'type'
  | 'id'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
>;

export interface NumberInputProps extends NativeInputProps, FieldProps {
  /** Raw value; `null` renders an empty field (never 0 — CF-37). */
  value: number | null;
  /**
   * Called with the parsed number, or `null` when the field is emptied. Text that does not parse, or a number outside
   * `min` / `max`, is kept on screen with `aria-invalid` and is not emitted.
   */
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow Up / Down add or subtract it (default 1). */
  step?: number;
  /** Unit shown after the field, e.g. "%"; it joins `aria-describedby`. */
  suffix?: string;
  /** `estimate`: value marked as an estimate (SCR-08 "Estimado": amber fill, dashed amber border). */
  variant?: 'default' | 'estimate';
  /** `sm` 64px wide, `md` 72px (component catalog "NumberInput"). */
  size?: 'sm' | 'md';
}

const VARIANT_CLASS = {
  default: 'text-text-heading',
  estimate:
    'border-dashed border-status-warning-base bg-status-warning-bg text-status-warning-text',
} as const;

// Widths are the 64px and 72px spacing tokens (space.64, space.72).
const SIZE_CLASS = { sm: 'w-64', md: 'w-72' } as const;

const decimalsOf = (step: number) => (String(step).split('.')[1] ?? '').length;

/**
 * Editable indicator / weight value (component catalog "NumberInput"): right-aligned mono text, optional suffix, es-CO
 * input ("7,4" → 7.4, "4.102" → 4102). It is a text field with `inputMode="decimal"` because `type="number"` rejects the
 * decimal comma.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'number-input',
    className,
    value,
    onValueChange,
    min,
    max,
    step = 1,
    suffix,
    variant = 'default',
    size = 'md',
    readOnly,
    onBlur,
    onKeyDown,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(id);
  const suffixId = `${ids.control}-suffix`;
  const [text, setText] = useState(() => formatEditableNumber(value));
  const [invalid, setInvalid] = useState(false);
  const [shownValue, setShownValue] = useState(value);

  // A new value from the parent replaces the text, unless it is what the text already says.
  if (!Object.is(value, shownValue)) {
    setShownValue(value);
    const parsed = parseEsCoNumber(text);
    const current = parsed.kind === 'number' ? parsed.value : null;
    if (parsed.kind === 'invalid' || !Object.is(current, value)) {
      setText(formatEditableNumber(value));
      setInvalid(false);
    }
  }

  const inRange = (number: number) =>
    (min === undefined || number >= min) && (max === undefined || number <= max);

  const commit = (next: string) => {
    setText(next);
    const parsed = parseEsCoNumber(next);
    if (parsed.kind === 'empty') {
      setInvalid(false);
      setShownValue(null);
      if (value !== null) onValueChange(null);
      return;
    }
    if (parsed.kind === 'invalid' || !inRange(parsed.value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setShownValue(parsed.value);
    if (!Object.is(parsed.value, value)) onValueChange(parsed.value);
  };

  const stepBy = (event: KeyboardEvent<HTMLInputElement>) => {
    const direction = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (direction === 0 || readOnly) return;
    const parsed = parseEsCoNumber(text);
    if (parsed.kind === 'invalid') return;
    event.preventDefault();
    const start = parsed.kind === 'number' ? parsed.value : (min ?? 0);
    let next = Number((start + direction * step).toFixed(decimalsOf(step)));
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    commit(formatEditableNumber(next));
  };

  return (
    <FieldFrame
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      labelVariant={labelVariant}
      description={description}
      error={error}
      testId={testId}
      className={className}
    >
      <div className="flex items-center gap-4">
        <input
          ref={ref}
          id={ids.control}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          data-testid={testId}
          value={text}
          readOnly={readOnly}
          className={cn(
            controlClass,
            'rounded-sm px-6 py-4 text-right font-mono text-mono-input',
            SIZE_CLASS[size],
            VARIANT_CLASS[variant],
          )}
          onChange={(event) => {
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            stepBy(event);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            // Normalise valid text ("7,40" → "7,4"); invalid text stays for the user to fix.
            const parsed = parseEsCoNumber(text);
            if (parsed.kind === 'number' && inRange(parsed.value)) {
              setText(formatEditableNumber(parsed.value));
            }
          }}
          {...describedBy(ids, {
            description,
            error,
            invalid,
            extra: [suffix === undefined ? undefined : suffixId],
          })}
          {...props}
        />
        {suffix === undefined ? null : (
          <span id={suffixId} className="font-mono text-mono-input text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    </FieldFrame>
  );
});
