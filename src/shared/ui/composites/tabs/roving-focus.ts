/** Anything a roving-focus list moves over: an id and an optional disabled flag. */
export interface RovingItem {
  id: string;
  disabled?: boolean;
}

/** Index of the next enabled item from `from` in direction `step` (±1), wrapping around; -1 when none is enabled. */
function stepEnabled(items: readonly RovingItem[], from: number, step: 1 | -1): number {
  for (let offset = 1; offset <= items.length; offset++) {
    const index = (((from + step * offset) % items.length) + items.length) % items.length;
    if (items[index]?.disabled !== true) return index;
  }
  return -1;
}

/** First (`step` 1) or last (`step` -1) enabled index; -1 when every item is disabled. */
function edgeEnabled(items: readonly RovingItem[], step: 1 | -1): number {
  return stepEnabled(items, step === 1 ? items.length - 1 : 0, step);
}

/**
 * Target of a key in a horizontal roving-focus list (WAI-ARIA tabs pattern): ArrowRight / ArrowLeft move to the next /
 * previous enabled item and wrap, Home / End jump to the first / last enabled item. Disabled items are skipped. Returns
 * `null` for any other key (the caller lets the browser handle it).
 */
export function rovingTarget(
  items: readonly RovingItem[],
  currentIndex: number,
  key: string,
): number | null {
  let target: number;
  switch (key) {
    case 'ArrowRight':
      target = stepEnabled(items, currentIndex, 1);
      break;
    case 'ArrowLeft':
      target = stepEnabled(items, currentIndex, -1);
      break;
    case 'Home':
      target = edgeEnabled(items, 1);
      break;
    case 'End':
      target = edgeEnabled(items, -1);
      break;
    default:
      return null;
  }
  return target === -1 ? null : target;
}

/** Id of the item that holds `tabIndex=0`: the preferred one when it is enabled, else the first enabled item. */
export function tabStopId(
  items: readonly RovingItem[],
  preferred: string | undefined,
): string | undefined {
  const enabled = items.filter((item) => item.disabled !== true);
  return enabled.find((item) => item.id === preferred)?.id ?? enabled[0]?.id;
}
