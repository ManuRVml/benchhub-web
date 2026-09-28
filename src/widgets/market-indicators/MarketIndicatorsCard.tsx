import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  formatCurrency,
  formatDelta,
  formatMultiple,
  formatNumber,
  formatPercent,
  formatUnit,
} from '@/shared/lib/format';
import { SectionCard } from '@/shared/ui/composites/section-card';

import type { V03Response } from '@/shared/api';

/** A single market indicator from the BFF response, derived from V03Response. */
export type MarketIndicator = Extract<
  V03Response['marketIndicators'],
  { status: 'ok' }
>['data'][number];

/**
 * Format a market indicator value by its unit code.
 * - cop_per_usd, cop → formatCurrency COP
 * - usd_bn → formatCurrency USD
 * - percent → formatPercent
 * - ratio_x → formatMultiple
 * - usd_b, kboe, bcop, mmcop → formatUnit
 * - points → formatNumber + " pts"
 * - default → formatNumber
 */
function formatIndicatorValue(value: number, unit: string): string {
  switch (unit) {
    case 'cop_per_usd':
    case 'cop':
      return formatCurrency(value, 'COP');
    case 'usd_bn':
      return formatCurrency(value, 'USD');
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

export interface MarketIndicatorsCardProps {
  items: readonly MarketIndicator[];
}

/**
 * SCR-05 "Indicadores de mercado" (prototype L361-L378): a 16px-padded card with the uppercase group label and its "(i)"
 * panel over a 5-column grid; each cell shows label (11px muted), value (15px bold mono), delta (11px, by trend).
 */
export function MarketIndicatorsCard({ items }: MarketIndicatorsCardProps) {
  const t = useT();

  if (items.length === 0) {
    return null;
  }

  return (
    <SectionCard
      title={t('home.sectionTitles.marketIndicators')}
      info={t('home.sectionInfo.marketIndicators')}
      titleVariant="eyebrow"
      headingLevel={2}
      testId="market-indicators"
      className="p-16"
    >
      <div data-testid="market-indicators-grid" className="grid grid-cols-5 gap-10">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <span className="mb-3 text-11 text-text-muted">{item.label}</span>
            <span className="font-mono text-mono-market text-text-heading">
              {formatIndicatorValue(item.value, item.unit)}
            </span>
            <span
              className={cn(
                'text-11 font-semibold',
                item.trend === 'up' ? 'text-status-success-text' : 'text-status-danger-text',
              )}
            >
              {formatDelta(item.deltaPct, { unit: '%' })}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
