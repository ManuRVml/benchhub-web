import { beforeEach, describe, expect, it } from 'vitest';

import {
  selectClosePanel,
  selectMarkTipSeen,
  selectOpenPanel,
  selectPanelOpen,
  selectTipSeen,
  selectTogglePanel,
  useAssistantStore,
} from './assistant.store';

beforeEach(() => {
  useAssistantStore.setState(useAssistantStore.getInitialState(), true);
});

const state = () => useAssistantStore.getState();

describe('useAssistantStore', () => {
  it('starts closed with no tip seen', () => {
    expect(selectPanelOpen(state())).toBe(false);
    expect(selectTipSeen('SCR-07')(state())).toBe(false);
  });

  it('opens, closes and toggles the panel', () => {
    selectOpenPanel(state())();
    expect(selectPanelOpen(state())).toBe(true);
    selectClosePanel(state())();
    expect(selectPanelOpen(state())).toBe(false);
    selectTogglePanel(state())();
    expect(selectPanelOpen(state())).toBe(true);
    selectTogglePanel(state())();
    expect(selectPanelOpen(state())).toBe(false);
  });

  it('remembers per screen which proactive tip was shown', () => {
    selectMarkTipSeen(state())('SCR-07');
    expect(selectTipSeen('SCR-07')(state())).toBe(true);
    expect(selectTipSeen('SCR-08')(state())).toBe(false);
  });

  it('does not notify subscribers when a tip is marked twice', () => {
    selectMarkTipSeen(state())('SCR-07');
    let notified = 0;
    const unsubscribe = useAssistantStore.subscribe(() => {
      notified += 1;
    });
    selectMarkTipSeen(state())('SCR-07');
    unsubscribe();
    expect(notified).toBe(0);
  });

  it('does not persist anything', () => {
    expect('persist' in useAssistantStore).toBe(false);
  });
});
