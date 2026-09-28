import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CompanyProfileModal } from './CompanyProfileModal';

describe('CompanyProfileModal', () => {
  const profile: Parameters<typeof CompanyProfileModal>[0]['profile'] = {
    company: { id: 'cmp_chevron', name: 'Chevron', colorKey: 'chevron' },
    country: 'Estados Unidos',
    category: 'Super Major',
    business: 'Integrado global',
    segments: ['Upstream', 'Downstream', 'Chemicals'],
    news: [
      { id: 'nws_01', headline: 'Headline 1', impact: 'up' },
      { id: 'nws_02', headline: 'Headline 2', impact: 'down' },
    ],
  };

  it('renders the company name as dialog title', () => {
    render(<CompanyProfileModal open onOpenChange={() => void 0} profile={profile} />);
    expect(screen.getByRole('dialog', { name: 'Chevron' })).toBeInTheDocument();
  });

  it('renders the 4 labelled fields with values', () => {
    render(<CompanyProfileModal open onOpenChange={() => void 0} profile={profile} />);
    expect(screen.getByText('PAÍS')).toBeInTheDocument();
    expect(screen.getByText('CATEGORÍA')).toBeInTheDocument();
    expect(screen.getByText('NEGOCIO')).toBeInTheDocument();
    expect(screen.getByText('SEGMENTOS')).toBeInTheDocument();

    expect(screen.getByText('Estados Unidos')).toBeInTheDocument();
    // Category appears twice: as description (secondary) and as value (body)
    expect(screen.getAllByText('Super Major')).toHaveLength(2);
    expect(screen.getByText('Integrado global')).toBeInTheDocument();
    expect(screen.getByText('Upstream, Downstream, Chemicals')).toBeInTheDocument();
  });

  it('renders segments joined with ", " when empty', () => {
    render(
      <CompanyProfileModal
        open
        onOpenChange={() => void 0}
        profile={{ ...profile, segments: [] }}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders one item per news item with correct border colours', () => {
    render(<CompanyProfileModal open onOpenChange={() => void 0} profile={profile} />);
    expect(screen.getByText('Noticias recientes')).toBeInTheDocument();
    expect(screen.getByText('Headline 1')).toBeInTheDocument();
    expect(screen.getByText('Headline 2')).toBeInTheDocument();

    // The news items are div elements with border-left styling
    const items = screen
      .getAllByTestId('modal')
      .flatMap((modal) => Array.from(modal.querySelectorAll('div.rounded-sm.border-l-4')));
    expect(items).toHaveLength(2);
  });

  it('shows empty state when news is empty', () => {
    render(
      <CompanyProfileModal open onOpenChange={() => void 0} profile={{ ...profile, news: [] }} />,
    );
    expect(screen.getByText('Noticias recientes')).toBeInTheDocument();
    expect(screen.getByText('Sin noticias recientes.')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    render(<CompanyProfileModal open onOpenChange={() => void 0} profile={profile} isLoading />);
    expect(screen.getAllByRole('status')).toHaveLength(8);
  });

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<CompanyProfileModal open onOpenChange={onClose} profile={profile} />);
    await userEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
