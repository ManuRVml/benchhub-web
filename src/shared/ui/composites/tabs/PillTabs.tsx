import { cn } from '@/shared/lib';

import { TabBar } from './TabBar';

import type { TabBarProps } from './TabBar';

export interface PillTabsProps extends TabBarProps {
  /**
   * solid (default): active pill filled `brand.primary` (SCR-07 step 3 source tabs); subtle: active pill
   * `brand.primarySubtle` with a `brand.primary` border (SCR-12 indicator pills).
   */
  variant?: 'solid' | 'subtle';
}

const ACTIVE_CLASS = {
  solid: 'border-brand-primary bg-brand-primary text-text-inverse',
  subtle: 'border-brand-primary bg-brand-primary-subtle text-brand-primary',
} as const;

/**
 * Row of separate pills with single selection (SCR-07 source tabs, SCR-12 indicator pills with disabled items). Same
 * keyboard model as SegmentedTabs: roving tabindex, ArrowLeft / ArrowRight (wrapping), Home / End, disabled pills are
 * skipped and cannot be selected. Controlled or uncontrolled.
 */
export function PillTabs({ variant = 'solid', ...props }: PillTabsProps) {
  return (
    <TabBar
      {...props}
      listClassName="flex flex-wrap items-center gap-6"
      tabClassName={(_item, selected) =>
        cn(
          'inline-flex cursor-pointer items-center whitespace-nowrap rounded-pill border px-12 py-6 text-small-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:border-border-subtle disabled:text-text-muted',
          selected
            ? ACTIVE_CLASS[variant]
            : 'border-border-default bg-surface-card text-text-secondary hover:border-brand-primary-border',
        )
      }
    />
  );
}
