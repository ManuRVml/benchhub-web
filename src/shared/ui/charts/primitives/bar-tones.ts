/**
 * Fill colours of the div bars, token classes only (src/app/styles/theme.css, generated from design-tokens.json).
 * A new colour is a new entry here.
 */
export const BAR_TONE_CLASS = {
  highlight: 'bg-chart-highlight',
  peer: 'bg-chart-peer',
  monitor: 'bg-chart-monitor',
  success: 'bg-status-success-base',
  warning: 'bg-status-warning-base',
  danger: 'bg-status-danger-base',
  brand: 'bg-brand-primary',
  financiera: 'bg-dimension-share-financiera',
  operativa: 'bg-dimension-share-operativa',
  transversal: 'bg-dimension-share-transversal',
  series1: 'bg-chart-series-1',
  series2: 'bg-chart-series-2',
  series3: 'bg-chart-series-3',
  series4: 'bg-chart-series-4',
  series5: 'bg-chart-series-5',
  series6: 'bg-chart-series-6',
  series7: 'bg-chart-series-7',
  series8: 'bg-chart-series-8',
  series9: 'bg-chart-series-9',
} as const;

export type BarTone = keyof typeof BAR_TONE_CLASS;

/**
 * Text colour for a label drawn on a filled bar, chosen for WCAG AA (4.5:1) at the 10px label size. `null` marks the
 * tones where neither dark nor inverse text reaches 4.5:1 (danger 4.09, series2 3.99): draw the value outside the bar.
 */
export const ON_TONE_TEXT_CLASS: Record<BarTone, string | null> = {
  highlight: 'text-text-heading',
  peer: 'text-text-heading',
  monitor: 'text-text-inverse',
  success: 'text-text-heading',
  warning: 'text-text-heading',
  danger: null,
  brand: 'text-text-inverse',
  financiera: 'text-text-inverse',
  operativa: 'text-text-heading',
  transversal: 'text-text-heading',
  series1: 'text-text-inverse',
  series2: null,
  series3: 'text-text-heading',
  series4: 'text-text-heading',
  series5: 'text-text-heading',
  series6: 'text-text-heading',
  series7: 'text-text-heading',
  series8: 'text-text-heading',
  series9: 'text-text-inverse',
};
/** Empty track behind every bar. */
export const TRACK_CLASS = 'bg-chart-track';
