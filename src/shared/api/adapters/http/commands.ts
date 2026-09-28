import {
  AddAnalysisCompanyResponse,
  AddValueMonitorKvisResponse,
  CreateAnalysisDraftResponse,
  CreateAssistantFeedbackResponse,
  CreateChangeRequestResponse,
  CreateComparisonProfileResponse,
  CreateExportResponse,
  CreatePresentationResponse,
  CreatePreviewInvitationsResponse,
  CreateRecalculationResponse,
  CreateReviewCommentResponse,
  CreateSavedViewResponse,
  CreateSensitivitySimulationResponse,
  CreateSlideCommentDraftResponse,
  CreateStrategicPlanResponse,
  DeleteComparisonProfileResponse,
  DeletePresentationVersionResponse,
  DeleteSavedViewResponse,
  EvaluateSensitivityResponse,
  EvaluateWeightSimulationResponse,
  GenerateAnalysisResponse,
  GenerateExecutiveNarrativeResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  PublishAnalysisResponse,
  PublishPresentationResponse,
  RemoveAnalysisCompanyResponse,
  SendAssistantMessageResponse,
  UpdateAnalysisDraftResponse,
  UpdateChangeRequestResponse,
  UpdateComparisonProfileResponse,
  UpdateKviTargetsResponse,
  UpdatePresentationResponse,
  UpdateReviewCommentResponse,
  UpdateStrategicPlanResponse,
  UpdateUserSettingsResponse,
  UpdateValueMonitorConfigurationResponse,
  UpdateValueOverridesResponse,
  UpdateWeightOverridesResponse,
  UploadPresentationVersionResponse,
  ValidateSensitivitySuggestionResponse,
} from '../../generated/zod';

import { apiPath } from './api-path';

import type { HttpClient } from '../../http-client';
import type {
  AnalysisDraftCommands,
  AnalysisEditCommands,
  AssistantCommands,
  ComparisonProfileCommands,
  NotificationCommands,
  PresentationCommands,
  PreviewInvitationCommands,
  ReportCommands,
  ReviewCommands,
  SavedViewCommands,
  SensitivityCommands,
  SettingsCommands,
  ValueMonitorCommands,
} from '../../ports';

// HTTP adapters of the command ports. Each method is one contract operation (`@operation`, checked against the vendored
// openapi.yaml by `pnpm contract:adapters`); the client adds X-CSRF-Token and validates the generated response schema.

export function createAnalysisDraftHttpAdapter(http: HttpClient): AnalysisDraftCommands {
  return {
    /** @operation createAnalysisDraft */
    createAnalysisDraft: (body, options) =>
      http.post('/analysis-drafts', body, { ...options, schema: CreateAnalysisDraftResponse }),
    /** @operation updateAnalysisDraft */
    updateAnalysisDraft: (draftId, body, options) =>
      http.patch(apiPath`/analysis-drafts/${draftId}`, body, {
        ...options,
        schema: UpdateAnalysisDraftResponse,
      }),
    /** @operation generateAnalysis */
    generateAnalysis: (draftId, body, options) =>
      http.post(apiPath`/analysis-drafts/${draftId}/generation`, body, {
        ...options,
        schema: GenerateAnalysisResponse,
      }),
  };
}

export function createAnalysisEditHttpAdapter(http: HttpClient): AnalysisEditCommands {
  return {
    /** @operation addAnalysisCompany */
    addAnalysisCompany: (analysisId, body, options) =>
      http.post(apiPath`/analyses/${analysisId}/companies`, body, {
        ...options,
        schema: AddAnalysisCompanyResponse,
      }),
    /** @operation removeAnalysisCompany */
    removeAnalysisCompany: (analysisId, companyId, options) =>
      http.delete(apiPath`/analyses/${analysisId}/companies/${companyId}`, undefined, {
        ...options,
        schema: RemoveAnalysisCompanyResponse,
      }),
    /** @operation updateValueOverrides */
    updateValueOverrides: (analysisId, body, options) =>
      http.patch(apiPath`/analyses/${analysisId}/value-overrides`, body, {
        ...options,
        schema: UpdateValueOverridesResponse,
      }),
    /** @operation updateWeightOverrides */
    updateWeightOverrides: (analysisId, body, options) =>
      http.patch(apiPath`/analyses/${analysisId}/weight-overrides`, body, {
        ...options,
        schema: UpdateWeightOverridesResponse,
      }),
    /** @operation createRecalculation */
    createRecalculation: (body, options) =>
      http.post('/recalculations', body, { ...options, schema: CreateRecalculationResponse }),
    /** @operation publishAnalysis */
    publishAnalysis: (body, options) =>
      http.post('/publications', body, { ...options, schema: PublishAnalysisResponse }),
  };
}

