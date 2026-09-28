import * as RadixSwitch from '@radix-ui/react-switch';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { describedBy, useFieldIds } from './field';

import type { FieldProps } from './field';
import type { ReactNode } from 'react';

export interface SwitchProps extends Omit<FieldProps, 'hideLabel'> {
  /** Controlled state; omit it (with `defaultChecked`) for an uncontrolled switch. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Form field name, when the switch is submitted in a native form. */
  name?: string;
  /** Extra content after the label (e.g. a saving indicator). */
  trailing?: ReactNode;
  /** Track colour when on: `brand` (`brand.primary`, default) or `success` (`status.success.base`, SCR-16 prototype). */
  tone?: SwitchTone;
}

export type SwitchTone = 'brand' | 'success';

const CHECKED_TONE: Record<SwitchTone, string> = {
  brand: 'data-[state=checked]:bg-brand-primary',
  success: 'data-[state=checked]:bg-status-success-base',
};

/**
 * On / off preference toggle (component catalog "Switch", SCR-16): label on the left, 40×22 track on the right,
 * `brand.primary` (or `status.success.base` with `tone="success"`) when on. Radix Switch: `role="switch"` with
 * `aria-checked`, toggled by click, Space or Enter.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    description,
    error,
    id,
    testId = 'switch',
    className,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    name,
    trailing,
    tone = 'brand',
  },
  ref,
) {
  const ids = useFieldIds(id);
  return (
    <div className={cn('flex flex-col', className)} data-testid={`${testId}-field`}>
      <div className="flex items-center justify-between gap-16">
        <label
          id={ids.label}
          htmlFor={ids.control}
          className={cn('text-13 text-text-body', disabled && 'text-text-muted')}
        >
          {label}
        </label>
        {trailing}
        <RadixSwitch.Root
          ref={ref}
          id={ids.control}
          data-testid={testId}
          data-tone={tone}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-(--size-switch-track-height) w-(--size-switch-track-width) shrink-0 cursor-pointer items-center rounded-pill bg-border-default transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            CHECKED_TONE[tone],
          )}
          {...(checked === undefined ? {} : { checked })}
          {...(defaultChecked === undefined ? {} : { defaultChecked })}
          {...(onCheckedChange ? { onCheckedChange } : {})}
          {...(name === undefined ? {} : { name })}
          {...describedBy(ids, { description, error })}
        >
          <RadixSwitch.Thumb className="block size-(--size-switch-knob) translate-x-(--size-switch-knob-inset) rounded-pill bg-surface-card shadow-toast transition-transform data-[state=checked]:translate-x-(--size-switch-knob-checked-offset)" />
        </RadixSwitch.Root>
      </div>
      {description === undefined ? null : (
        <p id={ids.description} className="mt-4 text-label text-text-secondary">
          {description}
        </p>
      )}
      {error === undefined ? null : (
        <p id={ids.error} className="mt-4 text-label text-status-danger-text">
          {error}
        </p>
      )}
    </div>
  );
});
