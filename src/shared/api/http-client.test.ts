import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '../../../tools/test/msw/server';

import { ApiError } from './errors';
import {
  CreateAnalysisDraftResponse,
  DeleteSavedViewResponse,
  GetHomeViewResponse,
  UpdateAnalysisDraftResponse,
} from './generated/zod';
import { API_BASE_URL, createHttpClient, CSRF_HEADER, TRACE_ID_HEADER } from './http-client';

import type { V03Response } from './generated/model';

// jsdom's fetch (Node) needs absolute URLs, so the tests point the client at the page origin; the relative default is
// checked with a fetch spy.
const API = `${window.location.origin}${API_BASE_URL}`;
const TOKEN = 'csrf-token-1';

// A V-03 payload whose five sections are all forbidden: valid for the generated schema and short.
const HOME: V03Response = {
  banner: { status: 'forbidden' },
  executiveSummary: { status: 'forbidden' },
  enabledAnalyses: { status: 'forbidden' },
  peerNews: { status: 'forbidden' },
  marketIndicators: { status: 'forbidden' },
  permissions: { canViewAnalysisList: false },
};

const client = (onUnauthenticated = vi.fn()) =>
  createHttpClient({ baseUrl: API, onUnauthenticated });

/** GET /session answers `csrfToken` values in order (the last one repeats) and counts the calls. */
function sessionHandler(...tokens: string[]) {
  const calls = { count: 0 };
  server.use(
    http.get(`${API}/session`, () => {
      const token = tokens[Math.min(calls.count, tokens.length - 1)] ?? TOKEN;
      calls.count += 1;
      return HttpResponse.json({ user: { id: 'usr_ana' }, csrfToken: token });
    }),
  );
  return calls;
}

/** Every key and value of a Web Storage area, as one string. */
const storageText = (storage: Storage) =>
  Array.from({ length: storage.length }, (_, i) => {
    const key = storage.key(i) ?? '';
    return `${key}=${storage.getItem(key) ?? ''}`;
  }).join('\n');

async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error('expected the call to fail');
}

describe('httpClient responses', () => {
  it('returns the data typed by the generated schema when the payload is valid', async () => {
    server.use(http.get(`${API}/views/home`, () => HttpResponse.json(HOME)));
    const data: V03Response = await client().get('/views/home', { schema: GetHomeViewResponse });
    expect(data).toEqual(HOME);
  });

  it('throws INVALID_RESPONSE instead of returning a payload that breaks the contract', async () => {
    server.use(
      http.get(`${API}/views/home`, () =>
        HttpResponse.json(
          { ...HOME, banner: { status: 'broken' } },
          {
            headers: { [TRACE_ID_HEADER]: 'trace-invalid' },
          },
        ),
      ),
    );
    const error = await rejection(client().get('/views/home', { schema: GetHomeViewResponse }));
    expect(error.code).toBe('INVALID_RESPONSE');
    expect(error.status).toBe(200);
    expect(error.traceId).toBe('trace-invalid');
    expect(error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['banner'] })]),
    );
  });

  it('throws INVALID_RESPONSE for a body that is not JSON', async () => {
    server.use(http.get(`${API}/views/home`, () => HttpResponse.text('<html>')));
    const error = await rejection(client().get('/views/home', { schema: GetHomeViewResponse }));
    expect(error.code).toBe('INVALID_RESPONSE');
  });

  it('sends query parameters, lists comma-joined and empty values dropped', async () => {
    let url = '';
    server.use(
      http.get(`${API}/views/home`, ({ request }) => {
        url = request.url;
        return HttpResponse.json(HOME);
      }),
    );
    await client().get('/views/home', {
      schema: GetHomeViewResponse,
      query: { horizon: 'tbg', categories: ['rentabilidad', 'liquidez'], q: '', page: 2 },
    });
    expect(new URL(url).search).toBe('?horizon=tbg&categories=rentabilidad%2Cliquidez&page=2');
  });

  it('calls the relative /api/v1 root with cookies and JSON headers by default', async () => {
    const fetchSpy = vi.fn<typeof fetch>(() =>
      Promise.resolve(Response.json({ draftId: 'drf_01' })),
    );
    await createHttpClient({ fetch: fetchSpy }).get('/views/home', {
      schema: CreateAnalysisDraftResponse,
    });
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe('/api/v1/views/home');
    expect(init).toMatchObject({
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });
});

