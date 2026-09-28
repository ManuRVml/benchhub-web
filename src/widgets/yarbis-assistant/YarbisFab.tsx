import { useT } from '@/shared/i18n';
import { AssistantIcon } from '@/shared/ui/icons';

import { yarbisTestIds } from './test-ids';

import type { Ref } from 'react';

export interface YarbisFabProps {
  open: boolean;
  /** Id of the panel the button opens (`aria-controls`). */
  panelId: string;
  onToggle: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Yarbis floating button (SCR-04 HTML L3176–3178, `Cmp:AssistantFab`): 56px `ai.accent` circle with the 28px robot
 * icon (14px padding), bottom-right over the page on `z.fab`. It toggles the panel and reports it with
 * `aria-expanded`; it receives the focus back when the panel closes.
 */
export function YarbisFab({ open, panelId, onToggle, ref }: YarbisFabProps) {
  const t = useT();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={t('common.a11y.openAssistant')}
      aria-expanded={open}
      aria-controls={panelId}
      data-testid={yarbisTestIds.fab}
      onClick={onToggle}
      className="fixed right-28 bottom-6.5 z-(--z-fab) cursor-pointer rounded-pill bg-ai-accent p-14 text-text-inverse shadow-fab transition-colors hover:bg-ai-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
    >
      <AssistantIcon size={28} />
    </button>
  );
}
