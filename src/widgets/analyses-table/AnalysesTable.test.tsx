import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AnalysesTable } from './AnalysesTable';

const MOCK_ROWS = [
  {
    id: 'an-001',
    name: 'Desempeño comparativo — 4T 2025',
    description: 'Referenciamiento competitivo trimestral de Ecopetrol.',
    createdAt: '2025-10-03',
    createdBy: 'Camila Bravo',
    status: 'in_review' as const,
  },
  {
    id: 'an-002',
    name: 'Análisis anual 2024 vs. pares',
    description: 'Comparación anual de indicadores financieros.',
    createdAt: '2025-01-14',
    createdBy: 'Jorge Salas',
    status: 'published' as const,
  },
  {
    id: 'an-003',
    name: 'Sensibilidad ROACE — Escenario optimista',
    description: 'Simulación de productividad y costos operativos.',
    createdAt: '2025-08-22',
    createdBy: 'Camila Bravo',
    status: 'draft' as const,
  },
];

describe('AnalysesTable', () => {
  it('renders the table caption', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    expect(screen.getByText('Todos los análisis creados')).toBeInTheDocument();
  });

  it('renders 4 column headers', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    expect(screen.getByText('Nombre del análisis')).toBeInTheDocument();
    expect(screen.getByText('Fecha de creación')).toBeInTheDocument();
    expect(screen.getByText('Creado por')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('renders status badges for each status', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('calls onViewDetails when clicking "Ver detalle"', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    const buttons = screen.getAllByText('Ver detalle');
    expect(buttons).toHaveLength(3);
    const [first] = buttons;
    if (!first) throw new Error('no button');
    fireEvent.click(first);
    expect(onViewDetails).toHaveBeenCalledWith('an-001');
  });

  it('each row button has accessible name "Ver detalle de <name>"', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    for (const row of MOCK_ROWS) {
      expect(
        screen.getByRole('button', { name: `Ver detalle de ${row.name}` }),
      ).toBeInTheDocument();
    }
  });

  it('"Ver detalle" is a filled brand button, like the prototype (HTML L433)', () => {
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={vi.fn()} />);
    const [first] = MOCK_ROWS;
    if (!first) throw new Error('no row');
    const button = screen.getByRole('button', { name: `Ver detalle de ${first.name}` });
    expect(button).toHaveClass(
      'bg-brand-primary',
      'text-text-inverse',
      'rounded-control',
      'px-12',
      'py-8',
      'text-12',
    );
    expect(button).not.toHaveClass('bg-transparent');
  });

  it('writes the creation date with the prototype 3-letter month', () => {
    const row = {
      id: 'an-sep',
      name: 'Storytelling de Mercado',
      description: null,
      createdAt: '2025-09-28',
      createdBy: 'Camila Bravo',
      status: 'draft' as const,
    };
    render(<AnalysesTable rows={[row]} onViewDetails={vi.fn()} />);
    expect(screen.getByText('28 sep 2025')).toBeInTheDocument();
  });

  it('expands a row to show its description', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={onViewDetails} />);
    const expandButtons = screen.getAllByRole('button', { name: /Detalle de / });
    const [first] = expandButtons;
    if (!first) throw new Error('no expand button');
    fireEvent.click(first);
    expect(
      screen.getByText('Referenciamiento competitivo trimestral de Ecopetrol.'),
    ).toBeInTheDocument();
  });

  it('has no expand chevron column: five columns, the (i) sits after the name (prototype L416-L427)', () => {
    render(<AnalysesTable rows={MOCK_ROWS} onViewDetails={vi.fn()} />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.queryByText('›')).toBeNull();
    const [first] = MOCK_ROWS;
    if (!first) throw new Error('no row');
    const name = screen.getByRole('rowheader', { name: new RegExp(first.name) });
    const toggle = within(name).getByRole('button', { name: `Detalle de ${first.name}` });
    expect(toggle).toHaveAttribute('data-testid', 'analyses-table-expand-an-001');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const detail = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    expect(detail).toHaveTextContent('Referenciamiento competitivo trimestral de Ecopetrol.');
  });

  it('shows no (i) for an analysis without description', () => {
    const row = {
      id: 'an-nodesc',
      name: 'Sin descripción',
      description: null,
      createdAt: '2025-10-03',
      createdBy: 'Camila Bravo',
      status: 'draft' as const,
    };
    render(<AnalysesTable rows={[row]} onViewDetails={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /^Detalle de / })).toBeNull();
  });

  it('renders empty state when no rows', () => {
    const onViewDetails = vi.fn();
    render(<AnalysesTable rows={[]} onViewDetails={onViewDetails} />);
    expect(
      screen.getByText('No se encontraron análisis con los filtros aplicados.'),
    ).toBeInTheDocument();
  });
});
