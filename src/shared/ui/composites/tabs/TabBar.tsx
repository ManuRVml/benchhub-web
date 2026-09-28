import { useId, useRef, useState } from 'react';

import { cn } from '@/shared/lib';

import { rovingTarget, tabStopId } from './roving-focus';
import { tabsTestIds } from './test-ids';

import type { RovingItem } from './roving-focus';
import type { KeyboardEvent, ReactNode } from 'react';

/** One tab: a stable id and its visible label, already translated by the caller. */
export interface TabItem extends RovingItem {
  label: ReactNode;
}

/**
 * Props shared by SegmentedTabs and PillTabs. Controlled with `value` + `onChange`, or uncontrolled with
 * `defaultValue`.
 */
export interface TabBarProps<Item extends TabItem = TabItem> {
  items: readonly Item[];
  /** Selected tab id (controlled). */
  value?: string;
  /** Initially selected tab id (uncontrolled); default the first enabled tab. */
  defaultValue?: string;
  /** Called with the id of the tab the user selects. */
  onChange?: (id: string) => void;
  /**
   * `automatic` (default) selects a tab as soon as the arrow keys focus it; `manual` only moves focus and selects on
   * Enter / Space (use it when selecting is expensive).
   */
  activation?: 'automatic' | 'manual';
  /** Accessible name of the tab list, already translated. */
  'aria-label': string;
  /**
   * Prefix of the tab / panel ids when the tabs switch panels: each tab gets `aria-controls` pointing at the
   * `TabPanel` rendered with the same prefix. Omit it when the tabs only filter or navigate.
   */
  idPrefix?: string;
  /** Test-id owner: list `{scope}-{component}-tablist`, tabs `{scope}-{component}-tab-{id}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

interface TabBarStyle<Item extends TabItem> {
  listClassName: string;
  tabClassName: (item: Item, selected: boolean) => string;
  renderLabel?: (item: Item) => ReactNode;
}

/** Ids of a tab and of the panel it controls (`TabBar` with `idPrefix`, `TabPanel`). */
export function tabIds(idPrefix: string, itemId: string) {
  return { tab: `${idPrefix}-tab-${itemId}`, panel: `${idPrefix}-panel-${itemId}` };
}

/**
 * WAI-ARIA tab list with a roving tabindex, shared by SegmentedTabs and PillTabs (only the classes differ): one tab in
 * the page tab order, ArrowLeft / ArrowRight (wrapping) and Home / End move between enabled tabs, disabled tabs are
 * skipped and not focusable. Tabs are native buttons, so Enter / Space and clicks select them.
 */
export function TabBar<Item extends TabItem>({
  items,
  value,
  defaultValue,
  onChange,
  activation = 'automatic',
  'aria-label': ariaLabel,
  idPrefix,
  testIds,
  className,
  listClassName,
  tabClassName,
  renderLabel,
}: TabBarProps<Item> & TabBarStyle<Item>) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selectedId = value ?? uncontrolled ?? tabStopId(items, undefined);
  const [focusedId, setFocusedId] = useState<string | undefined>(undefined);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const fallbackPrefix = useId();
  const stopId = tabStopId(items, focusedId ?? selectedId);

  const select = (id: string) => {
    if (id === selectedId) return;
    if (value === undefined) setUncontrolled(id);
    onChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = rovingTarget(items, index, event.key);
    if (target === null) return;
    event.preventDefault();
    const item = items[target];
    if (!item) return;
    tabRefs.current.get(item.id)?.focus();
    if (activation === 'automatic') select(item.id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      {...(testIds ? { 'data-testid': tabsTestIds.list(testIds.scope, testIds.component) } : {})}
      className={cn(listClassName, className)}
    >
      {items.map((item, index) => {
        const selected = item.id === selectedId;
        const ids = tabIds(idPrefix ?? fallbackPrefix, item.id);
        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) tabRefs.current.set(item.id, node);
              else tabRefs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            id={ids.tab}
            aria-selected={selected}
            {...(idPrefix ? { 'aria-controls': ids.panel } : {})}
            tabIndex={item.id === stopId ? 0 : -1}
            disabled={item.disabled}
            data-state={selected ? 'active' : 'inactive'}
            {...(testIds
              ? { 'data-testid': tabsTestIds.tab(testIds.scope, testIds.component, item.id) }
              : {})}
            onFocus={() => {
              setFocusedId(item.id);
            }}
            onBlur={() => {
              setFocusedId(undefined);
            }}
            onClick={() => {
              select(item.id);
            }}
            onKeyDown={(event) => {
              onKeyDown(event, index);
            }}
            className={tabClassName(item, selected)}
          >
            {renderLabel ? renderLabel(item) : item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  /** Same `idPrefix` as the tab bar. */
  idPrefix: string;
  /** Id of the tab this panel belongs to. */
  itemId: string;
  /** Hide the panel of an unselected tab (it stays in the DOM so ria-controls resolves). */
  hidden?: boolean;
  testIds?: { scope: string; component: string };
  className?: string;
  children: ReactNode;
}

/** Panel of a tab bar rendered with `idPrefix`: `role="tabpanel"`, labelled by its tab, focusable. */
export function TabPanel({
  idPrefix,
  itemId,
  hidden,
  testIds,
  className,
  children,
}: TabPanelProps) {
  const ids = tabIds(idPrefix, itemId);
  return (
    <div
      role="tabpanel"
      id={ids.panel}
      aria-labelledby={ids.tab}
      tabIndex={0}
      hidden={hidden}
      {...(testIds
        ? { 'data-testid': tabsTestIds.panel(testIds.scope, testIds.component, itemId) }
        : {})}
      className={cn(
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        className,
      )}
    >
      {children}
    </div>
  );
}
