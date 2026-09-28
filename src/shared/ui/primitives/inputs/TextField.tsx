import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { CONTROL_SIZE, FieldFrame, controlClass, describedBy, useFieldIds } from './field';

import type { ControlSize, FieldProps } from './field';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'size' | 'type' | 'id'
>;

export interface TextFieldProps extends NativeInputProps, FieldProps {
  /** `sm` 12px text (filters, table cells) or `md` 13px (forms, default). */
  size?: ControlSize;
  /** `dashedEstimate`: amber dashed field for an estimate justification (SCR-08). */
  variant?: 'default' | 'dashedEstimate';
  /** `password` masks the text (SCR-01 "Contraseña"); default `text`. */
  type?: 'text' | 'password';
  /** Called with the new text on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void;
}

const VARIANT_CLASS = {
  default: '',
  dashedEstimate: 'border-dashed border-status-warning-base bg-status-warning-estimate-input-bg',
} as const;

/** Single-line text input with its label, help and error (component catalog "TextField"). */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'text-field',
    className,
    size = 'md',
    variant = 'default',
    type = 'text',
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
        type={type}
        data-testid={testId}
        className={cn(controlClass, CONTROL_SIZE[size], VARIANT_CLASS[variant])}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...describedBy(ids, { description, error })}
        {...props}
      />
    </FieldFrame>
  );
});
