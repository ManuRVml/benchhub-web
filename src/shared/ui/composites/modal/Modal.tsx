import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import type { ReactNode, RefObject } from 'react';

/** Card widths of the prototype overlays (docs/design/component-catalog.md "Modal"); the 1180 preview is its own variant. */
export const MODAL_WIDTHS = [420, 440, 480, 520, 560, 640] as const;
export type ModalWidth = (typeof MODAL_WIDTHS)[number];

// Tailwind's spacing multiplier is 4px, so max-w-105 = 420px; token spacing names (2..64) never collide with these.
const WIDTH_CLASS: Readonly<Record<ModalWidth, string>> = {
  420: 'max-w-105',
  440: 'max-w-110',
  480: 'max-w-120',
  520: 'max-w-130',
  560: 'max-w-140',
  640: 'max-w-160',
};

export interface ModalProps {
  /** Controlled open state; omit it (and `onOpenChange`) together with `trigger` for an uncontrolled modal. */
  open?: boolean;
  /** Called with `false` on Esc, overlay click or "✕", and with `true` when `trigger` opens the modal. */
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the modal (rendered through Radix `Dialog.Trigger asChild`); focus returns to it on close. */
  trigger?: ReactNode;
  /** Accessible name of the dialog (`aria-labelledby`), shown as the `title-modal` heading. Required. */
  title: ReactNode;
  /** Accessible description (`aria-describedby`), shown under the title. Required for screen readers. */
  description: ReactNode;
  /** Keeps the description for assistive technology only (visually hidden) when the design shows no subtitle. */
  hideDescription?: boolean;
  /** Card max width in px (420 · 440 · 480 · 520 · 560 · 640); the card shrinks on narrow viewports. Default 480. */
  width?: ModalWidth;
  /** Esc closes the modal (default `true`); set `false` for flows that must not be interrupted (e.g. uploading). */
  closeOnEscape?: boolean;
  /** A click on the scrim closes the modal (default `true`). */
  closeOnOverlayClick?: boolean;
  /** Shows the "✕" close button in the top-right corner (default `true`). */
  showCloseButton?: boolean;
  /** Element focused when the modal opens; by default Radix focuses the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Actions row under the body (e.g. "Cancelar" / "Guardar"). */
  footer?: ReactNode;
  /** `data-testid` of the card; the scrim gets `<testId>-overlay` and the close button `<testId>-close`. */
  testId?: string;
  children?: ReactNode;
}

/**
 * Dialog frame shared by every overlay (component catalog "Modal"): scrim `overlay.scrim`, white card `radius.modal` with
 * `shadow.modal`, stacked at `z.modal`. Built on Radix Dialog: focus is trapped inside the card and returns to the
 * trigger on close, Esc and scrim clicks close it unless disabled, and the title / description name the dialog.
 */
export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  hideDescription = false,
  width = 480,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  initialFocusRef,
  footer,
  testId = 'modal',
  children,
}: ModalProps) {
  const t = useT();
  const opener = useRef<HTMLElement | null>(null);
  const controlled = open === undefined ? {} : { open };

  return (
    <Dialog.Root {...controlled} {...(onOpenChange ? { onOpenChange } : {})}>
      {trigger === undefined ? null : <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay
          data-testid={`${testId}-overlay`}
          className="fixed inset-0 z-(--z-modal) grid place-items-center overflow-y-auto bg-overlay-scrim p-16"
        >
          <Dialog.Content
            data-testid={testId}
            className={cn(
              'relative w-full rounded-modal bg-surface-card p-24 text-body text-text-body shadow-modal',
              WIDTH_CLASS[width],
            )}
            onCloseAutoFocus={(event) => {
              // Radix returns focus to its Trigger; a controlled modal without `trigger` returns it to the opener.
              if (trigger !== undefined) return;
              event.preventDefault();
              opener.current?.focus();
            }}
            onEscapeKeyDown={(event) => {
              if (!closeOnEscape) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (!closeOnOverlayClick) event.preventDefault();
            }}
            onOpenAutoFocus={(event) => {
              // Still the element that opened the modal: focus moves into the card after this event.
              opener.current =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
              const target = initialFocusRef?.current;
              if (target) {
                event.preventDefault();
                target.focus();
              }
            }}
          >
            <Dialog.Title
              className={cn('text-title-modal text-text-heading', showCloseButton && 'pr-32')}
            >
              {title}
            </Dialog.Title>
            <Dialog.Description
              className={cn('mt-4 text-small text-text-secondary', hideDescription && 'sr-only')}
            >
              {description}
            </Dialog.Description>
            {children === undefined ? null : <div className="mt-16">{children}</div>}
            {footer === undefined ? null : (
              <div className="mt-24 flex items-center justify-end gap-8">{footer}</div>
            )}
            {showCloseButton ? (
              <Dialog.Close
                data-testid={`${testId}-close`}
                aria-label={t('common.a11y.closeDialog')}
                className="absolute top-16 right-16 grid size-28 place-items-center rounded-sm text-17 text-text-muted hover:text-text-secondary"
              >
                <span aria-hidden="true">✕</span>
              </Dialog.Close>
            ) : null}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
