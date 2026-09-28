import { z } from 'zod';

import type { ApiError as ApiErrorBody } from './generated/model';

/**
 * Codes the web itself raises; every other code is the BFF's (`ApiError.code` of the response body, brief L278).
 * - `INVALID_RESPONSE`: the body failed the contract's Zod schema (or was not JSON); unvalidated data is never returned.
 * - `NETWORK_ERROR`: no HTTP response (offline, DNS, CORS, connection reset); `status` 0.
 * - `UNAUTHENTICATED`: 401, the session is gone; the client also calls `onUnauthenticated()`.
 * - `CSRF_INVALID`: 403 from the BFF when `X-CSRF-Token` is missing or stale, after the one refresh + retry.
 * - `HTTP_ERROR`: a non-2xx response without an ApiError body.
 */
export type ClientErrorCode =
  'INVALID_RESPONSE' | 'NETWORK_ERROR' | 'UNAUTHENTICATED' | 'CSRF_INVALID' | 'HTTP_ERROR';

export interface ApiErrorInit {
  code: string;
  message: string;
  /** `X-Trace-Id` of the response (or the body's `traceId`); empty when there was no response. */
  traceId: string;
  /** HTTP status; 0 when the request never got a response. */
  status: number;
  /** Diagnostic data (BFF `details`, or the Zod issues of an INVALID_RESPONSE). The UI never shows it verbatim. */
  details?: unknown;
}

/**
 * Error thrown by the http client for every failed call: the ApiError body of the BFF (`code`, `message`, `traceId`,
 * `details?`) plus the HTTP `status`. UI copy is chosen from `code`; `traceId` is shown for support.
 */
export class ApiError extends Error implements ApiErrorBody {
  readonly code: string;
  readonly traceId: string;
  readonly status: number;
  readonly details?: unknown;

  constructor({ code, message, traceId, status, details }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.traceId = traceId;
    this.status = status;
    if (details !== undefined) this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Error body of a non-2xx BFF response (the contract's `ApiError` component). Read leniently: a body that does not
 * match becomes an `HTTP_ERROR` with the status, never a crash.
 */
export const apiErrorBodySchema = z.object({
  code: z.string().min(1),
  message: z.string(),
  traceId: z.string().optional(),
  details: z.unknown().optional(),
});
