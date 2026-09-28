import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ExecutiveSummary, type ExecutiveSummaryData } from './ExecutiveSummary';

describe('ExecutiveSummary', () => {
  const renderComponent = (data: ExecutiveSummaryData) => {
    render(<ExecutiveSummary data={data} />);
  };

  it('renders the uppercase group label with the description behind its (i) toggle (prototype L255-L261)', () => {
    renderComponent({
      total: 8,
      active: 6,
      published: 3,
      inProgress: 2,
      avgCoveragePct: 82,
    });

    const heading = screen.getByRole('heading', { level: 2, name: 'Resumen ejecutivo' });
    expect(heading).toHaveClass('uppercase', 'text-eyebrow');
    const info = screen.getByText(
      'KPIs clave del último análisis publicado: posición general, cobertura de datos y hallazgos más relevantes frente a pares.',
    );
    expect(info).not.toBeVisible();
    fireEvent.click(screen.getByTestId('executive-summary-info-toggle'));
    expect(info).toBeVisible();
  });

  it('renders the KPIs as a bare strip of five centred tiles (prototype L262-L266)', () => {
    renderComponent({ total: 8, active: 6, published: 3, inProgress: 2, avgCoveragePct: 82 });

    expect(screen.getByTestId('executive-summary')).not.toHaveClass('border', 'bg-surface-card');
    expect(screen.getByTestId('executive-summary-strip')).toHaveClass('grid-cols-5', 'gap-12');
    for (const id of ['kpi-total', 'kpi-active', 'kpi-published', 'kpi-in-progress']) {
      expect(screen.getByTestId(id)).toHaveClass(
        'items-center',
        'text-center',
        'rounded-card',
        'p-16',
      );
    }
  });

  it('renders the 5 labels with their values', () => {
    renderComponent({
      total: 8,
      active: 6,
      published: 3,
      inProgress: 2,
      avgCoveragePct: 82,
    });

    expect(screen.getByText('Total análisis')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.getByText('Publicados')).toBeInTheDocument();
    expect(screen.getByText('En construcción')).toBeInTheDocument();
    expect(screen.getByText('Cobertura prom.')).toBeInTheDocument();
  });

  it('renders each KPI value inside its label card (mutation test)', () => {
    renderComponent({
      total: 8,
      active: 6,
      published: 3,
      inProgress: 2,
      avgCoveragePct: 82,
    });

    // Total
    expect(within(screen.getByTestId('kpi-total')).getByText('8')).toBeInTheDocument();
    // Active
    expect(within(screen.getByTestId('kpi-active')).getByText('6')).toBeInTheDocument();
    // Published
    expect(within(screen.getByTestId('kpi-published')).getByText('3')).toBeInTheDocument();
    // In Progress
    expect(within(screen.getByTestId('kpi-in-progress')).getByText('2')).toBeInTheDocument();
    // Avg Coverage
    expect(within(screen.getByTestId('kpi-avg-coverage')).getByText('82%')).toBeInTheDocument();
  });
});
