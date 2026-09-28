import type { ReactNode } from 'react';

/** Toast kinds of the prototype (component catalog "Toast"); `error` is the banner-style failure notice. */
export type ToastVariant = 'autosave' | 'undo' | 'success' | 'error';

/** Where a toast stacks on screen. */
export type ToastPosition = 'bottom-right' | 'bottom-center' | 'top-center';

/**
 * Per-variant placement and lifetime (.plan/source-map/02-prototype-html.md §4): autosave bottom-right 1.8 s, undo
 * bottom-center 5 s, success 2.2 s ("✓ Cambios guardados"). Errors stay until dismissed (`null`).
 */
export const TOAST_DEFAULTS: Readonly<
  Record<ToastVariant, { readonly position: ToastPosition; readonly durationMs: number | null }>
> = {
  autosave: { position: 'bottom-right', durationMs: 1800 },
  undo: { position: 'bottom-center', durationMs: 5000 },
  success: { position: 'bottom-right', durationMs: 2200 },
  error: { position: 'top-center', durationMs: null },
};

/** Default number of toasts kept per position; older ones are dropped first. */
export const DEFAULT_MAX_VISIBLE = 3;

interface ToastOptionsBase {
  /** Message shown in the toast, already translated by the caller. */
  message: ReactNode;
  /** Stable id: showing a toast with the id of a visible one replaces it (and restarts its timer). */
  id?: string;
  /** Lifetime in ms; `null` keeps the toast until it is dismissed. Defaults to the variant's `TOAST_DEFAULTS`. */
  durationMs?: number | null;
}

export interface UndoToastOptions extends ToastOptionsBase {
  variant: 'undo';
  /** Runs when the user presses "Deshacer" before the toast expires; `onExpire` is then not called. */
  onUndo: () => void;
  /** Runs when the undo window closes without undo: timeout, dismissal, replacement or eviction from the stack. */
  onExpire?: () => void;
}

export interface MessageToastOptions extends ToastOptionsBase {
  variant: 'autosave' | 'success' | 'error';
}

export type ToastOptions = UndoToastOptions | MessageToastOptions;

/** A toast on screen. `key` changes whenever the toast is (re)shown, so its timer restarts. */
export interface ToastRecord {
  readonly id: string;
  readonly key: number;
  readonly variant: ToastVariant;
  readonly position: ToastPosition;
  readonly message: ReactNode;
  readonly durationMs: number | null;
  readonly onUndo?: () => void;
  readonly onExpire?: () => void;
}

export interface ToastStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly ToastRecord[];
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  /** Closes a toast without undo (an undo toast fires `onExpire`). Unknown ids are ignored. */
  dismiss: (id: string) => void;
  /** Closes an undo toast through its action and fires `onUndo`. */
  undo: (id: string) => void;
}

/** Framework-free toast queue behind `ToastProvider`: callbacks run after the queue has changed, outside React updates. */
export function createToastStore(maxVisible = DEFAULT_MAX_VISIBLE): ToastStore {
  let toasts: readonly ToastRecord[] = [];
  let sequence = 0;
  const listeners = new Set<() => void>();

  const commit = (next: readonly ToastRecord[], expired: readonly ToastRecord[]) => {
    toasts = next;
    for (const listener of listeners) listener();
    for (const toast of expired) toast.onExpire?.();
  };

  const take = (id: string): ToastRecord | undefined => {
    const toast = toasts.find((item) => item.id === id);
    if (toast)
      commit(
        toasts.filter((item) => item !== toast),
        [],
      );
    return toast;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => toasts,
    show(options) {
      sequence += 1;
      const id = options.id ?? `toast-${String(sequence)}`;
      const defaults = TOAST_DEFAULTS[options.variant];
      const record: ToastRecord = {
        id,
        key: sequence,
        variant: options.variant,
        position: defaults.position,
        message: options.message,
        durationMs: options.durationMs === undefined ? defaults.durationMs : options.durationMs,
        ...(options.variant === 'undo'
          ? { onUndo: options.onUndo, ...(options.onExpire ? { onExpire: options.onExpire } : {}) }
          : {}),
      };
      const replaced = toasts.filter((item) => item.id === id);
      const queue = [...toasts.filter((item) => item.id !== id), record];
      const samePosition = queue.filter((item) => item.position === record.position);
      const evicted = samePosition.slice(0, Math.max(0, samePosition.length - maxVisible));
      commit(
        queue.filter((item) => !evicted.includes(item)),
        [...replaced, ...evicted],
      );
      return id;
    },
    dismiss(id) {
      take(id)?.onExpire?.();
    },
    undo(id) {
      take(id)?.onUndo?.();
    },
  };
}
