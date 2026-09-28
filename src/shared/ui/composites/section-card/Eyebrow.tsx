import { cn } from '@/shared/lib';

import type { ReactNode } from 'react';

export interface EyebrowProps {
  /** Element to render: `p` (default) above a title, `span` inline, or a heading when the eyebrow is the only title. */
  as?: 'p' | 'span' | 'h2' | 'h3' | 'h4';
  /** Element id, e.g. to label a region with the eyebrow. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Uppercase 11px group label (component catalog "SectionHeader" `eyebrow`, `Cmp:GroupEyebrow`). Coloured
 * `text.secondary`: the `text.eyebrow` token (#808A9B) is 3.4:1 on white, below WCAG AA for 11px text.
 */
export function Eyebrow({ as: Tag = 'p', id, className, children }: EyebrowProps) {
  return (
    <Tag
      id={id}
      className={cn('text-eyebrow tracking-eyebrow text-text-secondary uppercase', className)}
    >
      {children}
    </Tag>
  );
}
