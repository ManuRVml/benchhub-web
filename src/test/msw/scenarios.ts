import type { z } from 'zod';

/**
 * Behaviour of the MSW handlers (P5-03):
 * - ok: the operation's mock payload (fixture, or its MOCK_GAPS replacement);
 * - empty: the same payload with every list emptied (falls back to ok when the schema needs items);
 * - error: 500 with an ApiError body and `X-Trace-Id`;
 * - slow: ok after `SLOW_DELAY_MS`;
 * - forbidden: 403 with an ApiError body;
 * - partial: the first `SectionResult` of the payload in `error` (views with sections; ok otherwise).
 */
export const SCENARIOS = ['ok', 'empty', 'error', 'slow', 'forbidden', 'partial'] as const;

export type Scenario = (typeof SCENARIOS)[number];

export const SLOW_DELAY_MS = 1500;

/** Query parameter of the browser worker that picks the scenario (`?msw=error`). */
export const SCENARIO_PARAM = 'msw';

export const isScenario = (value: unknown): value is Scenario =>
  typeof value === 'string' && (SCENARIOS as readonly string[]).includes(value);

/** The scenario named in a URL query (`?msw=partial`), else `ok`. */
export function scenarioFromSearch(search: string): Scenario {
  const value = new URLSearchParams(search).get(SCENARIO_PARAM);
  return isScenario(value) ? value : 'ok';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function emptyLists(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, emptyLists(item)]));
}

/** The payload with every list emptied, if the operation's schema accepts it; otherwise the payload unchanged. */
export function emptyPayload(payload: unknown, schema: z.ZodType): unknown {
  const empty = emptyLists(payload);
  return schema.safeParse(empty).success ? empty : payload;
}

const isOkSection = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && value.status === 'ok' && 'data' in value;

/** The payload with its first `SectionResult` turned into `{ status: 'error' }`; unchanged when it has no sections. */
export function partialPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  const key = Object.keys(payload).find((name) => isOkSection(payload[name]));
  return key === undefined
    ? payload
    : { ...payload, [key]: { status: 'error', errorCode: 'PROVIDER_ERROR' } };
}

/** ApiError body of the error / forbidden scenarios (brief L278). */
export const apiErrorBody = (code: string, message: string, traceId: string) => ({
  code,
  message,
  traceId,
});
