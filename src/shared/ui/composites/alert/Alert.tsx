import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import type { ReactNode } from 'react';

export interface AlertProps {
  /** Alert severity. 'danger' shows the error icon and danger colors; 'info' shows the info icon and brand colors. */
  variant?: 'danger' | 'info';
  /** Title shown above the message. Optional: if omitted, no title is rendered. */
  title?: string;
  /** Main message content. */
  children: ReactNode;
  /** Callback fired when the close button is clicked. If omitted, the close button is not shown. */
  onClose?: () => void;
  /** Custom class name for the alert container. */
  className?: string;
  /** Test ID for the alert container. */
  'data-testid'?: string;
}

/**
 * Alert composite (component catalog "Alert"): displays important messages with optional close action.
 * Two variants: 'danger' (error state, red theme) and 'info' (informational, brand theme).
 */
export function Alert({
  variant = 'danger',
  title,
  children,
  onClose,
  className,
  'data-testid': testId = 'alert',
}: AlertProps) {
  const t = useT();
  const variantStyles = {
    danger: {
      bg: 'bg-status-danger-bg',
      text: 'text-status-danger-text',
      iconColor: 'text-status-danger-text',
      borderColor: 'border-status-danger-base',
    },
    info: {
      bg: 'bg-brand-bg',
      text: 'text-brand-text',
      iconColor: 'text-brand-text',
      borderColor: 'border-brand-base',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      data-testid={testId}
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex flex-col gap-8 rounded-card border p-16',
        styles.bg,
        styles.text,
        styles.borderColor,
        className,
      )}
    >
      {(title ?? onClose) && (
        <div className="flex items-start justify-between gap-12">
          {title && <h4 className="font-medium">{title}</h4>}
          {onClose && (
            <button
              type="button"
              data-testid={`${testId}-close`}
              onClick={onClose}
              className={cn(
                'hover:bg-black/10 shrink-0 rounded-sm px-4 py-1 text-13 focus:ring-2 focus:ring-current focus:outline-none focus:ring-inset',
                styles.iconColor,
              )}
              aria-label={t('common.a11y.closeDialog')}
            >
              {'✕'}
            </button>
          )}
        </div>
      )}
      <div className="text-small">{children}</div>
    </div>
  );
}
