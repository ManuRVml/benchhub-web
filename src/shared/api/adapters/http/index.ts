import { createAuthHttpAdapter } from './auth';
import {
  createAnalysisDraftHttpAdapter,
  createAnalysisEditHttpAdapter,
  createAssistantHttpAdapter,
  createComparisonProfileHttpAdapter,
  createNotificationHttpAdapter,
  createPresentationHttpAdapter,
  createPreviewInvitationHttpAdapter,
  createReportHttpAdapter,
  createReviewHttpAdapter,
  createSavedViewHttpAdapter,
  createSensitivityHttpAdapter,
  createSettingsHttpAdapter,
  createValueMonitorHttpAdapter,
} from './commands';
import { createOperationsHttpAdapter } from './operations';
import {
  createAdminViewHttpAdapter,
  createAnalysesViewHttpAdapter,
  createAnalysisDefinitionViewHttpAdapter,
  createCommentsViewHttpAdapter,
  createAssistantContextViewHttpAdapter,
  createCompanyProfileViewHttpAdapter,
  createComparisonProfilesViewHttpAdapter,
  createHomeViewHttpAdapter,
  createIndicatorDetailViewHttpAdapter,
  createNotificationsViewHttpAdapter,
  createPresentationViewsHttpAdapter,
  createResultsViewHttpAdapter,
  createSensitivityViewHttpAdapter,
  createTbgViewAdapters,
  createSettingsViewHttpAdapter,
  createShellViewHttpAdapter,
  createValueMonitorViewAdapters,
  createVisualizationViewHttpAdapter,
} from './views';

import type { HttpClient } from '../../http-client';
import type { ApiPorts } from '../../ports';

export { apiPath } from './api-path';
export { createAuthHttpAdapter } from './auth';
export {
  createAnalysisDraftHttpAdapter,
  createAnalysisEditHttpAdapter,
  createAssistantHttpAdapter,
  createComparisonProfileHttpAdapter,
  createNotificationHttpAdapter,
  createPresentationHttpAdapter,
  createPreviewInvitationHttpAdapter,
  createReportHttpAdapter,
  createReviewHttpAdapter,
  createSavedViewHttpAdapter,
  createSensitivityHttpAdapter,
  createSettingsHttpAdapter,
  createValueMonitorHttpAdapter,
} from './commands';
export { createOperationsHttpAdapter } from './operations';
export {
  createAdminViewHttpAdapter,
  createAnalysesViewHttpAdapter,
  createAnalysisDefinitionViewHttpAdapter,
  createCommentsViewHttpAdapter,
  createAssistantContextViewHttpAdapter,
  createCompanyProfileViewHttpAdapter,
  createComparisonProfilesViewHttpAdapter,
  createHomeViewHttpAdapter,
  createIndicatorDetailViewHttpAdapter,
  createNotificationsViewHttpAdapter,
  createPresentationViewsHttpAdapter,
  createResultsViewHttpAdapter,
  createSensitivityViewHttpAdapter,
  createTbgViewAdapters,
  createSettingsViewHttpAdapter,
  createShellViewHttpAdapter,
  createValueMonitorViewAdapters,
  createVisualizationViewHttpAdapter,
} from './views';

/** Every port backed by one http client: one adapter per port, one method per contract operation. */
export function createHttpPorts(http: HttpClient): ApiPorts {
  return {
    auth: createAuthHttpAdapter(http),
    shell: createShellViewHttpAdapter(http),
    admin: createAdminViewHttpAdapter(http),
    home: createHomeViewHttpAdapter(http),
    analyses: createAnalysesViewHttpAdapter(http),
    analysisDefinition: createAnalysisDefinitionViewHttpAdapter(http),
    results: createResultsViewHttpAdapter(http),
    valueMonitorViews: createValueMonitorViewAdapters(http),
    visualization: createVisualizationViewHttpAdapter(http),
    settingsViews: createSettingsViewHttpAdapter(http),
    assistantContext: createAssistantContextViewHttpAdapter(http),
    companyProfile: createCompanyProfileViewHttpAdapter(http),
    indicatorDetail: createIndicatorDetailViewHttpAdapter(http),
    comments: createCommentsViewHttpAdapter(http),
    sensitivityViews: createSensitivityViewHttpAdapter(http),
    tbgViews: createTbgViewAdapters(http),
    comparisonProfiles: createComparisonProfilesViewHttpAdapter(http),
    analysisDrafts: createAnalysisDraftHttpAdapter(http),
    analysisEdits: createAnalysisEditHttpAdapter(http),
    review: createReviewHttpAdapter(http),
    reports: createReportHttpAdapter(http),
    valueMonitor: createValueMonitorHttpAdapter(http),
    savedViews: createSavedViewHttpAdapter(http),
    sensitivities: createSensitivityHttpAdapter(http),
    presentations: createPresentationHttpAdapter(http),
    presentationViews: createPresentationViewsHttpAdapter(http),
    previewInvitations: createPreviewInvitationHttpAdapter(http),
    operations: createOperationsHttpAdapter(http),
    assistant: createAssistantHttpAdapter(http),
    notifications: {
      ...createNotificationsViewHttpAdapter(http),
      ...createNotificationHttpAdapter(http),
    },
    comparisonProfileCommands: createComparisonProfileHttpAdapter(http),
    settings: createSettingsHttpAdapter(http),
  };
}
