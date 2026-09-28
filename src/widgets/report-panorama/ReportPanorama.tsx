import { useId, useState } from 'react';

import { useCompanyProfile } from '@/features/company-profile';
import { useT } from '@/shared/i18n';
import { HeatmapChart } from '@/shared/ui/charts/heatmap';
import { RadarChart } from '@/shared/ui/charts/radar';
import { InfoToggle, InlineInfoPanel, SectionCard } from '@/shared/ui/composites/section-card';

import { reportPanoramaTestIds } from './test-ids';

import type { VisualizationHeatmapRow, VisualizationRadar } from '@/entities/analysis';
import type { ReactNode } from 'react';

const DIMENSION_COLUMNS = [
  'analysis-report.dimensionTabs.financial',
  'analysis-report.dimensionTabs.operational',
  'analysis-report.dimensionTabs.transversal',
] as const;

/** V-20 radar `axes` are dimension codes (`fin`/`op`/`trans`), not pre-translated labels — translate for display. */
const DIMENSION_LABEL_KEY = {
  fin: 'analysis-report.dimensionTabs.financial',
  op: 'analysis-report.dimensionTabs.operational',
  trans: 'analysis-report.dimensionTabs.transversal',
} as const;

/** Peer weight ramp per column (SCR-09 heatmap `dimColor`, docs/design/design-tokens.json `dimension.share.*`). */
const HEATMAP_COLUMN_COLOR_KEYS = [
  'dimension.share.financiera',
  'dimension.share.operativa',
  'dimension.share.transversal',
];

export interface ReportPanoramaProps {
  /** The page supplies the V-20 heatmap SectionBoundary. */
  heatmapSlot: ReactNode;
  /**
   * "Ranking por categoría" widget (`PeerWeightRanking`), rendered between the heatmap and the radar (spec layout
   * order). A separate widget/file per P5-47b's scope split — `report-panorama` never imports it directly (FSD:
   * same-layer widgets don't import each other), the page composes them.
   */
  rankingSlot: ReactNode;
  /** The page supplies the V-20 radar SectionBoundary. */
  radarSlot: ReactNode;
  /**
   * "Recomendaciones de Yarbis (n)" AI pill + OVL-01 modal (`features/yarbis-recommendations`, P5-48). A slot for the
   * same FSD reason as `rankingSlot`: this widget never imports another widget or feature directly, the page composes
   * them.
   */
  recommendationsSlot: ReactNode;
}

/**
 * SCR-09 "Panorama comparativo de promedios" card (P5-47b/P5-48): heatmap + radar sub-sections, the `rankingSlot`
 * widget in between, and the `recommendationsSlot` (OVL-01 trigger + modal) as the card's header action. The KPI
 * tiles sub-section is P5-47a's `ReportPosition`, rendered separately by the page.
 *
 * Heatmap peer-name click opens OVL-13 (P5-OVL13): the accessible data table's row header is the actual click
 * target (a real `<button>`), not the SVG canvas — ECharts axis labels aren't reliably clickable or keyboard
 * operable. Ecopetrol's own row (always first, `heatmapRows[0]`) never opens a profile (spec: "peer name click").
 */
export function ReportPanorama({
  heatmapSlot,
  rankingSlot,
  radarSlot,
  recommendationsSlot,
}: ReportPanoramaProps) {
  const t = useT();

  return (
    <SectionCard
      padding="prototype"
      testId={reportPanoramaTestIds.root}
      title={t('analysis-report.panorama.title')}
      subtitle={t('analysis-report.panorama.subtitle')}
      actions={recommendationsSlot}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-20">
        {heatmapSlot}
        {rankingSlot}
        {radarSlot}
      </div>
    </SectionCard>
  );
}

