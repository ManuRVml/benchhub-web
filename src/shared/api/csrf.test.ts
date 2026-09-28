import { describe, expect, it, vi } from 'vitest';

import { createCsrfTokenStore } from './csrf';

describe('createCsrfTokenStore', () => {
  it('fetches once and shares the token between concurrent callers', async () => {
    const fetchToken = vi.fn(() => Promise.resolve('t1'));
    const store = createCsrfTokenStore(fetchToken);
    await expect(Promise.all([store.get(), store.get()])).resolves.toEqual(['t1', 't1']);
    await expect(store.get()).resolves.toBe('t1');
    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  it('refresh fetches a new token and clear forgets it', async () => {
    const fetchToken = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('t1')
      .mockResolvedValueOnce('t2')
      .mockResolvedValueOnce('t3');
    const store = createCsrfTokenStore(fetchToken);
    await expect(store.get()).resolves.toBe('t1');
    await expect(store.refresh()).resolves.toBe('t2');
    await expect(store.get()).resolves.toBe('t2');
    store.clear();
    await expect(store.get()).resolves.toBe('t3');
  });

  it('does not cache a failed fetch', async () => {
    const fetchToken = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('t1');
    const store = createCsrfTokenStore(fetchToken);
    await expect(store.get()).rejects.toThrow('offline');
    await expect(store.get()).resolves.toBe('t1');
  });
});
