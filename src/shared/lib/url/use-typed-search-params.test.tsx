// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { useTypedSearchParams } from './use-typed-search-params';

import type { SetTypedSearchParams } from './use-typed-search-params';
import type { Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const schema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  categoria: z.array(z.enum(['agua', 'energia', 'residuos'])).default([]),
  vista: z.enum(['tabla', 'grafico']).default('tabla'),
});

type Value = z.output<typeof schema>;

interface Harness {
  readonly value: () => Value;
  readonly set: SetTypedSearchParams<typeof schema>;
  readonly search: () => string;
  readonly historyAction: () => string;
}

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

/** Renders a probe component under a memory data router whose only location is `/` plus `search`. */
async function renderAt(search: string): Promise<Harness> {
  const renders: Value[] = [];
  let setter: SetTypedSearchParams<typeof schema> | undefined;
  function Probe() {
    const [value, set] = useTypedSearchParams(schema);
    renders.push(value);
    setter = set;
    return null;
  }
  const router = createMemoryRouter([{ index: true, Component: Probe }], {
    initialEntries: [`/${search}`],
  });
  const container = document.createElement('div');
  root = createRoot(container);
  const mounted = root;
  await act(async () => {
    mounted.render(<RouterProvider router={router} />);
    await Promise.resolve();
  });
  const current = (): Value => {
    const last = renders.at(-1);
    if (!last) throw new Error('probe did not render');
    return last;
  };
  return {
    value: current,
    set: (patch, options) => {
      if (!setter) throw new Error('probe did not render');
      setter(patch, options);
    },
    search: () => router.state.location.search,
    historyAction: () => router.state.historyAction,
  };
}

async function write(harness: Harness, ...args: Parameters<Harness['set']>): Promise<void> {
  await act(async () => {
    harness.set(...args);
    await Promise.resolve();
  });
}

describe('useTypedSearchParams', () => {
  it('returns the schema defaults for a URL without params', async () => {
    const harness = await renderAt('');
    expect(harness.value()).toStrictEqual({ page: 1, categoria: [], vista: 'tabla' });
  });

  it('round-trips a patch through the URL', async () => {
    const harness = await renderAt('');
    await write(harness, { q: 'eco', page: 2, categoria: ['agua', 'energia'], vista: 'grafico' });
    expect(harness.search()).toBe(
      `?${new URLSearchParams('q=eco&page=2&categoria=agua,energia&vista=grafico')}`,
    );
    expect(harness.value()).toStrictEqual({
      q: 'eco',
      page: 2,
      categoria: ['agua', 'energia'],
      vista: 'grafico',
    });
  });

  it('parses list params written comma-separated', async () => {
    const harness = await renderAt('?categoria=agua,residuos');
    expect(harness.value().categoria).toStrictEqual(['agua', 'residuos']);
  });

  it('falls back to defaults for invalid values without throwing, and removes them on the next write', async () => {
    const harness = await renderAt('?page=abc&vista=mapa&categoria=agua,plastico&q=ok');
    expect(harness.value()).toStrictEqual({ q: 'ok', page: 1, categoria: [], vista: 'tabla' });
    await write(harness, { q: 'nuevo' });
    expect(harness.search()).toBe('?q=nuevo');
  });

  it('keeps unrelated params when a patch is written', async () => {
    const harness = await renderAt('?utm_source=mail&page=2&tab=b');
    await write(harness, { page: 3 });
    expect(harness.search()).toBe('?utm_source=mail&page=3&tab=b');
    await write(harness, { categoria: ['energia'] });
    expect(harness.search()).toBe('?utm_source=mail&page=3&tab=b&categoria=energia');
  });

  it('drops empty and cleared values, returning to the defaults', async () => {
    const harness = await renderAt('?q=eco&page=4&categoria=agua');
    await write(harness, { q: '', page: null, categoria: [] });
    expect(harness.search()).toBe('');
    expect(harness.value()).toStrictEqual({ page: 1, categoria: [], vista: 'tabla' });
  });

  it('pushes a history entry by default and replaces it with { replace: true }', async () => {
    const harness = await renderAt('');
    await write(harness, { q: 'a' });
    expect(harness.historyAction()).toBe('PUSH');
    await write(harness, { q: 'ab' }, { replace: true });
    expect(harness.historyAction()).toBe('REPLACE');
    expect(harness.search()).toBe('?q=ab');
  });
});
