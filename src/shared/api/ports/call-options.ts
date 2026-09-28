/**
 * Per-call options of every port method. Contract 0.1.0 declares no query parameters, so view methods take only these;
 * when the contract adds a query, the method gains a `query` typed from the generated model.
 */
export interface CallOptions {
  /** Aborts the request (React Query passes its own signal). */
  signal?: AbortSignal;
}

/**
 * Options of the Resultados views that take the horizon (V-09, V-14 `?horizon=tbg|ilp|union`, default `tbg` on the
 * BFF). The contract 0.1.0 does not publish the query yet; the views' docs define it (P5-40b).
 */
export interface ResultsViewOptions extends CallOptions {
  horizon?: 'tbg' | 'ilp' | 'union';
}

/**
 * Options of V-07 indicator catalog (SCR-07 step 3 source tabs, `?source=pares|tbg_ilp`, default `pares` on the BFF).
 * The contract 0.1.0 does not publish the query yet.
 */
export interface IndicatorCatalogViewOptions extends CallOptions {
  source?: 'pares' | 'tbg_ilp';
}

/** Options shared by every Monitor de Valor view keyed by the `corte` snapshot (V-27, V-30, V-31, V-35). */
export interface ValueMonitorViewOptions extends CallOptions {
  snapshot?: string;
}

/** Options of V-28 peer ranking (`?indicator=&snapshot=`, indicator default `ind_roace` on the BFF). */
export interface ValueMonitorPeerRankingViewOptions extends CallOptions {
  indicator?: string;
  snapshot?: string;
}

/** Options of V-29 history (`?indicator=&range=&snapshot=`, defaults `ind_roace` / `actual` on the BFF). */
export interface ValueMonitorHistoryViewOptions extends CallOptions {
  indicator?: string;
  range?: 'actual' | '5y' | '8y' | '10y';
  snapshot?: string;
}

/** Options of V-30 KVI table (`?snapshot=&categories=&compliance=`, the last two comma lists, ADR-0005). */
export interface ValueMonitorKvisViewOptions extends CallOptions {
  snapshot?: string;
  categories?: readonly string[];
  compliance?: readonly string[];
}

/** Options of V-34 KVI candidates (`?source=`, `pares` by default on the BFF): the active OVL-05 source tab. */
export interface KviCandidatesViewOptions extends CallOptions {
  source?: 'pares' | 'tbg' | 'ilp';
}

/**
 * Options of V-12 (getCompanyComparisonView, SCR-08 module 4).
 * Query params: `horizon` (tbg|ilp|union, default `tbg`), `companyId` (optional; defaults to the analysis' own
 * current selection on the BFF).
 */
export interface CompanyComparisonViewOptions extends CallOptions {
  horizon?: 'tbg' | 'ilp' | 'union';
  companyId?: string;
}

/**
 * Options of V-15 (getTbgIndicatorComparatorView).
 * Query params: `horizon` (tbg|ilp, default `tbg`), `indicatorId` (default `ind_roace`), `companyScope` (all, default `all`).
 */
export interface TbgIndicatorComparatorViewOptions extends CallOptions {
  horizon?: 'tbg' | 'ilp';
  indicatorId?: string;
  companyScope?: 'all';
}

/**
 * Options of V-16 (getFutureAspirationView).
 * Query params: `segment` (total|crude|gas|unconventional|lowEmissions, default `total`).
 */
export interface FutureAspirationViewOptions extends CallOptions {
  segment?: 'total' | 'crude' | 'gas' | 'unconventional' | 'lowEmissions';
}

/**
 * Options of V-17 (getTbgHorizonView).
 * Query params: `horizon` (tbg|ilp|union, default `tbg`), `view` (summary|company, default `summary`), `companyId`, `detail` (true|false, default `false`).
 */
export interface TbgHorizonViewOptions extends CallOptions {
  horizon?: 'tbg' | 'ilp' | 'union';
  view?: 'summary' | 'company';
  companyId?: string;
  detail?: boolean;
}

/**
 * Options of V-18 (getTbgDimensionWeightsView).
 * Query params: `horizon` (tbg|ilp, default `tbg`), `dimension` (fin|op|trans, default `fin`).
 */
export interface TbgDimensionWeightsViewOptions extends CallOptions {
  horizon?: 'tbg' | 'ilp';
  dimension?: 'fin' | 'op' | 'trans';
}

/**
 * Options of V-19 (getComparisonProfilesView).
 * Query params: `profileId` (optional; selects the active profile, defaults to the analysis' own on the BFF).
 */
export interface ComparisonProfilesViewOptions extends CallOptions {
  profileId?: string;
}

/** Options of A-01 (startLogin): `returnTo` (in-app path) and `loginHint` (typed username), both optional. */
export interface StartLoginOptions extends CallOptions {
  returnTo?: string;
  loginHint?: string;
}

/**
 * Options of A-02 (completeLogin): `code` (absent on an IdP error) and the IdP's own `error`/`error_description`.
 * `state` is required, so it's a positional argument of the method, not here.
 */
export interface CompleteLoginOptions extends CallOptions {
  code?: string;
  error?: string;
  error_description?: string;
}

/** Options of V-40 the presentations list (`?analysisId=&page=&pageSize=`, page/pageSize default 1/20 on the BFF). */
export interface PresentationsViewOptions extends CallOptions {
  analysisId?: string;
  page?: number;
  pageSize?: number;
}

/** Options of V-42 presentation slides (`?order=`, a comma list of slide keys; default the saved order). */
export interface PresentationSlidesViewOptions extends CallOptions {
  order?: readonly string[];
}

/** Options of V-44 notifications (`?q=&severity=`; severity is the contract's comma list). */
export interface NotificationsViewOptions extends CallOptions {
  q?: string;
  severity?: readonly ('info' | 'success' | 'warn' | 'error')[];
}

/** Options of O-03 mediated download (`?disposition=attachment|inline`, default `attachment` on the BFF). */
export interface DownloadFileOptions extends CallOptions {
  disposition?: 'attachment' | 'inline';
}
