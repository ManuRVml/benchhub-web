import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { V36Response } from '@/shared/api';

// V-36 GE benchmark radar (SCR-11 section 10, gated): the first view in this entity to go through the typed
// `ValueMonitorViewPort` (P7-HOOKS), unlike V-27..V-30's hand-written hooks that predate it. The generated query
// params (`companies`, `year`, `category`, `compareWithPreviousYear`) exist on the schema but the port method takes
// none of them (adapters/http/views.ts posts a bare GET) — flagged for Nilo/BFF in the P5-54 reply. Until the port
// forwards them, the widget fetches the one full response and filters/toggles company series client-side.

export type ValueMonitorBenchmarkRadarView = V36Response;
export type BenchmarkRadarSection = V36Response['radar'];
export type BenchmarkRadarData = Extract<BenchmarkRadarSection, { status: 'ok' }>['data'];
export type BenchmarkRadarSeries = BenchmarkRadarData['series'][number];
export type BenchmarkRadarAxis = BenchmarkRadarData['axes'][number];
export type BenchmarkRankingSection = V36Response['ranking'];
export type BenchmarkRankingData = Extract<BenchmarkRankingSection, { status: 'ok' }>['data'];
export type BenchmarkInsightSection = V36Response['insight'];
export type BenchmarkInsightData = Extract<BenchmarkInsightSection, { status: 'ok' }>['data'];

/** V-36 benchmark radar of the Monitor de Valor. */
export function useValueMonitorBenchmarkRadarView() {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorBenchmarkRadar(),
    queryFn: ({ signal }) => valueMonitorViews.getValueMonitorBenchmarkRadarView({ signal }),
  });
}
