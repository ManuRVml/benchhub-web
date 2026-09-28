import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { CONTROL_SIZE, FieldFrame, controlClass, describedBy, useFieldIds } from './field';

import type { ControlSize, FieldProps } from './field';
import type { ComponentPropsWithoutRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type NativeSelectProps = Omit<
  ComponentPropsWithoutRef<'select'>,
  'className' | 'size' | 'id' | 'multiple'
>;

export interface SelectProps extends NativeSelectProps, FieldProps {
  /** Options in display order, labels already translated. */
  options: readonly SelectOption[];
  /** `filter` variant: a first option with value `''` and this label ("todas", "todos"). */
  allLabel?: string;
  /** Called with the selected value (alongside the native `onChange`). */
  onValueChange?: (value: string) => void;
  size?: ControlSize;
}

/**
 * Single-select dropdown on the native `<select>` (component catalog "Select": native for simple filters and forms),
 * so keyboard, typeahead and mobile pickers come from the platform.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'select',
    className,
    size = 'md',
    options,
    allLabel,
    onChange,
    onValueChange,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(id);
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
      <select
        ref={ref}
        id={ids.control}
        data-testid={testId}
        className={cn(controlClass, CONTROL_SIZE[size], 'cursor-pointer')}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...describedBy(ids, { description, error })}
        {...props}
      >
        {allLabel === undefined ? null : <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
});
