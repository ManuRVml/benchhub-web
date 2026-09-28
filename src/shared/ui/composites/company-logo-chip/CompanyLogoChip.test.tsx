import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CompanyLogoChip } from './CompanyLogoChip';

const chip = () => screen.getByTestId('company-logo-chip');

describe('CompanyLogoChip', () => {
  it.each([
    ['ecopetrol', 'Ecopetrol', 'bg-company-ecopetrol'],
    ['shell', 'Shell', 'bg-company-shell'],
    ['totalEnergies', 'TotalEnergies', 'bg-company-total-energies'],
  ])('maps the colour key %s to its company token class', (slug, name, bg) => {
    render(<CompanyLogoChip slug={slug} name={name} />);
    expect(chip()).toHaveClass(bg);
    expect(chip()).not.toHaveClass('bg-company-fallback');
  });

  it.each([['acme'], [null], [undefined], ['']])(
    'falls back to company.fallback for an unknown key (%s)',
    (slug) => {
      render(<CompanyLogoChip slug={slug} name="Acme Energy" />);
      expect(chip()).toHaveClass('bg-company-fallback', 'text-text-inverse');
    },
  );

  it('uses dark initials on light company colours and light ones on dark colours', () => {
    const { rerender } = render(<CompanyLogoChip slug="shell" name="Shell" />);
    expect(chip()).toHaveClass('text-dark-bg');
    rerender(<CompanyLogoChip slug="bp" name="BP" />);
    expect(chip()).toHaveClass('text-dark-bg');
    rerender(<CompanyLogoChip slug="petrobras" name="Petrobras" />);
    expect(chip()).toHaveClass('text-text-inverse');
  });

  it('shows the initials (BFF or derived) and the visible name, with a decorative chip', () => {
    const { rerender } = render(<CompanyLogoChip slug="shell" name="Shell" />);
    expect(chip()).toHaveTextContent('SH');
    expect(chip()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Shell')).toBeInTheDocument();
    rerender(<CompanyLogoChip slug="bp" name="BP" initials="BP" />);
    expect(chip()).toHaveTextContent('BP');
  });

  it('is an image named by the company when the name is not shown', () => {
    render(<CompanyLogoChip slug="equinor" name="Equinor" showName={false} size="md" />);
    const image = screen.getByRole('img', { name: 'Equinor' });
    expect(image).toHaveClass('size-(--size-control-icon-button-md)', 'bg-company-equinor');
    expect(screen.queryByText('Equinor')).toBeNull();
  });
});
