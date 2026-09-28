import { useParams } from 'react-router';

import { useVisualizationView } from '@/entities/analysis';
import { YarbisRecommendationsTrigger } from '@/features/yarbis-recommendations';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { useTypedSearchParams } from '@/shared/lib/url';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { CategoryTiers } from '@/widgets/category-tiers';
import { PeerWeightRanking } from '@/widgets/peer-weight-ranking';
import { ReportComments } from '@/widgets/report-comments';
import { ReportIndicatorPanel } from '@/widgets/report-indicator-panel';
import { ReportHeatmap, ReportPanorama, ReportRadar } from '@/widgets/report-panorama';
import { ReportKpiTiles, ReportPosition } from '@/widgets/report-position';
import { WeightComposition } from '@/widgets/weight-composition';

import { reportSearchSchema } from './report-search';
import { VisualizationTbgModules } from './visualization-tbg-modules';

import type { VisualizationCategory, VisualizationView } from '@/entities/analysis';
import type { SectionResult } from '@/shared/api/section-result';

/** SCR-09 page scope (P5-47a). The rest of the section slugs its own scope: {@link SectionBoundary}. */
export const ANALYSIS_REPORT_SCOPE = 'analysis-report';

/** The V-20 query as one SectionResult: the whole page fails, is forbidden or loads together. */
function toSectionResult(
  data: VisualizationView | undefined,
  error: unknown,
): SectionResult<VisualizationView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-09 Visualización · Dashboard (docs/design/screen-inventory/SCR-09-visualizacion.md). P5-47a built the header
 * card and KPI tiles slice of V-20 ({@link ReportPosition}); P5-47b added the "Panorama comparativo de promedios"
 * card's heatmap and radar ({@link ReportPanorama}, still V-20) and "Ranking por categoría" ({@link PeerWeightRanking},
 * V-21, its own SectionBoundary so a ranking failure never breaks the header/KPI slice). P5-47c adds the
 * "Categorías" cards ({@link CategoryTiers}, still V-20) and the indicator panel ({@link ReportIndicatorPanel}, V-22,
 * its own SectionBoundary), completing P5-47. P5-48 adds "Composición de peso por línea de indicador"
 * ({@link WeightComposition}, still V-20), the "Comentarios" rail ({@link ReportComments}, V-26, its own load/retry
 * so a thread failure never breaks the rest) and the recommendations trigger + OVL-01 modal
 * ({@link YarbisRecommendationsTrigger}, V-23, `ReportPanorama`'s `recommendationsSlot`).
 */
export function AnalysisReportPage() {
  const t = useT();
  const { analysisId = '' } = useParams();
  return (
    <ToastProvider>
      <section data-testid="analysis-report-page">
        <h1 className="sr-only">{t('headerTitle.analysisReport')}</h1>
        <ReportFrame analysisId={analysisId} />
      </section>
    </ToastProvider>
  );
}

function ReportFrame({ analysisId }: { analysisId: string }) {
  const query = useVisualizationView(analysisId);
  const [search, setSearch] = useTypedSearchParams(reportSearchSchema);
  const retry = () => {
    void query.refetch();
  };

  return (
    <SectionBoundary
      scope={ANALYSIS_REPORT_SCOPE}
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={retry}
      skeleton={<Skeleton shape="block" size={320} />}
    >
      {(data) => {
        return (
          <div
            data-testid="analysis-report-layout"
            className="grid gap-16 desktop:grid-cols-[minmax(0,1fr)_var(--size-layout-right-rail)]"
          >
            <div className="grid gap-16">
              <ReportPosition
                analysisId={analysisId}
                position={data.position}
                kpiTilesSlot={
                  <SectionBoundary
                    scope="analysis-report-kpi-tiles"
                    result={data.kpiTiles}
                    onRetry={retry}
                  >
                    {(kpiTiles) => <ReportKpiTiles kpiTiles={kpiTiles} />}
                  </SectionBoundary>
                }
                // V-20's real permissions is a generic Record<string,boolean> (unknown keys type as optional).
                canCreatePresentation={data.permissions.canCreatePresentation ?? false}
              />
              <ReportPanorama
                heatmapSlot={
                  <SectionBoundary
                    scope="analysis-report-heatmap"
                    result={data.heatmap}
                    onRetry={retry}
                  >
                    {(heatmap) => <ReportHeatmap heatmap={heatmap} />}
                  </SectionBoundary>
                }
                rankingSlot={
                  <PeerWeightRanking
                    analysisId={analysisId}
                    dimension={search.ranking}
                    onDimensionChange={(ranking) => {
                      setSearch({ ranking });
                    }}
                  />
                }
                radarSlot={
                  <SectionBoundary
                    scope="analysis-report-radar"
                    result={data.radar}
                    onRetry={retry}
                  >
                    {(radar) => <ReportRadar radar={radar} />}
                  </SectionBoundary>
                }
                recommendationsSlot={<YarbisRecommendationsTrigger analysisId={analysisId} />}
              />
              <SectionBoundary
                scope="analysis-report-categories"
                result={data.categories}
                onRetry={retry}
              >
                {(categories) => {
                  const typedCategories = categories.map((category) => ({
                    ...category,
                    tierId: category.tierId as VisualizationCategory['tierId'],
                  }));
                  const selectedCategory =
                    typedCategories.find((category) => category.id === search.categoria) ??
                    typedCategories[0];
                  return (
                    <>
                      <CategoryTiers
                        categories={typedCategories}
                        selectedCategory={selectedCategory?.id ?? search.categoria}
                        onSelectCategory={(categoria) => {
                          setSearch({ categoria });
                        }}
                      />
                      {selectedCategory ? (
                        <ReportIndicatorPanel
                          analysisId={analysisId}
                          category={selectedCategory.id}
                          categoryLabel={selectedCategory.label}
                          categoryMessage={selectedCategory.message}
                        />
                      ) : null}
                    </>
                  );
                }}
              </SectionBoundary>
              <SectionBoundary
                scope="analysis-report-weight-composition"
                result={data.weightComposition}
                onRetry={retry}
              >
                {(weightComposition) => {
                  const { lineLegend, ...weightCompositionData } = weightComposition;
                  return (
                    <WeightComposition
                      data={weightCompositionData}
                      lineLegend={lineLegend}
                      dimension={search.peso}
                      onDimensionChange={(peso) => {
                        setSearch({ peso });
                      }}
                    />
                  );
                }}
              </SectionBoundary>
              <VisualizationTbgModules analysisId={analysisId} />
            </div>
            <ReportComments
              analysisId={analysisId}
              canComment={data.permissions.canComment ?? false}
            />
          </div>
        );
      }}
    </SectionBoundary>
  );
}
