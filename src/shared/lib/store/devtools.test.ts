import { afterEach, describe, expect, it, vi } from 'vitest';

import { storeDevtools } from './devtools';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('storeDevtools', () => {
  it('connects the store to Redux DevTools in development', () => {
    vi.stubEnv('DEV', true);
    expect(storeDevtools('layout')).toStrictEqual({ name: 'eco/layout', enabled: true });
  });

  it('never connects outside development', () => {
    vi.stubEnv('DEV', false);
    expect(storeDevtools('layout').enabled).toBe(false);
  });
});
