import { useCallback, useEffect, useMemo, useRef } from 'react';

export interface DebouncedAutosaveOptions {
  /** Quiet time after the last edit before saving (SCR-08 autosave: 500 ms). */
  delayMs?: number;
  /** Called when a save rejects (e.g. to show the error toast); the edit is not retried. */
  onError?: (error: unknown) => void;
}

export interface DebouncedAutosave<T> {
  /** Queues `value`; a burst of calls within `delayMs` ends in one save of the last value. */
  schedule: (value: T) => void;
  /** Saves the pending value now (no-op when nothing is pending). */
  flush: () => void;
  /** Drops the pending value without saving. */
  cancel: () => void;
}

/**
 * Debounced autosave (SCR-08 edits, 500 ms): `schedule(value)` on every edit, `save(lastValue)` once per burst. A value
 * still pending when the component unmounts is saved immediately (never lost on navigation). Save errors go to
 * `onError`. The latest `save` / `onError` are always used, so inline callbacks are fine.
 */
export function useDebouncedAutosave<T>(
  save: (value: T) => Promise<unknown>,
  { delayMs = 500, onError }: DebouncedAutosaveOptions = {},
): DebouncedAutosave<T> {
  const saveRef = useRef(save);
  const onErrorRef = useRef(onError);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ value: T } | null>(null);

  useEffect(() => {
    saveRef.current = save;
    onErrorRef.current = onError;
  });

  const flush = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    const next = pending.current;
    pending.current = null;
    if (!next) return;
    saveRef.current(next.value).catch((error: unknown) => {
      onErrorRef.current?.(error);
    });
  }, []);

  const schedule = useCallback(
    (value: T) => {
      pending.current = { value };
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delayMs);
    },
    [delayMs, flush],
  );

  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
  }, []);

  useEffect(() => flush, [flush]);

  return useMemo(() => ({ schedule, flush, cancel }), [schedule, flush, cancel]);
}
