// Assistant UI state (brief §5.3, ADR-0005): the side panel and which screens already showed their proactive tip.
// Not persisted: a tip is shown once per screen per browser session, and a reload starts a new session.
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { storeDevtools } from '@/shared/lib/store';

export interface AssistantState {
  readonly panelOpen: boolean;
  /** Screens (e.g. `'SCR-07'`) whose proactive tip was already shown in this session. */
  readonly tipsSeen: Readonly<Record<string, true>>;
}

export interface AssistantActions {
  readonly openPanel: () => void;
  readonly closePanel: () => void;
  readonly togglePanel: () => void;
  readonly markTipSeen: (screen: string) => void;
}

export type AssistantStore = AssistantState & AssistantActions;

export const useAssistantStore = create<AssistantStore>()(
  devtools(
    (set) => ({
      panelOpen: false,
      tipsSeen: {},
      openPanel: () => {
        set({ panelOpen: true }, false, 'assistant/openPanel');
      },
      closePanel: () => {
        set({ panelOpen: false }, false, 'assistant/closePanel');
      },
      togglePanel: () => {
        set((state) => ({ panelOpen: !state.panelOpen }), false, 'assistant/togglePanel');
      },
      markTipSeen: (screen) => {
        set(
          (state) =>
            state.tipsSeen[screen] ? state : { tipsSeen: { ...state.tipsSeen, [screen]: true } },
          false,
          'assistant/markTipSeen',
        );
      },
    }),
    storeDevtools('assistant'),
  ),
);

export const selectPanelOpen = (state: AssistantStore): boolean => state.panelOpen;
/** Selector factory: whether the proactive tip of `screen` was already shown. */
export const selectTipSeen =
  (screen: string) =>
  (state: AssistantStore): boolean =>
    state.tipsSeen[screen] === true;
export const selectOpenPanel = (state: AssistantStore): AssistantActions['openPanel'] =>
  state.openPanel;
export const selectClosePanel = (state: AssistantStore): AssistantActions['closePanel'] =>
  state.closePanel;
export const selectTogglePanel = (state: AssistantStore): AssistantActions['togglePanel'] =>
  state.togglePanel;
export const selectMarkTipSeen = (state: AssistantStore): AssistantActions['markTipSeen'] =>
  state.markTipSeen;
