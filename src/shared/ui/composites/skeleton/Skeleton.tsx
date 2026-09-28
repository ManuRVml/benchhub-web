import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

/** `line` (text lines, the last one shorter), `block` (card / chart area) or `circle` (avatar). */
export type SkeletonShape = 'line' | 'block' | 'circle';

/**
 * Pulse of the placeholders. `motion-safe:` keeps it off under `prefers-reduced-motion: reduce` (the global reduced
 * motion rule also shortens it), so reduced-motion users see a still placeholder.
 */
export const SKELETON_PULSE_CLASS = 'motion-safe:animate-pulse';

const SHAPE_CLASS: Readonly<Record<SkeletonShape, string>> = {
  line: 'h-12 rounded-sm',
  block: 'rounded-card',
  circle: 'rounded-pill',
};

export interface SkeletonProps {
  /** Placeholder shape; default `line`. */
  shape?: SkeletonShape;
  /** Number of lines for `shape="line"`; default 1. */
  lines?: number;
  /** Height in px of a `block` (default 120) or diameter of a `circle` (default 36). */
  size?: number;
  /** Visually hidden loading text announced by screen readers; default `common.section.loading` ("Cargando…"). */
  label?: string;
  /** `data-testid` of the container; defaults to `skeleton`. */
  testId?: string;
  className?: string;
}

/**
 * Loading placeholder shaped like the final content (component-catalog.md "Skeleton"). The container is a busy
 * status with a visually hidden "Cargando…"; the grey shapes are hidden from assistive technology.
 */
export function Skeleton({
  shape = 'line',
  lines = 1,
  size,
  label,
  testId = 'skeleton',
  className,
}: SkeletonProps) {
  const t = useT();
  const count = shape === 'line' ? Math.max(1, Math.floor(lines)) : 1;
  const dimension = shape === 'line' ? undefined : (size ?? (shape === 'block' ? 120 : 36));
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid={testId}
      className={cn('flex flex-col gap-8', className)}
    >
      <span className="sr-only">{label ?? t('common.section.loading')}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          data-testid={`${testId}-shape`}
          className={cn(
            'bg-border-subtle',
            SKELETON_PULSE_CLASS,
            SHAPE_CLASS[shape],
            // The last of several lines is shorter, like the end of a paragraph; circles take their size from style.
            shape === 'circle'
              ? null
              : shape === 'line' && count > 1 && index === count - 1
                ? 'w-3/5'
                : 'w-full',
          )}
          style={
            dimension === undefined
              ? undefined
              : { height: dimension, width: shape === 'circle' ? dimension : undefined }
          }
        />
      ))}
    </div>
  );
}
