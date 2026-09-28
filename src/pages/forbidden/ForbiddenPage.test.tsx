// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ForbiddenPage } from './ForbiddenPage';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useNavigate: vi.fn() };
});

describe('ForbiddenPage', () => {
  it('renders the h1 with the title', () => {
    render(<ForbiddenPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ForbiddenPage />);
    expect(
      screen.getByText(
        'Si crees que deberías tener acceso, contacta al administrador de la herramienta.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the action button', () => {
    render(<ForbiddenPage />);
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument();
  });

  it('navigates to home when clicking the action button', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(<ForbiddenPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Ir al inicio' }));

    expect(navigate).toHaveBeenCalled();
  });
});
