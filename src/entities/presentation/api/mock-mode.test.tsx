import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { server } from '../../../test/msw/server';

import { usePresentationDetail, usePresentationSlides } from './presentation-views';
import { useMediatedDownload } from './use-mediated-download';
import { useOperationStatus } from './use-operation-status';
import { usePresentationBuilderView } from './use-presentation-builder-view';
import { useUpdatePresentationBuilder } from './use-presentation-commands';
import { useCreatePresentationComment } from './use-presentation-comment';
import { usePresentationsView } from './use-presentations-view';
import { useGenerateSlideCommentDraft } from './use-slide-comment-draft';

import type { ServiceContainer } from '@/shared/api';
import type { ReactNode } from 'react';

// The mock-mode regression class: in `VITE_API_MODE=mock` there is no BFF and the raw client rejects every call, so a
// hook that still went through `services.http` would sit in its error state. These run every presentation hook against
// the real mock adapters with a raw client whose fetch always rejects and no MSW handler registered: only the typed
// ports can answer.

const noNetwork = vi.fn(() => Promise.reject(new TypeError('mock mode has no network')));

function mockModeServices(overrides: Partial<ServiceContainer> = {}): ServiceContainer {
  return {
    ...createMockPorts(),
    http: createHttpClient({ fetch: noNetwork }),
    mode: 'mock',
    ...overrides,
  };
}

function wrapperFor(services: ServiceContainer) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ServiceContext.Provider>
    );
  };
}

// Strict guard: MSW answers EVERY raw network request with a network error, so a hook that bypassed the ports through
// the raw client stub or a raw global fetch fails here instead of being served by a default handler.
beforeEach(() => {
  server.use(http.all('*', () => HttpResponse.error()));
});

afterEach(() => {
  noNetwork.mockClear();
  vi.restoreAllMocks();
});

describe('presentation hooks in mock mode (real mock adapter, no network)', () => {
  it('the strict guard is live: a raw global fetch to the BFF fails', async () => {
    await expect(fetch('/api/v1/views/presentations')).rejects.toThrow();
  });

  it('V-40 the list', async () => {
    const { result } = renderHook(() => usePresentationsView(), {
      wrapper: wrapperFor(mockModeServices()),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.items.map((item) => item.id)).toContain('prs_directorio_t4');
  });

  it('V-41 the builder, V-43 the detail and V-42 the slides', async () => {
    const wrapper = wrapperFor(mockModeServices());
    const builder = renderHook(() => usePresentationBuilderView('prs_directorio_t4'), { wrapper });
    const detail = renderHook(() => usePresentationDetail('prs_directorio_t4'), { wrapper });
    const slides = renderHook(
      () =>
        usePresentationSlides(
          'prs_directorio_t4',
          '/api/v1/views/presentation-slides/prs_directorio_t4',
        ),
      { wrapper },
    );
    await waitFor(() => {
      expect(builder.result.current.isSuccess).toBe(true);
      expect(detail.result.current.isSuccess).toBe(true);
      expect(slides.result.current.isSuccess).toBe(true);
    });
    expect(builder.result.current.data?.modules.length).toBeGreaterThan(0);
    expect(detail.result.current.data?.meta.name).toBe('Directorio Ejecutivo T4');
    expect(slides.result.current.data?.slides.length).toBeGreaterThan(0);
    expect(noNetwork).not.toHaveBeenCalled();
  });

  it('O-01 the operation status', async () => {
    const { result } = renderHook(() => useOperationStatus('op_01J9ZM0Q4A'), {
      wrapper: wrapperFor(mockModeServices()),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.id).toBe('op_01J9ZM0Q4A');
  });
});

describe('presentation commands in mock mode (real mock adapter, no network)', () => {
  it('C-28 autosaves the builder: a one-field meta patch completes from the cached V-41 builder', async () => {
    const wrapper = wrapperFor(mockModeServices());
    const builder = renderHook(() => usePresentationBuilderView('prs_directorio_t4'), { wrapper });
    await waitFor(() => {
      expect(builder.result.current.isSuccess).toBe(true);
    });
    const update = renderHook(() => useUpdatePresentationBuilder('prs_directorio_t4'), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ meta: { title: 'Nuevo título' } });
    });
    expect(noNetwork).not.toHaveBeenCalled();
  });

  it('C-10 comments on a presentation and C-32 drafts a slide comment', async () => {
    const wrapper = wrapperFor(mockModeServices());
    const comment = renderHook(() => useCreatePresentationComment('prs_directorio_t4'), {
      wrapper,
    });
    const draft = renderHook(() => useGenerateSlideCommentDraft(), { wrapper });
    await act(async () => {
      const created = await comment.result.current.mutateAsync({ text: 'Lista para el comité' });
      expect(created.status).toBe('pending');
      const suggestion = await draft.result.current.mutateAsync({
        presentationId: 'prs_directorio_t4',
        slideKey: 'title',
        language: 'es',
      });
      expect(suggestion.status).toBe('suggestion');
    });
    expect(noNetwork).not.toHaveBeenCalled();
  });
});

describe('useMediatedDownload (O-03)', () => {
  it('downloads through the downloadFile port only: never the raw client or a raw fetch, and saves the blob under the given name', async () => {
    const blob = new Blob(['deck'], { type: 'application/octet-stream' });
    const downloadFile = vi.fn(() => Promise.resolve(blob));
    const services = mockModeServices({
      operations: { ...createMockPorts().operations, downloadFile },
    });
    const globalFetch = vi.spyOn(globalThis, 'fetch');
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const saved: { href: string; download: string }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(
      this: HTMLAnchorElement,
    ) {
      saved.push({ href: this.href, download: this.download });
    });

    const { result } = renderHook(() => useMediatedDownload(), {
      wrapper: wrapperFor(services),
    });
    await act(async () => {
      await result.current.mutateAsync({ fileId: 'file_01', fileName: 'deck.pptx' });
    });

    expect(downloadFile).toHaveBeenCalledTimes(1);
    expect(downloadFile).toHaveBeenCalledWith('file_01');
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(saved).toEqual([{ href: 'blob:mock-url', download: 'deck.pptx' }]);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(noNetwork).not.toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('works in mock mode with the default mock downloadFile (no network)', async () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { result } = renderHook(() => useMediatedDownload(), {
      wrapper: wrapperFor(mockModeServices()),
    });
    await act(async () => {
      await result.current.mutateAsync({ fileId: 'file_01', fileName: 'deck.pptx' });
    });
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(noNetwork).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
