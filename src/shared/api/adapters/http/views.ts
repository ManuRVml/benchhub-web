import {
  GetAiFindingsViewResponse,
  GetAnalysesViewResponse,
  GetAnalysisDefinitionViewResponse,
  GetAnalysisValidationViewResponse,
  GetAssistantContextViewResponse,
  GetCategoryIndicatorsViewResponse,
  GetCompanyComparisonViewResponse,
  GetCompanyCoverageViewResponse,
  GetCompanyProfileViewResponse,
  GetComparisonProfilesViewResponse,
  GetCompetitorCatalogViewResponse,
  GetFutureAspirationViewResponse,
  GetHomeViewResponse,
  GetIndicatorCatalogViewResponse,
  GetIndicatorDetailViewResponse,
  GetKviCandidatesViewResponse,
  GetKviTraceabilityViewResponse,
  GetNotificationsViewResponse,
  GetPeerAverageComparisonViewResponse,
  GetPeerWeightRankingViewResponse,
  GetPresentationDetailViewResponse,
  GetPresentationsViewResponse,
  GetPresentationSlidesViewResponse,
  GetReportSummaryViewResponse,
  GetSensitivityDriversViewResponse,
  GetSensitivityScenariosViewResponse,
  GetTbgDimensionWeightsViewResponse,
  GetTbgHorizonViewResponse,
  GetTbgIndicatorComparatorViewResponse,
  GetSavedViewsViewResponse,
  GetShellStatusViewResponse,
  GetUserSettingsViewResponse,
  GetValueMonitorBenchmarkRadarViewResponse,
  GetValueMonitorCompositionViewResponse,
  GetValueMonitorConfigurationViewResponse,
  GetValueMonitorHistoryViewResponse,
  GetValueMonitorKvisViewResponse,
  GetValueMonitorPeerRankingViewResponse,
  GetValueMonitorRecommendationsViewResponse,
  GetValueMonitorViewResponse,
  GetVisualizationViewResponse,
  GetWeightRecommendationsViewResponse,
  GetWeightSimulatorViewResponse,
} from '../../generated/zod';
import {
  AdminHomeViewSchema,
  CommentThreadViewSchema,
  PresentationBuilderViewSchema,
  ResultsHeaderViewSchema,
} from '../../ports/response-schemas';

import { apiPath } from './api-path';

import type { HttpClient } from '../../http-client';
import type {
  AdminViewPort,
  AnalysesViewPort,
  AnalysisDefinitionViewPort,
  CommentsViewPort,
  AssistantContextViewPort,
  CompanyProfileViewPort,
  ComparisonProfilesViewPort,
  HomeViewPort,
  IndicatorDetailViewPort,
  NotificationsViewPort,
  PresentationViewsPort,
  ResultsViewPort,
  SensitivityViewPort,
  TbgViewPort,
  SettingsViewPort,
  ShellViewPort,
  ValueMonitorViewPort,
  VisualizationViewPort,
} from '../../ports';

// HTTP adapters of the view ports. Each method is one contract operation (`@operation`, checked against the vendored
// openapi.yaml by `pnpm contract:adapters`) and passes that operation's generated Zod response schema to the client.

export function createShellViewHttpAdapter(http: HttpClient): ShellViewPort {
  return {
    /** @operation getShellStatusView */
    getShellStatusView: (options) =>
      http.get('/views/shell-status', { ...options, schema: GetShellStatusViewResponse }),
  };
}

export function createAdminViewHttpAdapter(http: HttpClient): AdminViewPort {
  return {
    /** @operation getAdminHomeView */
    getAdminHomeView: (options) =>
      http.get('/views/admin-home', { ...options, schema: AdminHomeViewSchema }),
  };
}

export function createHomeViewHttpAdapter(http: HttpClient): HomeViewPort {
  return {
    /** @operation getHomeView */
    getHomeView: (options) => http.get('/views/home', { ...options, schema: GetHomeViewResponse }),
  };
}

