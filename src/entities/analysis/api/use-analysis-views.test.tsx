import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL, queryKeys } from '@/shared/api';

import { scenarioHandlers } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import {
  useAiFindingsView,
  useAnalysesView,
  useAnalysisDefinitionView,
  useAnalysisValidationView,
  useCompanyComparisonView,
  useCompanyCoverageView,
  useCompetitorCatalogView,
  useIndicatorCatalogView,
  usePeerAverageComparisonView,
  useReportSummaryView,
  useResultsHeaderView,
} from './use-analysis-views';

import type { V09Response } from '@/shared/api';

const HOOKS: [string, () => { isSuccess: boolean; data: unknown }][] = [
  ['useAnalysesView', () => useAnalysesView()],
  ['useAnalysisDefinitionView', () => useAnalysisDefinitionView('drf_01')],
  ['useCompetitorCatalogView', () => useCompetitorCatalogView()],
  ['useIndicatorCatalogView', () => useIndicatorCatalogView()],
  ['useAnalysisValidationView', () => useAnalysisValidationView('drf_01')],
  ['useResultsHeaderView', () => useResultsHeaderView('ana_01')],
  ['useCompanyCoverageView', () => useCompanyCoverageView('ana_01')],
  ['usePeerAverageComparisonView', () => usePeerAverageComparisonView('ana_01')],
  ['useCompanyComparisonView', () => useCompanyComparisonView('ana_01')],
  ['useReportSummaryView', () => useReportSummaryView('ana_01')],
  ['useAiFindingsView', () => useAiFindingsView('ana_01')],
];

describe('analysis view hooks', () => {
  it.each(HOOKS)('%s loads its view (ok scenario)', async (_name, hook) => {
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(hook, { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeTruthy();
  });

  it('keys the per-analysis views under queryKeys.analysis(id)', async () => {
    const { wrapper, queryClient } = createQueryHarness();
    const { result } = renderHook(() => useResultsHeaderView('ana_01'), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    const data: V09Response | undefined = queryClient.getQueryData(
      queryKeys.resultsHeader('ana_01'),
    );
    expect(data?.analysis.lifecycleState).toBe('preparation');
    expect(queryClient.getQueriesData({ queryKey: queryKeys.analysis('ana_01') })).toHaveLength(1);
  });

  it('fetches V-09 and V-14 per horizon: ?horizon= on the request and one cache entry per horizon', async () => {
    const seen: string[] = [];
    server.events.on('request:start', ({ request }) => {
      const url = new URL(request.url);
      const view = /\/views\/(results-header|ai-findings)\//.exec(url.pathname)?.[1];
      if (view) seen.push(`${view}?${url.searchParams.get('horizon') ?? ''}`);
    });
    const { wrapper, queryClient } = createQueryHarness();
    const { result, rerender } = renderHook(
      ({ horizon }: { horizon: 'tbg' | 'ilp' | 'union' }) => ({
        header: useResultsHeaderView('ana_01', horizon),
        findings: useAiFindingsView('ana_01', horizon),
      }),
      { wrapper, initialProps: { horizon: 'tbg' } },
    );
    await waitFor(() => {
      expect(result.current.header.isSuccess && result.current.findings.isSuccess).toBe(true);
    });
    rerender({ horizon: 'union' });
    await waitFor(() => {
      expect(queryClient.getQueryData(queryKeys.resultsHeader('ana_01', 'union'))).toBeDefined();
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(queryKeys.aiFindings('ana_01', 'union'))).toBeDefined();
    });
    server.events.removeAllListeners();
    expect(queryClient.getQueryData(queryKeys.resultsHeader('ana_01', 'tbg'))).toBeDefined();
    expect(queryClient.getQueriesData({ queryKey: queryKeys.analysis('ana_01') })).toHaveLength(4);
    expect(seen).toEqual(
      expect.arrayContaining([
        'results-header?tbg',
        'results-header?union',
        'ai-findings?tbg',
        'ai-findings?union',
      ]),
    );
  });

  it('accepts a V-09 module id the generated contract does not know (adapter widening)', async () => {
    const v09 = {
      analysis: {
        id: 'ana_01',
        title: 'Desempeño comparativo — 4T 2025',
        status: 'in_review',
        lifecycleState: 'preparation',
        periodLabel: { year: 2025, quarter: 4 },
      },
      horizon: 'tbg',
      horizonOptions: [{ id: 'tbg', labelKey: 'results.horizon.tbg' }],
      modules: [
        { id: 'companyCoverage', order: 1, isGated: false, visibleInHorizons: ['tbg'] },
        { id: 'esgScorecard', order: 2, isGated: false, visibleInHorizons: ['tbg'] },
      ],
      companySet: [],
      analysisTabs: [{ id: 'results', isEnabled: true, presentationId: null }],
      permissions: {},
    };
    server.use(
      http.get(`${API_BASE_URL}/views/results-header/:analysisId`, () => HttpResponse.json(v09)),
    );
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useResultsHeaderView('ana_01'), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.modules.map((m) => m.id)).toEqual([
      'companyCoverage',
      'esgScorecard',
    ]);
  });

  it('stays idle without an id', () => {
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useResultsHeaderView(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('forbidden: surfaces the 403 ApiError', async () => {
    server.use(...scenarioHandlers('forbidden'));
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useCompanyCoverageView('ana_01'), { wrapper });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.code).toBe('FORBIDDEN');
  });
});
