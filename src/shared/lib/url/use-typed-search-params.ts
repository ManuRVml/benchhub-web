import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { parseSearchParams, patchSearchParams } from './search-params';

import type { SearchParamsPatch, SearchParamsSchema, SearchParamsValue } from './search-params';

export interface SetSearchParamsOptions {
  /** Replace the current history entry instead of pushing a new one (e.g. while typing in a search box). */
  readonly replace?: boolean;
}

export type SetTypedSearchParams<S extends SearchParamsSchema> = (
  patch: SearchParamsPatch<S>,
  options?: SetSearchParamsOptions,
) => void;

/**
 * Typed URL state (ADR-0005): `[value, set]` over the current location's query string. `value` is parsed with the
 * schema (defaults applied, invalid values fall back to their defaults, never throws); `set(patch, { replace })`
 * writes only the patched keys, drops empty values and invalid schema keys, and keeps every unrelated param.
 * Declare the schema at module level so `value` stays referentially stable between renders.
 */
export function useTypedSearchParams<S extends SearchParamsSchema>(
  schema: S,
): readonly [SearchParamsValue<S>, SetTypedSearchParams<S>] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = useMemo(() => parseSearchParams(schema, searchParams), [schema, searchParams]);
  const set = useCallback<SetTypedSearchParams<S>>(
    (patch, options) => {
      setSearchParams((prev) => patchSearchParams(schema, prev, patch), {
        replace: options?.replace ?? false,
      });
    },
    [schema, setSearchParams],
  );
  return [value, set] as const;
}
