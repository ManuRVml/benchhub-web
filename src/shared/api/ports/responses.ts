import type {
  AdminHomeViewSchema,
  CommentThreadViewSchema,
  LogoutSuccessSchema,
  PresentationBuilderViewSchema,
  ResultsHeaderViewSchema,
} from './response-schemas';
import type {
  AddAnalysisCompanyResponse,
  AddValueMonitorKvisResponse,
  CompleteLoginResponse,
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
  GetAiFindingsViewResponse,
  GetAnalysesViewResponse,
  GetAnalysisDefinitionViewResponse,
  GetAnalysisValidationViewResponse,
  GetAssistantContextViewQueryParams,
  GetAssistantContextViewResponse,
  GetCategoryIndicatorsViewResponse,
  GetCommentThreadViewQueryParams,
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
  GetOperationStatusResponse,
  GetPeerAverageComparisonViewResponse,
  GetPeerWeightRankingViewResponse,
  GetPresentationDetailViewResponse,
  GetPresentationsViewResponse,
  GetPresentationSlidesViewResponse,
  GetReportSummaryViewResponse,
  GetResultsHeaderViewResponse,
  GetSensitivityDriversViewResponse,
  GetSensitivityScenariosViewResponse,
  GetSessionResponse,
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
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  PasswordLoginResponse,
  PublishAnalysisResponse,
  PublishPresentationResponse,
  RemoveAnalysisCompanyResponse,
  SendAssistantMessageResponse,
  StartLoginResponse,
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
} from '../generated/zod';
import type { z } from 'zod';

// Response types of the ports: the output of each operation's generated Zod schema, i.e. exactly what the adapter
// returns after validation. Orval's interfaces (`src/shared/api/generated/model`) mark optional members `x?: T` while
// the Zod outputs are `x?: T | undefined`; under exactOptionalPropertyTypes they are not assignable, so the ports use
// the schema outputs (same names as the models: `V03Response`, `C01Response`…). Request bodies use the models.

/** A-01 (startLogin) response: only the 503 `AUTH_PROVIDER_UNAVAILABLE` shape — success is a bare `302` the browser
 * follows natively, never fetched by the SPA. */
export type A01Response = z.output<typeof StartLoginResponse>;

/** A-02 (completeLogin) response, as its generated schema validates it. Called by the IdP, never by the SPA. */
export type A02Response = z.output<typeof CompleteLoginResponse>;

/** A-03 (logout) response: `204 No Content` (see `LogoutSuccessSchema`), not the generated error-only shape. */
export type A03Response = z.output<typeof LogoutSuccessSchema>;

/** A-04 (getSession) response, as its generated schema validates it. */
export type A04Response = z.output<typeof GetSessionResponse>;

/** A-05 (passwordLogin, mock only) response: the A-04 session of the user just signed in. */
export type A05Response = z.output<typeof PasswordLoginResponse>;

/** C-01 (createAnalysisDraft) response, as its generated schema validates it. */
export type C01Response = z.output<typeof CreateAnalysisDraftResponse>;

/** C-02 (updateAnalysisDraft) response, as its generated schema validates it. */
export type C02Response = z.output<typeof UpdateAnalysisDraftResponse>;

/** C-03 (generateAnalysis) response, as its generated schema validates it. */
export type C03Response = z.output<typeof GenerateAnalysisResponse>;

/** C-04 (addAnalysisCompany) response, as its generated schema validates it. */
export type C04Response = z.output<typeof AddAnalysisCompanyResponse>;

/** C-05 (removeAnalysisCompany) response, as its generated schema validates it. */
export type C05Response = z.output<typeof RemoveAnalysisCompanyResponse>;

/** C-06 (updateValueOverrides) response, as its generated schema validates it. */
export type C06Response = z.output<typeof UpdateValueOverridesResponse>;

/** C-07 (updateWeightOverrides) response, as its generated schema validates it. */
export type C07Response = z.output<typeof UpdateWeightOverridesResponse>;

