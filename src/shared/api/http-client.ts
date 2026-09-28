import { encodeQueryValue } from '@/shared/lib/url';

import { createCsrfTokenStore, sessionCsrfSchema } from './csrf';
import { ApiError, apiErrorBodySchema } from './errors';

import type { CsrfTokenStore } from './csrf';
import type { QueryValue } from '@/shared/lib/url';
import type { z } from 'zod';

/** Every call is relative to the BFF API root (brief §4, ADR-0004): Vite proxies it in development. */
export const API_BASE_URL = '/api/v1';
/** BFF session endpoint; its `csrfToken` protects every unsafe method (BFF ADR-0004 §6). */
export const SESSION_ENDPOINT = '/session';
export const CSRF_HEADER = 'X-CSRF-Token';
export const TRACE_ID_HEADER = 'X-Trace-Id';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryParams = Readonly<Record<string, QueryValue>>;

export interface HttpClientOptions {
  /** API root; default `/api/v1`. */
  baseUrl?: string;
  /** Called once per 401 before the UNAUTHENTICATED error is thrown; the app navigates to the login route. */
  onUnauthenticated?: () => void;
  /** fetch implementation (tests); default the global fetch. */
  fetch?: typeof fetch;
}

export interface RequestOptions<S extends z.ZodType> {
  /** Generated Zod schema of the response (`src/shared/api/generated/zod.ts`); the data is returned only if it parses. */
  schema: S;
  signal?: AbortSignal;
  /**
   * A call that needs no session (A-05 password login): no CSRF token is fetched or sent, and a 401 keeps the BFF's
   * own error code (e.g. `INVALID_CREDENTIALS`) instead of becoming `UNAUTHENTICATED` + `onUnauthenticated()`.
   */
  anonymous?: boolean;
}

export interface GetOptions<S extends z.ZodType> extends RequestOptions<S> {
  /** Query parameters; lists are comma-joined and empty values dropped, as in `routes.<key>.build()`. */
  query?: QueryParams;
}

export interface HttpClient {
  get<S extends z.ZodType>(path: string, options: GetOptions<S>): Promise<z.output<S>>;
  post<S extends z.ZodType>(
    path: string,
    body: unknown,
    options: RequestOptions<S>,
  ): Promise<z.output<S>>;
  put<S extends z.ZodType>(
    path: string,
    body: unknown,
    options: RequestOptions<S>,
  ): Promise<z.output<S>>;
  patch<S extends z.ZodType>(
    path: string,
    body: unknown,
    options: RequestOptions<S>,
  ): Promise<z.output<S>>;
  delete<S extends z.ZodType>(
    path: string,
    body: unknown,
    options: RequestOptions<S>,
  ): Promise<z.output<S>>;
}

interface Call {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
  anonymous?: boolean;
}

const isUnsafe = (method: HttpMethod) => method !== 'GET';

function buildUrl(baseUrl: string, path: string, query: QueryParams | undefined): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    const encoded = encodeQueryValue(value);
    if (encoded !== null) qs.set(key, encoded);
  }
  const text = qs.toString();
  return `${baseUrl}${path}${text ? `?${text}` : ''}`;
}

const isAbort = (error: unknown, signal: AbortSignal | undefined) =>
  signal?.aborted === true || (error instanceof DOMException && error.name === 'AbortError');

async function readJson(response: Response): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const text = await response.text();
  if (text === '') return { ok: true, value: undefined };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/**
 * fetch client of the BFF (brief §4, ADR-0004): relative `/api/v1`, cookies included, JSON in and out.
 * - Every response is parsed with the generated Zod schema the caller passes; a mismatch throws
 *   `ApiError { code: 'INVALID_RESPONSE' }`, so unvalidated data never reaches the app.
 * - Unsafe methods send `X-CSRF-Token` from the in-memory session token; on 403 `CSRF_INVALID` the token is refreshed
 *   once and the call retried once.
 * - Errors are `ApiError { code, message, traceId, status, details? }`; `traceId` comes from `X-Trace-Id`. 401 calls
 *   `onUnauthenticated()` and throws `UNAUTHENTICATED`; no response throws `NETWORK_ERROR`. An aborted call rejects
 *   with the fetch `AbortError` unchanged, so query libraries see a cancellation, not a failure.
 */
