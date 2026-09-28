import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsForm } from './SettingsForm';

import type { Settings } from './SettingsForm';

// Wrapper component for testing controlled switches
function ControlledSettingsForm({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (p: Partial<Settings>) => void;
}) {
  const [state, setState] = useState(settings);
  return (
    <SettingsForm
      settings={state}
      onChange={(patch) => {
        onChange(patch);
        setState({ ...state, ...patch });
      }}
    />
  );
}

describe('SettingsForm', () => {
  const user = {
    name: 'Camila Bravo',
    roleLabel: 'Analista creador',
    department: 'VP Tecnología e Innovación',
  };

  const settings: Settings = {
    fontScale: 1,
    highContrast: false,
    emailNotifications: true,
  };

  it('renders no in-content page title: the app shell header is the page h1 (F0-3)', () => {
    render(<SettingsForm />);
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.queryByText('Configuración')).toBeNull();
  });

  it('renders the profile as role title + unit next to the avatar (the name is in the header)', () => {
    render(<SettingsForm user={user} />);
    expect(screen.getByTestId('settings-profile-role')).toHaveTextContent('Analista creador');
    expect(screen.getByTestId('settings-profile-role')).toHaveClass('text-title-card');
    expect(screen.getByTestId('settings-profile-unit')).toHaveTextContent(
      'VP Tecnología e Innovación',
    );
    expect(screen.getByTestId('settings-profile-unit')).toHaveClass(
      'text-small',
      'text-text-secondary',
    );
    expect(screen.queryByText('Camila Bravo')).toBeNull();
    expect(screen.getByRole('img', { name: 'Camila Bravo' })).toBeInTheDocument();
  });

  it('lays out a 560px column of two cards with a 52px brand-filled avatar (SCR-16 prototype)', () => {
    render(<SettingsForm user={user} settings={settings} />);
    expect(screen.getByTestId('settings-form')).toHaveClass(
      'max-w-(--size-layout-max-width-config)',
      'gap-20',
    );
    for (const id of ['settings-profile-card', 'settings-accessibility-card']) {
      expect(screen.getByTestId(id)).toHaveClass(
        'rounded-card',
        'border',
        'bg-surface-card',
        'p-22',
      );
    }
    expect(screen.getByTestId('settings-profile-avatar')).toHaveClass(
      'size-(--size-avatar-xl)',
      'bg-brand-primary',
      'text-text-inverse',
    );
    const title = screen.getByRole('heading', { level: 2, name: 'Accesibilidad' });
    expect(title).toHaveClass('text-title-card-sm');
  });

  it('shows the font-size row: label left, three muted square buttons right, the selected one lilac', () => {
    render(<SettingsForm settings={settings} />);
    const row = screen.getByTestId('settings-font-size-row');
    expect(row).toHaveClass('justify-between');
    expect(row.firstElementChild).toHaveTextContent('Tamaño de fuente');
    const selected = screen.getByRole('tab', { name: 'A' });
    expect(selected).toHaveClass('bg-brand-primary-subtle', 'text-brand-primary');
    for (const name of ['A-', 'A+']) {
      expect(screen.getByRole('tab', { name })).toHaveClass(
        'size-(--size-control-square)',
        'bg-surface-page',
      );
    }
    // Both switches are green when on (tone success), not brand purple.
    for (const name of ['Alto contraste', 'Notificaciones por correo']) {
      expect(screen.getByRole('switch', { name })).toHaveClass(
        'data-[state=checked]:bg-status-success-base',
      );
    }
    expect(screen.getByRole('tab', { name: 'A-' })).toHaveClass('text-11');
    expect(screen.getByRole('tab', { name: 'A+' })).toHaveClass('text-14');
  });

  it('renders font size controls', () => {
    render(<SettingsForm settings={settings} />);
    expect(screen.getByRole('tab', { name: 'A-' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'A+' })).toBeInTheDocument();
  });

  it('selects the correct font size tab based on settings', () => {
    render(<SettingsForm settings={{ ...settings, fontScale: 0.9 }} />);
    expect(screen.getByRole('tab', { name: 'A-' })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when font size is changed', async () => {
    const onChange = vi.fn();
    render(<SettingsForm settings={settings} onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'A+' }));
    expect(onChange).toHaveBeenLastCalledWith({ fontScale: 1.1 });
  });

  it('toggles high contrast switch', async () => {
    const onChange = vi.fn();
    render(<ControlledSettingsForm settings={settings} onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Alto contraste' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
    expect(onChange).toHaveBeenLastCalledWith({ highContrast: true });
  });

  it('toggles email notifications switch', async () => {
    const onChange = vi.fn();
    render(<ControlledSettingsForm settings={settings} onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Notificaciones por correo' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
    expect(onChange).toHaveBeenLastCalledWith({ emailNotifications: false });
  });

  it('has data-testid on the form container', () => {
    render(<SettingsForm />);
    expect(screen.getByTestId('settings-form')).toBeInTheDocument();
  });

  it('has data-testid on high contrast switch field', () => {
    render(<SettingsForm settings={settings} />);
    expect(screen.getByTestId('high-contrast-switch-field')).toBeInTheDocument();
  });

  it('has data-testid on email notifications switch field', () => {
    render(<SettingsForm settings={settings} />);
    expect(screen.getByTestId('email-notifications-switch-field')).toBeInTheDocument();
  });
});
