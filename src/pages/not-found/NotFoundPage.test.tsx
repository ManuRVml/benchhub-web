// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { NotFoundPage } from './NotFoundPage';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useNavigate: vi.fn() };
});

describe('NotFoundPage', () => {
  it('renders the h1 with the title', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByText('Puede que el enlace esté roto o que la página se haya movido.'),
    ).toBeInTheDocument();
  });

  it('renders the action button', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument();
  });

  it('navigates to home when clicking the action button', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(<NotFoundPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Ir al inicio' }));

    expect(navigate).toHaveBeenCalled();
  });
});
