import * as RadixSlider from '@radix-ui/react-slider';
import { forwardRef, useState } from 'react';

import { cn } from '@/shared/lib';

import { FieldFrame, describedBy, useFieldIds } from './field';

import type { FieldProps } from './field';

export interface RangeSliderProps extends FieldProps {
  /** Controlled value; omit it (with `defaultValue`) for an uncontrolled slider. */
  value?: number;
  defaultValue?: number;
  /** Called while dragging or on each key press. */
  onValueChange?: (value: number) => void;
  /** Called once when the user releases the thumb or finishes a key press (e.g. to call C-21). */
  onValueCommit?: (value: number) => void;
  min: number;
  max: number;
  /** Default 1. */
  step?: number;
  disabled?: boolean;
  /**
   * Formats the value with its unit for `aria-valuetext` and the value shown next to the label, e.g.
   * `(v) => formatPercent(v)`. Without it the raw number is announced and nothing is shown.
   */
  formatValue?: (value: number) => string;
}

/**
 * Single-thumb range slider (component catalog "SliderField", SCR-12 levers, SCR-08 weights) on Radix Slider: arrow,
 * Page, Home and End keys, `aria-valuenow` / `min` / `max` and a unit-aware `aria-valuetext`. Themed with
 * `brand.primary` on a `chart.track` rail instead of the browser blue (OQ-11).
 */
export const RangeSlider = forwardRef<HTMLSpanElement, RangeSliderProps>(function RangeSlider(
  {
    label,
    hideLabel,
    labelVariant,
    description,
    error,
    id,
    testId = 'range-slider',
    className,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min,
    max,
    step = 1,
    disabled,
    formatValue,
  },
  ref,
) {
  const ids = useFieldIds(id);
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const shown = formatValue?.(current);

  return (
    <FieldFrame
      ids={ids}
      label={
        <span className="flex items-baseline justify-between gap-8">
          <span>{label}</span>
          {shown === undefined ? null : (
            <span aria-hidden="true" className="font-mono text-mono-input text-brand-primary">
              {shown}
            </span>
          )}
        </span>
      }
      hideLabel={hideLabel}
      labelVariant={labelVariant}
      description={description}
      error={error}
      testId={testId}
      className={className}
      labelFor={false}
    >
      <RadixSlider.Root
        ref={ref}
        value={[current]}
        min={min}
        max={max}
        step={step}
        {...(disabled === undefined ? {} : { disabled })}
        className="relative flex h-20 w-full touch-none items-center select-none data-disabled:opacity-50"
        onValueChange={([next = current]) => {
          setInner(next);
          onValueChange?.(next);
        }}
        {...(onValueCommit
          ? {
              onValueCommit: ([next = current]: number[]) => {
                onValueCommit(next);
              },
            }
          : {})}
      >
        <RadixSlider.Track className="relative h-4 grow overflow-hidden rounded-pill bg-chart-track">
          <RadixSlider.Range className="absolute h-full bg-brand-primary" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          id={ids.control}
          data-testid={testId}
          aria-labelledby={ids.label}
          {...(shown === undefined ? {} : { 'aria-valuetext': shown })}
          {...describedBy(ids, { description, error })}
          className={cn(
            'block size-16 cursor-grab rounded-pill border-2 border-brand-primary bg-surface-card',
            'active:cursor-grabbing data-disabled:cursor-not-allowed',
          )}
        />
      </RadixSlider.Root>
    </FieldFrame>
  );
});
