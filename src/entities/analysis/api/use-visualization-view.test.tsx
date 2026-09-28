import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import v20Fixture from '../../../test/fixtures/contracts/V-20.response.json';
import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useVisualizationView } from './use-visualization-view';

import type { V20Response } from '@/shared/api';

const VISUALIZATION_PATH = `${API_BASE_URL}/views/visualization/:analysisId`;

describe('useVisualizationView', () => {
  it('preserves a heatmap section error while the other V-20 sections resolve', async () => {
    const view = {
      ...v20Fixture,
      heatmap: { status: 'error', errorCode: 'PROVIDER_ERROR' },
    } as V20Response;
    server.use(http.get(VISUALIZATION_PATH, () => HttpResponse.json(view)));

    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useVisualizationView('ana_1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.heatmap).toEqual({ status: 'error', errorCode: 'PROVIDER_ERROR' });
    expect(result.current.data?.kpiTiles.status).toBe('ok');
    expect(result.current.data?.radar.status).toBe('ok');
    expect(result.current.data?.categories.status).toBe('ok');
    expect(result.current.data?.weightComposition.status).toBe('ok');
  });
});
