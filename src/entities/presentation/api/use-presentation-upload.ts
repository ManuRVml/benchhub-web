import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  API_BASE_URL,
  apiErrorBodySchema,
  ApiError,
  createCsrfTokenStore,
  CSRF_HEADER,
  sessionCsrfSchema,
  SESSION_ENDPOINT,
} from '@/shared/api';

import { presentationBuilderQueryKeys } from './use-presentation-builder-view';

// C-30 — PUT /presentations/:id/uploaded-version, multipart/form-data (OVL-07a). C-30 IS vendored (`PresentationCommands
// .uploadPresentationVersion`), but its generated HTTP adapter only PUTs the empty JSON body the contract's minimal
// example shows (`{}`) — the actual file, which the contract sends as multipart, has no field in that JSON schema and
// the generic JSON-only http client cannot attach a `FormData` body. So this file bypasses the generated adapter for
// the request only, using the same public building blocks `createHttpClient` itself uses (`createCsrfTokenStore`,
// `CSRF_HEADER`, `SESSION_ENDPOINT`) — never editing `src/shared/api/adapters` — and validates the JSON response with a
// small mirror of the vendored `C30Response` shape.

/** Accepted upload extensions (C-30, case-insensitive per the contract). */
export const UPLOAD_EXTENSIONS = ['.ppt', '.pptx'] as const;
/** C-30 `budgetBytes`: 50 MB. */
export const MAX_UPLOAD_BYTES = 52_428_800;

export type UploadRejection = 'invalid-type' | 'too-large';

/** Client-side check (defense in depth; the BFF still validates MIME type and magic bytes). */
export function validateUploadFile(file: File): UploadRejection | null {
  const name = file.name.toLowerCase();
  if (!UPLOAD_EXTENSIONS.some((extension) => name.endsWith(extension))) return 'invalid-type';
  if (file.size > MAX_UPLOAD_BYTES) return 'too-large';
  return null;
}

/** Mirror of the vendored `C30Response` (`UploadPresentationVersionResponse`), for the raw multipart call. */
const uploadedVersionSchema = z
  .object({
    uploaded: z.boolean(),
    versionId: z.string().min(1),
    fileName: z.string().min(1),
  })
  .strict();

export type UploadedPresentationVersion = z.output<typeof uploadedVersionSchema>;

// One CSRF store for this module: the multipart PUT is an unsafe method and needs the same synchronizer token the
// app's http client sends, fetched the same way (`GET /session`, ADR-0004 §6) but kept in its own closure, since the
// app's token lives inside `createHttpClient` and is not exposed.
const csrf = createCsrfTokenStore(async () => {
  const response = await fetch(`${API_BASE_URL}${SESSION_ENDPOINT}`, { credentials: 'include' });
  if (!response.ok) {
    throw new ApiError({
      code: 'HTTP_ERROR',
      message: 'Could not load the CSRF token',
      traceId: '',
      status: response.status,
    });
  }
  const { csrfToken } = sessionCsrfSchema.parse(await response.json());
  return csrfToken;
});

async function parseUploadResponse(response: Response): Promise<UploadedPresentationVersion> {
  const traceId = response.headers.get('X-Trace-Id') ?? '';
  const text = await response.text();
  const json: unknown = text === '' ? undefined : JSON.parse(text);
  if (!response.ok) {
    const body = apiErrorBodySchema.safeParse(json);
    throw new ApiError(
      body.success
        ? { ...body.data, traceId: body.data.traceId ?? traceId, status: response.status }
        : {
            code: 'HTTP_ERROR',
            message: `HTTP ${String(response.status)}`,
            traceId,
            status: response.status,
          },
    );
  }
  const result = uploadedVersionSchema.safeParse(json);
  if (!result.success) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'The response does not match the contract',
      traceId,
      status: response.status,
    });
  }
  return result.data;
}

/** PUTs `file` as C-30's multipart body; retries once with a fresh CSRF token on a 403 `CSRF_INVALID`. */
export async function uploadPresentationVersion(
  presentationId: string,
  file: File,
  options: { signal?: AbortSignal } = {},
): Promise<UploadedPresentationVersion> {
  const form = new FormData();
  form.set('file', file, file.name);
  const put = async (token: string) =>
    fetch(`${API_BASE_URL}/presentations/${encodeURIComponent(presentationId)}/uploaded-version`, {
      method: 'PUT',
      credentials: 'include',
      headers: { [CSRF_HEADER]: token },
      body: form,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  let response = await put(await csrf.get());
  if (response.status === 403) {
    const retryBody = apiErrorBodySchema.safeParse(
      await response
        .clone()
        .json()
        .catch(() => undefined),
    );
    if (retryBody.success && retryBody.data.code === 'CSRF_INVALID') {
      response = await put(await csrf.refresh());
    }
  }
  return parseUploadResponse(response);
}

/** Uploads the file and refreshes the builder (so `uploadedVersion` reflects it). */
export function useUploadPresentationVersion(presentationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadPresentationVersion(presentationId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: presentationBuilderQueryKeys.builder(presentationId),
      }),
  });
}
