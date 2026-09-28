import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedAutosave } from './use-debounced-autosave';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedAutosave', () => {
  it('saves a burst of 5 edits once, with the last value, 500 ms after the last edit', () => {
    const save = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useDebouncedAutosave(save, { delayMs: 500 }));

    act(() => {
      for (const value of [1, 2, 3, 4, 5]) {
        result.current.schedule(value);
        vi.advanceTimersByTime(100);
      }
    });
    expect(save).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(5);
  });

  it('flushes a pending edit on unmount', () => {
    const save = vi.fn(() => Promise.resolve());
    const { result, unmount } = renderHook(() => useDebouncedAutosave(save));
    act(() => {
      result.current.schedule('draft');
    });
    unmount();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('draft');
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('does not save on unmount when nothing is pending', () => {
    const save = vi.fn(() => Promise.resolve());
    const { unmount } = renderHook(() => useDebouncedAutosave(save));
    unmount();
    expect(save).not.toHaveBeenCalled();
  });

  it('reports a failed save to onError', async () => {
    const failure = new Error('500');
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedAutosave(() => Promise.reject(failure), { onError }),
    );
    act(() => {
      result.current.schedule(1);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(onError).toHaveBeenCalledWith(failure);
  });

  it('cancel drops the pending edit; flush saves it now', () => {
    const save = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useDebouncedAutosave(save));
    act(() => {
      result.current.schedule(1);
      result.current.cancel();
      vi.advanceTimersByTime(1000);
    });
    expect(save).not.toHaveBeenCalled();
    act(() => {
      result.current.schedule(2);
      result.current.flush();
    });
    expect(save).toHaveBeenCalledWith(2);
  });
});
