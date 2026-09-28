import type { VisualizationTierId } from '../api/use-visualization-view';

// Tier names and tones (docs/design/design-tokens.json `tier.1..4.base.$description`), shared by every widget that
// shows a tier: report-position's header (P5-47a) and category-tiers' cards (P5-47c). Single source so neither
// widget re-derives the mapping.

/** i18n keys of the 4 tier names. */
export const TIER_NAME_KEY = {
  1: 'analysis-report.header.tierNames.1',
  2: 'analysis-report.header.tierNames.2',
  3: 'analysis-report.header.tierNames.3',
  4: 'analysis-report.header.tierNames.4',
} as const satisfies Record<VisualizationTierId, string>;

/** AA-safe text colour of each tier on a plain (non-badge) background — Badge's own tone mapping, badge-variants.ts. */
export const TIER_TEXT_CLASS = {
  1: 'text-status-success-text',
  2: 'text-tier-2-text',
  3: 'text-tier-3-text',
  4: 'text-status-danger-text',
} as const satisfies Record<VisualizationTierId, string>;

/** Pale card background of each tier (Badge's own `card` fill, badge-variants.ts `bg-tier-N-card`). */
export const TIER_CARD_BG_CLASS = {
  1: 'bg-tier-1-card',
  2: 'bg-tier-2-card',
  3: 'bg-tier-3-card',
  4: 'bg-tier-4-card',
} as const satisfies Record<VisualizationTierId, string>;

/** Accent border colour of each tier (the tier's `base` token). */
export const TIER_BORDER_CLASS = {
  1: 'border-tier-1-base',
  2: 'border-tier-2-base',
  3: 'border-tier-3-base',
  4: 'border-tier-4-base',
} as const satisfies Record<VisualizationTierId, string>;
