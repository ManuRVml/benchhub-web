import { useId, useState } from 'react';

import { useT } from '@/shared/i18n';
import { KpiStatCard } from '@/shared/ui/composites/kpi-stat-card';
import { InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';

import { valueMonitorKpisTestIds } from './test-ids';

import type { KpiTone } from '@/shared/ui/composites/kpi-stat-card';

// SCR-11 "KPI tiles" card (docs/design/screen-inventory/SCR-11-monitor-valor.md, section 2): four tiles + one
// shared info panel. Peso por dimensión, ranking, historia, configuración, the KVI table, composition, comments,
// Narrativa (OVL-09) and OVL-02 are other slices (P5-50b / P5-51 / later).

export interface ValueMonitorKpisProps {
  /** Weighted average compliance across every KVI, uncapped (%). */
  globalPct: number;
  /** Weighted average "Reto" compliance, uncapped (%). */
  retoPct: number;
  /** KVIs below 70 % compliance. */
  atRiskCount: number;
  /** KVIs with no formula or data yet. */
  tbdCount: number;
}

/** Result band of a compliance percentage (≥90 success, 70–89 warning, <70 danger — same thresholds as the KVI
 * table's bands and the coverage tones elsewhere in the app). */
function bandTone(pct: number): KpiTone {
  if (pct >= 90) return 'success';
  if (pct >= 70) return 'warning';
  return 'danger';
}

const TILE_CLASS = 'rounded-card p-16';

export function ValueMonitorKpis({
  globalPct,
  retoPct,
  atRiskCount,
  tbdCount,
}: ValueMonitorKpisProps) {
  const t = useT();
  const [infoOpen, setInfoOpen] = useState(false);
  const toggleId = useId();
  const panelId = useId();

  return (
    // Four standalone tiles, no wrapping card (BencHUD.dc.html:1723): repeat(4, 1fr), gap 12, radius 12, padding 16.
    <div data-testid={valueMonitorKpisTestIds.root}>
      <div className="grid grid-cols-2 gap-12 tablet:grid-cols-4">
        <div className="relative">
          <KpiStatCard
            label={t('value-monitor.kpis.globalCompliance')}
            value={globalPct}
            unit="percent"
            decimals={0}
            tone={bandTone(globalPct)}
            testId={valueMonitorKpisTestIds.global}
            labelPosition="above"
            className={TILE_CLASS}
          />
          <InfoToggle
            id={toggleId}
            expanded={infoOpen}
            controls={panelId}
            testId={valueMonitorKpisTestIds.infoToggle}
            className="absolute top-12 right-12"
            onToggle={() => {
              setInfoOpen((open) => !open);
            }}
          />
        </div>
        <KpiStatCard
          label={t('value-monitor.kpis.retoCompliance')}
          value={retoPct}
          unit="percent"
          decimals={1}
          tone={bandTone(retoPct)}
          testId={valueMonitorKpisTestIds.reto}
          labelPosition="above"
          className={TILE_CLASS}
        />
        <KpiStatCard
          label={t('value-monitor.kpis.atRisk')}
          value={atRiskCount}
          unit="number"
          tone="danger"
          testId={valueMonitorKpisTestIds.atRisk}
          labelPosition="above"
          className={TILE_CLASS}
        />
        <KpiStatCard
          label={t('value-monitor.kpis.tbd')}
          value={tbdCount}
          unit="number"
          tone="neutral"
          testId={valueMonitorKpisTestIds.tbd}
          labelPosition="above"
          className={TILE_CLASS}
        />
      </div>
      <InlineInfoPanel
        id={panelId}
        labelledBy={toggleId}
        open={infoOpen}
        testId={valueMonitorKpisTestIds.infoPanel}
        className="mt-12"
      >
        {t('value-monitor.kpis.info')}
      </InlineInfoPanel>
    </div>
  );
}
