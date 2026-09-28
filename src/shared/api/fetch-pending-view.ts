import { ApiError } from './errors';

import type { QueryParams } from './http-client';
import type { ServiceContainer } from './service-context';
import type { z } from 'zod';

// Presentations (SCR-13/14, V-40..V-43) have no typed port yet (Sol is adding one on task/P7-PORTS-PRES); until then
// their hooks (src/entities/presentation/api/) call the BFF directly in http mode and, in mock mode, load the
// contract's own fixture — the raw `services.http` client is a stub in mock mode and always rejects. This is the
// minimal re-expression of what `pending-views.ts` used to provide for these four views before it was deleted
// (ADR-0004: the other views it covered, V-24/V-26/V-37..V-39, now have real ports and read through those instead).
// Delete this file once P7-PORTS-PRES lands and the presentation hooks read through their own port.
interface PendingViewRequest<S extends z.ZodType> {
  /** Contract id, also the fixture name in `mock` mode. */
  contract: 'V-40' | 'V-41' | 'V-42' | 'V-43';
  path: string;
  query?: QueryParams;
  schema: S;
  signal?: AbortSignal;
}

export async function fetchPendingView<S extends z.ZodType>(
  services: Pick<ServiceContainer, 'http' | 'mode'>,
  { contract, path, query, schema, signal }: PendingViewRequest<S>,
): Promise<z.output<S>> {
  // The build-time check comes first so an `http` build folds this to `if (true)` and drops the fixture import below.
  if (import.meta.env.VITE_API_MODE === 'http' || services.mode === 'http') {
    return services.http.get(path, {
      schema,
      ...(query ? { query } : {}),
      ...(signal ? { signal } : {}),
    });
  }
  const { loadContractFixture } = await import('./adapters/mock/mock-data');
  const result = schema.safeParse(await loadContractFixture(contract));
  if (!result.success) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: `The ${contract} fixture does not match its schema`,
      traceId: 'mock',
      status: 200,
      details: result.error.issues.map(({ path: at, code, message }) => ({
        path: at,
        code,
        message,
      })),
    });
  }
  return result.data;
}
