import { isApiError } from './errors';

import type { ApiError } from './errors';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

// TanStack Query policy of the web (ADR-0005): typed errors, retries, stale times and optimistic patches.

declare module '@tanstack/react-query' {
  // Every query / mutation function goes through the http client or the mock adapters, which throw ApiError.
  interface Register {
    defaultError: ApiError;
  }
}

/** Retries a failed query at most twice, but never a 4xx ApiError (it will fail the same way) nor a bad payload. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) {
    if (error.status >= 400 && error.status < 500) return false;
    if (error.code === 'INVALID_RESPONSE') return false;
  }
  return failureCount < 2;
}

/**
 * How long a view stays fresh, per kind of view:
 * - catalog: reference data edited in the back office (competitor / indicator catalogs) — 10 min;
 * - view: screen payloads computed from analysis data — 30 s;
 * - frame: headers that change only with the analysis lifecycle (results header) — 2 min.
 */
export const STALE_TIMES = {
  catalog: 10 * 60_000,
  view: 30_000,
  frame: 2 * 60_000,
} as const;

/** Snapshot of the cached queries under a prefix, taken before an optimistic patch. */
export type QuerySnapshot = readonly (readonly [QueryKey, unknown])[];

/**
 * Optimistic update: cancels in-flight queries under `prefix` (so they cannot overwrite the patch), snapshots their
 * data, applies `patch` to each cached entry and returns the snapshot for `restoreQueries` on error.
 */
export async function patchQueries(
  queryClient: QueryClient,
  prefix: QueryKey,
  patch: (data: unknown, queryKey: QueryKey) => unknown,
): Promise<QuerySnapshot> {
  await queryClient.cancelQueries({ queryKey: prefix });
  const snapshot = queryClient.getQueriesData({ queryKey: prefix });
  for (const [queryKey, data] of snapshot) {
    if (data !== undefined) queryClient.setQueryData(queryKey, patch(data, queryKey));
  }
  return snapshot;
}

/** Rollback of `patchQueries`: puts every snapshotted entry back as it was. */
export function restoreQueries(
  queryClient: QueryClient,
  snapshot: QuerySnapshot | undefined,
): void {
  for (const [queryKey, data] of snapshot ?? []) queryClient.setQueryData(queryKey, data);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Returns a copy of `data` where every object matching `match` is replaced by `update(object)`; untouched branches keep
 * their identity. Used by optimistic patches that do not know the exact view shape (e.g. every row of a KVI).
 */
export function deepPatch(
  data: unknown,
  match: (node: Record<string, unknown>) => boolean,
  update: (node: Record<string, unknown>) => Record<string, unknown>,
): unknown {
  if (Array.isArray(data)) {
    const next = data.map((item) => deepPatch(item, match, update));
    return next.every((item, index) => item === data[index]) ? data : next;
  }
  if (!isRecord(data)) return data;
  const node = match(data) ? update(data) : data;
  let changed = node !== data;
  const entries = Object.entries(node).map(([key, value]) => {
    const patched = deepPatch(value, match, update);
    if (patched !== value) changed = true;
    return [key, patched] as const;
  });
  return changed ? Object.fromEntries(entries) : data;
}
