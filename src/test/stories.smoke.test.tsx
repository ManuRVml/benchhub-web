// @vitest-environment jsdom
import { composeStories } from '@storybook/react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ComponentType } from 'react';

// jsdom has no ResizeObserver; charts and sliders observe their container.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

type StoriesModule = Parameters<typeof composeStories>[0];

const modules = import.meta.glob<StoriesModule>('../**/*.stories.tsx', { eager: true });
/** The glob types every file as CSF, but a file can lack its default export (meta); check it at runtime. */
const hasMeta = (mod: unknown): boolean =>
  typeof mod === 'object' && mod !== null && (mod as { default?: unknown }).default !== undefined;
// composeStories throws on a module without a default export; skip it here so the CSF check below names the file.
const cases: [string, ComponentType][] = Object.entries(modules).flatMap(([path, mod]) =>
  (hasMeta(mod) ? Object.entries<ComponentType>(composeStories(mod)) : []).map(
    ([name, Story]): [string, ComponentType] => [`${path.replace('../', '')} - ${name}`, Story],
  ),
);

afterEach(cleanup);

// build-storybook refuses to index a stories file without a CSF default export (meta); catch it here, in `pnpm test`.
describe('stories files are CSF modules', () => {
  it.each(Object.entries(modules))('%s has a default export (meta)', (_path, mod) => {
    expect(hasMeta(mod)).toBe(true);
  });
});

describe('stories render without throwing', () => {
  it.each(cases)('renders %s', (_key, Story) => {
    expect(() => render(<Story />)).not.toThrow();
  });
});
