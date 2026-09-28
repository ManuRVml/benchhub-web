import type {
  CallOptions,
  CompanyComparisonViewOptions,
  ComparisonProfilesViewOptions,
  FutureAspirationViewOptions,
  IndicatorCatalogViewOptions,
  PresentationsViewOptions,
  PresentationSlidesViewOptions,
  KviCandidatesViewOptions,
  NotificationsViewOptions,
  ResultsViewOptions,
  TbgDimensionWeightsViewOptions,
  TbgHorizonViewOptions,
  TbgIndicatorComparatorViewOptions,
  ValueMonitorHistoryViewOptions,
  ValueMonitorKvisViewOptions,
  ValueMonitorPeerRankingViewOptions,
  ValueMonitorViewOptions,
} from './call-options';
import type {
  ReviewEntityType,
  AssistantContextScreen,
  V01Response,
  V02Response,
  V03Response,
  V04Response,
  V05Response,
  V06Response,
  V07Response,
  V08Response,
  V09Response,
  V10Response,
  V11Response,
  V12Response,
  V13Response,
  V14Response,
  V15Response,
  V16Response,
  V17Response,
  V18Response,
  V19Response,
  V20Response,
  V21Response,
  V22Response,
  V23Response,
  V24Response,
  V25Response,
  V26Response,
  V27Response,
  V28Response,
  V29Response,
  V30Response,
  V31Response,
  V32Response,
  V33Response,
  V34Response,
  V35Response,
  V36Response,
  V37Response,
  V38Response,
  V39Response,
  V40Response,
  V41Response,
  V42Response,
  V43Response,
  V44Response,
  V45Response,
  V46Response,
  V47Response,
} from './responses';

// View ports (brief §4.3): one read model per screen area, typed with the generated contract (./responses). Implemented by the
// HTTP adapters (P5-02) and the mock adapters (P5-03); the app only sees these interfaces.

/** SCR-04 app shell (header/sidebar), across every screen. */
export interface ShellViewPort {
  /** V-01 — shell status: unread notifications badge. */
  getShellStatusView(options?: CallOptions): Promise<V01Response>;
}

/** SCR-03 admin back-office (placeholder cards). */
export interface AdminViewPort {
  /** V-02 — admin home: back-office placeholder cards. */
  getAdminHomeView(options?: CallOptions): Promise<V02Response>;
}

/** SCR-05 Inicio. */
export interface HomeViewPort {
  /** V-03 — five independent sections of the home page. */
  getHomeView(options?: CallOptions): Promise<V03Response>;
}

/** SCR-06 analyses list. */
export interface AnalysesViewPort {
  /** V-04 — paged analyses list with filter options. */
  getAnalysesView(options?: CallOptions): Promise<V04Response>;
}

/** SCR-07 analysis definition wizard. */
export interface AnalysisDefinitionViewPort {
  /** V-05 — wizard frame and step 1 fields of a draft. */
  getAnalysisDefinitionView(draftId: string, options?: CallOptions): Promise<V05Response>;
  /** V-06 — competitor catalog (wizard step 2). */
  getCompetitorCatalogView(options?: CallOptions): Promise<V06Response>;
  /** V-07 — indicator catalog (wizard step 3), one source at a time (`pares` default). */
  getIndicatorCatalogView(options?: IndicatorCatalogViewOptions): Promise<V07Response>;
  /** V-08 — validation summary of a draft (wizard step 5). */
  getAnalysisValidationView(draftId: string, options?: CallOptions): Promise<V08Response>;
}

/** SCR-08 Resultados: the frame and its independently loaded modules. */
export interface ResultsViewPort {
  /** V-09 — results header: analysis, horizons, modules, company set, tabs. */
  getResultsHeaderView(analysisId: string, options?: ResultsViewOptions): Promise<V09Response>;
  /** V-10 — company coverage module (four sections). */
  getCompanyCoverageView(analysisId: string, options?: CallOptions): Promise<V10Response>;
  /** V-11 — GE vs. peer average module. */
  getPeerAverageComparisonView(analysisId: string, options?: CallOptions): Promise<V11Response>;
  /** V-12 — GE vs. company module. */
  getCompanyComparisonView(
    analysisId: string,
    options?: CompanyComparisonViewOptions,
  ): Promise<V12Response>;
  /** V-13 — report summary module. */
  getReportSummaryView(analysisId: string, options?: CallOptions): Promise<V13Response>;
  /** V-14 — AI findings rail (suggestions). */
  getAiFindingsView(analysisId: string, options?: ResultsViewOptions): Promise<V14Response>;
}