export function createReviewHttpAdapter(http: HttpClient): ReviewCommands {
  return {
    /** @operation createReviewComment */
    createReviewComment: (body, options) =>
      http.post('/review-comments', body, { ...options, schema: CreateReviewCommentResponse }),
    /** @operation updateReviewComment */
    updateReviewComment: (commentId, body, options) =>
      http.patch(apiPath`/review-comments/${commentId}`, body, {
        ...options,
        schema: UpdateReviewCommentResponse,
      }),
    /** @operation createChangeRequest */
    createChangeRequest: (body, options) =>
      http.post('/change-requests', body, { ...options, schema: CreateChangeRequestResponse }),
    /** @operation updateChangeRequest */
    updateChangeRequest: (requestId, body, options) =>
      http.patch(apiPath`/change-requests/${requestId}`, body, {
        ...options,
        schema: UpdateChangeRequestResponse,
      }),
  };
}

export function createReportHttpAdapter(http: HttpClient): ReportCommands {
  return {
    /** @operation createExport */
    createExport: (body, options) =>
      http.post('/exports', body, { ...options, schema: CreateExportResponse }),
    /** @operation generateExecutiveNarrative */
    generateExecutiveNarrative: (body, options) =>
      http.post('/executive-narratives', body, {
        ...options,
        schema: GenerateExecutiveNarrativeResponse,
      }),
  };
}

export function createValueMonitorHttpAdapter(http: HttpClient): ValueMonitorCommands {
  return {
    /** @operation updateKviTargets */
    updateKviTargets: (kviId, body, options) =>
      http.patch(apiPath`/kvis/${kviId}/targets`, body, {
        ...options,
        schema: UpdateKviTargetsResponse,
      }),
    /** @operation updateValueMonitorConfiguration */
    updateValueMonitorConfiguration: (body, options) =>
      http.put('/value-monitor-configuration', body, {
        ...options,
        schema: UpdateValueMonitorConfigurationResponse,
      }),
    /** @operation addValueMonitorKvis */
    addValueMonitorKvis: (body, options) =>
      http.post('/value-monitor-kvis', body, { ...options, schema: AddValueMonitorKvisResponse }),
  };
}

export function createSavedViewHttpAdapter(http: HttpClient): SavedViewCommands {
  return {
    /** @operation createSavedView */
    createSavedView: (body, options) =>
      http.post('/saved-views', body, { ...options, schema: CreateSavedViewResponse }),
    /** @operation deleteSavedView */
    deleteSavedView: (viewId, options) =>
      http.delete(apiPath`/saved-views/${viewId}`, undefined, {
        ...options,
        schema: DeleteSavedViewResponse,
      }),
  };
}

export function createSensitivityHttpAdapter(http: HttpClient): SensitivityCommands {
  return {
    /** @operation evaluateSensitivity */
    evaluateSensitivity: (body, options) =>
      http.post('/sensitivity-evaluations', body, {
        ...options,
        schema: EvaluateSensitivityResponse,
      }),
    /** @operation validateSensitivitySuggestion */
    validateSensitivitySuggestion: (suggestionId, body, options) =>
      http.post(apiPath`/sensitivity-suggestions/${suggestionId}/validation`, body, {
        ...options,
        schema: ValidateSensitivitySuggestionResponse,
      }),
    /** @operation createSensitivitySimulation */
    createSensitivitySimulation: (body, options) =>
      http.post('/sensitivity-simulations', body, {
        ...options,
        schema: CreateSensitivitySimulationResponse,
      }),
    /** @operation evaluateWeightSimulation */
    evaluateWeightSimulation: (body, options) =>
      http.post('/weight-simulation-evaluations', body, {
        ...options,
        schema: EvaluateWeightSimulationResponse,
      }),
    /** @operation createStrategicPlan */
    createStrategicPlan: (body, options) =>
      http.post('/strategic-plans', body, { ...options, schema: CreateStrategicPlanResponse }),
    /** @operation updateStrategicPlan */
    updateStrategicPlan: (planId, body, options) =>
      http.patch(apiPath`/strategic-plans/${planId}`, body, {
        ...options,
        schema: UpdateStrategicPlanResponse,
      }),
  };
}

