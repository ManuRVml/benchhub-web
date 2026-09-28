import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { CONTROL_SIZE, FieldFrame, controlClass, describedBy, useFieldIds } from './field';

import type { ControlSize, FieldProps } from './field';
import type { ComponentPropsWithoutRef } from 'react';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'size' | 'type' | 'id'
>;

export interface DateInputProps extends NativeInputProps, FieldProps {
  /** ISO date `YYYY-MM-DD` (or `''` when empty); `min` / `max` use the same format. */
  value?: string;
  /** Called with the ISO date, or `''` when the field is cleared. */
  onValueChange?: (value: string) => void;
  size?: ControlSize;
}

/**
 * Native date field (`type="date"`, component catalog "TextField" `date` variant): the browser renders its picker in the
 * user's locale while the value stays ISO, e.g. the SCR-07 "Fecha de corte".
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'date-input',
    className,
    size = 'md',
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
      <input
        ref={ref}
        id={ids.control}
        type="date"
        data-testid={testId}
        className={cn(controlClass, CONTROL_SIZE[size])}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...describedBy(ids, { description, error })}
        {...props}
      />
    </FieldFrame>
  );
});
