import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useNotificationsView } from './use-notifications-view';

const PATH = `${API_BASE_URL}/views/notifications`;

function captureNotifications() {
  const seen: string[] = [];
  server.use(
    http.get(PATH, ({ request }) => {
      const url = new URL(request.url);
      seen.push(`${url.pathname}${url.search}`);
      return HttpResponse.json({
        items: [],
        page: 1,
        pageSize: 20,
        totalItems: 0,
        unreadCount: 0,
        permissions: {},
      });
    }),
  );
  return seen;
}

describe('useNotificationsView (V-44)', () => {
  it('forwards q and severity filters to its server-side query', async () => {
    const seen = captureNotifications();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(
      () => useNotificationsView({ q: 'chevron', severity: ['error', 'warn'] }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(seen).toEqual([`${PATH}?q=chevron&severity=error%2Cwarn`]);
  });
});