export function createAnalysesViewHttpAdapter(http: HttpClient): AnalysesViewPort {
  return {
    /** @operation getAnalysesView */
    getAnalysesView: (options) =>
      http.get('/views/analyses', { ...options, schema: GetAnalysesViewResponse }),
  };
}

export function createAnalysisDefinitionViewHttpAdapter(
  http: HttpClient,
): AnalysisDefinitionViewPort {
  return {
    /** @operation getAnalysisDefinitionView */
    getAnalysisDefinitionView: (draftId, options) =>
      http.get(apiPath`/views/analysis-definition/${draftId}`, {
        ...options,
        schema: GetAnalysisDefinitionViewResponse,
      }),
    /** @operation getCompetitorCatalogView */
    getCompetitorCatalogView: (options) =>
      http.get('/views/competitor-catalog', {
        ...options,
        schema: GetCompetitorCatalogViewResponse,
      }),
    /** @operation getIndicatorCatalogView */
    getIndicatorCatalogView: ({ source, ...options } = {}) =>
      http.get('/views/indicator-catalog', {
        ...options,
        ...(source ? { query: { source } } : {}),
        schema: GetIndicatorCatalogViewResponse,
      }),
    /** @operation getAnalysisValidationView */
    getAnalysisValidationView: (draftId, options) =>
      http.get(apiPath`/views/analysis-validation/${draftId}`, {
        ...options,
        schema: GetAnalysisValidationViewResponse,
      }),
  };
}

export function createResultsViewHttpAdapter(http: HttpClient): ResultsViewPort {
  return {
    /** @operation getResultsHeaderView */
    getResultsHeaderView: (analysisId, { horizon, ...options } = {}) =>
      http.get(apiPath`/views/results-header/${analysisId}`, {
        ...options,
        ...(horizon ? { query: { horizon } } : {}),
        // Generated V-09 with `modules[].id` widened (response-schemas.ts): unknown modules reach the registry.
        schema: ResultsHeaderViewSchema,
      }),
    /** @operation getCompanyCoverageView */
    getCompanyCoverageView: (analysisId, options) =>
      http.get(apiPath`/views/company-coverage/${analysisId}`, {
        ...options,
        schema: GetCompanyCoverageViewResponse,
      }),
    /** @operation getPeerAverageComparisonView */
    getPeerAverageComparisonView: (analysisId, options) =>
      http.get(apiPath`/views/peer-average-comparison/${analysisId}`, {
        ...options,
        schema: GetPeerAverageComparisonViewResponse,
      }),
    /** @operation getCompanyComparisonView */
    getCompanyComparisonView: (analysisId, { horizon, companyId, ...options } = {}) =>
      http.get(apiPath`/views/company-comparison/${analysisId}`, {
        ...options,
        ...(horizon || companyId ? { query: { horizon, companyId } } : {}),
        schema: GetCompanyComparisonViewResponse,
      }),
    /** @operation getReportSummaryView */
    getReportSummaryView: (analysisId, options) =>
      http.get(apiPath`/views/report-summary/${analysisId}`, {
        ...options,
        schema: GetReportSummaryViewResponse,
      }),
    /** @operation getAiFindingsView */
    getAiFindingsView: (analysisId, { horizon, ...options } = {}) =>
      http.get(apiPath`/views/ai-findings/${analysisId}`, {
        ...options,
        ...(horizon ? { query: { horizon } } : {}),
        schema: GetAiFindingsViewResponse,
      }),
  };
}

/** Comparison profiles view (SCR-08b). */
export function createComparisonProfilesViewHttpAdapter(
  http: HttpClient,
): ComparisonProfilesViewPort {
  return {
    /** @operation getComparisonProfilesView */
    getComparisonProfilesView: (analysisId, { profileId, ...options } = {}) =>
      http.get(apiPath`/views/comparison-profiles/${analysisId}`, {
        ...options,
        ...(profileId ? { query: { profileId } } : {}),
        schema: GetComparisonProfilesViewResponse,
      }),
  };
}

