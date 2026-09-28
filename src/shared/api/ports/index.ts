import type { AuthPort } from './auth';
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
} from './commands';
import type { OperationsPort } from './operations';
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
} from './views';

export type { AuthPort } from './auth';
export type {
  CallOptions,
  CompanyComparisonViewOptions,
  DownloadFileOptions,
  IndicatorCatalogViewOptions,
  NotificationsViewOptions,
  PresentationsViewOptions,
  PresentationSlidesViewOptions,
  ResultsViewOptions,
} from './call-options';
export type {
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
} from './commands';
export type { OperationsPort } from './operations';
export type {
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
} from './views';

/** Every port of the BFF contract, as the service container exposes them. */
export interface ApiPorts {
  auth: AuthPort;
  shell: ShellViewPort;
  admin: AdminViewPort;
  home: HomeViewPort;
  analyses: AnalysesViewPort;
  analysisDefinition: AnalysisDefinitionViewPort;
  results: ResultsViewPort;
  valueMonitorViews: ValueMonitorViewPort;
  visualization: VisualizationViewPort;
  settingsViews: SettingsViewPort;
  assistantContext: AssistantContextViewPort;
  companyProfile: CompanyProfileViewPort;
  indicatorDetail: IndicatorDetailViewPort;
  comments: CommentsViewPort;
  sensitivityViews: SensitivityViewPort;
  tbgViews: TbgViewPort;
  comparisonProfiles: ComparisonProfilesViewPort;
  analysisDrafts: AnalysisDraftCommands;
  analysisEdits: AnalysisEditCommands;
  review: ReviewCommands;
  reports: ReportCommands;
  valueMonitor: ValueMonitorCommands;
  savedViews: SavedViewCommands;
  sensitivities: SensitivityCommands;
  presentations: PresentationCommands;
  presentationViews: PresentationViewsPort;
  previewInvitations: PreviewInvitationCommands;
  operations: OperationsPort;
  assistant: AssistantCommands;
  notifications: NotificationCommands & NotificationsViewPort;
  comparisonProfileCommands: ComparisonProfileCommands;
  settings: SettingsCommands;
}
