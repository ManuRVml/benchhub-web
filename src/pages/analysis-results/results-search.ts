import { z } from 'zod';

import type { ResultsHorizon } from '@/widgets/analysis-modules';

// URL state of SCR-08 (routes.analysisResults): `horizonte=tbg|ilp|tbg-ilp`, absent = `tbg`. The contract calls the
// combined horizon `union`; the URL keeps the prototype's `tbg-ilp` (V-09 L9–10, Nilo #59).

export const HORIZON_PARAMS = ['tbg', 'ilp', 'tbg-ilp'] as const;
export type HorizonParam = (typeof HORIZON_PARAMS)[number];

export const DIMENSION_PARAMS = ['fin', 'op', 'trans'] as const;
export type DimensionParam = (typeof DIMENSION_PARAMS)[number];

export const SEGMENT_PARAMS = ['total', 'crude', 'gas', 'unconventional', 'lowEmissions'] as const;
export type SegmentParam = (typeof SEGMENT_PARAMS)[number];

/** Module-level schema so the parsed value stays referentially stable. */
export const resultsSearchSchema = z.object({
  horizonte: z.enum(HORIZON_PARAMS).default('tbg'),
  categoria: z.string().optional(),
  /** Module 8 (TBG dimension weights) dimension tabs. */
  dimension: z.enum(DIMENSION_PARAMS).default('fin'),
  /** Module 6 (Future aspiration) segment chips. */
  segmento: z.enum(SEGMENT_PARAMS).default('total'),
  /** Module 4 (Company comparison) selected company tab; ids are dynamic (V-09 `companySet`). */
  empresa: z.string().optional(),
});

export const horizonFromParam = (param: HorizonParam): ResultsHorizon =>
  param === 'tbg-ilp' ? 'union' : param;

export const paramFromHorizon = (horizon: ResultsHorizon): HorizonParam =>
  horizon === 'union' ? 'tbg-ilp' : horizon;
