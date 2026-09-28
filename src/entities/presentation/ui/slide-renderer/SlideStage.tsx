import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib';

import type { ReactNode } from 'react';

/**
 * Design canvas of every slide (slide-renderer.md "Scaling"): slides are laid out on a fixed 960 × 540 px canvas and
 * scaled uniformly, so SCR-14 (≤ 900px), OVL-06 and the PPTX / PDF export share one geometry. The px values inside the
 * slide components are canvas coordinates, not screen sizes.
 */
export const SLIDE_CANVAS = { width: 960, height: 540 } as const;

export interface SlideStageProps {
  /** `stage` (SCR-14 viewer, `shadow.slideStage`) or `preview` (OVL-06, `shadow.previewSlide`). */
  variant?: 'stage' | 'preview';
  /**
   * Fixed scale of the canvas (e.g. 0.25 for a thumbnail). Without it the stage fills its container's width at 16:9
   * and a ResizeObserver keeps the scale = container width / 960.
   */
  scale?: number;
  children: ReactNode;
  /** `data-testid` of the stage; defaults to `slide-stage`. */
  testId?: string;
  className?: string;
}

/** 16:9 frame (radius 10, white) that scales the 960 × 540 canvas uniformly; text stays vector-crisp. */
export function SlideStage({
  variant = 'stage',
  scale,
  children,
  testId = 'slide-stage',
  className,
}: SlideStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (scale !== undefined || !frame || typeof ResizeObserver !== 'function') return undefined;
    const update = () => {
      const width = frame.getBoundingClientRect().width;
      if (width > 0) setMeasured(width / SLIDE_CANVAS.width);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => {
      observer.disconnect();
    };
  }, [scale]);

  const factor = scale ?? measured;
  return (
    <div
      ref={frameRef}
      data-testid={testId}
      data-scale={factor}
      className={cn(
        'relative aspect-video overflow-hidden rounded-md bg-surface-card',
        variant === 'preview' ? 'shadow-preview-slide' : 'shadow-slide-stage',
        scale === undefined ? 'w-full' : null,
        className,
      )}
      style={
        scale === undefined
          ? undefined
          : { width: SLIDE_CANVAS.width * scale, height: SLIDE_CANVAS.height * scale }
      }
    >
      <div
        data-testid={`${testId}-canvas`}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: SLIDE_CANVAS.width,
          height: SLIDE_CANVAS.height,
          transform: `scale(${String(factor)})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