/** C-08 (createRecalculation) response, as its generated schema validates it. */
export type C08Response = z.output<typeof CreateRecalculationResponse>;

/** C-09 (publishAnalysis) response, as its generated schema validates it. */
export type C09Response = z.output<typeof PublishAnalysisResponse>;

/** C-10 (createReviewComment) response, as its generated schema validates it. */
export type C10Response = z.output<typeof CreateReviewCommentResponse>;

/** C-11 (updateReviewComment) response, as its generated schema validates it. */
export type C11Response = z.output<typeof UpdateReviewCommentResponse>;

/** C-12 (createChangeRequest) response, as its generated schema validates it. */
export type C12Response = z.output<typeof CreateChangeRequestResponse>;

/** C-13 (updateChangeRequest) response, as its generated schema validates it. */
export type C13Response = z.output<typeof UpdateChangeRequestResponse>;

/** C-14 (createExport) response, as its generated schema validates it. */
export type C14Response = z.output<typeof CreateExportResponse>;

/** C-15 (generateExecutiveNarrative) response, as its generated schema validates it. */
export type C15Response = z.output<typeof GenerateExecutiveNarrativeResponse>;

/** C-16 (updateKviTargets) response, as its generated schema validates it. */
export type C16Response = z.output<typeof UpdateKviTargetsResponse>;

/** C-17 (updateValueMonitorConfiguration) response, as its generated schema validates it. */
export type C17Response = z.output<typeof UpdateValueMonitorConfigurationResponse>;

/** C-18 (addValueMonitorKvis) response, as its generated schema validates it. */
export type C18Response = z.output<typeof AddValueMonitorKvisResponse>;

/** V-44 (getNotificationsView) response, as its generated schema validates it. */
export type V44Response = z.output<typeof GetNotificationsViewResponse>;

/** C-19 (createSavedView) response, as its generated schema validates it. */
export type C19Response = z.output<typeof CreateSavedViewResponse>;

/** C-20 (deleteSavedView) response, as its generated schema validates it. */
export type C20Response = z.output<typeof DeleteSavedViewResponse>;

/** C-21 (evaluateSensitivity) response, as its generated schema validates it. */
export type C21Response = z.output<typeof EvaluateSensitivityResponse>;

/** C-22 (validateSensitivitySuggestion) response, as its generated schema validates it. */
export type C22Response = z.output<typeof ValidateSensitivitySuggestionResponse>;

/** C-23 (createSensitivitySimulation) response, as its generated schema validates it. */
export type C23Response = z.output<typeof CreateSensitivitySimulationResponse>;

/** C-24 (evaluateWeightSimulation) response, as its generated schema validates it. */
export type C24Response = z.output<typeof EvaluateWeightSimulationResponse>;

/** C-25 (createStrategicPlan) response, as its generated schema validates it. */
export type C25Response = z.output<typeof CreateStrategicPlanResponse>;

/** C-26 (updateStrategicPlan) response, as its generated schema validates it. */
export type C26Response = z.output<typeof UpdateStrategicPlanResponse>;

/** C-27 (createPresentation) response, as its generated schema validates it. */
export type C27Response = z.output<typeof CreatePresentationResponse>;

/** C-28 (updatePresentation) response, as its generated schema validates it. */
export type C28Response = z.output<typeof UpdatePresentationResponse>;

/** C-29 (publishPresentation) response, as its generated schema validates it. */
export type C29Response = z.output<typeof PublishPresentationResponse>;

/** C-30 (uploadPresentationVersion) response, as its generated schema validates it. */
export type C30Response = z.output<typeof UploadPresentationVersionResponse>;

/** C-31 (deletePresentationVersion) response, as its generated schema validates it. */
export type C31Response = z.output<typeof DeletePresentationVersionResponse>;

/** C-32 (createSlideCommentDraft) response, as its generated schema validates it. */
export type C32Response = z.output<typeof CreateSlideCommentDraftResponse>;

