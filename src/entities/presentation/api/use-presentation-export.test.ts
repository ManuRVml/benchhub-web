import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { server } from '@/test/msw/server';
import { createQueryHarness } from '@/test/query-wrapper';

import { useExportPresentation } from './use-presentation-export';

import type { C14Response } from '@/shared/api/ports/responses';

const PRESENTATION_ID = 'prs_test_export';

/** Serves C-14 and returns a mutable reference to capture the POST body. */
function serve() {
  const capturedBody = { value: undefined as unknown };
  server.use(
    http.post(`${API_BASE_URL}/exports`, async ({ request }) => {
      capturedBody.value = await request.json();
      const response: C14Response = {
        operationId: 'op_test_export',
        status: 'accepted',
      };
      return HttpResponse.json(response);
    }),
  );
  return capturedBody;
}

describe('useExportPresentation (C-14)', () => {
  it('sends the correct body for presentation-pdf export', async () => {
    const capturedBody = serve();
    const harness = createQueryHarness();
    const { result } = renderHook(() => useExportPresentation(PRESENTATION_ID), {
      wrapper: harness.wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync('presentation-pdf');
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(capturedBody.value).toEqual({
      kind: 'presentation-pdf',
      params: { presentationId: PRESENTATION_ID },
    });
  });

  it('sends the correct body for presentation-pptx export', async () => {
    const capturedBody = serve();
    const harness = createQueryHarness();
    const { result } = renderHook(() => useExportPresentation(PRESENTATION_ID), {
      wrapper: harness.wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync('presentation-pptx');
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(capturedBody.value).toEqual({
      kind: 'presentation-pptx',
      params: { presentationId: PRESENTATION_ID },
    });
  });

  it('returns the operationId from the response', async () => {
    serve();
    const harness = createQueryHarness();
    const { result } = renderHook(() => useExportPresentation(PRESENTATION_ID), {
      wrapper: harness.wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync('presentation-pdf');
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({
      operationId: 'op_test_export',
      status: 'accepted',
    });
  });
});
