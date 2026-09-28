import { ApiError, apiErrorBodySchema } from './errors';
import { API_BASE_URL, CSRF_HEADER, TRACE_ID_HEADER } from './http-client';

import type { CsrfTokenStore } from './csrf';
import type { z } from 'zod';

/** One `text/event-stream` message: its `event` name (default `message`) and its joined `data` lines. */
export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Splits a `text/event-stream` body into messages (WHATWG HTML §9.2 "Server-sent events"): `data:` lines are joined
 * with "\n", a blank line dispatches, `:` lines are comments, CR / CRLF / LF all end a line. Messages without data are
 * not dispatched, and a message cut off by the end of the stream is dropped, as EventSource does.
 */
export async function* readSseMessages(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let event = '';
  let data: string[] = [];

  const lineOf = (raw: string): SseMessage | null => {
    if (raw === '') {
      const message = data.length > 0 ? { event: event || 'message', data: data.join('\n') } : null;
      event = '';
      data = [];
      return message;
    }
    if (raw.startsWith(':')) return null;
    const colon = raw.indexOf(':');
    const field = colon === -1 ? raw : raw.slice(0, colon);
    const value = colon === -1 ? '' : raw.slice(colon + 1).replace(/^ /, '');
    if (field === 'data') data.push(value);
    else if (field === 'event') event = value;
    return null;
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      // A CR at the end of a chunk may be the first half of a CRLF: hold it until the next chunk shows.
      const hold = !done && buffer.endsWith('\r') ? '\r' : '';
      const lines = (hold ? buffer.slice(0, -1) : buffer).split(/\r\n|\r|\n/);
      // The last piece is an unfinished line: keep it for the next chunk. At the end of the stream it is dropped, with
      // any message still waiting for its blank line (as EventSource does).
      buffer = (lines.pop() ?? '') + hold;
      for (const line of lines) {
        const message = lineOf(line);
        if (message) yield message;
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}

export interface SseClientOptions {
  /** CSRF token store of the session (P5-01), required by POST streams. */
  csrf?: CsrfTokenStore;
  /** API root; default `/api/v1`. */
  baseUrl?: string;
  /** Called once per 401 before the UNAUTHENTICATED error is thrown. */
  onUnauthenticated?: () => void;
  /** fetch implementation (tests); default the global fetch. */
  fetch?: typeof fetch;
}

export interface SseStreamOptions<S extends z.ZodType> {
  /** Zod schema of one event's JSON `data`; an event that does not parse ends the stream with INVALID_RESPONSE. */
  schema: S;
  signal?: AbortSignal;
}

export interface SseClient {
  /** POSTs `body` as JSON and yields every event of the `text/event-stream` answer, validated by `schema`. */
  post<S extends z.ZodType>(
    path: string,
    body: unknown,
    options: SseStreamOptions<S>,
  ): AsyncGenerator<z.output<S>>;
  /** GETs an operation event stream; O-02 is session-authenticated but not CSRF-protected. */
  get<S extends z.ZodType>(path: string, options: SseStreamOptions<S>): AsyncGenerator<z.output<S>>;
}

async function toApiError(response: Response): Promise<ApiError> {
  const headerTraceId = response.headers.get(TRACE_ID_HEADER);
  let body: z.infer<typeof apiErrorBodySchema> | null;
  try {
    const parsed = apiErrorBodySchema.safeParse(JSON.parse(await response.text()));
    body = parsed.success ? parsed.data : null;
  } catch {
    body = null;
  }
  const traceId = headerTraceId ?? body?.traceId ?? '';
  if (response.status === 401) {
    return new ApiError({
      code: 'UNAUTHENTICATED',
      message: body?.message ?? 'Session expired',
      traceId,
      status: 401,
    });
  }
  if (body)
    return new ApiError({
      ...body,
      traceId,
      status: response.status,
    });
  return new ApiError({
    code: 'HTTP_ERROR',
    message: `HTTP ${String(response.status)}`,
    traceId,
    status: response.status,
  });
}

/**
 * Streaming counterpart of the http client for Server-Sent Events answers (C-33 Yarbis chat): fetch + ReadableStream,
 * because EventSource can neither POST a body nor send the CSRF header. Same rules as `createHttpClient`: relative
 * `/api/v1`, cookies included, `X-CSRF-Token` from the session store with one refresh + retry on 403 CSRF_INVALID,
 * errors as `ApiError`, every event validated by the caller's Zod schema. Aborting the signal cancels the stream.
 */
export function createSseClient(options: SseClientOptions): SseClient {
  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const doFetch: typeof fetch = (...args) => (options.fetch ?? fetch)(...args);

  async function send(
    path: string,
    method: 'GET' | 'POST',
    signal?: AbortSignal,
    body?: unknown,
    csrfToken?: string,
  ) {
    try {
      return await doFetch(`${baseUrl}${path}`, {
        method,
        credentials: 'include',
        headers: {
          Accept: 'text/event-stream',
          ...(method === 'POST' ? { 'Content-Type': 'application/json', [CSRF_HEADER]: csrfToken ?? '' } : {}),
        },
        ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
        ...(signal ? { signal } : {}),
      });
    } catch (error) {
      if (
        signal?.aborted === true ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        throw error;
      }
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        traceId: '',
        status: 0,
      });
    }
  }

  async function* events<S extends z.ZodType>(response: Response, schema: S) {
    const traceId = response.headers.get(TRACE_ID_HEADER) ?? '';
    if (!response.body) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'The stream has no body',
        traceId,
        status: response.status,
      });
    }
    for await (const message of readSseMessages(response.body)) {
      let json: unknown;
      try {
        json = JSON.parse(message.data);
      } catch {
        throw new ApiError({
          code: 'INVALID_RESPONSE',
          message: 'An event is not JSON',
          traceId,
          status: response.status,
        });
      }
      const result = schema.safeParse(json);
      if (!result.success) {
        throw new ApiError({
          code: 'INVALID_RESPONSE',
          message: 'An event does not match the contract',
          traceId,
          status: response.status,
          details: result.error.issues.map(({ path: issuePath, code, message: text }) => ({
            path: issuePath,
            code,
            message: text,
          })),
        });
      }
      yield result.data;
    }
  }

  async function checkResponse(response: Response) {
    if (!response.ok) {
      const error = await toApiError(response);
      if (error.code === 'UNAUTHENTICATED') {
        options.csrf?.clear();
        options.onUnauthenticated?.();
      }
      throw error;
    }
  }

  return {
    async *post(path, body, { schema, signal }) {
      if (!options.csrf) throw new Error('A CSRF token store is required for POST SSE streams');
      let response = await send(path, 'POST', signal, body, await options.csrf.get());
      if (response.status === 403) {
        const error = await toApiError(response.clone());
        if (error.code === 'CSRF_INVALID') {
          response = await send(path, 'POST', signal, body, await options.csrf.refresh());
        }
      }
      await checkResponse(response);
      yield* events(response, schema);
    },
    async *get(path, { schema, signal }) {
      const response = await send(path, 'GET', signal);
      await checkResponse(response);
      yield* events(response, schema);
    },
  };
}