export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const doFetch: typeof fetch = (...args) => (options.fetch ?? fetch)(...args);

  async function send(call: Call, csrfToken?: string): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (call.body !== undefined) headers['Content-Type'] = 'application/json';
    if (csrfToken !== undefined) headers[CSRF_HEADER] = csrfToken;
    try {
      return await doFetch(buildUrl(baseUrl, call.path, call.query), {
        method: call.method,
        credentials: 'include',
        headers,
        ...(call.body === undefined ? {} : { body: JSON.stringify(call.body) }),
        ...(call.signal ? { signal: call.signal } : {}),
      });
    } catch (error) {
      if (isAbort(error, call.signal)) throw error;
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        traceId: '',
        status: 0,
      });
    }
  }

  async function toApiError(response: Response, anonymous = false): Promise<ApiError> {
    const headerTraceId = response.headers.get(TRACE_ID_HEADER);
    const json = await readJson(response);
    const body = json.ok ? apiErrorBodySchema.safeParse(json.value) : null;
    const traceId = headerTraceId ?? (body?.success ? body.data.traceId : undefined) ?? '';
    if (response.status === 401 && !anonymous) {
      return new ApiError({
        code: 'UNAUTHENTICATED',
        message: body?.success ? body.data.message : 'Session expired',
        traceId,
        status: 401,
      });
    }
    if (body?.success) {
      return new ApiError({ ...body.data, traceId, status: response.status });
    }
    return new ApiError({
      code: 'HTTP_ERROR',
      message: `HTTP ${String(response.status)}`,
      traceId,
      status: response.status,
    });
  }

  async function fail(response: Response, anonymous = false): Promise<never> {
    const error = await toApiError(response, anonymous);
    if (error.code === 'UNAUTHENTICATED' && !anonymous) {
      csrf.clear();
      options.onUnauthenticated?.();
    }
    throw error;
  }

  async function parse<S extends z.ZodType>(response: Response, schema: S): Promise<z.output<S>> {
    const traceId = response.headers.get(TRACE_ID_HEADER) ?? '';
    const json = await readJson(response);
    if (!json.ok) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'The response is not JSON',
        traceId,
        status: response.status,
      });
    }
    const result = schema.safeParse(json.value);
    if (!result.success) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'The response does not match the contract',
        traceId,
        status: response.status,
        details: result.error.issues.map(({ path, code, message }) => ({ path, code, message })),
      });
    }
    return result.data;
  }

  const csrf: CsrfTokenStore = createCsrfTokenStore(async () => {
    const response = await send({ method: 'GET', path: SESSION_ENDPOINT });
    if (!response.ok) return fail(response);
    return (await parse(response, sessionCsrfSchema)).csrfToken;
  });

  async function request<S extends z.ZodType>(call: Call, schema: S): Promise<z.output<S>> {
    const anonymous = call.anonymous === true;
    const protectedUnsafe = isUnsafe(call.method) && !anonymous;
    let response = await send(call, protectedUnsafe ? await csrf.get() : undefined);
    if (response.status === 403 && protectedUnsafe) {
      const error = await toApiError(response.clone());
      if (error.code === 'CSRF_INVALID') {
        response = await send(call, await csrf.refresh());
      }
    }
    if (!response.ok) return fail(response, anonymous);
    return parse(response, schema);
  }

  const withBody =
    (method: HttpMethod) =>
    <S extends z.ZodType>(
      path: string,
      body: unknown,
      { schema, signal, anonymous }: RequestOptions<S>,
    ) =>
      request(
        { method, path, body, ...(signal ? { signal } : {}), ...(anonymous ? { anonymous } : {}) },
        schema,
      );

  return {
    get: (path, { schema, query, signal }) =>
      request(
        { method: 'GET', path, ...(query ? { query } : {}), ...(signal ? { signal } : {}) },
        schema,
      ),
    post: withBody('POST'),
    put: withBody('PUT'),
    patch: withBody('PATCH'),
    delete: withBody('DELETE'),
  };
}
