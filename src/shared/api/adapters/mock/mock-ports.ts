import { invalidCredentialsError, mockCredentialsMatch } from './mock-credentials';
import { mockResponse as respond } from './mock-data';

import type { ApiPorts } from '../../ports';

// Mock adapters of every port (`VITE_API_MODE=mock`, P5-03): the same 48 methods as the HTTP adapters, answered in
// memory with the fixture of the operation parsed by its generated schema. Arguments are ignored (one canned answer per
// operation). Each method declares its operation with `@operation`, checked by `pnpm contract:mocks`.

/** Every port backed by the in-memory mocks. */
export function createMockPorts(): ApiPorts {
  return {
    auth: {
      /** @operation startLogin */
      startLogin: () => respond('startLogin'),
      /** @operation completeLogin */
      completeLogin: () => respond('completeLogin'),
      /** @operation logout */
      logout: async () => {
        // The real success is 204 No Content (A03Response = void); the fixture models the 403 CSRF_INVALID example
        // instead (the operation's only documented JSON shape), so it's fetched for contract:mocks but discarded.
        await respond('logout');
      },
      /** @operation getSession */
      getSession: () => respond('getSession'),
      /** @operation passwordLogin */
      passwordLogin: async ({ username, password }) => {
        // The one exception to "arguments are ignored": the mock accepts only the A-05 mock credential pair.
        if (!mockCredentialsMatch(username, password)) throw invalidCredentialsError();
        return respond('passwordLogin');
      },
    },
    shell: {
      /** @operation getShellStatusView */
      getShellStatusView: () => respond('getShellStatusView'),
    },
    admin: {
      /** @operation getAdminHomeView */
      getAdminHomeView: () => respond('getAdminHomeView'),
    },
    home: {
      /** @operation getHomeView */
      getHomeView: () => respond('getHomeView'),
    },
    analyses: {
      /** @operation getAnalysesView */
      getAnalysesView: () => respond('getAnalysesView'),
    },
    analysisDefinition: {
      /** @operation getAnalysisDefinitionView */
      getAnalysisDefinitionView: () => respond('getAnalysisDefinitionView'),
      /** @operation getCompetitorCatalogView */
      getCompetitorCatalogView: () => respond('getCompetitorCatalogView'),
      /** @operation getIndicatorCatalogView */
      getIndicatorCatalogView: () => respond('getIndicatorCatalogView'),
      /** @operation getAnalysisValidationView */
      getAnalysisValidationView: () => respond('getAnalysisValidationView'),
    },
    results: {
      /** @operation getResultsHeaderView */
      getResultsHeaderView: () => respond('getResultsHeaderView'),
      /** @operation getCompanyCoverageView */
      getCompanyCoverageView: () => respond('getCompanyCoverageView'),
      /** @operation getPeerAverageComparisonView */
      getPeerAverageComparisonView: () => respond('getPeerAverageComparisonView'),
      /** @operation getCompanyComparisonView */
      getCompanyComparisonView: () => respond('getCompanyComparisonView'),
      /** @operation getReportSummaryView */
      getReportSummaryView: () => respond('getReportSummaryView'),
      /** @operation getAiFindingsView */
      getAiFindingsView: () => respond('getAiFindingsView'),
    },
    comparisonProfiles: {
      /** @operation getComparisonProfilesView */
      getComparisonProfilesView: () => respond('getComparisonProfilesView'),
    },
    visualization: {
      /** @operation getVisualizationView */
      getVisualizationView: () => respond('getVisualizationView'),
      /** @operation getPeerWeightRankingView */
      getPeerWeightRankingView: () => respond('getPeerWeightRankingView'),
      /** @operation getCategoryIndicatorsView */
      getCategoryIndicatorsView: () => respond('getCategoryIndicatorsView'),
      /** @operation getWeightRecommendationsView */
      getWeightRecommendationsView: () => respond('getWeightRecommendationsView'),
    },
    companyProfile: {
      /** @operation getCompanyProfileView */
      getCompanyProfileView: () => respond('getCompanyProfileView'),
    },
    analysisDrafts: {
      /** @operation createAnalysisDraft */
      createAnalysisDraft: () => respond('createAnalysisDraft'),
      /** @operation updateAnalysisDraft */
      updateAnalysisDraft: () => respond('updateAnalysisDraft'),
      /** @operation generateAnalysis */
      generateAnalysis: () => respond('generateAnalysis'),
    },
    analysisEdits: {
      /** @operation addAnalysisCompany */
      addAnalysisCompany: () => respond('addAnalysisCompany'),
      /** @operation removeAnalysisCompany */
      removeAnalysisCompany: () => respond('removeAnalysisCompany'),
      /** @operation updateValueOverrides */
      updateValueOverrides: () => respond('updateValueOverrides'),
      /** @operation updateWeightOverrides */
      updateWeightOverrides: () => respond('updateWeightOverrides'),
      /** @operation createRecalculation */
      createRecalculation: () => respond('createRecalculation'),
      /** @operation publishAnalysis */
      publishAnalysis: () => respond('publishAnalysis'),
    },
    review: {
      /** @operation createReviewComment */
      createReviewComment: () => respond('createReviewComment'),
      /** @operation updateReviewComment */
      updateReviewComment: () => respond('updateReviewComment'),
      /** @operation createChangeRequest */
      createChangeRequest: () => respond('createChangeRequest'),
      /** @operation updateChangeRequest */
      updateChangeRequest: () => respond('updateChangeRequest'),
    },
    reports: {
      /** @operation createExport */
      createExport: () => respond('createExport'),
      /** @operation generateExecutiveNarrative */
      generateExecutiveNarrative: () => respond('generateExecutiveNarrative'),
    },
    valueMonitor: {
      /** @operation updateKviTargets */
      updateKviTargets: () => respond('updateKviTargets'),
      /** @operation updateValueMonitorConfiguration */
      updateValueMonitorConfiguration: () => respond('updateValueMonitorConfiguration'),
      /** @operation addValueMonitorKvis */
      addValueMonitorKvis: () => respond('addValueMonitorKvis'),
    },
    valueMonitorViews: {
      /** @operation getValueMonitorView */
      getValueMonitorView: () => respond('getValueMonitorView'),
      /** @operation getValueMonitorPeerRankingView */
      getValueMonitorPeerRankingView: () => respond('getValueMonitorPeerRankingView'),
      /** @operation getValueMonitorHistoryView */
      getValueMonitorHistoryView: () => respond('getValueMonitorHistoryView'),
      /** @operation getValueMonitorKvisView */
      getValueMonitorKvisView: () => respond('getValueMonitorKvisView'),
      /** @operation getValueMonitorCompositionView */
      getValueMonitorCompositionView: () => respond('getValueMonitorCompositionView'),
      /** @operation getValueMonitorConfigurationView */
      getValueMonitorConfigurationView: () => respond('getValueMonitorConfigurationView'),
      /** @operation getKviTraceabilityView */
      getKviTraceabilityView: () => respond('getKviTraceabilityView'),
      /** @operation getKviCandidatesView */
      getKviCandidatesView: () => respond('getKviCandidatesView'),
      /** @operation getValueMonitorRecommendationsView */
      getValueMonitorRecommendationsView: () => respond('getValueMonitorRecommendationsView'),
      /** @operation getValueMonitorBenchmarkRadarView */
      getValueMonitorBenchmarkRadarView: () => respond('getValueMonitorBenchmarkRadarView'),
      /** @operation getSavedViewsView */
      getSavedViewsView: () => respond('getSavedViewsView'),
    },
    settingsViews: {
      /** @operation getUserSettingsView */
      getUserSettingsView: () => respond('getUserSettingsView'),
    },
    assistantContext: {
      /** @operation getAssistantContextView */
      getAssistantContextView: () => respond('getAssistantContextView'),
    },
    indicatorDetail: {
      /** @operation getIndicatorDetailView */
      getIndicatorDetailView: () => respond('getIndicatorDetailView'),
    },
    comments: {
      /** @operation getCommentThreadView */
      getCommentThreadView: () => respond('getCommentThreadView'),
    },
    sensitivityViews: {
      /** @operation getSensitivityDriversView */
      getSensitivityDriversView: () => respond('getSensitivityDriversView'),
      /** @operation getSensitivityScenariosView */
      getSensitivityScenariosView: () => respond('getSensitivityScenariosView'),
      /** @operation getWeightSimulatorView */
      getWeightSimulatorView: () => respond('getWeightSimulatorView'),
    },
    tbgViews: {
      /** @operation getTbgIndicatorComparatorView */
      getTbgIndicatorComparatorView: () => respond('getTbgIndicatorComparatorView'),
      /** @operation getFutureAspirationView */
      getFutureAspirationView: () => respond('getFutureAspirationView'),
      /** @operation getTbgHorizonView */
      getTbgHorizonView: () => respond('getTbgHorizonView'),
      /** @operation getTbgDimensionWeightsView */
      getTbgDimensionWeightsView: () => respond('getTbgDimensionWeightsView'),
    },
    savedViews: {
      /** @operation createSavedView */
      createSavedView: () => respond('createSavedView'),
      /** @operation deleteSavedView */
      deleteSavedView: () => respond('deleteSavedView'),
    },
    sensitivities: {
      /** @operation evaluateSensitivity */
      evaluateSensitivity: () => respond('evaluateSensitivity'),
      /** @operation validateSensitivitySuggestion */
      validateSensitivitySuggestion: () => respond('validateSensitivitySuggestion'),
      /** @operation createSensitivitySimulation */
      createSensitivitySimulation: () => respond('createSensitivitySimulation'),
      /** @operation evaluateWeightSimulation */
      evaluateWeightSimulation: () => respond('evaluateWeightSimulation'),
      /** @operation createStrategicPlan */
      createStrategicPlan: () => respond('createStrategicPlan'),
      /** @operation updateStrategicPlan */
      updateStrategicPlan: () => respond('updateStrategicPlan'),
    },
    presentations: {
      /** @operation createPresentation */
      createPresentation: () => respond('createPresentation'),
      /** @operation updatePresentation */
      updatePresentation: () => respond('updatePresentation'),
      /** @operation publishPresentation */
      publishPresentation: () => respond('publishPresentation'),
      /** @operation uploadPresentationVersion */
      uploadPresentationVersion: () => respond('uploadPresentationVersion'),
      /** @operation deletePresentationVersion */
      deletePresentationVersion: () => respond('deletePresentationVersion'),
      /** @operation createSlideCommentDraft */
      createSlideCommentDraft: () => respond('createSlideCommentDraft'),
    },
    presentationViews: {
      /** @operation getPresentationsView */
      getPresentationsView: () => respond('getPresentationsView'),
      /** @operation getPresentationBuilderView */
      getPresentationBuilderView: () => respond('getPresentationBuilderView'),
      /** @operation getPresentationSlidesView */
      getPresentationSlidesView: () => respond('getPresentationSlidesView'),
      /** @operation getPresentationDetailView */
      getPresentationDetailView: () => respond('getPresentationDetailView'),
    },
    previewInvitations: {
      /** @operation createPreviewInvitations */
      createPreviewInvitations: () => respond('createPreviewInvitations'),
    },
    operations: {
      /** @operation getOperationStatus */
      getOperationStatus: () => respond('getOperationStatus'),
      /**
       * @operation downloadFile
       * O-03 has no fixture-backed mock (mock-data.ts's `respond()` validates against the generated schema, which is
       * the `ApiError` shape for this operation — see ports/operations.ts); a small synthetic file stands in.
       */
      downloadFile: () => Promise.resolve(new Blob(['mock file content'], { type: 'text/plain' })),
    },
    assistant: {
      /** @operation sendAssistantMessage */
      sendAssistantMessage: () => respond('sendAssistantMessage'),
      /** @operation createAssistantFeedback */
      createAssistantFeedback: () => respond('createAssistantFeedback'),
    },
    notifications: {
      /** @operation getNotificationsView */
      getNotificationsView: () => respond('getNotificationsView'),
      /** @operation markNotificationRead */
      markNotificationRead: () => respond('markNotificationRead'),
      /** @operation markAllNotificationsRead */
      markAllNotificationsRead: () => respond('markAllNotificationsRead'),
    },
    comparisonProfileCommands: {
      /** @operation createComparisonProfile */
      createComparisonProfile: () => respond('createComparisonProfile'),
      /** @operation updateComparisonProfile */
      updateComparisonProfile: () => respond('updateComparisonProfile'),
      /** @operation deleteComparisonProfile */
      deleteComparisonProfile: () => respond('deleteComparisonProfile'),
    },
    settings: {
      /** @operation updateUserSettings */
      updateUserSettings: () => respond('updateUserSettings'),
    },
  };
}
