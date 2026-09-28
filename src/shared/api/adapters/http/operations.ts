import { ApiError, apiErrorBodySchema } from '../../errors';
import { GetOperationStatusResponse } from '../../generated/zod';
import { API_BASE_URL, TRACE_ID_HEADER } from '../../http-client';

import { apiPath } from './api-path';

import type { HttpClient } from '../../http-client';
import type { OperationsPort } from '../../ports';

// HTTP adapter of O-01 (a normal JSON GET) and O-03 (see ports/operations.ts: its generated response schema is the
// `ApiError` shape, not a file schema, so this bypasses the shared JSON client and reads the response directly).

export function createOperationsHttpAdapter(http: HttpClient): OperationsPort {
  return {
    /** @operation getOperationStatus */
    getOperationStatus: (operationId, options) =>
      http.get(apiPath`/operations/${operationId}`, {
        ...options,
        schema: GetOperationStatusResponse,
      }),
    /** @operation downloadFile */
    downloadFile: async (fileId, { disposition = 'attachment', signal } = {}) => {
      const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/download?disposition=${disposition}`;
      const response = await fetch(url, { credentials: 'include', ...(signal ? { signal } : {}) });
      if (!response.ok) {
        const traceId = response.headers.get(TRACE_ID_HEADER) ?? '';
        const body = apiErrorBodySchema.safeParse(await response.json().catch(() => undefined));
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
      return response.blob();
    },
  };
}