/** Value Monitor views (SCR-09). */
export function createValueMonitorViewAdapters(http: HttpClient): ValueMonitorViewPort {
  return {
    /** @operation getValueMonitorView */
    getValueMonitorView: ({ snapshot, ...options } = {}) =>
      http.get('/views/value-monitor', {
        ...options,
        ...(snapshot ? { query: { snapshot } } : {}),
        schema: GetValueMonitorViewResponse,
      }),
    /** @operation getValueMonitorPeerRankingView */
    getValueMonitorPeerRankingView: ({ indicator, snapshot, ...options } = {}) =>
      http.get('/views/value-monitor-peer-ranking', {
        ...options,
        ...(indicator || snapshot
          ? { query: { ...(indicator ? { indicator } : {}), ...(snapshot ? { snapshot } : {}) } }
          : {}),
        schema: GetValueMonitorPeerRankingViewResponse,
      }),
    /** @operation getValueMonitorHistoryView */
    getValueMonitorHistoryView: ({ indicator, range, snapshot, ...options } = {}) =>
      http.get('/views/value-monitor-history', {
        ...options,
        ...(indicator || range || snapshot
          ? {
              query: {
                ...(indicator ? { indicator } : {}),
                ...(range ? { range } : {}),
                ...(snapshot ? { snapshot } : {}),
              },
            }
          : {}),
        schema: GetValueMonitorHistoryViewResponse,
      }),
    /** @operation getValueMonitorKvisView */
    getValueMonitorKvisView: ({ snapshot, categories, compliance, ...options } = {}) =>
      http.get('/views/value-monitor-kvis', {
        ...options,
        ...(snapshot || categories?.length || compliance?.length
          ? {
              query: {
                ...(snapshot ? { snapshot } : {}),
                ...(categories?.length ? { categories } : {}),
                ...(compliance?.length ? { compliance } : {}),
              },
            }
          : {}),
        schema: GetValueMonitorKvisViewResponse,
      }),
    /** @operation getValueMonitorCompositionView */
    getValueMonitorCompositionView: ({ snapshot, ...options } = {}) =>
      http.get('/views/value-monitor-composition', {
        ...options,
        ...(snapshot ? { query: { snapshot } } : {}),
        schema: GetValueMonitorCompositionViewResponse,
      }),
    /** @operation getValueMonitorConfigurationView */
    getValueMonitorConfigurationView: (options) =>
      http.get('/views/value-monitor-configuration', {
        ...options,
        schema: GetValueMonitorConfigurationViewResponse,
      }),
    /** @operation getKviTraceabilityView */
    getKviTraceabilityView: (kviId, options) =>
      http.get(apiPath`/views/kvi-traceability/${kviId}`, {
        ...options,
        schema: GetKviTraceabilityViewResponse,
      }),
    /** @operation getKviCandidatesView */
    getKviCandidatesView: ({ source, ...options } = {}) =>
      http.get('/views/kvi-candidates', {
        ...options,
        ...(source ? { query: { source } } : {}),
        schema: GetKviCandidatesViewResponse,
      }),
    /** @operation getValueMonitorRecommendationsView */
    getValueMonitorRecommendationsView: ({ snapshot, ...options } = {}) =>
      http.get('/views/value-monitor-recommendations', {
        ...options,
        ...(snapshot ? { query: { snapshot } } : {}),
        schema: GetValueMonitorRecommendationsViewResponse,
      }),
    /** @operation getValueMonitorBenchmarkRadarView */
    getValueMonitorBenchmarkRadarView: (options) =>
      http.get('/views/value-monitor-benchmark-radar', {
        ...options,
        schema: GetValueMonitorBenchmarkRadarViewResponse,
      }),
    /** @operation getSavedViewsView */
    getSavedViewsView: (screen, options) =>
      http.get('/views/saved-views', {
        ...options,
        query: { screen },
        schema: GetSavedViewsViewResponse,
      }),
  };
}

