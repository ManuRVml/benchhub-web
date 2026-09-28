import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { t } from '@/shared/i18n';

import { AI_PILL_PULSE_CLASS, AiPill } from './AiPill';

// Any common copy works as sample text; the glyph "✦" is added by the component.
const LABEL = t('common.analysisTabs.results');

/** Stubs window.matchMedia so `(prefers-reduced-motion: reduce)` matches when `reduce` is true. */
function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AiPill', () => {
  it('renders "✦" as aria-hidden decoration outside the accessible name', () => {
    render(<AiPill>{LABEL}</AiPill>);
    const pill = screen.getByRole('button', { name: LABEL });
    expect(pill).toHaveTextContent(`✦${LABEL}`);
    const glyph = pill.firstElementChild;
    expect(glyph).toHaveTextContent('✦');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(pill).toHaveAttribute('type', 'button');
    expect(pill).toHaveAttribute('data-testid', 'ai-pill');
  });

  it('applies the AI token classes and the size padding', () => {
    const { rerender } = render(<AiPill>{LABEL}</AiPill>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-ai-bg',
      'border-ai-border',
      'text-ai-text',
      'rounded-pill',
      'px-14',
      'text-12',
    );
    rerender(<AiPill size="sm">{LABEL}</AiPill>);
    expect(screen.getByRole('button')).toHaveClass('px-12', 'py-6', 'text-11');
  });

  it('appends the count to the label', () => {
    render(<AiPill count={3}>{LABEL}</AiPill>);
    expect(screen.getByRole('button', { name: `${LABEL} (3)` })).toBeInTheDocument();
  });

  it('pulses only when asked and motion is allowed', () => {
    stubReducedMotion(false);
    const { rerender } = render(<AiPill>{LABEL}</AiPill>);
    expect(screen.getByRole('button')).not.toHaveClass(AI_PILL_PULSE_CLASS);
    rerender(<AiPill pulse>{LABEL}</AiPill>);
    expect(screen.getByRole('button')).toHaveClass(AI_PILL_PULSE_CLASS);
  });

  it('drops the pulse class under prefers-reduced-motion: reduce', () => {
    stubReducedMotion(true);
    render(<AiPill pulse>{LABEL}</AiPill>);
    expect(screen.getByRole('button')).not.toHaveClass(AI_PILL_PULSE_CLASS);
  });

  it('ignores clicks and announces aria-busy while loading', async () => {
    const onClick = vi.fn();
    render(
      <AiPill onClick={onClick} loading>
        {LABEL}
      </AiPill>,
    );
    const pill = screen.getByRole('button', { name: LABEL });
    expect(pill).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(pill);
    expect(onClick).not.toHaveBeenCalled();
  });
});
