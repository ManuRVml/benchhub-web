// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import {
  LAYOUT_STORAGE_KEY,
  selectSetSidebarCollapsed,
  selectSidebarCollapsed,
  selectToggleSidebar,
  useLayoutStore,
} from './layout.store';

beforeEach(() => {
  localStorage.clear();
  useLayoutStore.setState(useLayoutStore.getInitialState(), true);
});

const stored = (): unknown => JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) ?? 'null');

describe('useLayoutStore', () => {
  it('starts with the sidebar expanded', () => {
    expect(selectSidebarCollapsed(useLayoutStore.getState())).toBe(false);
  });

  it('toggles and sets the sidebar through imperative actions', () => {
    selectToggleSidebar(useLayoutStore.getState())();
    expect(selectSidebarCollapsed(useLayoutStore.getState())).toBe(true);
    selectToggleSidebar(useLayoutStore.getState())();
    expect(selectSidebarCollapsed(useLayoutStore.getState())).toBe(false);
    selectSetSidebarCollapsed(useLayoutStore.getState())(true);
    expect(selectSidebarCollapsed(useLayoutStore.getState())).toBe(true);
  });

  it('persists only the collapse preference', () => {
    useLayoutStore.getState().setSidebarCollapsed(true);
    expect(stored()).toStrictEqual({ state: { sidebarCollapsed: true }, version: 1 });
  });

  it('restores the preference from localStorage', async () => {
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify({ state: { sidebarCollapsed: true }, version: 1 }),
    );
    await useLayoutStore.persist.rehydrate();
    expect(selectSidebarCollapsed(useLayoutStore.getState())).toBe(true);
  });

  it('keeps the action references stable across updates', () => {
    const toggle = selectToggleSidebar(useLayoutStore.getState());
    toggle();
    expect(selectToggleSidebar(useLayoutStore.getState())).toBe(toggle);
  });
});
