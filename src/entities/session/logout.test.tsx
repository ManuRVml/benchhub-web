import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { server } from '@/test/msw/server';
import { createQueryHarness } from '@/test/query-wrapper';

import { useLogout } from './logout';

function stubAssign() {
  const assign = vi.fn();
  vi.stubGlobal('location', { assign, origin: window.location.origin, href: window.location.href });
  return assign;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useLogout (F15)', () => {
  it('calls A-03 once, waits for it, then reloads on /login', async () => {
    const calls: string[] = [];
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () => {
        calls.push('logout');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useLogout(), { wrapper });
    const assign = stubAssign();
    assign.mockImplementation(() => {
      calls.push('reload');
    });

    await result.current();

    // The reload must come after A-03 settles, or the unload could cut the logout request short.
    expect(calls).toEqual(['logout', 'reload']);
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('still reloads on /login when A-03 fails', async () => {
    server.use(http.post(`${API_BASE_URL}/auth/logout`, () => HttpResponse.error()));
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useLogout(), { wrapper });
    const assign = stubAssign();

    await result.current();

    expect(assign).toHaveBeenCalledWith('/login');
  });
});
