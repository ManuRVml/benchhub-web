import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { encodeQueryValue, parseSearchParams, patchSearchParams } from './search-params';

const schema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  categoria: z.array(z.enum(['agua', 'energia', 'residuos'])).default([]),
  resumen: z.stringbool().default(false),
});

const params = (search: string): URLSearchParams => new URLSearchParams(search);

describe('encodeQueryValue (shared with routes.<key>.build)', () => {
  it('drops absent and empty values and joins lists with commas', () => {
    expect(encodeQueryValue(undefined)).toBeNull();
    expect(encodeQueryValue(null)).toBeNull();
    expect(encodeQueryValue('')).toBeNull();
    expect(encodeQueryValue([])).toBeNull();
    expect(encodeQueryValue('eco')).toBe('eco');
    expect(encodeQueryValue(0)).toBe('0');
    expect(encodeQueryValue(false)).toBe('false');
    expect(encodeQueryValue(['agua', 'energia'])).toBe('agua,energia');
  });
});

describe('parseSearchParams', () => {
  it('applies the defaults when the URL has no params', () => {
    expect(parseSearchParams(schema, params(''))).toStrictEqual({
      page: 1,
      categoria: [],
      resumen: false,
    });
  });

  it('parses scalars, booleans and comma-separated lists', () => {
    expect(
      parseSearchParams(schema, params('q=eco&page=3&categoria=agua%2Cenergia&resumen=true')),
    ).toStrictEqual({
      q: 'eco',
      page: 3,
      categoria: ['agua', 'energia'],
      resumen: true,
    });
  });

  it('treats empty values as absent and skips empty list items', () => {
    expect(parseSearchParams(schema, params('q=&page=&categoria=agua,,residuos,'))).toStrictEqual({
      page: 1,
      categoria: ['agua', 'residuos'],
      resumen: false,
    });
  });

  it('merges repeated list keys', () => {
    expect(
      parseSearchParams(schema, params('categoria=agua&categoria=energia')).categoria,
    ).toStrictEqual(['agua', 'energia']);
  });

  it('falls back to the default for each invalid value, key by key, without throwing', () => {
    expect(
      parseSearchParams(schema, params('q=ok&page=abc&categoria=agua,plastico&resumen=quizas')),
    ).toStrictEqual({
      q: 'ok',
      page: 1,
      categoria: [],
      resumen: false,
    });
    expect(parseSearchParams(schema, params('page=0')).page).toBe(1);
  });

  it('treats a throwing transform as an invalid value', () => {
    const throwing = z.object({
      n: z
        .string()
        .transform((): number => {
          throw new Error('boom');
        })
        .optional(),
    });
    expect(parseSearchParams(throwing, params('n=1'))).toStrictEqual({});
  });

  it('leaves out a required field without a default instead of throwing', () => {
    const strict = z.object({ id: z.uuid(), q: z.string().optional() });
    expect(() => parseSearchParams(strict, params('id=nope&q=x'))).not.toThrow();
    expect(parseSearchParams(strict, params('id=nope&q=x'))).toStrictEqual({ q: 'x' });
  });
});

describe('patchSearchParams', () => {
  it('writes patched keys with the route-table encoding', () => {
    const next = patchSearchParams(schema, params(''), {
      q: 'eco',
      page: 2,
      categoria: ['agua', 'energia'],
    });
    expect(next.toString()).toBe('q=eco&page=2&categoria=agua%2Cenergia');
    expect(parseSearchParams(schema, next)).toStrictEqual({
      q: 'eco',
      page: 2,
      categoria: ['agua', 'energia'],
      resumen: false,
    });
  });

  it('removes keys patched to null, undefined, empty string or empty list', () => {
    const prev = params('q=eco&page=2&categoria=agua&resumen=true');
    const next = patchSearchParams(schema, prev, {
      q: '',
      page: null,
      categoria: [],
      resumen: undefined,
    });
    expect(next.toString()).toBe('');
  });

  it('keeps unrelated params, in place, and does not mutate the previous params', () => {
    const prev = params('utm_source=mail&page=2&tab=b');
    const next = patchSearchParams(schema, prev, { page: 3 });
    expect(next.toString()).toBe('utm_source=mail&page=3&tab=b');
    expect(prev.toString()).toBe('utm_source=mail&page=2&tab=b');
  });

  it('keeps unrelated params even when they look invalid', () => {
    const next = patchSearchParams(schema, params('ref=%%%&estado=x'), { q: 'a' });
    expect(next.get('ref')).toBe('%%%');
    expect(next.get('estado')).toBe('x');
  });

  it('removes invalid schema values on the next write and keeps valid ones untouched', () => {
    const prev = params('page=abc&categoria=agua,plastico&resumen=true&keep=1');
    const next = patchSearchParams(schema, prev, { q: 'x' });
    expect(next.toString()).toBe('resumen=true&keep=1&q=x');
  });
});
