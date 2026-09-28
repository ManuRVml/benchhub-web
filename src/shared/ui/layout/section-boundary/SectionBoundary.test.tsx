// Testing Library and jsdom arrive with P2-W04a (not merged yet), so these tests render with react-dom/server and
// read the markup; the retry wiring is checked on the presentational SectionErrorPanel element tree. Switch to
// @testing-library/react (render + user-event click) once P2-W04a is on main.
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SectionBoundary, SectionErrorPanel } from './SectionBoundary';
import { sectionBoundaryTestIds } from './test-ids';

import type { SectionResult } from '@/shared/api/section-result';
import type { ReactElement, ReactNode } from 'react';

const SCOPE = 'home-peer-news';
const CHILD = 'peer news list';

function renderBoundary(
  result: SectionResult<string[]> | undefined,
  extra: { isEmpty?: (data: string[]) => boolean; onRetry?: () => void } = {},
): string {
  return renderToStaticMarkup(
    <SectionBoundary scope={SCOPE} result={result} {...extra}>
      {(items) => (
        <ul data-testid="child">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </SectionBoundary>,
  );
}

function rootAttrs(html: string): { state: string | undefined; testId: string | undefined } {
  const state = /data-state="([^"]+)"/.exec(html)?.[1];
  const testId = /data-testid="([^"]+)"/.exec(html)?.[1];
  return { state, testId };
}

/** Depth-first search of a React element tree for the first element of the given type. */
function findElement(
  node: ReactNode,
  type: string,
): ReactElement<Record<string, unknown>> | undefined {
  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined;
  if (node.type === type) return node as ReactElement<Record<string, unknown>>;
  return findElement(node.props.children, type);
}

describe('SectionBoundary', () => {
  it('loading: data-state and aria-busy while the result is undefined', () => {
    const html = renderBoundary(undefined);
    expect(rootAttrs(html)).toEqual({
      state: 'loading',
      testId: sectionBoundaryTestIds.root(SCOPE, 'loading'),
    });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Cargando…');
    expect(html).not.toContain(CHILD);
  });

  it('ready: renders children with the data', () => {
    const html = renderBoundary({ status: 'ok', data: [CHILD] });
    expect(rootAttrs(html)).toEqual({ state: 'ready', testId: 'home-peer-news-section-ready' });
    expect(html).toContain('data-testid="child"');
    expect(html).toContain(CHILD);
  });

  it('empty: renders the empty slot instead of children', () => {
    const html = renderBoundary(
      { status: 'ok', data: [] },
      { isEmpty: (items) => items.length === 0 },
    );
    expect(rootAttrs(html)).toEqual({ state: 'empty', testId: 'home-peer-news-section-empty' });
    expect(html).toContain('No hay datos para mostrar.');
    expect(html).not.toContain('data-testid="child"');
  });

  it('error: role="alert", error code and a retry button', () => {
    const html = renderBoundary(
      { status: 'error', errorCode: 'PROVIDER_TIMEOUT' },
      { onRetry: vi.fn() },
    );
    expect(rootAttrs(html)).toEqual({ state: 'error', testId: 'home-peer-news-section-error' });
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-error-code="PROVIDER_TIMEOUT"');
    expect(html).toContain('No se pudo cargar esta sección.');
    expect(html).toContain(`data-testid="${sectionBoundaryTestIds.retry(SCOPE)}"`);
    expect(html).not.toContain(CHILD);
  });

  it('error without onRetry shows no retry button', () => {
    const html = renderBoundary({ status: 'error', errorCode: 'X' });
    expect(html).not.toContain(sectionBoundaryTestIds.retry(SCOPE));
  });

  it('forbidden: hides the children', () => {
    const html = renderBoundary({ status: 'forbidden' });
    expect(rootAttrs(html)).toEqual({
      state: 'forbidden',
      testId: 'home-peer-news-section-forbidden',
    });
    expect(html).toContain('No tienes permiso para ver esta sección.');
    expect(html).not.toContain('data-testid="child"');
    expect(html).not.toContain(CHILD);
  });

  it('retry: the error panel button calls onRetry', () => {
    const onRetry = vi.fn();
    const tree = SectionErrorPanel({
      testId: 'x-section-error',
      retryTestId: 'x-section-retry',
      errorCode: 'X',
      title: 'title',
      retryLabel: 'retry',
      onRetry,
    });
    const button = findElement(tree, 'button');
    expect(button?.props['data-testid']).toBe('x-section-retry');
    (button?.props.onClick as (() => void) | undefined)?.();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
