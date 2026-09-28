import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return () => undefined;
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY).matches
    : false;
}

/** True when the user asks for reduced motion; bars then drop their width transition class. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Width transition classes of a bar: none with reduced motion. `motion-reduce:transition-none` also covers the first
 * paint before hydration.
 */
export function barTransitionClass(reducedMotion: boolean, duration: 'bar' | 'barLong' = 'bar') {
  if (reducedMotion) return '';
  return duration === 'barLong'
    ? 'transition-[width] duration-700 ease-out motion-reduce:transition-none'
    : 'transition-[width] duration-500 ease-out motion-reduce:transition-none';
}