export function createPresentationHttpAdapter(http: HttpClient): PresentationCommands {
  return {
    /** @operation createPresentation */
    createPresentation: (body, options) =>
      http.post('/presentations', body, { ...options, schema: CreatePresentationResponse }),
    /** @operation updatePresentation */
    updatePresentation: (presentationId, body, options) =>
      http.patch(apiPath`/presentations/${presentationId}`, body, {
        ...options,
        schema: UpdatePresentationResponse,
      }),
    /** @operation publishPresentation */
    publishPresentation: (presentationId, body, options) =>
      http.post(apiPath`/presentations/${presentationId}/publication`, body, {
        ...options,
        schema: PublishPresentationResponse,
      }),
    /** @operation uploadPresentationVersion */
    uploadPresentationVersion: (presentationId, body, options) =>
      http.put(apiPath`/presentations/${presentationId}/uploaded-version`, body, {
        ...options,
        schema: UploadPresentationVersionResponse,
      }),
    /** @operation deletePresentationVersion */
    deletePresentationVersion: (presentationId, options) =>
      http.delete(apiPath`/presentations/${presentationId}/uploaded-version`, undefined, {
        ...options,
        schema: DeletePresentationVersionResponse,
      }),
    /** @operation createSlideCommentDraft */
    createSlideCommentDraft: (body, options) =>
      http.post('/slide-comment-drafts', body, {
        ...options,
        schema: CreateSlideCommentDraftResponse,
      }),
  };
}

export function createAssistantHttpAdapter(http: HttpClient): AssistantCommands {
  return {
    /** @operation sendAssistantMessage */
    sendAssistantMessage: (body, options) =>
      http.post('/assistant/messages', body, { ...options, schema: SendAssistantMessageResponse }),
    /** @operation createAssistantFeedback */
    createAssistantFeedback: (body, options) =>
      http.post('/assistant/feedback', body, {
        ...options,
        schema: CreateAssistantFeedbackResponse,
      }),
  };
}

export function createNotificationHttpAdapter(http: HttpClient): NotificationCommands {
  return {
    /** @operation markNotificationRead */
    markNotificationRead: (notificationId, body, options) =>
      http.patch(apiPath`/notifications/${notificationId}/read`, body, {
        ...options,
        schema: MarkNotificationReadResponse,
      }),
    /** @operation markAllNotificationsRead */
    markAllNotificationsRead: (body, options) =>
      http.post('/notifications/read-all', body, {
        ...options,
        schema: MarkAllNotificationsReadResponse,
      }),
  };
}

export function createComparisonProfileHttpAdapter(http: HttpClient): ComparisonProfileCommands {
  return {
    /** @operation createComparisonProfile */
    createComparisonProfile: (analysisId, body, options) =>
      http.post(apiPath`/analyses/${analysisId}/comparison-profiles`, body, {
        ...options,
        schema: CreateComparisonProfileResponse,
      }),
    /** @operation updateComparisonProfile */
    updateComparisonProfile: (analysisId, profileId, body, options) =>
      http.patch(apiPath`/analyses/${analysisId}/comparison-profiles/${profileId}`, body, {
        ...options,
        schema: UpdateComparisonProfileResponse,
      }),
    /** @operation deleteComparisonProfile */
    deleteComparisonProfile: (analysisId, profileId, options) =>
      http.delete(apiPath`/analyses/${analysisId}/comparison-profiles/${profileId}`, undefined, {
        ...options,
        schema: DeleteComparisonProfileResponse,
      }),
  };
}

export function createSettingsHttpAdapter(http: HttpClient): SettingsCommands {
  return {
    /** @operation updateUserSettings */
    updateUserSettings: (body, options) =>
      http.patch('/user-settings', body, { ...options, schema: UpdateUserSettingsResponse }),
  };
}

export function createPreviewInvitationHttpAdapter(http: HttpClient): PreviewInvitationCommands {
  return {
    /** @operation createPreviewInvitations */
    createPreviewInvitations: (analysisId, body, options) =>
      http.post(apiPath`/analyses/${analysisId}/preview-invitations`, body, {
        ...options,
        schema: CreatePreviewInvitationsResponse,
      }),
  };
}