/** C-33 (sendAssistantMessage) response, as its generated schema validates it. */
export type C33Response = z.output<typeof SendAssistantMessageResponse>;

/** C-34 (createAssistantFeedback) response, as its generated schema validates it. */
export type C34Response = z.output<typeof CreateAssistantFeedbackResponse>;

/** C-35 (markNotificationRead) response, as its generated schema validates it. */
export type C35Response = z.output<typeof MarkNotificationReadResponse>;

/** C-36 (markAllNotificationsRead) response, as its generated schema validates it. */
export type C36Response = z.output<typeof MarkAllNotificationsReadResponse>;

/** C-38 (createComparisonProfile) response, as its generated schema validates it. */
export type C38Response = z.output<typeof CreateComparisonProfileResponse>;

/** C-39 (updateComparisonProfile) response, as its generated schema validates it. */
export type C39Response = z.output<typeof UpdateComparisonProfileResponse>;

/** C-40 (deleteComparisonProfile) response, as its generated schema validates it. */
export type C40Response = z.output<typeof DeleteComparisonProfileResponse>;

/** C-37 (updateUserSettings) response, as its generated schema validates it. */
export type C37Response = z.output<typeof UpdateUserSettingsResponse>;

/** V-03 (getHomeView) response, as its generated schema validates it. */
export type V03Response = z.output<typeof GetHomeViewResponse>;

/** V-01 (getShellStatusView) response, as its generated schema validates it. */
export type V01Response = z.output<typeof GetShellStatusViewResponse>;

/**
 * V-02 (getAdminHomeView) response, as the web validates it: the generated schema with `cards[].id` widened to any
 * non-empty string (response-schemas.ts), so a card id the web does not know is skipped instead of failing the page.
 */
export type V02Response = z.output<typeof AdminHomeViewSchema>;

/** Card ids of the generated V-02 contract (the ids SCR-03 has copy for). */
export type { KnownAdminCardId } from './response-schemas';

/** V-04 (getAnalysesView) response, as its generated schema validates it. */
export type V04Response = z.output<typeof GetAnalysesViewResponse>;

/** V-05 (getAnalysisDefinitionView) response, as its generated schema validates it. */
export type V05Response = z.output<typeof GetAnalysisDefinitionViewResponse>;

/** V-06 (getCompetitorCatalogView) response, as its generated schema validates it. */
export type V06Response = z.output<typeof GetCompetitorCatalogViewResponse>;

/** V-07 (getIndicatorCatalogView) response, as its generated schema validates it. */
export type V07Response = z.output<typeof GetIndicatorCatalogViewResponse>;

/** V-08 (getAnalysisValidationView) response, as its generated schema validates it. */
export type V08Response = z.output<typeof GetAnalysisValidationViewResponse>;

/**
 * V-09 (getResultsHeaderView) response, as the web validates it: the generated schema with `modules[].id` widened to
 * any non-empty string (response-schemas.ts, P5-40b).
 */
export type V09Response = z.output<typeof ResultsHeaderViewSchema>;

/** Module ids of the generated V-09 contract (the ids the SCR-08 registry can know). */
export type { KnownResultsModuleId } from './response-schemas';

/** Horizon of the Resultados views (V-09 `horizon`, `?horizon=` of V-09 / V-14): TBG, ILP or both (`union`). */
export type ResultsHorizon = z.output<typeof GetResultsHeaderViewResponse>['horizon'];

/** V-10 (getCompanyCoverageView) response, as its generated schema validates it. */
export type V10Response = z.output<typeof GetCompanyCoverageViewResponse>;

/** V-11 (getPeerAverageComparisonView) response, as its generated schema validates it. */
export type V11Response = z.output<typeof GetPeerAverageComparisonViewResponse>;

/** V-12 (getCompanyComparisonView) response, as its generated schema validates it. */
export type V12Response = z.output<typeof GetCompanyComparisonViewResponse>;

