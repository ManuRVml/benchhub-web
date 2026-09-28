import { useCallback, useEffect, useId, useRef } from 'react';

import { useAssistantContextView } from '@/entities/assistant-context';
import {
  selectClosePanel,
  selectMarkTipSeen,
  selectPanelOpen,
  selectTogglePanel,
  toAssistantContextScreen,
  useAssistantChat,
  useAssistantStore,
} from '@/features/assistant';

import { YarbisFab } from './YarbisFab';
import { YarbisPanel } from './YarbisPanel';

import type { AssistantChatPort, AssistantScreen } from '@/features/assistant';

export interface YarbisAssistantProps {
  /** Screen the shell is on (C-33 `context.screen`, CF-112); passed in so the widget does not read the routes. */
  screen: AssistantScreen;
  /** Title of the current screen, already translated (panel header). */
  screenTitle: string;
  /** `canUseAssistant` (CF-40): without it nothing renders, not even the FAB. */
  canUseAssistant: boolean;
  /** C-33 stream + C-34 feedback (`createAssistantChatPort`). */
  port: AssistantChatPort;
  /** Analysis in context (C-33 `context.analysisId`, V-46 `?analysisId=`). */
  analysisId?: string;
}

/**
 * Yarbis assistant of the app shell (SCR-04 items 7–8, OVL-14): the FAB and, while open, the chat panel. The proactive
 * tip and the suggestion chips come from V-46 for the current screen (a failure shows an error bubble with retry in
 * the panel; the chat stays usable). The open state and the screens whose proactive tip was shown live in the
 * assistant store; the conversation lives here, so it survives screen changes. Closing the panel (Esc, "✕" or the
 * FAB) returns the focus to the FAB.
 */
export function YarbisAssistant({ canUseAssistant, ...props }: YarbisAssistantProps) {
  if (!canUseAssistant) return null;
  return <YarbisAssistantWidget {...props} />;
}

function YarbisAssistantWidget({
  screen,
  screenTitle,
  port,
  analysisId,
}: Omit<YarbisAssistantProps, 'canUseAssistant'>) {
  const panelId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const open = useAssistantStore(selectPanelOpen);
  const togglePanel = useAssistantStore(selectTogglePanel);
  const closePanel = useAssistantStore(selectClosePanel);
  const markTipSeen = useAssistantStore(selectMarkTipSeen);
  const chat = useAssistantChat({
    port,
    screen,
    ...(analysisId === undefined ? {} : { analysisId }),
  });
  const { addTip } = chat;
  const context = useAssistantContextView(toAssistantContextScreen(screen), analysisId);
  const contextStatus = context.data
    ? 'ready'
    : context.isError && !context.isFetching
      ? 'error'
      : 'loading';

  // First visit of a screen in this session appends its tip once (HTML L3622–3631). The store is read at effect time,
  // not from the render, so a repeated effect (Strict Mode) cannot add it twice.
  const tipText = context.data?.proactiveTip?.text;
  useEffect(() => {
    if (tipText === undefined || useAssistantStore.getState().tipsSeen[screen]) return;
    markTipSeen(screen);
    addTip(tipText);
  }, [addTip, markTipSeen, screen, tipText]);

  const close = useCallback(() => {
    closePanel();
    fabRef.current?.focus();
  }, [closePanel]);

  return (
    <>
      {open ? (
        <YarbisPanel
          id={panelId}
          screenTitle={screenTitle}
          messages={chat.messages}
          suggestions={context.data?.suggestions ?? []}
          contextStatus={contextStatus}
          onRetryContext={() => {
            void context.refetch();
          }}
          busy={chat.busy}
          onSend={chat.send}
          onRetry={chat.retry}
          onRate={chat.rate}
          onClose={close}
        />
      ) : null}
      <YarbisFab ref={fabRef} open={open} panelId={panelId} onToggle={togglePanel} />
    </>
  );
}