/** SCR-08b comparison profiles: saved peer/business-type profiles and their scoring. */
export interface ComparisonProfilesViewPort {
  /** V-19 — comparison profiles: the saved list, the active one's config, its result and the summary table. */
  getComparisonProfilesView(
    analysisId: string,
    options?: ComparisonProfilesViewOptions,
  ): Promise<V19Response>;
}

/** SCR-09 Visualización: the four independent views of the visualization screen. */
export interface VisualizationViewPort {
  /** V-20 — dashboard: position, KPI tiles, heatmap, radar, categories, weight composition. */
  getVisualizationView(analysisId: string, options?: CallOptions): Promise<V20Response>;
  /** V-21 — peer weight ranking: ranking rows with explanation text for a dimension. */
  getPeerWeightRankingView(
    analysisId: string,
    dimension?: string,
    options?: CallOptions,
  ): Promise<V21Response>;
  /** V-22 — category indicators: indicator rows for a category. */
  getCategoryIndicatorsView(
    analysisId: string,
    category?: string,
    options?: CallOptions,
  ): Promise<V22Response>;
  /** V-23 — weight recommendations: AI suggestions for fin/op/trans dimensions. */
  getWeightRecommendationsView(
    analysisId: string,
    scope?: string,
    horizon?: string,
    options?: CallOptions,
  ): Promise<V23Response>;
}

/** OVL-13 company profile overlay — not scoped to one analysis, so it's its own port. */
export interface CompanyProfileViewPort {
  /** V-25 — company profile: identity, country, category/business, segments, recent news. */
  getCompanyProfileView(companyId: string, options?: CallOptions): Promise<V25Response>;
}

/** SCR-09 Value Monitor: configuration, KPIs, composition, recommendations, benchmark. */
export interface ValueMonitorViewPort {
  /** V-27 — value monitor main view (summary). */
  getValueMonitorView(options?: ValueMonitorViewOptions): Promise<V27Response>;
  /** V-28 — value monitor peer ranking. */
  getValueMonitorPeerRankingView(
    options?: ValueMonitorPeerRankingViewOptions,
  ): Promise<V28Response>;
  /** V-29 — value monitor history. */
  getValueMonitorHistoryView(options?: ValueMonitorHistoryViewOptions): Promise<V29Response>;
  /** V-30 — value monitor KVIS. */
  getValueMonitorKvisView(options?: ValueMonitorKvisViewOptions): Promise<V30Response>;
  /** V-31 — value monitor composition. */
  getValueMonitorCompositionView(options?: ValueMonitorViewOptions): Promise<V31Response>;
  /** V-32 — value monitor configuration. */
  getValueMonitorConfigurationView(options?: CallOptions): Promise<V32Response>;
  /** V-33 — KVI traceability. */
  getKviTraceabilityView(kviId: string, options?: CallOptions): Promise<V33Response>;
  /** V-34 — KVI candidates of one source tab (`pares` by default). */
  getKviCandidatesView(options?: KviCandidatesViewOptions): Promise<V34Response>;
  /** V-35 — value monitor recommendations. */
  getValueMonitorRecommendationsView(options?: ValueMonitorViewOptions): Promise<V35Response>;
  /** V-36 — value monitor benchmark radar. */
  getValueMonitorBenchmarkRadarView(options?: CallOptions): Promise<V36Response>;
  /** V-47 — saved views of a screen (today only `'value-monitor'` is a real value). */
  getSavedViewsView(screen: 'value-monitor', options?: CallOptions): Promise<V47Response>;
}

