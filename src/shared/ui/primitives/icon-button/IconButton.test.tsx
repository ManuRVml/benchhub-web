import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { t } from '@/shared/i18n';
import { BellIcon, HelpIcon } from '@/shared/ui/icons';

import { IconButton } from './IconButton';

const BELL = t('common.ariaLabel.notifications');

describe('IconButton', () => {
  it('is a native button named by its aria-label, with a decorative icon and no tooltip', () => {
    render(<IconButton aria-label={BELL} icon={BellIcon} />);
    const button = screen.getByRole('button', { name: BELL });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-testid', 'icon-button');
    expect(button).not.toHaveAttribute('title');
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '20');
  });

  it('applies the token classes of each variant and size', () => {
    const { rerender } = render(<IconButton aria-label={BELL} icon={BellIcon} />);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-surface-page',
      'rounded-pill',
      'size-(--size-control-icon-button-md)',
    );
    rerender(<IconButton aria-label={BELL} icon={BellIcon} variant="ghost" size="sm" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent', 'size-(--size-control-icon-button-sm)');
    expect(button).not.toHaveClass('bg-surface-page');
    expect(button.querySelector('svg')).toHaveAttribute('width', '14');
  });

  it('forwards the ref and calls onClick unless disabled', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const label = t('common.ariaLabel.help');
    const { rerender } = render(
      <IconButton ref={ref} aria-label={label} icon={HelpIcon} onClick={onClick} />,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: label }));
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<IconButton aria-label={label} icon={HelpIcon} onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('requires aria-label at the type level', () => {
    // An icon-only button without an accessible name must not compile. If `aria-label` becomes optional this
    // directive is unused and `pnpm typecheck` fails.
    // @ts-expect-error -- `aria-label` is required
    const element = <IconButton icon={BellIcon} />;
    expect(element.props).not.toHaveProperty('aria-label');
  });
});
