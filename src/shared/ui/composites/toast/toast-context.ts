import { createContext } from 'react';

import type { ToastOptions, UndoToastOptions } from './toast-store';

type Shortcut = (
  message: ToastOptions['message'],
  options?: { id?: string; durationMs?: number | null },
) => string;

/** What `useToast()` returns. Every call returns the toast id. */
export interface ToastApi {
  /** Shows any toast variant. */
  show: (options: ToastOptions) => string;
  /** Closes a toast; an undo toast fires its `onExpire`. */
  dismiss: (id: string) => void;
  /** "Cambios guardados automáticamente" style notice (bottom-right, 1.8 s). Reuses the id `autosave` by default. */
  autosave: Shortcut;
  /** Confirmation such as "✓ Cambios guardados" (bottom-right, 2.2 s). */
  success: Shortcut;
  /** Failure banner (top-center, stays until dismissed, announced assertively). */
  error: Shortcut;
  /** Undo notice with the "Deshacer" action (bottom-center, 5 s). */
  undo: (options: Omit<UndoToastOptions, 'variant'>) => string;
}

export const ToastContext = createContext<ToastApi | null>(null);
