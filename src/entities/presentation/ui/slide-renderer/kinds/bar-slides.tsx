import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { COMPANY_COLOR_CLASSES, FALLBACK_COMPANY_COLOR } from '@/shared/lib/company-color';

import { formatSlideValue, formatWholePct, slideBarPct } from '../slide-theme';
import { SlideChrome } from '../SlideChrome';

import type { BarsSlide, PvcSlide, RadarSlide } from '../types';
import type { ChromeKindProps } from './chrome-kind-props';

// Paired-bar kinds (slide-renderer.md "bars", "pvc", "radar"): Ecopetrol `chart.ecopetrol` vs peers `chart.peer` or the
// company colour; negative values keep a positive length and a signed label (CF-72); no axis, grid or tooltip.

interface PairedRow {
  label: string;
  first: { value: string; pct: number };
  second: { value: string; pct: number };
}

/** Company colour class of a bare slug, matched case-insensitively (CF-137); unknown → `company.fallback`. */
function companyFill(slug: string): string {
  const key = Object.keys(COMPANY_COLOR_CLASSES).find(
    (candidate) => candidate.toLowerCase() === slug.toLowerCase(),
  ) as keyof typeof COMPANY_COLOR_CLASSES | undefined;
  return (key ? COMPANY_COLOR_CLASSES[key] : FALLBACK_COMPANY_COLOR).bg;
}

function PairedRows({
  rows,
  secondFill,
  thick = false,
}: {
  rows: readonly PairedRow[];
  secondFill: string;
  thick?: boolean;
}) {
  const bar = thick ? 'h-12' : 'h-[7px]';
  return (
    <ul className={cn('m-0 flex list-none flex-col p-0', thick ? 'gap-16' : 'gap-10')}>
      {rows.map((row) => (
        <li
          key={row.label}
          className={cn(
            'grid items-center gap-12',
            thick ? 'grid-cols-1' : 'grid-cols-[170px_1fr]',
          )}
        >
          <span className="truncate text-12 font-medium text-text-body">{row.label}</span>
          <span className="flex flex-col gap-3">
            {[
              { ...row.first, fill: 'bg-chart-ecopetrol', strong: true },
              { ...row.second, fill: secondFill, strong: false },
            ].map((side) => (
              <span key={side.fill} className="flex items-center gap-6">
                <span
                  aria-hidden="true"
                  className={cn('rounded-xs', bar, side.fill)}
                  style={{ width: `${String(side.pct)}%` }}
                />
                <span
                  className={cn(
                    'font-mono',
                    thick ? 'text-11' : 'text-10',
                    side.strong ? 'font-bold text-text-heading' : 'font-medium text-text-secondary',
                  )}
                >
                  {side.value}
                </span>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Legend({ second, secondFill }: { second: string; secondFill: string }) {
  const t = useT();
  return (
    <p className="m-0 mt-12 flex gap-16 text-11 text-text-secondary">
      {[
        { label: t('presentation-detail.slides.legend.ecopetrol'), fill: 'bg-chart-ecopetrol' },
        { label: second, fill: secondFill },
      ].map((item) => (
        <span key={item.label} className="inline-flex items-center gap-6">
          <span aria-hidden="true" className={cn('size-[9px] rounded-legend', item.fill)} />
          {item.label}
        </span>
      ))}
    </p>
  );
}

/** GE vs. Promedio Pares (HTML L2126–2142): bar length = |value| / maxAbs × 82 %. */
export function BarsSlideView({ slide, ...chrome }: ChromeKindProps<BarsSlide>) {
  const t = useT();
  const rows = slide.rows.map((row) => ({
    label: row.indicatorLabel,
    first: {
      value: formatSlideValue(row.ecopetrolValue, row.unit),
      pct: slideBarPct(row.ecopetrolValue, slide.maxAbs),
    },
    second: {
      value: formatSlideValue(row.peerAverageValue, row.unit),
      pct: slideBarPct(row.peerAverageValue, slide.maxAbs),
    },
  }));
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={slide.title}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <PairedRows rows={rows} secondFill="bg-chart-peer" />
      <Legend second={t('presentation-detail.slides.legend.peers')} secondFill="bg-chart-peer" />
    </SlideChrome>
  );
}

/** GE vs. {compañía} (HTML L2154–2170): per-row maxAbs; the company bar uses its canonical colour (CF-47). */
export function PvcSlideView({ slide, ...chrome }: ChromeKindProps<PvcSlide>) {
  const fill = companyFill(slide.companyColorKey);
  const rows = slide.rows.map((row) => ({
    label: row.indicatorLabel,
    first: {
      value: formatSlideValue(row.ecopetrolValue, row.unit),
      pct: slideBarPct(row.ecopetrolValue, row.maxAbs),
    },
    second: {
      value: formatSlideValue(row.companyValue, row.unit),
      pct: slideBarPct(row.companyValue, row.maxAbs),
    },
  }));
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={slide.title}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <PairedRows rows={rows} secondFill={fill} />
      <Legend second={slide.companyName} secondFill={fill} />
    </SlideChrome>
  );
}

/**
 * Ecopetrol vs. promedio sectorial (HTML L2196–2209): paired 12px bars per dimension, **not** a radar polygon (V2);
 * length = value × 2 % of the track, capped at 100 %.
 */
export function RadarSlideView({ slide, ...chrome }: ChromeKindProps<RadarSlide>) {
  const t = useT();
  const rows = slide.rows.map((row) => ({
    label: row.dimensionLabel,
    first: {
      value: formatWholePct(row.ecopetrolWeightPct),
      pct: Math.min(100, row.ecopetrolWeightPct * 2),
    },
    second: {
      value: formatWholePct(row.peerAverageWeightPct),
      pct: Math.min(100, row.peerAverageWeightPct * 2),
    },
  }));
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.radar.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <PairedRows rows={rows} secondFill="bg-chart-peer" thick />
      <Legend second={t('presentation-detail.slides.legend.peers')} secondFill="bg-chart-peer" />
    </SlideChrome>
  );
}
