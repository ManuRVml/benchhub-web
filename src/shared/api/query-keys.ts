import type { AssistantContextScreen, ResultsHorizon } from './ports/responses';

/**
 * Query key factory for TanStack Query.
 *
 * Each key follows the pattern `['eco', <section>, ...params]` where:
 * - `eco` is the root namespace
 * - `section` is the view category (home, analyses, analysis, etc.)
 * - `params` are path parameters for specific resources
 *
 * This allows for precise cache invalidation using `queryClient.invalidateQueries()`.
 */
export const queryKeys = {
  all: ['eco'] as const,
  /** A-04, the signed-in session; no params, one entry for the whole app. */
  session: () => ['eco', 'session'] as const,
  /** V-01 shell status (unread notifications badge), shared by the whole app shell. */
  shellStatus: () => ['eco', 'shell-status'] as const,
  /** V-02 admin home (SCR-03 back-office cards). */
  adminHome: () => ['eco', 'admin-home'] as const,
  /** V-45 user settings (SCR-16). */
  userSettings: () => ['eco', 'user-settings'] as const,
  /** V-47 the user's saved views of one screen; C-19 / C-20 invalidate the `['eco', 'saved-views']` prefix. */
  savedViews: (screen: 'value-monitor') => ['eco', 'saved-views', screen] as const,
  /** V-46 Yarbis tip and suggestion chips: independent per screen, and per analysis when the screen has one. */
  assistantContext: (screen: AssistantContextScreen, analysisId?: string) =>
    ['eco', 'assistant-context', screen, analysisId ?? ''] as const,
  home: () => ['eco', 'home'] as const,
  analyses: (query?: Readonly<Record<string, unknown>>) =>
    ['eco', 'analyses', query ?? {}] as const,
  analysisDefinition: (draftId: string) => ['eco', 'analysis-definition', draftId] as const,
  competitorCatalog: () => ['eco', 'competitor-catalog'] as const,
  /** V-07 per source: the pares and tbg_ilp catalogs cache separately (SCR-07 step 3 source tabs). */
  indicatorCatalog: (source: 'pares' | 'tbg_ilp' = 'pares') =>
    ['eco', 'indicator-catalog', source] as const,
  analysisValidation: (draftId: string) => ['eco', 'analysis-validation', draftId] as const,
  analysis: (analysisId: string) => ['eco', 'analysis', analysisId] as const,
  /** V-09 per horizon: switching the horizon tab reads (or fetches) its own cache entry. */
  resultsHeader: (analysisId: string, horizon: ResultsHorizon = 'tbg') =>
    ['eco', 'analysis', analysisId, 'results-header', horizon] as const,
  companyCoverage: (analysisId: string) =>
    ['eco', 'analysis', analysisId, 'company-coverage'] as const,
  peerAverageComparison: (analysisId: string) =>
    ['eco', 'analysis', analysisId, 'peer-average-comparison'] as const,
  companyComparison: (analysisId: string) =>
    ['eco', 'analysis', analysisId, 'company-comparison'] as const,
  /** V-12 per company + horizon (SCR-08 module 4 tabs), not yet forwarded by the generated port (P5-42b). */
  companyComparisonDetail: (
    analysisId: string,
    companyId?: string,
    horizon: ResultsHorizon = 'tbg',
  ) =>
    ['eco', 'analysis', analysisId, 'company-comparison-detail', horizon, companyId ?? ''] as const,
  reportSummary: (analysisId: string) => ['eco', 'analysis', analysisId, 'report-summary'] as const,
  /** V-14 per horizon. */
  aiFindings: (analysisId: string, horizon: ResultsHorizon = 'tbg') =>
    ['eco', 'analysis', analysisId, 'ai-findings', horizon] as const,
  /** V-20 (SCR-09 Visualización), not yet in contract 0.1.0 (P5-47a). */
  visualization: (analysisId: string) => ['eco', 'analysis', analysisId, 'visualization'] as const,
  /** V-21 per dimension (SCR-09 "Ranking por categoría"), not yet in contract 0.1.0 (P5-47b). */
  peerWeightRanking: (analysisId: string, dimension: 'fin' | 'op' | 'trans') =>
    ['eco', 'analysis', analysisId, 'peer-weight-ranking', dimension] as const,
  /** V-15 per indicator + scope (SCR-08 module 5), not yet in contract 0.1.0 (P5-RES, TODO(P7-PORTS)). */
  tbgIndicatorComparator: (analysisId: string, indicatorId: string, companyScope: string) =>
    ['eco', 'analysis', analysisId, 'tbg-indicator-comparator', indicatorId, companyScope] as const,
  /** V-16 per segment (SCR-08 module 6), not yet in contract 0.1.0 (P5-RES, TODO(P7-PORTS)). */
  futureAspiration: (analysisId: string, segment: string) =>
    ['eco', 'analysis', analysisId, 'future-aspiration', segment] as const,
  /** V-17 per horizon (SCR-08 module 7, "Resumen general" slice only), not yet in contract 0.1.0 (P5-RES, TODO(P7-PORTS)). */
  tbgHorizon: (analysisId: string, horizon: ResultsHorizon) =>
    ['eco', 'analysis', analysisId, 'tbg-horizon', horizon] as const,
  /** V-18 per horizon + dimension (SCR-08 module 8), not yet in contract 0.1.0 (P5-RES, TODO(P7-PORTS)). */
  tbgDimensionWeights: (
    analysisId: string,
    horizon: ResultsHorizon,
    dimension: 'fin' | 'op' | 'trans',
  ) => ['eco', 'analysis', analysisId, 'tbg-dimension-weights', horizon, dimension] as const,
  /** V-19 per profile (SCR-08 module 9), not yet in contract 0.1.0 (P5-RES, TODO(P7-PORTS)). */
  comparisonProfiles: (analysisId: string, profileId: string) =>
    ['eco', 'analysis', analysisId, 'comparison-profiles', profileId] as const,
  /** V-22 per category (SCR-09 indicator panel), not yet in contract 0.1.0 (P5-47c). */
  categoryIndicators: (analysisId: string, category: string) =>
    ['eco', 'analysis', analysisId, 'category-indicators', category] as const,
  /** V-25 (OVL-13 company profile) — not scoped to one analysis, so it sits outside the `analysis` prefix. */
  companyProfile: (companyId: string) => ['eco', 'company-profile', companyId] as const,
  /** V-23 (SCR-09 OVL-01 "Recomendaciones de Yarbis"), not yet in contract 0.1.0 (P5-48). */
  recommendations: (analysisId: string) =>
    ['eco', 'analysis', analysisId, 'recommendations'] as const,
  /** V-27 header + KPI tiles + dimension weights (SCR-11 Monitor de Valor), not yet in contract 0.1.0 (P5-50a);
   * per snapshot. */
  valueMonitor: (snapshot: string) => ['eco', 'value-monitor', snapshot] as const,
  /** V-28 peer ranking (SCR-11 section 4), not yet in contract 0.1.0 (P5-50b); per indicator + snapshot. */
  valueMonitorPeerRanking: (indicator: string, snapshot: string) =>
    ['eco', 'value-monitor', 'peer-ranking', indicator, snapshot] as const,
  /** V-29 history (SCR-11 section 5), not yet in contract 0.1.0 (P5-50b); per indicator + range. */
  valueMonitorHistory: (indicator: string, range: string) =>
    ['eco', 'value-monitor', 'history', indicator, range] as const,
  /** V-30 KVI table (SCR-11), not yet in contract 0.1.0 (P5-50b); per snapshot + filters. */
  valueMonitorKvis: (
    snapshot: string,
    categories: readonly string[],
    compliance: readonly string[],
  ) => ['eco', 'value-monitor', 'kvis', snapshot, categories, compliance] as const,
  /** V-31 composition donut + category table (SCR-11 section 9), not yet in contract 0.1.0 (P5-53); per snapshot. */
  valueMonitorComposition: (snapshot: string) =>
    ['eco', 'value-monitor', 'composition', snapshot] as const,
  /** V-35 Yarbis recommendations (SCR-11 OVL-02), not yet in contract 0.1.0 (P5-53); per snapshot. */
  valueMonitorRecommendations: (snapshot: string) =>
    ['eco', 'value-monitor', 'recommendations', snapshot] as const,
  /** V-32 configuration card (SCR-11 section 7), not yet in contract 0.1.0 (P5-52b); per snapshot. */
  valueMonitorConfiguration: (snapshot: string) =>
    ['eco', 'value-monitor', 'configuration', snapshot] as const,
  /** V-34 "Añadir indicador" candidates (OVL-05): per snapshot and source tab. Without `source` it is the prefix of
   * every tab's entry, so invalidating it refreshes all three. */
  valueMonitorKviCandidates: (snapshot: string, source?: 'pares' | 'tbg' | 'ilp') =>
    source === undefined
      ? (['eco', 'value-monitor', 'kvi-candidates', snapshot] as const)
      : (['eco', 'value-monitor', 'kvi-candidates', snapshot, source] as const),
  /** V-36 benchmark radar (SCR-11 section 10, gated), via the typed port (P7-HOOKS); no params forwarded yet. */
  valueMonitorBenchmarkRadar: () => ['eco', 'value-monitor', 'benchmark-radar'] as const,
  /** V-44 notifications list + unread count (SCR-15), per server-side filter values. */
  notifications: (q = '', severity: readonly string[] = []) =>
    ['eco', 'notifications', q, severity] as const,
} as const;

export type QueryKey = ReturnType<(typeof queryKeys)[Exclude<keyof typeof queryKeys, 'all'>]>;
