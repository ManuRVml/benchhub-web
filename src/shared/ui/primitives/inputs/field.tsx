import { useId } from 'react';

import { cn } from '@/shared/lib';

import type { ReactNode, Ref, RefCallback } from 'react';

export type FieldLabelVariant = 'default' | 'eyebrow';

/** Classes of the field label per variant (component catalog "FieldLabel"). */
export const FIELD_LABEL_CLASS: Record<FieldLabelVariant, string> = {
  default: 'text-13 text-text-body',
  eyebrow: 'text-label font-medium uppercase tracking-eyebrow text-text-muted',
};

/** Label, help and error props shared by every input primitive. */
export interface FieldProps {
  /** Visible label, bound to the control (`<label htmlFor>` or `aria-labelledby`). Required: every control is named. */
  label: ReactNode;
  /** Keeps the label for assistive technology only, for controls whose design shows no label (table cells, search). */
  hideLabel?: boolean | undefined;
  /** `eyebrow`: uppercase 11px / 500 muted label (component catalog "FieldLabel" eyebrow variant, SCR-07 wizard). */
  labelVariant?: FieldLabelVariant | undefined;
  /** Help text under the control, announced through `aria-describedby`. */
  description?: ReactNode | undefined;
  /** Error message: sets `aria-invalid`, the danger border and joins `aria-describedby`. */
  error?: ReactNode | undefined;
  /** Id of the control; generated when omitted. Label, description and error ids derive from it. */
  id?: string | undefined;
  /** `data-testid` of the control; the wrapper gets `<testId>-field`. */
  testId?: string | undefined;
  /** Classes of the wrapper (layout: width, margins). */
  className?: string | undefined;
}

export interface FieldIds {
  control: string;
  label: string;
  description: string;
  error: string;
}

/** Stable ids for a control and its label / description / error. */
export function useFieldIds(id: string | undefined): FieldIds {
  const generated = useId();
  const control = id ?? generated;
  return {
    control,
    label: `${control}-label`,
    description: `${control}-description`,
    error: `${control}-error`,
  };
}

/** `aria-describedby` / `aria-invalid` for a control: description, error and any extra ids, in that order. */
export function describedBy(
  ids: FieldIds,
  {
    description,
    error,
    invalid = false,
    extra = [],
  }: {
    description?: ReactNode | undefined;
    error?: ReactNode | undefined;
    invalid?: boolean;
    extra?: readonly (string | undefined)[];
  },
): { 'aria-describedby'?: string; 'aria-invalid'?: true } {
  const list = [
    description === undefined ? undefined : ids.description,
    error === undefined ? undefined : ids.error,
    ...extra,
  ].filter((value): value is string => value !== undefined);
  return {
    ...(list.length ? { 'aria-describedby': list.join(' ') } : {}),
    ...(invalid || error !== undefined ? { 'aria-invalid': true as const } : {}),
  };
}

/** Assigns a node to a forwarded ref and to a local one. */
export function mergeRefs<T>(...refs: readonly (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}

/** Token classes of a bordered single-line control; the error border follows `aria-invalid`. */
export const controlClass = cn(
  'w-full rounded-control border border-border-default bg-surface-card text-text-body',
  'placeholder:text-text-muted hover:border-text-muted',
  'disabled:cursor-not-allowed disabled:bg-surface-page disabled:text-text-muted',
  'aria-invalid:border-status-danger-base',
);

export const CONTROL_SIZE = {
  sm: 'px-8 py-5 text-12',
  md: 'px-12 py-8 text-13',
} as const;

export type ControlSize = keyof typeof CONTROL_SIZE;

interface FieldFrameProps {
  ids: FieldIds;
  label: ReactNode;
  hideLabel?: boolean | undefined;
  labelVariant?: FieldLabelVariant | undefined;
  description?: ReactNode | undefined;
  error?: ReactNode | undefined;
  testId: string;
  className?: string | undefined;
  /** `false` renders the label as a plain element (for controls named through `aria-labelledby`). */
  labelFor?: boolean | undefined;
  children: ReactNode;
}

/** Label above the control, then description and error lines (component catalog "FieldLabel" default variant). */
export function FieldFrame({
  ids,
  label,
  hideLabel = false,
  labelVariant = 'default',
  description,
  error,
  testId,
  className,
  labelFor = true,
  children,
}: FieldFrameProps) {
  const labelClass = cn('mb-6 block', FIELD_LABEL_CLASS[labelVariant], hideLabel && 'sr-only');
  return (
    <div className={cn('flex flex-col', className)} data-testid={`${testId}-field`}>
      {labelFor ? (
        <label id={ids.label} htmlFor={ids.control} className={labelClass}>
          {label}
        </label>
      ) : (
        <span id={ids.label} className={labelClass}>
          {label}
        </span>
      )}
      {children}
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
}
