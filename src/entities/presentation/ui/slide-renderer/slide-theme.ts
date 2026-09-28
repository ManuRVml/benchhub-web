import { formatMultiple, formatNumber, formatPercent, formatUnit } from '@/shared/lib/format';

import type { SlideTemplateId, SlideUnit } from './types';

/**
 * Template accent classes (slide-renderer.md "Template accents": `template.directorio` / `.storytelling` /
 * `.detalleAnalitico`). `fill` / `glow` use the accent itself (decorative); `text` and `onFill` are the AA-safe inks:
 * the storytelling cyan (2.2:1) and analítico blue (2.8:1) fail WCAG AA as text on white, so their eyebrow takes
 * `ai.text` / `text.heading`, and text on an accent fill is dark on those two (CF-139 pattern).
 */
export const TEMPLATE_ACCENT: Readonly<
  Record<SlideTemplateId, { fill: string; text: string; onFill: string; glowVar: string }>
> = {
  directorio: {
    fill: 'bg-template-directorio',
    text: 'text-template-directorio',
    onFill: 'text-text-inverse',
    glowVar: '--color-template-directorio',
  },
  storytelling: {
    fill: 'bg-template-storytelling',
    text: 'text-ai-text',
    onFill: 'text-dark-bg',
    glowVar: '--color-template-storytelling',
  },
  analitico: {
    fill: 'bg-template-detalle-analitico',
    text: 'text-text-heading',
    onFill: 'text-dark-bg',
    glowVar: '--color-template-detalle-analitico',
  },
};

/**
 * Corner glow of the chrome kinds: `gradient.slideGlow` with the template accent at alpha 0x22 (≈ 13 %), built from the
 * accent's CSS variable so every template gets its own glow without a colour literal.
 */
export function slideGlow(template: SlideTemplateId): string {
  const accent = `var(${TEMPLATE_ACCENT[template].glowVar})`;
  return `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${accent} 13%, transparent) 0%, transparent 70%)`;
}

/** es-CO text of a slide value by its unit code (CF-70); negative values keep their sign (CF-72). */
export function formatSlideValue(value: number, unit: SlideUnit): string {
  switch (unit) {
    case 'percent':
      return formatPercent(value);
    case 'ratio_x':
      return formatMultiple(value);
    case 'usd_b':
      return formatUnit(value, 'USD/B');
    case 'kboe':
      return formatUnit(value, 'KBOE');
    case 'bcop':
      return formatUnit(value, 'BCOP');
    case 'mmcop':
      return formatUnit(value, 'MMCOP');
    case 'points':
      return `${formatNumber(value, { decimals: 1 })} pts`;
    default:
      return formatNumber(value, { decimals: 1 });
  }
}

/** Whole percentage as the slides print it ("45%", "106%"). */
export const formatWholePct = (value: number): string => formatPercent(value, { decimals: 0 });

/** Bar length of `bars` / `pvc` rows: |value| / maxAbs × 82 % of the track (slide-renderer.md, HTML L4925, L4931). */
export function slideBarPct(value: number, maxAbs: number): number {
  if (!(maxAbs > 0)) return 0;
  return Math.min(100, (Math.abs(value) / maxAbs) * 82);
}
