import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { server } from '../../test/msw/server';

import { createCsrfTokenStore } from './csrf';
import { ApiError } from './errors';
import { API_BASE_URL, CSRF_HEADER } from './http-client';
import { createSseClient, readSseMessages } from './sse';

const encoder = new TextEncoder();

/** A body that delivers the given chunks as separate reads (to cut lines and messages mid-way). */
const bodyOf = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });

const collect = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const out: T[] = [];
  for await (const item of iterable) out.push(item);
  return out;
};

const eventSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('token'), content: z.string() }),
  z.strictObject({ type: z.literal('done'), messageId: z.string() }),
]);

const sse = (...events: object[]) =>
  events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');

describe('readSseMessages', () => {
  it('joins data lines, dispatches on blank lines and skips comments', async () => {
    const messages = await collect(
      readSseMessages(
        bodyOf(': keep-alive\n', 'event: chunk\ndata: a\ndata: b\n\n', 'data: c\n\n'),
      ),
    );
    expect(messages).toEqual([
      { event: 'chunk', data: 'a\nb' },
      { event: 'message', data: 'c' },
    ]);
  });

  it('reassembles lines and messages split across chunks, with CRLF or CR line ends', async () => {
    const messages = await collect(
      readSseMessages(bodyOf('da', 'ta: {"x"', ':1}\r', '\n\r\ndata:2\r\r')),
    );
    expect(messages.map((message) => message.data)).toEqual(['{"x":1}', '2']);
  });

  it('keeps a CRLF split between two chunks as one line end', async () => {
    const messages = await collect(readSseMessages(bodyOf('data: a\r', '\ndata: b\r\n\r\n')));
    expect(messages).toEqual([{ event: 'message', data: 'a\nb' }]);
  });

  it('drops a message the stream cuts off before its blank line', async () => {
    const messages = await collect(readSseMessages(bodyOf('data: 1\n\ndata: 2\n')));
    expect(messages.map((message) => message.data)).toEqual(['1']);
  });
});

describe('createSseClient', () => {
  const url = `${API_BASE_URL}/assistant/messages`;
  const client = (onUnauthenticated = vi.fn()) => {
    const fetchToken = vi.fn(async () =>
      Promise.resolve(`token-${String(fetchToken.mock.calls.length)}`),
    );
    return {
      fetchToken,
      onUnauthenticated,
      sse: createSseClient({ csrf: createCsrfTokenStore(fetchToken), onUnauthenticated }),
    };
  };

  it('POSTs the JSON body with the CSRF header and yields every validated event in order', async () => {
    let request: Request | undefined;
    server.use(
      http.post(url, ({ request: incoming }) => {
        request = incoming;
        return new HttpResponse(
          bodyOf(
            sse({ type: 'token', content: 'El ' }, { type: 'token', content: 'ROACE' }),
            sse({ type: 'done', messageId: 'msg_1' }),
          ),
          { headers: { 'Content-Type': 'text/event-stream' } },
        );
      }),
    );
    const { sse: stream } = client();
    const events = await collect(
      stream.post('/assistant/messages', { message: 'hola' }, { schema: eventSchema }),
    );
    expect(events).toEqual([
      { type: 'token', content: 'El ' },
      { type: 'token', content: 'ROACE' },
      { type: 'done', messageId: 'msg_1' },
    ]);
    expect(request?.headers.get(CSRF_HEADER)).toBe('token-1');
    expect(request?.headers.get('Accept')).toBe('text/event-stream');
    expect(request?.credentials).toBe('include');
    expect(await request?.json()).toEqual({ message: 'hola' });
  });

  it('GETs an O-02-style stream without a CSRF header', async () => {
    const url = `${API_BASE_URL}/operations/op_1/events`;
    let request: Request | undefined;
    server.use(
      http.get(url, ({ request: incoming }) => {
        request = incoming;
        return new HttpResponse(bodyOf(sse({ operationId: 'op_1', status: 'running' })), {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }),
    );

    const events = await collect(
      createSseClient({}).get('/operations/op_1/events', {
        schema: z.strictObject({ operationId: z.string(), status: z.literal('running') }),
      }),
    );

    expect(events).toEqual([{ operationId: 'op_1', status: 'running' }]);
    expect(request?.headers.get(CSRF_HEADER)).toBeNull();
    expect(request?.headers.get('Accept')).toBe('text/event-stream');
  });

  it('refreshes the CSRF token once and retries on 403 CSRF_INVALID', async () => {
    const tokens: (string | null)[] = [];
    server.use(
      http.post(url, ({ request }) => {
        tokens.push(request.headers.get(CSRF_HEADER));
        if (tokens.length === 1) {
          return HttpResponse.json(
            { code: 'CSRF_INVALID', message: 'stale', traceId: 't' },
            { status: 403 },
          );
        }
        return new HttpResponse(bodyOf(sse({ type: 'done', messageId: 'msg_2' })));
      }),
    );
    const { sse: stream } = client();
    const events = await collect(stream.post('/assistant/messages', {}, { schema: eventSchema }));
    expect(tokens).toEqual(['token-1', 'token-2']);
    expect(events).toEqual([{ type: 'done', messageId: 'msg_2' }]);
  });

  it('throws the ApiError of a failed request and reports a 401', async () => {
    server.use(
      http.post(url, () =>
        HttpResponse.json(
          { code: 'FORBIDDEN', message: 'no', traceId: 'body-trace' },
          { status: 403 },
        ),
      ),
    );
    await expect(
      collect(client().sse.post('/assistant/messages', {}, { schema: eventSchema })),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
      traceId: 'body-trace',
    });

    server.use(http.post(url, () => new HttpResponse(null, { status: 401 })));
    const onUnauthenticated = vi.fn();
    await expect(
      collect(
        client(onUnauthenticated).sse.post('/assistant/messages', {}, { schema: eventSchema }),
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('ends the stream with INVALID_RESPONSE when an event breaks the schema or is not JSON', async () => {
    server.use(http.post(url, () => new HttpResponse(bodyOf(sse({ type: 'token', content: 1 })))));
    const failure = collect(client().sse.post('/assistant/messages', {}, { schema: eventSchema }));
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });

    server.use(http.post(url, () => new HttpResponse(bodyOf('data: {oops\n\n'))));
    await expect(
      collect(client().sse.post('/assistant/messages', {}, { schema: eventSchema })),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
});
