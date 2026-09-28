import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PeerNewsCarousel, type PeerNewsItem } from './PeerNewsCarousel';

vi.mock('@/shared/i18n', () => ({
  useT: () => {
    const translations: Record<string, string> = {
      'home.sectionTitles.peerNews': 'Noticias de los pares',
      'home.sectionInfo.peerNews':
        'Noticias recientes solo de las compañías configuradas como pares en el análisis.',
      'home.news.empty': 'Sin noticias recientes para los pares configurados.',
      'home.carousel.prev': 'Anterior',
      'home.carousel.next': 'Siguiente',
      'home.carousel.1': '1',
      'home.carousel.2': '2',
      'home.carousel.3': '3',
      'home.carousel.4': '4',
      'home.carousel.5': '5',
      'home.carousel.6': '6',
      'home.carousel.7': '7',
    };
    return (key: string) => translations[key] ?? key;
  },
}));

describe('PeerNewsCarousel', () => {
  const createMockItem = (overrides: Partial<PeerNewsItem> = {}): PeerNewsItem => ({
    id: `item-${overrides.id ?? '1'}`,
    companyId: 'company-1',
    companyName: 'Company Name',
    colorKey: 'ecopetrol',
    initials: 'CN',
    impact: 'up',
    headline: 'Headline text',
    source: 'Source name',
    ...overrides,
  });

  it('renders the uppercase group label with the description behind its (i) toggle (prototype L316-L335)', () => {
    render(<PeerNewsCarousel items={[createMockItem()]} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Noticias de los pares' });
    expect(heading).toHaveClass('uppercase', 'text-eyebrow');
    expect(screen.getByTestId('peer-news')).not.toHaveClass('border', 'bg-surface-card');
    const info = 'Noticias recientes solo de las compañías configuradas como pares en el análisis.';
    expect(screen.queryByText(info)).not.toBeVisible();
    fireEvent.click(screen.getByTestId('peer-news-info-toggle'));
    expect(screen.getByText(info)).toBeVisible();
  });

  it('lays the cards out as the auto-fill minmax(220px) grid: 5 columns at canvas', () => {
    render(<PeerNewsCarousel items={[createMockItem()]} />);
    expect(screen.getByTestId('peer-news-grid')).toHaveClass(
      'gap-14',
      'tablet:grid-cols-2',
      'laptop:grid-cols-3',
      'desktop:grid-cols-4',
      'canvas:grid-cols-5',
    );
  });

  it('puts the impact arrow in the card header, opposite the company chip (prototype L342-L353)', () => {
    render(<PeerNewsCarousel items={[createMockItem({ headline: 'Margin up' })]} />);
    const impact = screen.getByTestId('peer-news-impact');
    expect(impact.parentElement).toHaveClass('justify-between');
    expect(impact.parentElement).toHaveTextContent('Company Name');
    expect(impact.parentElement).not.toHaveTextContent('Margin up');
  });

  it('renders all cards when items fit in one page', () => {
    const items = Array.from({ length: 3 }).map((_, i) =>
      createMockItem({
        id: String(i),
        headline: `Headline ${String(i)}`,
        source: `Source ${String(i)}`,
      }),
    );
    render(<PeerNewsCarousel items={items} />);
    expect(screen.getByRole('region', { name: 'Noticias de los pares' })).toBeInTheDocument();
    items.forEach((item) => {
      expect(screen.getByText(item.headline)).toBeInTheDocument();
      expect(screen.getByText(item.source)).toBeInTheDocument();
    });
  });

  it('hides pager when items fit in one page', () => {
    const items = Array.from({ length: 3 }).map((_, i) => createMockItem({ id: String(i) }));
    render(<PeerNewsCarousel items={items} />);
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
  });

  it('renders items across multiple pages', () => {
    const items = Array.from({ length: 7 }).map((_, i) =>
      createMockItem({ id: String(i), headline: `Headline ${String(i)}` }),
    );
    render(<PeerNewsCarousel items={items} />);
    expect(screen.getByRole('region', { name: 'Noticias de los pares' })).toBeInTheDocument();
    expect(screen.getByText('Headline 0')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
  });

  it('navigates to next page', () => {
    const items = Array.from({ length: 7 }).map((_, i) =>
      createMockItem({ id: String(i), headline: `Headline ${String(i)}` }),
    );
    render(<PeerNewsCarousel items={items} />);
    const nextButton = screen.getByRole('button', { name: 'Siguiente' });
    fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled();
    const dots = screen.getAllByRole('button', { name: /^[1-3]$/ });
    expect(dots[1]).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to previous page', () => {
    const items = Array.from({ length: 7 }).map((_, i) =>
      createMockItem({ id: String(i), headline: `Headline ${String(i)}` }),
    );
    render(<PeerNewsCarousel items={items} />);
    const nextButton = screen.getByRole('button', { name: 'Siguiente' });
    fireEvent.click(nextButton);
    const prevButton = screen.getByRole('button', { name: 'Anterior' });
    fireEvent.click(prevButton);
    expect(prevButton).toBeDisabled();
    const dots = screen.getAllByRole('button', { name: /^[1-3]$/ });
    expect(dots[0]).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to specific page via dots', () => {
    const items = Array.from({ length: 11 }).map((_, i) =>
      createMockItem({ id: String(i), headline: `Headline ${String(i)}` }),
    );
    render(<PeerNewsCarousel items={items} />);
    const dots = screen.getAllByRole('button', { name: /^[1-3]$/ });
    const third = dots[2];
    if (!third) throw new Error('missing dot');
    fireEvent.click(third);
    expect(third).toHaveAttribute('aria-current', 'page');
  });

  it('renders empty state when no items', () => {
    render(<PeerNewsCarousel items={[]} />);
    expect(
      screen.getByText('Sin noticias recientes para los pares configurados.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Noticias de los pares' })).toBeInTheDocument();
  });

  it('hides pager when empty', () => {
    render(<PeerNewsCarousel items={[]} />);
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
  });

  it('shows correct arrow for impact (up/down)', () => {
    const upItem = createMockItem({
      id: 'up-1',
      impact: 'up',
      headline: 'Up impact headline',
      source: 'Source up',
    });
    const downItem = createMockItem({
      id: 'down-1',
      impact: 'down',
      headline: 'Down impact headline',
      source: 'Source down',
    });
    render(<PeerNewsCarousel items={[upItem, downItem]} />);
    expect(screen.getByText('Up impact headline')).toBeInTheDocument();
    expect(screen.getByText('Down impact headline')).toBeInTheDocument();
  });

  it('applies correct color class for impact', () => {
    const upItem = createMockItem({
      id: 'up-2',
      impact: 'up',
      headline: 'Up impact color',
      source: 'Source up color',
    });
    const downItem = createMockItem({
      id: 'down-2',
      impact: 'down',
      headline: 'Down impact color',
      source: 'Source down color',
    });
    render(<PeerNewsCarousel items={[upItem, downItem]} />);
    expect(screen.getByText('Up impact color')).toBeInTheDocument();
    expect(screen.getByText('Down impact color')).toBeInTheDocument();
  });
});
