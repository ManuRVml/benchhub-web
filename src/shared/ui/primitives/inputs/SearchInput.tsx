import { forwardRef, useRef, useState } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import {
  CONTROL_SIZE,
  FieldFrame,
  controlClass,
  describedBy,
  mergeRefs,
  useFieldIds,
} from './field';

import type { ControlSize, FieldProps } from './field';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'size' | 'type' | 'id' | 'value' | 'defaultValue'
>;

export interface SearchInputProps extends NativeInputProps, FieldProps {
  /** Controlled text; omit it (with `defaultValue`) for an uncontrolled field. */
  value?: string;
  defaultValue?: string;
  /** Called with the new text on typing and with `''` when the clear button is pressed. */
  onValueChange?: (value: string) => void;
  /** Leading icon. The prototype search fields have none (SCR-06 L390), so there is no default. */
  icon?: ReactNode;
  size?: ControlSize;
}

/**
 * Search box (`type="search"`, component catalog "TextField" `search` variant): optional leading icon and a "✕" clear
 * button, labelled from i18n, shown while there is text. Clearing returns focus to the field.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'search-input',
    className,
    size = 'md',
    icon,
    value,
    defaultValue = '',
    onChange,
    onValueChange,
    disabled,
    ...props
  },
  ref,
) {
  const t = useT();
  const ids = useFieldIds(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;

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
      <div className="relative flex items-center">
        {icon === undefined ? null : (
          <span aria-hidden="true" className="pointer-events-none absolute left-12 text-text-muted">
            {icon}
          </span>
        )}
        <input
          ref={mergeRefs(ref, inputRef)}
          id={ids.control}
          type="search"
          data-testid={testId}
          value={text}
          disabled={disabled}
          className={cn(
            controlClass,
            CONTROL_SIZE[size],
            'pr-32 [&::-webkit-search-cancel-button]:appearance-none',
            icon !== undefined && 'pl-32',
          )}
          onChange={(event) => {
            setInner(event.target.value);
            onChange?.(event);
            onValueChange?.(event.target.value);
          }}
          {...describedBy(ids, { description, error })}
          {...props}
        />
        {text === '' || disabled ? null : (
          <button
            type="button"
            data-testid={`${testId}-clear`}
            aria-label={t('common.a11y.clearSearch')}
            className="absolute right-8 grid size-20 place-items-center rounded-sm text-12 text-text-muted hover:text-text-secondary"
            onClick={() => {
              setInner('');
              onValueChange?.('');
              inputRef.current?.focus();
            }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>
    </FieldFrame>
  );
});