/** SCR-16 settings. */
export interface SettingsViewPort {
  /** V-45 — user settings: profile, accessibility, email notifications. */
  getUserSettingsView(options?: CallOptions): Promise<V45Response>;
}

/** Yarbis assistant context (P5-31), shared across screens. */
export interface AssistantContextViewPort {
  /** V-46 — assistant context: proactive tip and suggestions for the current screen. */
  getAssistantContextView(
    screen: AssistantContextScreen,
    analysisId?: string,
    options?: CallOptions,
  ): Promise<V46Response>;
}

/** SCR-15 Notificaciones. */
export interface NotificationsViewPort {
  /** V-44 — paged notifications list with unread count. */
  getNotificationsView(options?: NotificationsViewOptions): Promise<V44Response>;
}

/** SCR-10 indicator detail. */
export interface IndicatorDetailViewPort {
  /** V-24 — indicator detail: KPIs, series, AI insight and traceability, each independently loaded. */
  getIndicatorDetailView(
    analysisId: string,
    indicatorId: string,
    origin?: 'resultados' | 'visualizacion' | 'presentacion',
    options?: CallOptions,
  ): Promise<V24Response>;
}

/** Comment threads (F32/F33), shared across screens (Resultados, indicator detail, Monitor de Valor, presentations). */
export interface CommentsViewPort {
  /** V-26 — comment thread of one entity, paged (`page` default 1 on the BFF). */
  getCommentThreadView(
    entityType: ReviewEntityType,
    entityId: string,
    page?: number,
    options?: CallOptions,
  ): Promise<V26Response>;
}

/** SCR-12 Sensibilidades. */
export interface SensitivityViewPort {
  /** V-37 — sensitivity drivers: indicator pills, formula, levers, base/target, Yarbis suggestion (indicator default `ind_roace` on the BFF). */
  getSensitivityDriversView(indicator?: string, options?: CallOptions): Promise<V37Response>;
  /** V-38 — sensitivity scenarios: productivity/costs sliders, ROACE base/peer-average, optional presets. */
  getSensitivityScenariosView(options?: CallOptions): Promise<V38Response>;
  /** V-39 — weight simulator: base score, weight categories with their KVI rows, recommendations. */
  getWeightSimulatorView(options?: CallOptions): Promise<V39Response>;
}

/** TBG horizon views (P5-4x territory). */
export interface TbgViewPort {
  /** V-15 — TBG indicator comparator. */
  getTbgIndicatorComparatorView(
    analysisId: string,
    options?: TbgIndicatorComparatorViewOptions,
  ): Promise<V15Response>;
  /** V-16 — Future aspiration 2040+. */
  getFutureAspirationView(
    analysisId: string,
    options?: FutureAspirationViewOptions,
  ): Promise<V16Response>;
  /** V-17 — TBG / ILP horizon. */
  getTbgHorizonView(analysisId: string, options?: TbgHorizonViewOptions): Promise<V17Response>;
  /** V-18 — TBG dimension weights. */
  getTbgDimensionWeightsView(
    analysisId: string,
    options?: TbgDimensionWeightsViewOptions,
  ): Promise<V18Response>;
}

/** SCR-13 / SCR-14 presentations: the list and the two independently loaded viewer/builder frames. */
export interface PresentationViewsPort {
  /** V-40 — presentations list ("Presentaciones creadas"), optionally scoped to one analysis. */
  getPresentationsView(options?: PresentationsViewOptions): Promise<V40Response>;
  /** V-41 — the SCR-13 builder frame. */
  getPresentationBuilderView(presentationId: string, options?: CallOptions): Promise<V41Response>;
  /** V-42 — the slides of a presentation, in the saved order unless `order` lists slide keys. */
  getPresentationSlidesView(
    presentationId: string,
    options?: PresentationSlidesViewOptions,
  ): Promise<V42Response>;
  /** V-43 — the SCR-14 viewer detail frame (meta, slide ref, comment count). */
  getPresentationDetailView(presentationId: string, options?: CallOptions): Promise<V43Response>;
}