export function createSettingsViewHttpAdapter(http: HttpClient): SettingsViewPort {
  return {
    /** @operation getUserSettingsView */
    getUserSettingsView: (options) =>
      http.get('/views/user-settings', { ...options, schema: GetUserSettingsViewResponse }),
  };
}

export function createAssistantContextViewHttpAdapter(http: HttpClient): AssistantContextViewPort {
  return {
    /** @operation getAssistantContextView */
    getAssistantContextView: (screen, analysisId, options = {}) =>
      http.get('/views/assistant-context', {
        ...options,
        query: { screen, ...(analysisId ? { analysisId } : {}) },
        schema: GetAssistantContextViewResponse,
      }),
  };
}

export function createVisualizationViewHttpAdapter(http: HttpClient): VisualizationViewPort {
  return {
    /** @operation getVisualizationView */
    getVisualizationView: (analysisId, options) =>
      http.get(apiPath`/views/visualization/${analysisId}`, {
        ...options,
        schema: GetVisualizationViewResponse,
      }),
    /** @operation getPeerWeightRankingView */
    getPeerWeightRankingView: (analysisId, dimension, options = {}) =>
      http.get(apiPath`/views/peer-weight-ranking/${analysisId}`, {
        ...options,
        ...(dimension ? { query: { dimension } } : {}),
        schema: GetPeerWeightRankingViewResponse,
      }),
    /** @operation getCategoryIndicatorsView */
    getCategoryIndicatorsView: (analysisId, category, options = {}) =>
      http.get(apiPath`/views/category-indicators/${analysisId}`, {
        ...options,
        ...(category ? { query: { category } } : {}),
        schema: GetCategoryIndicatorsViewResponse,
      }),
    /** @operation getWeightRecommendationsView */
    getWeightRecommendationsView: (analysisId, scope, horizon, options = {}) =>
      http.get(apiPath`/views/weight-recommendations/${analysisId}`, {
        ...options,
        ...(scope || horizon ? { query: { scope, horizon } } : {}),
        schema: GetWeightRecommendationsViewResponse,
      }),
  };
}

export function createCompanyProfileViewHttpAdapter(http: HttpClient): CompanyProfileViewPort {
  return {
    /** @operation getCompanyProfileView */
    getCompanyProfileView: (companyId, options) =>
      http.get(apiPath`/views/company-profile/${companyId}`, {
        ...options,
        schema: GetCompanyProfileViewResponse,
      }),
  };
}

export function createIndicatorDetailViewHttpAdapter(http: HttpClient): IndicatorDetailViewPort {
  return {
    /** @operation getIndicatorDetailView */
    getIndicatorDetailView: (analysisId, indicatorId, origin, options = {}) =>
      http.get(apiPath`/views/indicator-detail/${analysisId}/${indicatorId}`, {
        ...options,
        ...(origin ? { query: { origin } } : {}),
        schema: GetIndicatorDetailViewResponse,
      }),
  };
}

export function createNotificationsViewHttpAdapter(http: HttpClient): NotificationsViewPort {
  return {
    /** @operation getNotificationsView */
    getNotificationsView: ({ q, severity, ...options } = {}) =>
      http.get('/views/notifications', {
        ...options,
        query: {
          ...(q === undefined ? {} : { q }),
          ...(severity === undefined ? {} : { severity }),
        },
        schema: GetNotificationsViewResponse,
      }),
  };
}

export function createCommentsViewHttpAdapter(http: HttpClient): CommentsViewPort {
  return {
    /** @operation getCommentThreadView */
    getCommentThreadView: (entityType, entityId, page, options = {}) =>
      http.get('/views/comment-thread', {
        ...options,
        query: { entityType, entityId, ...(page ? { page } : {}) },
        // Narrowed `permissions` (response-schemas.ts): every comment-thread consumer already reads its 4 keys.
        schema: CommentThreadViewSchema,
      }),
  };
}

