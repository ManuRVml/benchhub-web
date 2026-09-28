import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, queryKeys, TRACE_ID_HEADER } from '@/shared/api';
import { mockPayload } from '@/shared/api/mock';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import {
  useAddAnalysisCompany,
  useUpdateAnalysisDraft,
  useUpdateValueOverrides,
} from './use-analysis-commands';
import { useCompanyCoverageView } from './use-analysis-views';

import type { V10Response } from '@/shared/api';
import type { QueryClient } from '@tanstack/react-query';

const ANALYSIS = 'ana_01';
const COVERAGE_KEY = queryKeys.companyCoverage(ANALYSIS);

/** The first indicator of the selected company in a V-10 payload. */
function firstItem(view: V10Response) {
  if (view.selected.status !== 'ok')
    throw new Error('the V-10 fixture must have a selected company');
  const item = view.selected.data.groups[0]?.items[0];
  if (!item) throw new Error('the V-10 fixture must have an indicator');
  return {
    companyId: view.selected.data.companyId,
    indicatorId: item.indicatorId,
    value: item.value,
  };
}

function valueOf(view: V10Response | undefined, indicatorId: string): number | null | undefined {
  if (view?.selected.status !== 'ok') return undefined;
  return view.selected.data.groups
    .flatMap((group) => group.items)
    .find((item) => item.indicatorId === indicatorId)?.value;
}

/** Every value the cache holds for the V-10 indicator, in order (optimistic patch, rollback, refetch…). */
function recordValues(queryClient: QueryClient, indicatorId: string) {
  const history: (number | null | undefined)[] = [];
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || event.action.type !== 'success') return;
    if (JSON.stringify(event.query.queryKey) !== JSON.stringify(COVERAGE_KEY)) return;
    history.push(valueOf(event.query.state.data as V10Response | undefined, indicatorId));
  });
  return { history, unsubscribe };
}

describe('C-06 useUpdateValueOverrides', () => {
  it('shows the new value at once, rolls back on error, then refetches', async () => {
    const { wrapper, queryClient } = createQueryHarness();
    // The view is on screen (an active observer), so the invalidation after the command refetches it.
    const { result } = renderHook(
      () => ({ view: useCompanyCoverageView(ANALYSIS), command: useUpdateValueOverrides() }),
      { wrapper },
    );
    await vi.waitFor(() => {
      expect(result.current.view.isSuccess).toBe(true);
    });
    const seed = result.current.view.data;
    if (!seed) throw new Error('the coverage view must load');
    const { companyId, indicatorId, value: original } = firstItem(seed);
    const edited = original === 42 ? 43 : 42;

    // The PATCH fails only when the test says so; the refetch after the command answers a distinct server value.
    let failPatch: () => void = () => undefined;
    const serverValue = 7.5;
    const refetched = structuredClone(seed);
    if (refetched.selected.status === 'ok') {
      const first = refetched.selected.data.groups[0]?.items[0];
      if (first) first.value = serverValue;
    }
    server.use(
      http.patch(`${API_BASE_URL}/analyses/:analysisId/value-overrides`, async () => {
        await new Promise<void>((resolve) => {
          failPatch = resolve;
        });
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Valor inválido', traceId: 'trace-c06' },
          { status: 422, headers: { [TRACE_ID_HEADER]: 'trace-c06' } },
        );
      }),
      http.get(`${API_BASE_URL}/views/company-coverage/:analysisId`, () =>
        HttpResponse.json(refetched),
      ),
    );

    const { history, unsubscribe } = recordValues(queryClient, indicatorId);
    let outcome: Promise<unknown> = Promise.resolve();
    act(() => {
      outcome = result.current.command
        .mutateAsync({
          analysisId: ANALYSIS,
          body: { overrides: [{ companyId, indicatorId, value: edited, isEstimate: true }] },
        })
        .catch((error: unknown) => error);
    });

    await vi.waitFor(() => {
      expect(valueOf(queryClient.getQueryData(COVERAGE_KEY), indicatorId)).toBe(edited);
    });
    failPatch();
    const error = await act(() => outcome);
    unsubscribe();

    expect(error).toMatchObject({ code: 'VALIDATION_ERROR', status: 422, traceId: 'trace-c06' });
    // optimistic patch → rollback to the original → refetched server state
    expect(history).toEqual([edited, original, serverValue]);
    expect(valueOf(queryClient.getQueryData(COVERAGE_KEY), indicatorId)).toBe(serverValue);
  });
});

describe('invalidation after a command', () => {
  it('C-04 add company invalidates every view of that analysis only', async () => {
    const { wrapper, queryClient, services } = createQueryHarness();
    queryClient.setQueryData(COVERAGE_KEY, await services.results.getCompanyCoverageView(ANALYSIS));
    queryClient.setQueryData(
      queryKeys.companyCoverage('ana_02'),
      await mockPayload('getCompanyCoverageView'),
    );
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAddAnalysisCompany(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ analysisId: ANALYSIS, body: { companyId: 'cmp_repsol' } }),
    );

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.analysis(ANALYSIS) });
    expect(queryClient.getQueryState(COVERAGE_KEY)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.companyCoverage('ana_02'))?.isInvalidated).toBe(
      false,
    );
  });

  it('C-02 draft autosave invalidates the definition and validation views of the draft', async () => {
    const { wrapper, queryClient } = createQueryHarness();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateAnalysisDraft(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ draftId: 'drf_01', body: { step: 1, fields: { name: 'x' } } }),
    );
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.analysisDefinition('drf_01') });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.analysisValidation('drf_01') });
  });
});