/** V-13 (getReportSummaryView) response, as its generated schema validates it. */
export type V13Response = z.output<typeof GetReportSummaryViewResponse>;

/** V-14 (getAiFindingsView) response, as its generated schema validates it. */
export type V14Response = z.output<typeof GetAiFindingsViewResponse>;

/** V-25 (getCompanyProfileView) response, as its generated schema validates it. */
export type V25Response = z.output<typeof GetCompanyProfileViewResponse>;

/** V-24 (getIndicatorDetailView) response, as its generated schema validates it. */
export type V24Response = z.output<typeof GetIndicatorDetailViewResponse>;

/** SCR-10 indicator-detail `unit` domain (V-24 `indicator.unit`). */
export type IndicatorUnit = V24Response['indicator']['unit'];

/**
 * V-26 (getCommentThreadView) response, as the web reads it: `permissions` narrowed to its 4 known keys
 * (response-schemas.ts).
 */
export type V26Response = z.output<typeof CommentThreadViewSchema>;

/**
 * Entity types V-26/C-10 accept (CF-132: `indicator` included; `value_monitor`/`presentation` widened later). Derived
 * from the generated query params so it can never drift from the real enum.
 */
export type ReviewEntityType = z.output<typeof GetCommentThreadViewQueryParams>['entityType'];

/** V-19 (getComparisonProfilesView) response, as its generated schema validates it. */
export type V19Response = z.output<typeof GetComparisonProfilesViewResponse>;

/** V-20 (getVisualizationView) response, as its generated schema validates it. */
export type V20Response = z.output<typeof GetVisualizationViewResponse>;

/** V-21 (getPeerWeightRankingView) response, as its generated schema validates it. */
export type V21Response = z.output<typeof GetPeerWeightRankingViewResponse>;

/** V-22 (getCategoryIndicatorsView) response, as its generated schema validates it. */
export type V22Response = z.output<typeof GetCategoryIndicatorsViewResponse>;

/** V-23 (getWeightRecommendationsView) response, as its generated schema validates it. */
export type V23Response = z.output<typeof GetWeightRecommendationsViewResponse>;

/** V-27 (getValueMonitorView) response, as its generated schema validates it. */
export type V27Response = z.output<typeof GetValueMonitorViewResponse>;

/** V-28 (getValueMonitorPeerRankingView) response, as its generated schema validates it. */
export type V28Response = z.output<typeof GetValueMonitorPeerRankingViewResponse>;

/** V-29 (getValueMonitorHistoryView) response, as its generated schema validates it. */
export type V29Response = z.output<typeof GetValueMonitorHistoryViewResponse>;

/** V-30 (getValueMonitorKvisView) response, as its generated schema validates it. */
export type V30Response = z.output<typeof GetValueMonitorKvisViewResponse>;

/** V-31 (getValueMonitorCompositionView) response, as its generated schema validates it. */
export type V31Response = z.output<typeof GetValueMonitorCompositionViewResponse>;

/** V-32 (getValueMonitorConfigurationView) response, as its generated schema validates it. */
export type V32Response = z.output<typeof GetValueMonitorConfigurationViewResponse>;

/** V-33 (getKviTraceabilityView) response, as its generated schema validates it. */
export type V33Response = z.output<typeof GetKviTraceabilityViewResponse>;

/** V-34 (getKviCandidatesView) response, as its generated schema validates it. */
export type V34Response = z.output<typeof GetKviCandidatesViewResponse>;

/** V-35 (getValueMonitorRecommendationsView) response, as its generated schema validates it. */
export type V35Response = z.output<typeof GetValueMonitorRecommendationsViewResponse>;

/** V-36 (getValueMonitorBenchmarkRadarView) response, as its generated schema validates it. */
export type V36Response = z.output<typeof GetValueMonitorBenchmarkRadarViewResponse>;

/** V-37 (getSensitivityDriversView) response, as its generated schema validates it. */
export type V37Response = z.output<typeof GetSensitivityDriversViewResponse>;

