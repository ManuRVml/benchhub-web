import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type {
  ResultsHorizon,
  V15Response,
  V16Response,
  V17Response,
  V18Response,
  V19Response,
} from '@/shared/api';

// Query hooks of the analysis views (V-04..V-14): one per port method, keyed by `queryKeys`, returning the typed
// z.output data of the port. Errors surface as ApiError; 4xx are not retried (query-policy `shouldRetry`). Hooks that
// take an id stay idle until it is non-empty.

/** V-04 analyses list. */
export interface AnalysesViewFilters {
  q?: string | undefined;
  createdOn?: string | undefined;
  createdBy?: string | undefined;
  status?: string | undefined;
  ref?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAnalysesView(filters: AnalysesViewFilters = {}) {
  const { analyses } = useServices();
  return useQuery({
    queryKey: queryKeys.analyses({
      q: filters.q ?? '',
      createdOn: filters.createdOn ?? '',
      createdBy: filters.createdBy ?? '',
      status: filters.status ?? '',
      ref: filters.ref ?? '',
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    }),
    queryFn: ({ signal }) => analyses.getAnalysesView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}

/** V-05 wizard frame and step 1 of a draft. */
export function useAnalysisDefinitionView(draftId: string) {
  const { analysisDefinition } = useServices();
  return useQuery({
    queryKey: queryKeys.analysisDefinition(draftId),
    queryFn: ({ signal }) => analysisDefinition.getAnalysisDefinitionView(draftId, { signal }),
    enabled: draftId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-06 competitor catalog (reference data). */
export function useCompetitorCatalogView() {
  const { analysisDefinition } = useServices();
  return useQuery({
    queryKey: queryKeys.competitorCatalog(),
    queryFn: ({ signal }) => analysisDefinition.getCompetitorCatalogView({ signal }),
    staleTime: STALE_TIMES.catalog,
  });
}

/** V-07 indicator catalog (reference data), for one source at a time (SCR-07 step 3 source tabs, default `pares`). */
export function useIndicatorCatalogView(source: 'pares' | 'tbg_ilp' = 'pares') {
  const { analysisDefinition } = useServices();
  return useQuery({
    queryKey: queryKeys.indicatorCatalog(source),
    queryFn: ({ signal }) => analysisDefinition.getIndicatorCatalogView({ signal, source }),
    staleTime: STALE_TIMES.catalog,
  });
}

/** V-08 validation summary of a draft (wizard step 5). */
export function useAnalysisValidationView(draftId: string) {
  const { analysisDefinition } = useServices();
  return useQuery({
    queryKey: queryKeys.analysisValidation(draftId),
    queryFn: ({ signal }) => analysisDefinition.getAnalysisValidationView(draftId, { signal }),
    enabled: draftId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-09 results header (frame of SCR-08) for one horizon (`?horizon=`, default `tbg`). */
export function useResultsHeaderView(analysisId: string, horizon: ResultsHorizon = 'tbg') {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.resultsHeader(analysisId, horizon),
    queryFn: ({ signal }) => results.getResultsHeaderView(analysisId, { signal, horizon }),
    // Switching the horizon keeps the previous frame on screen until the new one arrives (no full-page skeleton).
    placeholderData: keepPreviousData,
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.frame,
  });
}

/** V-10 company coverage module. */
export function useCompanyCoverageView(analysisId: string) {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.companyCoverage(analysisId),
    queryFn: ({ signal }) => results.getCompanyCoverageView(analysisId, { signal }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-11 GE vs. peer average module. */
export function usePeerAverageComparisonView(analysisId: string) {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.peerAverageComparison(analysisId),
    queryFn: ({ signal }) => results.getPeerAverageComparisonView(analysisId, { signal }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-12 GE vs. company module. */
export function useCompanyComparisonView(analysisId: string) {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.companyComparison(analysisId),
    queryFn: ({ signal }) => results.getCompanyComparisonView(analysisId, { signal }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-13 report summary module. */
export function useReportSummaryView(analysisId: string) {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.reportSummary(analysisId),
    queryFn: ({ signal }) => results.getReportSummaryView(analysisId, { signal }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-14 AI findings rail. */
export function useAiFindingsView(analysisId: string, horizon: ResultsHorizon = 'tbg') {
  const { results } = useServices();
  return useQuery({
    queryKey: queryKeys.aiFindings(analysisId, horizon),
    queryFn: ({ signal }) => results.getAiFindingsView(analysisId, { signal, horizon }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

// P7-SWAP-RES: V-15..V-19 (SCR-08 modules 5, 6, 7 "Resumen general" slice, 8 and 9) moved here from the hand-written
// `use-results-mirror-views.ts` mirrors once `task/P7-PORTS-TBG` and `task/P7-PORTS-CP` vendored their ports —
// thin useQuery wrappers now, like every other hook in this file. Field-shape differences between each port's
// response and its widget's props are resolved at the consumer (`result-modules.tsx`), not here.

export type TbgIndicatorComparatorView = V15Response;

/** V-15 for one indicator/scope selection; an empty `indicatorId` lets the BFF default to its own current indicator
 * (P7-SWAP-RES fix — the mirror's old `enabled` gate required it non-empty, so the query could never fire before the
 * caller already knew a valid id, a chicken-and-egg bug the new mock-mode Resultados test caught). */
export function useTbgIndicatorComparatorView(
  analysisId: string,
  indicatorId: string,
  companyScope: string,
) {
  const { tbgViews } = useServices();
  return useQuery({
    queryKey: queryKeys.tbgIndicatorComparator(analysisId, indicatorId, companyScope),
    queryFn: ({ signal }) =>
      tbgViews.getTbgIndicatorComparatorView(analysisId, {
        ...(indicatorId === '' ? {} : { indicatorId }),
        // V-15's `companyScope` enum has only `all` at contract 0.1.0.
        companyScope: companyScope as 'all',
        signal,
      }),
    enabled: analysisId !== '' && companyScope !== '',
    staleTime: STALE_TIMES.view,
  });
}

export type FutureAspirationView = V16Response;

/** V-16 for one segment filter. Idle until the analysis id is non-empty. */
export function useFutureAspirationView(analysisId: string, segment: string) {
  const { tbgViews } = useServices();
  return useQuery({
    queryKey: queryKeys.futureAspiration(analysisId, segment),
    queryFn: ({ signal }) =>
      tbgViews.getFutureAspirationView(analysisId, {
        segment: segment as 'total' | 'crude' | 'gas' | 'unconventional' | 'lowEmissions',
        signal,
      }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

export type TbgHorizonSummaryView = NonNullable<V17Response['summary']>;

/** V-17 `view=summary` slice for one horizon ("Resumen general", P5-44a scope). Idle until the analysis id is
 * non-empty. */
export function useTbgHorizonSummaryView(analysisId: string, horizon: ResultsHorizon) {
  const { tbgViews } = useServices();
  return useQuery({
    queryKey: queryKeys.tbgHorizon(analysisId, horizon),
    queryFn: async ({ signal }) => {
      const data = await tbgViews.getTbgHorizonView(analysisId, {
        horizon,
        view: 'summary',
        signal,
      });
      // `view: 'summary'` always returns a non-null `summary`; `companyEditor`/`union` are other slices' data.
      if (data.summary === null) throw new Error('V-17 returned no summary for view=summary');
      return data.summary;
    },
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

/** V-18's `dimension` query param (fin | op | trans). */
export type TbgDimension = 'fin' | 'op' | 'trans';

export type TbgDimensionWeightsView = V18Response;

/** V-18 for one horizon + dimension. Idle until the analysis id is non-empty. */
export function useTbgDimensionWeightsView(
  analysisId: string,
  horizon: ResultsHorizon,
  dimension: TbgDimension,
) {
  const { tbgViews } = useServices();
  return useQuery({
    queryKey: queryKeys.tbgDimensionWeights(analysisId, horizon, dimension),
    queryFn: ({ signal }) =>
      tbgViews.getTbgDimensionWeightsView(analysisId, {
        // V-18's horizon has no `union` value (dimension weights are per-horizon, not the combined view).
        horizon: horizon as 'tbg' | 'ilp',
        dimension,
        signal,
      }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}

export type ComparisonProfilesView = V19Response;

/** V-19 for one profile (omitted `profileId` lets the server pick the active/default profile). Idle until the
 * analysis id is non-empty. */
export function useComparisonProfilesView(analysisId: string, profileId?: string) {
  const { comparisonProfiles } = useServices();
  return useQuery({
    queryKey: queryKeys.comparisonProfiles(analysisId, profileId ?? ''),
    queryFn: ({ signal }) =>
      comparisonProfiles.getComparisonProfilesView(analysisId, {
        ...(profileId === undefined ? {} : { profileId }),
        signal,
      }),
    enabled: analysisId !== '',
    staleTime: STALE_TIMES.view,
  });
}
