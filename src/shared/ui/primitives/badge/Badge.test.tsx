// Testing Library and jsdom arrive with P2-W04a (not merged yet): these tests render with react-dom/server and read
// the markup. Switch to @testing-library/react once P2-W04a is on main.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';
import { badgeTestId } from './test-ids';

import type { BadgeKind } from './Badge';

const LABEL = 'label';

function render(kind: BadgeKind, extra: Record<string, string> = {}): string {
  return renderToStaticMarkup(
    <Badge {...kind} {...extra}>
      {LABEL}
    </Badge>,
  );
}

function classesOf(html: string): string[] {
  return (/class="([^"]*)"/.exec(html)?.[1] ?? '').split(' ');
}

const CASES: [string, BadgeKind, string, string[]][] = [
  [
    'status draft',
    { kind: 'status', status: 'draft' },
    'status-draft',
    ['bg-surface-page', 'text-text-secondary'],
  ],
  [
    'status in_progress',
    { kind: 'status', status: 'in_progress' },
    'status-in_progress',
    ['bg-status-warning-note-bg', 'text-status-warning-note-text'],
  ],
  [
    'status in_review',
    { kind: 'status', status: 'in_review' },
    'status-in_review',
    ['bg-status-warning-bg', 'text-status-warning-text'],
  ],
  [
    'status published',
    { kind: 'status', status: 'published' },
    'status-published',
    ['bg-status-success-bg', 'text-status-success-text'],
  ],
  [
    'coverage complete',
    { kind: 'coverage', coverage: 'complete' },
    'coverage-complete',
    ['bg-status-success-bg', 'text-status-success-text'],
  ],
  [
    'coverage partial',
    { kind: 'coverage', coverage: 'partial' },
    'coverage-partial',
    ['bg-status-warning-bg', 'text-status-warning-text'],
  ],
  [
    'coverage missing',
    { kind: 'coverage', coverage: 'missing' },
    'coverage-missing',
    ['bg-status-danger-bg', 'text-status-danger-text'],
  ],
  [
    'severity info',
    { kind: 'severity', severity: 'info' },
    'severity-info',
    ['bg-severity-info-bg', 'text-brand-indigo'],
  ],
  [
    'severity success',
    { kind: 'severity', severity: 'success' },
    'severity-success',
    ['bg-severity-success-bg', 'text-status-success-text'],
  ],
  [
    'severity warn',
    { kind: 'severity', severity: 'warn' },
    'severity-warn',
    ['bg-severity-warn-bg', 'text-status-warning-text'],
  ],
  [
    'severity error',
    { kind: 'severity', severity: 'error' },
    'severity-error',
    ['bg-severity-error-bg', 'text-status-danger-text'],
  ],
  ['tier 1', { kind: 'tier', tier: 1 }, 'tier-1', ['bg-tier-1-card', 'text-status-success-text']],
  ['tier 2', { kind: 'tier', tier: 2 }, 'tier-2', ['bg-tier-2-card', 'text-tier-2-text']],
  ['tier 3', { kind: 'tier', tier: 3 }, 'tier-3', ['bg-tier-3-card', 'text-tier-3-text']],
  ['tier 4', { kind: 'tier', tier: 4 }, 'tier-4', ['bg-tier-4-card', 'text-status-danger-text']],
  [
    'urgency high',
    { kind: 'urgency', urgency: 'high' },
    'urgency-high',
    ['bg-urgency-high-bg', 'text-urgency-high-text'],
  ],
  [
    'urgency medium',
    { kind: 'urgency', urgency: 'medium' },
    'urgency-medium',
    ['bg-urgency-medium-bg', 'text-urgency-medium-text'],
  ],
  [
    'comment pending',
    { kind: 'commentStatus', commentStatus: 'pending' },
    'comment-status-pending',
    ['bg-status-warning-bg', 'text-status-warning-text'],
  ],
  [
    'comment in_analysis',
    { kind: 'commentStatus', commentStatus: 'in_analysis' },
    'comment-status-in_analysis',
    ['bg-severity-info-bg', 'text-brand-indigo'],
  ],
  [
    'comment resolved',
    { kind: 'commentStatus', commentStatus: 'resolved' },
    'comment-status-resolved',
    ['bg-status-success-bg', 'text-status-success-text'],
  ],
  [
    'horizon tbg',
    { kind: 'horizon', horizon: 'tbg' },
    'horizon-tbg',
    ['bg-severity-info-bg', 'text-brand-indigo'],
  ],
  ['horizon ilp', { kind: 'horizon', horizon: 'ilp' }, 'horizon-ilp', ['bg-ai-bg', 'text-ai-text']],
  ['delta up', { kind: 'delta', trend: 'up' }, 'delta-up', ['bg-status-success-bg']],
  ['delta down', { kind: 'delta', trend: 'down' }, 'delta-down', ['bg-status-danger-bg']],
  ['tbd', { kind: 'tbd' }, 'tbd', ['bg-surface-page', 'text-text-secondary']],
  ['count', { kind: 'count' }, 'count', ['bg-status-danger-text', 'text-text-inverse', 'min-h-18']],
  [
    'count brand',
    { kind: 'count', countTone: 'brand' },
    'count-brand',
    ['bg-brand-primary-subtle', 'text-brand-primary', 'px-10', 'py-3'],
  ],
  [
    'count neutral',
    { kind: 'count', countTone: 'neutral' },
    'count-neutral',
    ['bg-surface-page', 'text-text-secondary', 'px-10'],
  ],
  ['code', { kind: 'code' }, 'code', ['font-mono', 'text-text-secondary']],
  [
    'highlight',
    { kind: 'highlight' },
    'highlight',
    ['bg-chart-eco-chip-bg', 'text-chart-eco-chip-text'],
  ],
  ['soon', { kind: 'soon' }, 'soon', ['bg-surface-page', 'text-text-secondary']],
];

describe('Badge', () => {
  it.each(CASES)(
    '%s renders its token classes and data-variant',
    (_name, kind, variant, classes) => {
      const html = render(kind);
      expect(html).toContain(`data-variant="${variant}"`);
      expect(classesOf(html)).toEqual(expect.arrayContaining(classes));
      expect(html).toContain(LABEL);
    },
  );

  it('renders a native span without leaking variant props to the DOM', () => {
    const html = render({ kind: 'status', status: 'published' });
    expect(html.startsWith('<span')).toBe(true);
    expect(html).not.toContain('status="published"');
    expect(html).not.toContain('kind=');
  });

  it('forwards native props and a configurable data-testid', () => {
    const html = render(
      { kind: 'status', status: 'published' },
      { 'data-testid': badgeTestId('analyses', 'status', 'ana-1'), title: 'tooltip' },
    );
    expect(html).toContain('data-testid="analyses-status-badge-ana-1"');
    expect(html).toContain('title="tooltip"');
  });

  it('defaults the count kind to the count size', () => {
    expect(classesOf(render({ kind: 'count' }))).toContain('min-w-18');
    expect(classesOf(render({ kind: 'code' }))).toContain('py-3');
  });
});
