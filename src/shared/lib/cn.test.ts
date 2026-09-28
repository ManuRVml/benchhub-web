import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('px-2', false, undefined, null, 'py-1', { hidden: false, block: true })).toBe(
      'px-2 py-1 block',
    );
  });

  it('keeps the last conflicting Tailwind utility', () => {
    expect(cn('p-2 text-body', 'p-4')).toBe('text-body p-4');
    expect(cn('bg-brand-primary', 'bg-ai-accent')).toBe('bg-ai-accent');
  });

  it('does not merge utilities of different properties', () => {
    expect(cn('text-brand-primary', 'text-eyebrow')).toBe('text-brand-primary text-eyebrow');
  });
});
