import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { mockResponse } from '@/shared/api/mock';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useValueMonitorConfigurationView } from './use-value-monitor-configuration-view';

describe('useValueMonitorConfigurationView (V-32 through the typed port)', () => {
  it('requests /views/value-monitor-configuration with no query, even for a given snapshot', async () => {
    const payload = await mockResponse('getValueMonitorConfigurationView');
    const seen: URL[] = [];
    server.use(
      http.get(`${API_BASE_URL}/views/value-monitor-configuration`, ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json(payload);
      }),
    );
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useValueMonitorConfigurationView('2026-04'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-configuration`);
    expect(seen[0]?.search).toBe('');
    expect(result.current.data).toEqual(payload);
  });
});
