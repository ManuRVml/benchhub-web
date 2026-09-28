import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, createHttpClient, createHttpPorts } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { fetchSession, useSessionQuery } from './use-session-query';

import type { ServiceContainer } from '@/shared/api';

describe('useSessionQuery', () => {
  it('maps A-04 into the Session model (role, displayName, hasAdminAccess, canUseAssistant, navigation)', async () => {
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useSessionQuery(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({
      userId: 'usr_01J9Y7C2QK',
      displayName: 'Camila Bravo',
      role: 'analyst_creator',
      hasAdminAccess: false,
      canUseAssistant: true,
      navigation: [
        { id: 'inicio', labelKey: 'nav.inicio', to: '/inicio', isLocked: false },
        {
          id: 'ref-tbg-ilp',
          labelKey: 'nav.refTbgIlp',
          to: '/analisis?ref=tbg-ilp',
          isLocked: false,
        },
        {
          id: 'ref-competitivo',
          labelKey: 'nav.refCompetitivo',
          to: '/analisis/ana_01J9Y8D4T2/resultados',
          isLocked: false,
        },
        {
          id: 'monitor-valor',
          labelKey: 'nav.monitorValor',
          to: '/monitor-valor',
          isLocked: false,
        },
        {
          id: 'presentaciones',
          labelKey: 'nav.presentaciones',
          to: '/presentaciones',
          isLocked: false,
        },
        {
          id: 'notificaciones',
          labelKey: 'nav.notificaciones',
          to: '/notificaciones',
          isLocked: false,
        },
      ],
    });
  });

  it('passes through the real role the BFF sends, not a fixed one', async () => {
    server.use(
      http.get(`${API_BASE_URL}/session`, () =>
        HttpResponse.json({
          user: {
            id: 'usr_02',
            displayName: 'Jorge Salas',
            avatarFileId: null,
            roleLabelKey: 'role.executiveViewer',
          },
          role: 'executive_viewer',
          hasAdminAccess: true,
          requiresGate: false,
          navigation: [],
          analysisContext: { defaultAnalysisId: null },
          permissions: {},
        }),
      ),
    );
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useSessionQuery(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.role).toBe('executive_viewer');
    expect(result.current.data?.hasAdminAccess).toBe(true);
  });
});

describe('fetchSession', () => {
  it('resolves the mapped session on success', async () => {
    const { services } = createQueryHarness();
    const session = await fetchSession(services);
    expect(session).toMatchObject({ role: 'analyst_creator', hasAdminAccess: false });
  });

  it('resolves null on UNAUTHENTICATED (401) instead of throwing', async () => {
    server.use(
      http.get(`${API_BASE_URL}/session`, () =>
        HttpResponse.json(
          { code: 'UNAUTHENTICATED', message: 'Session expired', traceId: 't1' },
          { status: 401 },
        ),
      ),
    );
    const { services } = createQueryHarness();
    await expect(fetchSession(services)).resolves.toBeNull();
  });

  it('rethrows any other error', async () => {
    server.use(
      http.get(`${API_BASE_URL}/session`, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    const { services } = createQueryHarness();
    await expect(fetchSession(services)).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  it('http mode: a 401 during the bootstrap still calls onUnauthenticated (the login redirect)', async () => {
    server.use(
      http.get(`${API_BASE_URL}/session`, () =>
        HttpResponse.json(
          { code: 'UNAUTHENTICATED', message: 'Session expired', traceId: 't1' },
          { status: 401 },
        ),
      ),
    );
    const onUnauthenticated = vi.fn();
    const httpClient = createHttpClient({
      baseUrl: `${window.location.origin}${API_BASE_URL}`,
      onUnauthenticated,
    });
    const services: ServiceContainer = {
      ...createHttpPorts(httpClient),
      http: httpClient,
      mode: 'http',
    };

    await expect(fetchSession(services)).resolves.toBeNull();
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });
});