describe('httpClient errors', () => {
  it('propagates the ApiError body and the X-Trace-Id header', async () => {
    server.use(
      http.get(`${API}/views/home`, () =>
        HttpResponse.json(
          { code: 'NOT_FOUND', message: 'No existe', traceId: 'trace-body', details: { id: 'x' } },
          { status: 404, headers: { [TRACE_ID_HEADER]: 'trace-header' } },
        ),
      ),
    );
    const error = await rejection(client().get('/views/home', { schema: GetHomeViewResponse }));
    expect(error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'No existe',
      traceId: 'trace-header',
      status: 404,
      details: { id: 'x' },
    });
  });

  it('falls back to the body traceId and to HTTP_ERROR for a non-ApiError body', async () => {
    server.use(
      http.get(`${API}/views/home`, () =>
        HttpResponse.json(
          { code: 'PROVIDER_ERROR', message: 'Fallo', traceId: 'trace-body' },
          { status: 502 },
        ),
      ),
      http.get(`${API}/views/other`, () => new HttpResponse('Bad gateway', { status: 502 })),
    );
    const withBody = await rejection(client().get('/views/home', { schema: GetHomeViewResponse }));
    expect(withBody).toMatchObject({ code: 'PROVIDER_ERROR', traceId: 'trace-body' });
    const plain = await rejection(client().get('/views/other', { schema: GetHomeViewResponse }));
    expect(plain).toMatchObject({ code: 'HTTP_ERROR', status: 502, traceId: '' });
  });

  it('401 calls onUnauthenticated and throws UNAUTHENTICATED', async () => {
    server.use(
      http.get(`${API}/views/home`, () =>
        HttpResponse.json(
          { code: 'SESSION_EXPIRED', message: 'Sesión vencida', traceId: 't' },
          { status: 401, headers: { [TRACE_ID_HEADER]: 'trace-401' } },
        ),
      ),
    );
    const onUnauthenticated = vi.fn();
    const error = await rejection(
      client(onUnauthenticated).get('/views/home', { schema: GetHomeViewResponse }),
    );
    expect(error).toMatchObject({ code: 'UNAUTHENTICATED', status: 401, traceId: 'trace-401' });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('turns a network failure into NETWORK_ERROR', async () => {
    server.use(http.get(`${API}/views/home`, () => HttpResponse.error()));
    const error = await rejection(client().get('/views/home', { schema: GetHomeViewResponse }));
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', status: 0, traceId: '' });
  });

  it('rejects with the AbortError when the signal aborts, not with an ApiError', async () => {
    let release: () => void = () => undefined;
    server.use(
      http.get(`${API}/views/home`, async () => {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return HttpResponse.json(HOME);
      }),
    );
    const controller = new AbortController();
    const call = client().get('/views/home', {
      schema: GetHomeViewResponse,
      signal: controller.signal,
    });
    controller.abort();
    await expect(call).rejects.toMatchObject({ name: 'AbortError' });
    await expect(call).rejects.not.toBeInstanceOf(ApiError);
    release();
  });
});

describe('httpClient CSRF', () => {
  it('sends X-CSRF-Token on POST / PATCH / DELETE and never on GET', async () => {
    const session = sessionHandler(TOKEN);
    const seen: Record<string, string | null> = {};
    const record =
      (method: string) =>
      ({ request }: { request: Request }) => {
        seen[method] = request.headers.get(CSRF_HEADER);
        return undefined;
      };
    server.use(
      http.get(`${API}/views/home`, (info) => {
        record('GET')(info);
        return HttpResponse.json(HOME);
      }),
      http.post(`${API}/analysis-drafts`, (info) => {
        record('POST')(info);
        return HttpResponse.json({ draftId: 'drf_01' });
      }),
      http.patch(`${API}/analysis-drafts/drf_01`, (info) => {
        record('PATCH')(info);
        return HttpResponse.json({ validationState: { isValid: true, errors: [] } });
      }),
      http.delete(`${API}/saved-views/view_01`, (info) => {
        record('DELETE')(info);
        return HttpResponse.json({ deleted: true, viewId: 'view_01' });
      }),
    );
    const api = client();
    await api.get('/views/home', { schema: GetHomeViewResponse });
    await api.post(
      '/analysis-drafts',
      { type: 'generacion_valor' },
      {
        schema: CreateAnalysisDraftResponse,
      },
    );
    await api.patch(
      '/analysis-drafts/drf_01',
      { step: 2, fields: {} },
      {
        schema: UpdateAnalysisDraftResponse,
      },
    );
    await api.delete('/saved-views/view_01', undefined, { schema: DeleteSavedViewResponse });

    expect(seen.GET).toBeNull();
    expect(seen.POST).toBe(TOKEN);
    expect(seen.PATCH).toBe(TOKEN);
    expect(seen.DELETE).toBe(TOKEN);
    expect(session.count).toBe(1);
  });

  it('on 403 CSRF_INVALID refreshes the session once and retries once', async () => {
    const session = sessionHandler('stale-token', 'fresh-token');
    const sent: (string | null)[] = [];
    server.use(
      http.post(`${API}/analysis-drafts`, ({ request }) => {
        const token = request.headers.get(CSRF_HEADER);
        sent.push(token);
        return token === 'fresh-token'
          ? HttpResponse.json({ draftId: 'drf_02' })
          : HttpResponse.json(
              { code: 'CSRF_INVALID', message: 'Token CSRF inválido', traceId: 't' },
              { status: 403 },
            );
      }),
    );
    const data = await client().post(
      '/analysis-drafts',
      { type: 'generacion_valor' },
      {
        schema: CreateAnalysisDraftResponse,
      },
    );
    expect(data).toEqual({ draftId: 'drf_02' });
    expect(sent).toEqual(['stale-token', 'fresh-token']);
    expect(session.count).toBe(2);
  });

  it('surfaces the second CSRF_INVALID without another retry', async () => {
    const session = sessionHandler('stale-token', 'still-stale');
    let posts = 0;
    server.use(
      http.post(`${API}/analysis-drafts`, () => {
        posts += 1;
        return HttpResponse.json(
          { code: 'CSRF_INVALID', message: 'Token CSRF inválido', traceId: 'trace-csrf' },
          { status: 403 },
        );
      }),
    );
    const error = await rejection(
      client().post(
        '/analysis-drafts',
        { type: 'generacion_valor' },
        {
          schema: CreateAnalysisDraftResponse,
        },
      ),
    );
    expect(error).toMatchObject({ code: 'CSRF_INVALID', status: 403, traceId: 'trace-csrf' });
    expect(posts).toBe(2);
    expect(session.count).toBe(2);
  });

  it('does not retry a 403 that is not CSRF_INVALID', async () => {
    const session = sessionHandler(TOKEN);
    let posts = 0;
    server.use(
      http.post(`${API}/analysis-drafts`, () => {
        posts += 1;
        return HttpResponse.json(
          { code: 'FORBIDDEN', message: 'Sin permiso', traceId: 't' },
          { status: 403 },
        );
      }),
    );
    const error = await rejection(
      client().post(
        '/analysis-drafts',
        { type: 'generacion_valor' },
        {
          schema: CreateAnalysisDraftResponse,
        },
      ),
    );
    expect(error.code).toBe('FORBIDDEN');
    expect(posts).toBe(1);
    expect(session.count).toBe(1);
  });

  it('keeps the token in memory only', async () => {
    sessionHandler(TOKEN);
    server.use(http.post(`${API}/analysis-drafts`, () => HttpResponse.json({ draftId: 'drf_01' })));
    await client().post(
      '/analysis-drafts',
      { type: 'generacion_valor' },
      {
        schema: CreateAnalysisDraftResponse,
      },
    );
    expect(storageText(localStorage)).not.toContain(TOKEN);
    expect(storageText(sessionStorage)).not.toContain(TOKEN);
    expect(document.cookie).not.toContain(TOKEN);
  });
});

describe('httpClient anonymous calls (A-05 password login)', () => {
  it('sends no CSRF token and never fetches the session first', async () => {
    const session = sessionHandler(TOKEN);
    let csrf: string | null = 'unset';
    server.use(
      http.post(`${API}/auth/password-login`, ({ request }) => {
        csrf = request.headers.get(CSRF_HEADER);
        return HttpResponse.json({ draftId: 'drf_01' });
      }),
    );
    await client().post(
      '/auth/password-login',
      { username: 'u@example.com', password: 'pw' },
      { schema: CreateAnalysisDraftResponse, anonymous: true },
    );
    expect(csrf).toBeNull();
    expect(session.count).toBe(0);
  });

  it('keeps the BFF code of a 401 and does not call onUnauthenticated', async () => {
    server.use(
      http.post(`${API}/auth/password-login`, () =>
        HttpResponse.json(
          { code: 'INVALID_CREDENTIALS', message: 'The username or password is incorrect' },
          { status: 401, headers: { [TRACE_ID_HEADER]: 'trace-a05' } },
        ),
      ),
    );
    const onUnauthenticated = vi.fn();
    const error = await rejection(
      client(onUnauthenticated).post(
        '/auth/password-login',
        { username: 'u@example.com', password: 'pw' },
        { schema: CreateAnalysisDraftResponse, anonymous: true },
      ),
    );
    expect(error).toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401, traceId: 'trace-a05' });
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });
});
