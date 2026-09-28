import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { CheckIcon } from '@/shared/ui/icons';

import { ToastContext } from './toast-context';
import { createToastStore, DEFAULT_MAX_VISIBLE } from './toast-store';

import type { ToastApi } from './toast-context';
import type { ToastPosition, ToastRecord, ToastStore } from './toast-store';
import type { ReactNode } from 'react';

export interface ToastProviderProps {
  /** Toasts kept per position (default 3); showing one more drops the oldest (an undo toast fires `onExpire`). */
  maxVisible?: number;
  children?: ReactNode;
}

/**
 * Toast system (component catalog "Toast"): holds the queue, exposes `useToast()` and renders the three stacks at
 * `z.toast` in a portal. Polite stacks (`role="status"`) sit bottom-right and bottom-center; errors go to the
 * top-center `role="alert"` stack, announced assertively. Timers pause while a toast is hovered or focused.
 */
export function ToastProvider({ maxVisible = DEFAULT_MAX_VISIBLE, children }: ToastProviderProps) {
  const [store] = useState(() => createToastStore(maxVisible));
  const api = useMemo<ToastApi>(
    () => ({
      show: store.show,
      dismiss: store.dismiss,
      autosave: (message, options) =>
        store.show({ variant: 'autosave', message, id: 'autosave', ...options }),
      success: (message, options) => store.show({ variant: 'success', message, ...options }),
      error: (message, options) => store.show({ variant: 'error', message, ...options }),
      undo: (options) => store.show({ variant: 'undo', ...options }),
    }),
    [store],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport store={store} />
    </ToastContext.Provider>
  );
}

const STACK_CLASS: Readonly<Record<ToastPosition, string>> = {
  'bottom-right': 'right-24 bottom-24 items-end',
  'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2 items-center',
  'top-center': 'top-24 left-1/2 -translate-x-1/2 items-center',
};

const POSITIONS: readonly ToastPosition[] = ['bottom-right', 'bottom-center', 'top-center'];

function ToastViewport({ store }: { store: ToastStore }) {
  const t = useT();
  const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  // No document on a server render (the router test renders routes to static markup): no portal there.
  if (typeof document === 'undefined') return null;
  // The live regions are always mounted, so a toast added later is announced.
  return createPortal(
    <>
      {POSITIONS.map((position) => (
        <div
          key={position}
          role={position === 'top-center' ? 'alert' : 'status'}
          aria-live={position === 'top-center' ? 'assertive' : 'polite'}
          aria-label={t('common.a11y.toastRegion')}
          data-testid={`toast-stack-${position}`}
          className={cn(
            'pointer-events-none fixed z-(--z-toast) flex flex-col gap-8',
            STACK_CLASS[position],
          )}
        >
          {toasts
            .filter((toast) => toast.position === position)
            .map((toast) => (
              <ToastItem key={toast.key} toast={toast} store={store} />
            ))}
        </div>
      ))}
    </>,
    document.body,
  );
}

const CARD_CLASS: Readonly<Record<ToastRecord['variant'], string>> = {
  autosave: 'bg-surface-card text-text-heading shadow-toast',
  success: 'bg-status-success-bg text-status-success-text shadow-toast',
  undo: 'bg-text-heading text-text-inverse shadow-toast-undo',
  error: 'bg-status-danger-bg text-status-danger-text shadow-toast',
};

/** Runs `onElapsed` after `durationMs` of unpaused time; pausing keeps the remaining time. */
function useDismissTimer(durationMs: number | null, paused: boolean, onElapsed: () => void) {
  const remaining = useRef(durationMs ?? 0);
  const callback = useRef(onElapsed);
  useEffect(() => {
    callback.current = onElapsed;
  }, [onElapsed]);
  useEffect(() => {
    if (durationMs === null || paused) return undefined;
    const startedAt = Date.now();
    const handle = setTimeout(() => {
      callback.current();
    }, remaining.current);
    return () => {
      clearTimeout(handle);
      remaining.current -= Date.now() - startedAt;
    };
  }, [durationMs, paused]);
}

function ToastItem({ toast, store }: { toast: ToastRecord; store: ToastStore }) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { id } = toast;
  const expire = useMemo(
    () => () => {
      store.dismiss(id);
    },
    [store, id],
  );
  useDismissTimer(toast.durationMs, hovered || focused, expire);

  return (
    <div
      data-testid={`toast-${toast.variant}`}
      data-toast-id={toast.id}
      className={cn(
        'pointer-events-auto flex max-w-120 items-center gap-10 rounded-md px-16 py-12 text-small-medium',
        CARD_CLASS[toast.variant],
      )}
      onPointerEnter={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {toast.variant === 'autosave' || toast.variant === 'success' ? (
        <CheckIcon size={14} className="shrink-0 text-status-success-base" />
      ) : null}
      <span className="min-w-0">{toast.message}</span>
      {toast.variant === 'undo' ? (
        <button
          type="button"
          data-testid="toast-undo-action"
          className="shrink-0 font-semibold text-chart-highlight hover:underline"
          onClick={() => {
            store.undo(id);
          }}
        >
          {t('common.toast.undo')}
        </button>
      ) : null}
      {toast.variant === 'error' ? (
        <button
          type="button"
          data-testid="toast-dismiss"
          aria-label={t('common.a11y.dismissToast')}
          className="shrink-0 rounded-sm px-4 text-13"
          onClick={expire}
        >
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );
}
