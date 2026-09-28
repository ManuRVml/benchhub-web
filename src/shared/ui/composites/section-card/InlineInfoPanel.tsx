import { cn } from '@/shared/lib';

import type { ReactNode } from 'react';

export interface InlineInfoPanelProps {
  /** Id referenced by the toggle's `aria-controls`. */
  id: string;
  /** Id(s) of the elements that name the region, space-separated (the card uses toggle + title). */
  labelledBy: string;
  open: boolean;
  /** `data-testid` of the panel (default `info-panel`). */
  testId?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Inline explanatory panel under a card header (component catalog "InfoPanel" `neutral`): a `region` labelled by the
 * card title, `surface.page` background, 12px body text. Closed panels stay in the DOM with `hidden`, so the toggle's
 * `aria-controls` always points to an element.
 */
export function InlineInfoPanel({
  id,
  labelledBy,
  open,
  testId = 'info-panel',
  className,
  children,
}: InlineInfoPanelProps) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      hidden={!open}
      data-testid={testId}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'rounded-control bg-surface-page px-14 py-10 text-small text-text-body',
        className,
      )}
    >
      {children}
    </div>
  );
}
