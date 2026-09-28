import { cn } from '@/shared/lib';
import { BAR_TONE_CLASS, chartTestIds } from '@/shared/ui/charts/primitives';

import type { TestIdPart } from '@/shared/config/test-ids';
import type { BarTone } from '@/shared/ui/charts/primitives';

export interface ChartLegendItem {
  id: string;
  /** Visible text, already translated by the caller. */
  label: string;
  /** Chart tone token (`BAR_TONE_CLASS`) — no hex, no `var()`. */
  tone: BarTone;
  /** `solid` (default, a filled square) or `outlined` (an unfilled square in the tone's border colour, SCR-08 L587's
   * "Grupo Ecopetrol" marker). */
  variant?: 'solid' | 'outlined';
  /** Swatch class overriding `tone` (e.g. a per-company brand colour outside the `BarTone` set); `tone` is still
   * required for callers that don't need the override. */
  swatchClassName?: string;
}

export interface ChartLegendProps {
  items: readonly ChartLegendItem[];
  /** Accessible name of the legend's `role="list"`. */
  'aria-label'?: string;
  /** Test-id owner, following the charts' convention (`chartTestIds`): the root is `{scope}-{component}-legend`, each
   * item `{scope}-{component}-legend-item-{itemId}`. */
  testIds?: { scope: TestIdPart; component: TestIdPart };
  className?: string;
}

/** `bg-<token>` → `border-<token>`: every `BAR_TONE_CLASS` entry is a `bg-` utility on the same design-token colour, so
 * its border counterpart is the same string with the prefix swapped (Tailwind v4 generates both from one `--color-*`
 * variable) — no separate border-tone map to keep in sync. */
function toneBorderClass(tone: BarTone): string {
  return BAR_TONE_CLASS[tone].replace(/^bg-/, 'border-');
}

/**
 * Presentational chart legend (SCR-08 `Cmp:ChartLegend`, ~L380/L587): a swatch + label per item, decorative swatches
 * (`aria-hidden`, the label carries the meaning), `role="list"`/`"listitem"` so it reads as a group without native
 * list markup. Solid swatches are a filled square in the tone; the outlined variant (the "Grupo Ecopetrol" marker
 * where a highlighted row already carries the fill) is an empty square with a 2px border in the same tone.
 */
export function ChartLegend({
  items,
  'aria-label': ariaLabel,
  testIds,
  className,
}: ChartLegendProps) {
  return (
    <div
      role="list"
      {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
      {...(testIds ? { 'data-testid': chartTestIds.legend(testIds.scope, testIds.component) } : {})}
      className={cn('flex flex-wrap items-center gap-12', className)}
    >
      {items.map((item) => {
        const variant = item.variant ?? 'solid';
        return (
          <div
            key={item.id}
            role="listitem"
            {...(testIds
              ? {
                  'data-testid': chartTestIds.legendItem(testIds.scope, testIds.component, item.id),
                }
              : {})}
            className="inline-flex items-center gap-6 text-11 text-text-secondary"
          >
            <span
              aria-hidden="true"
              data-variant={variant}
              className={cn(
                'size-9 shrink-0 rounded-xs',
                variant === 'outlined'
                  ? cn(
                      'border-2 bg-transparent',
                      item.swatchClassName ?? toneBorderClass(item.tone),
                    )
                  : (item.swatchClassName ?? BAR_TONE_CLASS[item.tone]),
              )}
            />
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
