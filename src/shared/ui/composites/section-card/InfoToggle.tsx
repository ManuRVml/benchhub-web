import { forwardRef } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { InfoIcon } from '@/shared/ui/icons';
import { IconButton } from '@/shared/ui/primitives/icon-button';

export interface InfoToggleProps {
  /** Element id (e.g. to label the panel with the toggle text). */
  id?: string;
  /** Whether the panel it controls is open (`aria-expanded`). */
  expanded: boolean;
  /** Id of the panel it opens and closes (`aria-controls`). */
  controls: string;
  onToggle: () => void;
  /** Id of the text the toggle is about (e.g. the card title), read after "Más información". */
  describedBy?: string;
  /** Accessible name; defaults to `common.a11y.moreInfo` ("Más información"). */
  'aria-label'?: string;
  /** `data-testid` of the button (default `info-toggle`). */
  testId?: string;
  className?: string;
}

/**
 * The blue "i" button that toggles an inline info panel (component catalog "InfoButton" `toggle`, `Cmp:InfoToggle`):
 * click-toggle, never hover (CF-61), with `aria-expanded` and `aria-controls` pointing to the panel.
 */
export const InfoToggle = forwardRef<HTMLButtonElement, InfoToggleProps>(function InfoToggle(
  {
    id,
    expanded,
    controls,
    onToggle,
    describedBy,
    'aria-label': ariaLabel,
    testId = 'info-toggle',
    className,
  },
  ref,
) {
  const t = useT();
  return (
    <IconButton
      ref={ref}
      {...(id === undefined ? {} : { id })}
      icon={InfoIcon}
      variant="ghost"
      size="sm"
      testId={testId}
      aria-label={ariaLabel ?? t('common.a11y.moreInfo')}
      aria-expanded={expanded}
      aria-controls={controls}
      {...(describedBy === undefined ? {} : { 'aria-describedby': describedBy })}
      className={cn('text-info-icon hover:text-info-mid aria-expanded:bg-info-bg', className)}
      onClick={onToggle}
    />
  );
});