export function ReportHeatmap({ heatmap }: { heatmap: readonly VisualizationHeatmapRow[] }) {
  const t = useT();
  const [heatmapInfoOpen, setHeatmapInfoOpen] = useState(false);
  const heatmapEyebrowId = useId();
  const { open: openCompanyProfile, modal: companyProfileModal } = useCompanyProfile();

  const columns = DIMENSION_COLUMNS.map((key) => t(key));
  const heatmapRows = [...heatmap].sort((a, b) =>
    a.isEcopetrol === b.isEcopetrol ? 0 : a.isEcopetrol ? -1 : 1,
  );

  return (
    <div className="grid gap-8">
      <div className="flex items-center gap-6">
        <span id={heatmapEyebrowId} className="sr-only">
          {t('analysis-report.panorama.heatmapAriaLabel')}
        </span>
        <InfoToggle
          expanded={heatmapInfoOpen}
          controls={reportPanoramaTestIds.heatmapInfoPanel}
          describedBy={heatmapEyebrowId}
          onToggle={() => {
            setHeatmapInfoOpen((open) => !open);
          }}
          testId={reportPanoramaTestIds.heatmapInfoToggle}
        />
      </div>
      <InlineInfoPanel
        id={reportPanoramaTestIds.heatmapInfoPanel}
        labelledBy={heatmapEyebrowId}
        open={heatmapInfoOpen}
        testId={reportPanoramaTestIds.heatmapInfoPanel}
      >
        {t('analysis-report.panorama.heatmapInfo')}
      </InlineInfoPanel>
      <HeatmapChart
        rows={heatmapRows.map((row) => row.name)}
        columns={columns}
        values={heatmapRows.map((row) => [row.fin, row.op, row.trans])}
        unit="percent"
        ariaLabel={t('analysis-report.panorama.heatmapAriaLabel')}
        columnColorKeys={HEATMAP_COLUMN_COLOR_KEYS}
        rowHeader={t('analysis-report.panorama.heatmapCompanyHeader')}
        testId={reportPanoramaTestIds.heatmap}
        onRowLabelClick={(rowIndex) => {
          const row = heatmapRows[rowIndex];
          if (row && !row.isEcopetrol) openCompanyProfile(row.companyId, row.name);
        }}
      />
      {companyProfileModal}
    </div>
  );
}

export function ReportRadar({ radar }: { radar: VisualizationRadar }) {
  const t = useT();
  const [radarInfoOpen, setRadarInfoOpen] = useState(false);
  const radarEyebrowId = useId();

  return (
    <div className="grid gap-8">
      <div className="flex items-center gap-6">
        <span id={radarEyebrowId} className="sr-only">
          {t('analysis-report.panorama.radarAriaLabel')}
        </span>
        <InfoToggle
          expanded={radarInfoOpen}
          controls={reportPanoramaTestIds.radarInfoPanel}
          describedBy={radarEyebrowId}
          onToggle={() => {
            setRadarInfoOpen((open) => !open);
          }}
          testId={reportPanoramaTestIds.radarInfoToggle}
        />
      </div>
      <InlineInfoPanel
        id={reportPanoramaTestIds.radarInfoPanel}
        labelledBy={radarEyebrowId}
        open={radarInfoOpen}
        testId={reportPanoramaTestIds.radarInfoPanel}
      >
        {t('analysis-report.panorama.radarInfo')}
      </InlineInfoPanel>
      <RadarChart
        axes={radar.axes.map((axis) => ({ id: axis, label: t(DIMENSION_LABEL_KEY[axis]) }))}
        series={[
          {
            id: 'ecopetrol',
            label: t('analysis-report.panorama.radarLegend.ecopetrol'),
            colorKey: 'ecopetrol',
            values: radar.ecopetrol,
          },
          {
            id: 'sector',
            label: t('analysis-report.panorama.radarLegend.sectorAverage'),
            colorKey: 'chart.average',
            values: radar.sector,
          },
        ]}
        unit="percent"
        ariaLabel={t('analysis-report.panorama.radarAriaLabel')}
        testId={reportPanoramaTestIds.radar}
      />
    </div>
  );
}
