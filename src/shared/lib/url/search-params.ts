// URL query state (brief §5.3, ADR-0005): the URL is the source of truth for shareable state. These pure functions
// read and write a URLSearchParams through a Zod object schema; `useTypedSearchParams` binds them to the router.
// The encoding is the one `routes.<key>.build()` uses (src/shared/config/routes.ts), so a URL built by the route table
// and a URL written by the hook are the same string for the same values.
import { z } from 'zod';

/** Query values: lists are written comma-separated (navigation-map §1: `categoria`, `cumplimiento`, `severidad`). */
export type QueryValue =
  string | number | boolean | readonly (string | number | boolean)[] | null | undefined;

/** A query value as written to the URL, or `null` when the key is dropped (absent, empty string, empty list). */
export const encodeQueryValue = (value: QueryValue): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value === '' ? null : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return value.length ? value.join(',') : null;
};

/**
 * The schemas the URL helpers accept. Every field must accept `undefined` (`.optional()` or `.default(…)`): an absent
 * or invalid value falls back to what the field returns for `undefined`. Object-level refinements are not applied,
 * because each key is parsed on its own.
 */
export type SearchParamsSchema = z.ZodObject;

export type SearchParamsValue<S extends SearchParamsSchema> = z.output<S>;

/** Keys to change: a value is written, `null` / `undefined` / `''` / `[]` remove the key (back to its default). */
export type SearchParamsPatch<S extends SearchParamsSchema> = {
  readonly [K in keyof z.output<S>]?: z.output<S>[K] | null | undefined;
};

/** Whether a field holds a list (`z.array(…)`, possibly behind default / optional / nullable / catch / pipe). */
function isListField(field: z.core.$ZodType): boolean {
  if (field instanceof z.ZodArray) return true;
  if (
    field instanceof z.ZodDefault ||
    field instanceof z.ZodPrefault ||
    field instanceof z.ZodOptional ||
    field instanceof z.ZodNullable ||
    field instanceof z.ZodNonOptional ||
    field instanceof z.ZodReadonly ||
    field instanceof z.ZodCatch
  ) {
    return isListField(field.def.innerType);
  }
  if (field instanceof z.ZodPipe) return isListField(field.def.in);
  return false;
}

/** The raw URL input of one key: absent and empty values are `undefined`, lists are split on commas. */
function readRaw(
  params: URLSearchParams,
  key: string,
  list: boolean,
): string | string[] | undefined {
  if (list) {
    const items = params
      .getAll(key)
      .flatMap((value) => value.split(','))
      .filter((item) => item !== '');
    return items.length ? items : undefined;
  }
  const value = params.get(key);
  return value === null || value === '' ? undefined : value;
}

interface FieldResult {
  /** Whether the raw URL value passed the field's schema. */
  readonly valid: boolean;
  /** The parsed value, the field's default when invalid, or `undefined` when the field has neither. */
  readonly value: unknown;
}

/** Parses one key; an invalid value falls back to the field's value for `undefined` (its default). Never throws. */
function parseField(field: z.ZodType, params: URLSearchParams, key: string): FieldResult {
  const parsed = safeParse(field, readRaw(params, key, isListField(field)));
  if (parsed.success) return { valid: true, value: parsed.data };
  const fallback = safeParse(field, undefined);
  return { valid: false, value: fallback.success ? fallback.data : undefined };
}

/** `safeParse` that also turns a throwing transform or an async refinement into a failed result. */
function safeParse(
  field: z.ZodType,
  raw: unknown,
): { success: true; data: unknown } | { success: false } {
  try {
    return field.safeParse(raw);
  } catch {
    return { success: false };
  }
}

const shapeOf = (schema: SearchParamsSchema): Readonly<Record<string, z.ZodType>> => schema.shape;

/** Reads the schema's keys from the URL with defaults applied; invalid values become their defaults. Never throws. */
export function parseSearchParams<S extends SearchParamsSchema>(
  schema: S,
  params: URLSearchParams,
): SearchParamsValue<S> {
  const value: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(shapeOf(schema))) {
    const parsed = parseField(field, params, key).value;
    if (parsed !== undefined) value[key] = parsed;
  }
  return value as SearchParamsValue<S>;
}

/**
 * The next URL params after applying a patch: patched keys are written with the route-table encoding (or removed
 * when empty), schema keys whose current value is invalid are removed, and every other param is kept as it was.
 */
export function patchSearchParams<S extends SearchParamsSchema>(
  schema: S,
  prev: URLSearchParams,
  patch: SearchParamsPatch<S>,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  const changes = patch as Readonly<Record<string, QueryValue>>;
  for (const [key, field] of Object.entries(shapeOf(schema))) {
    if (Object.hasOwn(changes, key)) {
      const encoded = encodeQueryValue(changes[key]);
      if (encoded === null) next.delete(key);
      else next.set(key, encoded);
    } else if (next.has(key) && !parseField(field, prev, key).valid) {
      next.delete(key);
    }
  }
  return next;
}
