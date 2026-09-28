import { forwardRef, useState } from 'react';

import { cn } from '@/shared/lib';

import { FieldFrame, controlClass, describedBy, useFieldIds } from './field';

import type { FieldProps } from './field';
import type { ComponentPropsWithoutRef } from 'react';

type NativeTextareaProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'className' | 'id'>;

export interface TextareaProps extends NativeTextareaProps, FieldProps {
  /** `compact`: comment composer (min height 48). */
  variant?: 'default' | 'compact';
  /** Called with the new text on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void;
}

/**
 * Multi-line input (component catalog "TextArea"): objective / question, comments, notes. With `maxLength` a
 * "{length}/{max}" counter is shown and announced through `aria-describedby`.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'textarea',
    className,
    variant = 'default',
    rows = 3,
    maxLength,
    value,
    defaultValue,
    onChange,
    onValueChange,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(id);
  const counterId = `${ids.control}-counter`;
  const lengthOf = (text: unknown) => (typeof text === 'string' ? text.length : 0);
  // Uncontrolled fields count what was typed; controlled ones count `value`.
  const [typedLength, setTypedLength] = useState(() => lengthOf(defaultValue));
  const length = value === undefined ? typedLength : lengthOf(value);

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
      <textarea
        ref={ref}
        id={ids.control}
        data-testid={testId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          controlClass,
          'resize-y px-12 py-8 text-13',
          variant === 'compact' && 'min-h-48',
        )}
        onChange={(event) => {
          setTypedLength(event.target.value.length);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...describedBy(ids, {
          description,
          error,
          extra: [maxLength === undefined ? undefined : counterId],
        })}
        {...props}
      />
      {maxLength === undefined ? null : (
        <p id={counterId} className="mt-4 self-end text-label text-text-secondary">
          {`${String(length)}/${String(maxLength)}`}
        </p>
      )}
    </FieldFrame>
  );
});
