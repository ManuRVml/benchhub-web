import { useT } from '@/shared/i18n';
import { formatPercent } from '@/shared/lib/format';
import { maxAbs, RankingBarRow } from '@/shared/ui/charts/primitives';
import { SectionCard } from '@/shared/ui/composites/section-card';

import type { BarValue } from '@/shared/ui/charts/primitives';

// SCR-11 section 4 "Ranking de pares · ROACE": top 6 peers, latest period (CF-69, resolved server-side), Ecopetrol
// highlighted. Clicking a row is meant to open its company profile (OVL-13), but no view exposes the fields
// features/company-profile's `CompanyProfileModal` needs (country/category/business/segments/news) for a peer
// ranking row (only companyId/displayName/value/isEcopetrol) — flagged for Nilo/BFF; `onCompanyClick` is a TODO the
// page can wire once that data exists.

export interface ValueMonitorRankingRow {
  rank: number;
  companyId: string;
  displayName: string;
  /** Raw %. */
  value: number;
  isEcopetrol: boolean;
}

export interface ValueMonitorRankingProps {
  rows: readonly ValueMonitorRankingRow[];
  /** TODO(Nilo/BFF): no view carries a peer's country/category/business/segments/news yet for OVL-13. */
  onCompanyClick?: (companyId: string) => void;
}

const formatValue = (value: BarValue) => formatPercent(value, { decimals: 1 });

export function ValueMonitorRanking({ rows, onCompanyClick }: ValueMonitorRankingProps) {
  const t = useT();
  const max = maxAbs(rows.map((row) => row.value));
  return (
    <SectionCard
      title={t('value-monitor.ranking.title')}
      subtitle={t('value-monitor.ranking.subtitle')}
      info={t('value-monitor.ranking.info')}
      testId="value-monitor-ranking"
    >
      <div role="list" className="flex flex-col gap-2">
        {rows.map((row) => {
          const bar = (
            <RankingBarRow
              rank={row.rank}
              label={row.displayName}
              value={row.value}
              max={max}
              format={formatValue}
              {...(row.isEcopetrol ? { highlight: 'ecopetrol' as const } : {})}
            />
          );
          const testId = `value-monitor-ranking-row-${row.companyId}`;
          return (
            <div key={row.companyId} role="listitem" data-testid={testId}>
              {onCompanyClick ? (
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-sm text-left"
                  onClick={() => {
                    onCompanyClick(row.companyId);
                  }}
                >
                  {bar}
                </button>
              ) : (
                bar
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
