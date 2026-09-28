import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';
import { initialsOf } from './initials';

describe('initialsOf', () => {
  it.each([
    ['Camila Bravo', 'CB'],
    ['Shell', 'SH'],
    ['TotalEnergies', 'TO'],
    ['  maría   josé  pérez ', 'MJ'],
    ['', ''],
  ])('%s → %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe('Avatar', () => {
  it('shows the initials as an image named by the person', () => {
    render(<Avatar name="Camila Bravo" />);
    const avatar = screen.getByRole('img', { name: 'Camila Bravo' });
    expect(avatar).toHaveTextContent('CB');
    expect(avatar).toHaveClass('size-(--size-control-icon-button-md)', 'rounded-pill');
  });

  it('xl + brand tone: a 52px circle filled with brand.primary and white initials (SCR-16 profile)', () => {
    const { rerender } = render(<Avatar name="Camila Bravo" size="xl" tone="brand" />);
    const avatar = screen.getByRole('img', { name: 'Camila Bravo' });
    expect(avatar).toHaveClass('size-(--size-avatar-xl)', 'bg-brand-primary', 'text-text-inverse');
    expect(avatar).not.toHaveClass('bg-brand-primary-subtle');
    rerender(<Avatar name="Camila Bravo" size="xl" />);
    expect(avatar).toHaveClass('bg-brand-primary-subtle', 'text-brand-primary');
  });

  it('shows the photo with alt text and falls back to the initials when it fails', () => {
    render(<Avatar name="Camila Bravo" src="/user-avatar.png" size="lg" />);
    const photo = screen.getByRole('img', { name: 'Camila Bravo' });
    expect(photo.tagName).toBe('IMG');
    expect(photo).toHaveClass('size-48');
    fireEvent.error(photo);
    const fallback = screen.getByRole('img', { name: 'Camila Bravo' });
    expect(fallback.tagName).toBe('SPAN');
    expect(fallback).toHaveTextContent('CB');
  });

  it('is hidden from assistive technology when decorative', () => {
    render(<Avatar name="Camila Bravo" decorative />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByTestId('avatar')).toHaveAttribute('aria-hidden', 'true');
  });
});
