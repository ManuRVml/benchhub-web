// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AccessGatePage } from './AccessGatePage';

describe('AccessGatePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders h1 with translation key heading.title', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('¿A dónde quieres ir?');
  });

  it('renders subtitle with translation key heading.subtitle', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Elige un acceso para continuar')).toBeInTheDocument();
  });

  it('renders tool card link pointing to home route', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    const toolCard = screen.getByRole('link', {
      name: 'Ingresar a la herramienta Análisis, resultados, visualización y presentaciones de referenciamiento competitivo.',
    });
    expect(toolCard).toHaveAttribute('href', '/inicio');
  });

  it('renders administration card link pointing to admin route', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    const adminCard = screen.getByRole('link', {
      name: 'Administración Back office: usuarios, roles, fuentes de datos y parámetros del sistema.',
    });
    expect(adminCard).toHaveAttribute('href', '/admin');
  });

  it('renders logout button calling onLogout', () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <AccessGatePage onLogout={onLogout} />
      </MemoryRouter>,
    );
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' });
    logoutButton.click();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls default no-op onLogout when not provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' });
    expect(() => {
      logoutButton.click();
    }).not.toThrow();
    consoleSpy.mockRestore();
  });

  it('applies hover border-brand-indigo on cards', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    const toolCard = screen.getByRole('link', {
      name: 'Ingresar a la herramienta Análisis, resultados, visualización y presentaciones de referenciamiento competitivo.',
    });
    expect(toolCard).toHaveClass('hover:border-(color:--brand-indigo)');
    const adminCard = screen.getByRole('link', {
      name: 'Administración Back office: usuarios, roles, fuentes de datos y parámetros del sistema.',
    });
    expect(adminCard).toHaveClass('hover:border-(color:--brand-indigo)');
  });

  it('renders data-testid="access-gate-page"', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('access-gate-page')).toBeInTheDocument();
  });

  it('has main element as root container', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders both card titles', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Ingresar a la herramienta')).toBeInTheDocument();
    expect(screen.getByText('Administración')).toBeInTheDocument();
  });

  it('renders both card descriptions', () => {
    render(
      <MemoryRouter>
        <AccessGatePage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(
        'Análisis, resultados, visualización y presentaciones de referenciamiento competitivo.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Back office: usuarios, roles, fuentes de datos y parámetros del sistema.'),
    ).toBeInTheDocument();
  });
});