/** Unit domain of V-37 levers/base/target (SCR-12 §1). */
export type SensitivityUnit = V37Response['base']['unit'];

/** V-38 (getSensitivityScenariosView) response, as its generated schema validates it. */
export type V38Response = z.output<typeof GetSensitivityScenariosViewResponse>;

/** V-39 (getWeightSimulatorView) response, as its generated schema validates it. */
export type V39Response = z.output<typeof GetWeightSimulatorViewResponse>;

// Friendly aliases (SCR-12/SCR-10, pre-dating the typed ports): kept so entities/sensitivity, entities/indicator,
// entities/analysis and their consumer widgets/pages/tests do not need to change a single import name after the
// P7-PORTS-C swap from pending-views.ts's hand-written mirrors to these generated response types.
export type SensitivityDriversView = V37Response;
export type SensitivityLever = SensitivityDriversView['levers'][number];
export type SensitivityScenariosView = V38Response;
export type SensitivityScenariosVariable = SensitivityScenariosView['variables'][number];
export type SensitivityScenariosPreset = NonNullable<SensitivityScenariosView['presets']>[number];
export type WeightSimulatorView = V39Response;
export type WeightSimulatorCategory = WeightSimulatorView['categories'][number];
export type WeightSimulatorKvi = WeightSimulatorCategory['kvis'][number];
export type WeightSimulatorRecommendation = WeightSimulatorView['recommendations'][number];
export type IndicatorDetailView = V24Response;
export type CommentThreadView = V26Response;

/** V-15 (getTbgIndicatorComparatorView) response, as its generated schema validates it. */
export type V15Response = z.output<typeof GetTbgIndicatorComparatorViewResponse>;

/** V-16 (getFutureAspirationView) response, as its generated schema validates it. */
export type V16Response = z.output<typeof GetFutureAspirationViewResponse>;

/** V-17 (getTbgHorizonView) response, as its generated schema validates it. */
export type V17Response = z.output<typeof GetTbgHorizonViewResponse>;

/** V-18 (getTbgDimensionWeightsView) response, as its generated schema validates it. */
export type V18Response = z.output<typeof GetTbgDimensionWeightsViewResponse>;

/** V-45 (getUserSettingsView) response, as its generated schema validates it. */
export type V45Response = z.output<typeof GetUserSettingsViewResponse>;

/** V-46 (getAssistantContextView) response, as its generated schema validates it. */
export type V46Response = z.output<typeof GetAssistantContextViewResponse>;

/** Screens V-46 accepts (`?screen=`). Derived from the generated query params so it can never drift from the real enum. */
export type AssistantContextScreen = z.output<typeof GetAssistantContextViewQueryParams>['screen'];

/** V-47 (getSavedViewsView) response, as its generated schema validates it — screen is 'value-monitor' only today. */
export type V47Response = z.output<typeof GetSavedViewsViewResponse>;

/** V-40 (getPresentationsView) response, as its generated schema validates it. */
export type V40Response = z.output<typeof GetPresentationsViewResponse>;

/**
 * V-41 (getPresentationBuilderView) response, as the web validates it: the generated schema with `modules[].id`
 * widened to any non-empty string (response-schemas.ts).
 */
export type V41Response = z.output<typeof PresentationBuilderViewSchema>;

/** V-42 (getPresentationSlidesView) response, as its generated schema validates it. */
export type V42Response = z.output<typeof GetPresentationSlidesViewResponse>;

/** V-43 (getPresentationDetailView) response, as its generated schema validates it. */
export type V43Response = z.output<typeof GetPresentationDetailViewResponse>;

/** O-01 (getOperationStatus) response, as its generated schema validates it. */
export type O01Response = z.output<typeof GetOperationStatusResponse>;

/** C-41 (createPreviewInvitations) response, as its generated schema validates it. */
export type C41Response = z.output<typeof CreatePreviewInvitationsResponse>;