export function createSensitivityViewHttpAdapter(http: HttpClient): SensitivityViewPort {
  return {
    /** @operation getSensitivityDriversView */
    getSensitivityDriversView: (indicator, options = {}) =>
      http.get('/views/sensitivity-drivers', {
        ...options,
        ...(indicator ? { query: { indicator } } : {}),
        schema: GetSensitivityDriversViewResponse,
      }),
    /** @operation getSensitivityScenariosView */
    getSensitivityScenariosView: (options) =>
      http.get('/views/sensitivity-scenarios', {
        ...options,
        schema: GetSensitivityScenariosViewResponse,
      }),
    /** @operation getWeightSimulatorView */
    getWeightSimulatorView: (options) =>
      http.get('/views/weight-simulator', { ...options, schema: GetWeightSimulatorViewResponse }),
  };
}

/** TBG horizon views (P5-4x territory). */
export function createTbgViewAdapters(http: HttpClient): TbgViewPort {
  return {
    /** @operation getTbgIndicatorComparatorView */
    getTbgIndicatorComparatorView: (
      analysisId,
      { horizon, indicatorId, companyScope, ...options } = {},
    ) =>
      http.get(apiPath`/views/tbg-indicator-comparator/${analysisId}`, {
        ...options,
        ...(horizon || indicatorId || companyScope
          ? { query: { horizon, indicatorId, companyScope } }
          : {}),
        schema: GetTbgIndicatorComparatorViewResponse,
      }),
    /** @operation getFutureAspirationView */
    getFutureAspirationView: (analysisId, { segment, ...options } = {}) =>
      http.get(apiPath`/views/future-aspiration/${analysisId}`, {
        ...options,
        ...(segment ? { query: { segment } } : {}),
        schema: GetFutureAspirationViewResponse,
      }),
    /** @operation getTbgHorizonView */
    getTbgHorizonView: (analysisId, { horizon, view, companyId, detail, ...options } = {}) =>
      http.get(apiPath`/views/tbg-horizon/${analysisId}`, {
        ...options,
        ...(horizon || view || companyId || detail
          ? { query: { horizon, view, companyId, detail } }
          : {}),
        schema: GetTbgHorizonViewResponse,
      }),
    /** @operation getTbgDimensionWeightsView */
    getTbgDimensionWeightsView: (analysisId, { horizon, dimension, ...options } = {}) =>
      http.get(apiPath`/views/tbg-dimension-weights/${analysisId}`, {
        ...options,
        ...(horizon || dimension ? { query: { horizon, dimension } } : {}),
        schema: GetTbgDimensionWeightsViewResponse,
      }),
  };
}

/** SCR-13 / SCR-14 presentations: list, builder and viewer frames. */
export function createPresentationViewsHttpAdapter(http: HttpClient): PresentationViewsPort {
  return {
    /** @operation getPresentationsView */
    getPresentationsView: ({ analysisId, page, pageSize, ...options } = {}) =>
      http.get('/views/presentations', {
        ...options,
        ...(analysisId !== undefined || page !== undefined || pageSize !== undefined
          ? { query: { analysisId, page, pageSize } }
          : {}),
        schema: GetPresentationsViewResponse,
      }),
    /** @operation getPresentationBuilderView */
    getPresentationBuilderView: (presentationId, options) =>
      http.get(apiPath`/views/presentation-builder/${presentationId}`, {
        ...options,
        // Widened `modules[].id` (response-schemas.ts): an unknown module reaches the builder UI once instead of
        // failing the whole frame.
        schema: PresentationBuilderViewSchema,
      }),
    /** @operation getPresentationSlidesView */
    getPresentationSlidesView: (presentationId, { order, ...options } = {}) =>
      http.get(apiPath`/views/presentation-slides/${presentationId}`, {
        ...options,
        ...(order?.length ? { query: { order } } : {}),
        schema: GetPresentationSlidesViewResponse,
      }),
    /** @operation getPresentationDetailView */
    getPresentationDetailView: (presentationId, options) =>
      http.get(apiPath`/views/presentation-detail/${presentationId}`, {
        ...options,
        schema: GetPresentationDetailViewResponse,
      }),
  };
}
