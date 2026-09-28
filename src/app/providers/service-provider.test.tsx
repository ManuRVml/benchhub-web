import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { isApiError } from '@/shared/api';

import {
  createServiceContainer,
  resolveApiMode,
  ServiceProvider,
  useServices,
} from './service-provider';

import type { ReactNode } from 'react';
import type { z } from 'zod';

const schema = {} as z.ZodType;

describe('ServiceContainer', () => {
  it('picks the mode from VITE_API_MODE, defaulting to mock', () => {
    expect(resolveApiMode('http')).toBe('http');
    expect(resolveApiMode('mock')).toBe('mock');
    expect(resolveApiMode(undefined)).toBe('mock');
  });

  it('builds the fetch client in http mode', async () => {
    const services = await createServiceContainer({ mode: 'http', onUnauthenticated: vi.fn() });
    expect(services.mode).toBe('http');
    expect(typeof services.http.get).toBe('function');
  });

  it('answers the ports from the mock adapters in mock mode; the raw client has no BFF', async () => {
    const services = await createServiceContainer({ mode: 'mock', onUnauthenticated: vi.fn() });
    const error: unknown = await services.http
      .get('/views/home', { schema })
      .catch((e: unknown) => e);
    expect(isApiError(error) && error.code).toBe('MOCK_NOT_IMPLEMENTED');
    const home = await services.home.getHomeView();
    expect(home.banner.status).toBe('ok');
  });

  it('exposes one port per screen / domain next to the client', async () => {
    const services = await createServiceContainer({ mode: 'http', onUnauthenticated: vi.fn() });
    expect(Object.keys(services).sort()).toEqual(
      [
        'admin',
        'analyses',
        'analysisDefinition',
        'analysisDrafts',
        'analysisEdits',
        'assistant',
        'assistantContext',
        'auth',
        'comments',
        'companyProfile',
        'comparisonProfileCommands',
        'comparisonProfiles',
        'home',
        'http',
        'indicatorDetail',
        'mode',
        'notifications',
        'operations',
        'presentationViews',
        'presentations',
        'previewInvitations',
        'reports',
        'results',
        'review',
        'savedViews',
        'sensitivities',
        'sensitivityViews',
        'settings',
        'settingsViews',
        'shell',
        'tbgViews',
        'valueMonitor',
        'valueMonitorViews',
        'visualization',
      ].sort(),
    );
    expect(typeof services.results.getResultsHeaderView).toBe('function');
  });
});

describe('useServices', () => {
  it('returns the container of the nearest ServiceProvider', async () => {
    const services = await createServiceContainer({ mode: 'mock', onUnauthenticated: vi.fn() });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ServiceProvider services={services}>{children}</ServiceProvider>
    );
    const { result } = renderHook(() => useServices(), { wrapper });
    expect(result.current).toBe(services);
  });

  it('throws outside a ServiceProvider', () => {
    function Consumer() {
      useServices();
      return <p>{'ok'}</p>;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow('useServices must be used inside <ServiceProvider>');
    expect(screen.queryByText('ok')).toBeNull();
    spy.mockRestore();
  });
});
