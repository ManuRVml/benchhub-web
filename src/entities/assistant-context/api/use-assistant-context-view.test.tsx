import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useAssistantContextView } from './use-assistant-context-view';

const PATH = `${API_BASE_URL}/views/assistant-context`;

/** V-46 served by MSW; returns the pathname + query string of every request it received. */
function captureContext() {
  const seen: string[] = [];
  server.use(
    http.get(PATH, ({ request }) => {
      const url = new URL(request.url);
      seen.push(`${url.pathname}${url.search}`);
      return HttpResponse.json({
        proactiveTip: { id: 'tip_1', text: 'Hola, soy Yarbis.', aiStatus: 'suggestion' },
        suggestions: ['¿Cómo está Ecopetrol vs. pares?'],
        permissions: { canUseAssistant: true },
      });
    }),
  );
  return seen;
}

describe('useAssistantContextView (V-46)', () => {
  it('sends screen=inicio alone on the home screen, and returns the tip and chips', async () => {
    const seen = captureContext();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useAssistantContextView('inicio'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(seen).toEqual([`${PATH}?screen=inicio`]);
    expect(result.current.data?.proactiveTip?.text).toBe('Hola, soy Yarbis.');
    expect(result.current.data?.suggestions).toEqual(['¿Cómo está Ecopetrol vs. pares?']);
  });

  it('sends screen and analysisId on an analysis screen', async () => {
    const seen = captureContext();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useAssistantContextView('resultados', 'ana_01'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(seen).toEqual([`${PATH}?screen=resultados&analysisId=ana_01`]);
  });

  it('keeps one cache entry per screen and analysis: another screen is another request', async () => {
    const seen = captureContext();
    const { wrapper } = createQueryHarness();
    interface Props {
      screen: 'inicio' | 'resultados';
      analysisId?: string;
    }
    const { result, rerender } = renderHook(
      ({ screen, analysisId }: Props) => useAssistantContextView(screen, analysisId),
      { wrapper, initialProps: { screen: 'inicio' } },
    );
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    rerender({ screen: 'resultados', analysisId: 'ana_01' });
    await waitFor(() => {
      expect(seen).toHaveLength(2);
    });
    expect(seen).toEqual([`${PATH}?screen=inicio`, `${PATH}?screen=resultados&analysisId=ana_01`]);

    rerender({ screen: 'inicio' });
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    expect(seen).toHaveLength(2);
  });

  it('does not request anything while disabled', () => {
    const seen = captureContext();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(
      () => useAssistantContextView('inicio', undefined, { enabled: false }),
      {
        wrapper,
      },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(seen).toEqual([]);
  });
});
