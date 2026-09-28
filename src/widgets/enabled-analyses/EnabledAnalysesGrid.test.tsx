import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi, describe, it, expect } from 'vitest';

import { EnabledAnalysesGrid } from './EnabledAnalysesGrid';

import type { EnabledAnalysis } from './EnabledAnalysesGrid';

const MOCK: EnabledAnalysis[] = [
  {
    id: '1',
    title: 'Informe de referenciamiento de pares',
    description: 'Seguimiento trimestral de Ecopetrol vs. 14 compañías del sector.',
    status: 'published',
    updatedAt: '2024-01-01T10:00:00Z',
    ownerName: 'Alejandra',
    targetRoute: '/analisis/1/visualizacion',
  },
  {
    id: '2',
    title: 'Referentes estratégicos',
    description: 'TBG e ILP frente a pares del sector energético.',
    status: 'in_review',
    updatedAt: '2024-01-15T10:00:00Z',
    ownerName: 'Andrea',
    targetRoute: '/analisis/2/resultados',
  },
  {
    id: '3',
    title: 'Monitor de Valor',
    description: 'Drivers financieros y sensibilidades de generación de valor.',
    status: 'draft',
    updatedAt: '2024-01-08T10:00:00Z',
    ownerName: 'Mauricio',
    targetRoute: '/analisis/3/definicion',
  },
  {
    id: '4',
    title: 'Comparativo sectorial oil & gas',
    description: 'Rentabilidad y solvencia frente a majors internacionales.',
    status: 'published',
    updatedAt: '2024-01-10T10:00:00Z',
    ownerName: 'Camila',
    targetRoute: '/analisis/4/visualizacion',
  },
];

vi.mock('@/shared/i18n', () => ({
  useT: () => {
    const translations: Record<string, string> = {
      'home.sectionTitles.enabledAnalyses': 'Análisis habilitados',
      'home.sectionInfo.enabledAnalyses': 'Análisis a los que tienes acceso según tu rol.',
      'home.enabledAnalyses.verTodos': 'Ver todos ›',
      'home.meta.updated': 'Actualizado {updated} · {owner}',
      'home.status.draft': 'Borrador',
      'home.status.inProgress': 'En construcción',
      'home.status.inReview': 'En revisión',
      'home.status.published': 'Publicado',
      'common.a11y.rowActions': 'Acciones de fila',
    };
    return (key: string) => translations[key] ?? key;
  },
}));

vi.mock('@/shared/lib/format', () => ({
  formatRelativeTime: vi.fn((iso: string) => {
    const now = new Date().getTime();
    const then = new Date(iso).getTime();
    const diff = now - then;
    if (diff < 24 * 60 * 60 * 1000) return 'hoy';
    if (diff < 48 * 60 * 60 * 1000) return 'hace 1 día';
    if (diff < 7 * 24 * 60 * 60 * 1000) return 'hace 1 semana';
    return 'hace 5 días';
  }),
}));

vi.mock('@/shared/config', () => ({
  routes: {
    analyses: {
      build: () => '/analisis',
    },
  },
}));

describe('EnabledAnalysesGrid', () => {
  it('the title renders', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Análisis habilitados')).toBeInTheDocument();
  });

  it('4 cards render with their titles', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    MOCK.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it('"Publicado" shows for a published item', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Publicado')).toHaveLength(2);
  });

  it('each card link has the item targetRoute as href', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    MOCK.forEach((item) => {
      const link = screen.getByText(item.title).closest('a');
      if (!link) throw new Error('link not found');
      expect(link).toHaveAttribute('href', item.targetRoute);
    });
  });

  it('"Ver todos ›" links to routes.analyses.build() not a literal', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    const verTodosLink = screen.getByRole('link', { name: 'Ver todos ›' });
    expect(verTodosLink).toHaveAttribute('href', '/analisis');
  });

  it('renders an uppercase group label on the page, not a card (prototype L273-L279)', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Análisis habilitados' });
    expect(heading).toHaveClass('uppercase', 'text-eyebrow');
    expect(screen.getByTestId('enabled-analyses')).not.toHaveClass('border', 'bg-surface-card');
  });

  it('lays the cards out as the auto-fill minmax(280px) grid: 3 columns from desktop', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('enabled-analyses-grid')).toHaveClass(
      'grid-cols-1',
      'tablet:grid-cols-2',
      'desktop:grid-cols-3',
      'gap-16',
    );
  });

  it('puts the status badge on the title row, right-aligned (prototype L286-L289)', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={MOCK} />
      </MemoryRouter>,
    );
    const title = screen.getByText('Referentes estratégicos');
    const row = title.parentElement;
    expect(row).toHaveClass('justify-between');
    expect(row).toHaveTextContent('En revisión');
    expect(title.closest('a')).toHaveClass('p-20');
  });

  it('empty items render no card links', () => {
    render(
      <MemoryRouter>
        <EnabledAnalysesGrid items={[]} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
