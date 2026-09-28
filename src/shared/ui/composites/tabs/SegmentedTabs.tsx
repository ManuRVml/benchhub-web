import { cn } from '@/shared/lib';

import { TabBar } from './TabBar';

import type { TabBarProps, TabItem } from './TabBar';

export type SegmentedTabsVariant = 'brand' | 'dark' | 'dimension' | 'buttons' | 'withDot';
export type SegmentDimension = 'financiera' | 'operativa' | 'transversal';

export interface SegmentedTabItem extends TabItem {
  /** `dimension` variant: colour of the tab when it is active. */
  dimension?: SegmentDimension;
  /** `withDot` variant: background token class of the company dot (e.g. `bg-company-shell`). */
  dotClassName?: string;
  /** Extra token classes of this tab, e.g. the per-button type size of the `buttons` font-size control. */
  className?: string;
}

export interface SegmentedTabsProps extends TabBarProps<SegmentedTabItem> {
  /**
   * brand: active `brand.primary` (analysis tabs); dark: active `text.heading` (horizon); dimension: active in the
   * item's dimension colour; buttons: A- / A / A+ font-size control; withDot: company colour dot before the label.
   */
  variant?: SegmentedTabsVariant;
  /** sm: 6 × 12 px, small text; md (default): 8 × 16 px, body text. */
  size?: 'sm' | 'md';
}

const SIZE_CLASS = {
  sm: 'px-12 py-6 text-small-medium',
  md: 'px-16 py-8 text-body-strong',
} as const;

// Active colours with AA text: white on financiera (5.8:1); dark heading text on operativa / transversal.
const DIMENSION_ACTIVE_CLASS: Record<SegmentDimension, string> = {
  financiera: 'bg-dimension-share-financiera text-text-inverse',
  operativa: 'bg-dimension-share-operativa text-text-heading',
  transversal: 'bg-dimension-share-transversal text-text-heading',
};

function activeClass(variant: SegmentedTabsVariant, item: SegmentedTabItem): string {
  switch (variant) {
    case 'brand':
      return 'bg-brand-primary text-text-inverse';
    case 'dark':
      return 'bg-text-heading text-text-inverse';
    case 'dimension':
      return item.dimension
        ? DIMENSION_ACTIVE_CLASS[item.dimension]
        : 'bg-brand-primary text-text-inverse';
    case 'buttons':
      return 'bg-brand-primary-subtle text-brand-primary';
    case 'withDot':
      return 'bg-surface-card text-text-heading';
  }
}

/**
 * Segmented control / pill tab bar (catalogue "SegmentedTabs"; aliases SourceTabs, FontSizeControls): analysis tabs,
 * horizon, dimension, source and view tabs. Single selection with a roving tabindex: ArrowLeft / ArrowRight (wrapping),
 * Home / End, disabled tabs skipped. Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`); pass
 * `idPrefix` and render `TabPanel`s when the tabs switch panels.
 */
const TAB_BASE =
  'inline-flex cursor-pointer items-center gap-6 whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:text-text-muted';

/** `buttons` (FontSizeControls, BencHUD.dc.html:3002): separate 28px squares, radius 6, gap 6, no track. */
const BUTTONS_TAB = 'size-(--size-control-square) justify-center rounded-sm p-0';

export function SegmentedTabs({ variant = 'brand', size = 'md', ...props }: SegmentedTabsProps) {
  const isButtons = variant === 'buttons';
  return (
    <TabBar
      {...props}
      listClassName={
        isButtons
          ? 'inline-flex items-center gap-6'
          : 'inline-flex items-center gap-2 rounded-md bg-surface-page p-3'
      }
      tabClassName={(item, selected) =>
        cn(
          TAB_BASE,
          SIZE_CLASS[size],
          isButtons && BUTTONS_TAB,
          selected
            ? activeClass(variant, item)
            : isButtons
              ? 'bg-surface-page text-text-heading hover:bg-border-default'
              : 'text-text-secondary hover:text-text-heading',
          item.className,
        )
      }
      renderLabel={(item) => (
        <>
          {variant === 'withDot' && item.dotClassName ? (
            <span aria-hidden="true" className={cn('size-8 rounded-pill', item.dotClassName)} />
          ) : null}
          {item.label}
        </>
      )}
    />
  );
}
