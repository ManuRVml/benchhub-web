import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { KviTable } from './KviTable';

import type { KviTableRow } from './KviTable';

const FCL: KviTableRow = {
  kviId: 'kvi-fcl',
  code: 'KVI-FCL',
  category: 'Financiero',
  categoryId: 'financiero',
  label: 'Flujo de Caja Libre',
  unit: 'BCOP',
  weightPct: 10,
  owner: 'Diego Gómez',
  meta: 7.19,
  metaReto: 10.53,
  real: 10.69,
  resultPct: 149,
  retoPct: 102,
  resultBand: 'ok',
  retoBand: 'ok',
  isTbd: false,
  isTextMode: false,
  lowerIsBetter: false,
  isEditable: true,
  traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
};

const COBERTURA: KviTableRow = {
  kviId: 'kvi-cobertura',
  code: 'KVI-COBERTURA',
  category: 'Financiero',
  categoryId: 'financiero',
  label: 'Cobertura de Intereses',
  unit: 'MUSD',
  weightPct: 5,
  owner: 'Juan Carlos López',
  meta: 8.14,
  metaReto: 26.5,
  real: 6.1,
  resultPct: 75,
  retoPct: 23,
  resultBand: 'watch',
  retoBand: 'risk',
  isTbd: false,
  isTextMode: false,
  lowerIsBetter: false,
  isEditable: true,
  traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
};

const TRR: KviTableRow = {
  kviId: 'kvi-trr',
  code: 'KVI-TRR',
  category: 'Mercado',
  categoryId: 'mercado',
  label: 'TRR (renta variable)',
  unit: '%',
  weightPct: 5,
  owner: 'Bloomberg · JVD',
  meta: 7,
  metaReto: 7,
  real: 24,
  resultPct: 343,
  retoPct: 343,
  resultBand: 'ok',
  retoBand: 'ok',
  isTbd: false,
  isTextMode: false,
  lowerIsBetter: false,
  isEditable: true,
  traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
};

const ROACE_WACC: KviTableRow = {
  kviId: 'kvi-roacewacc',
  code: 'KVI-ROACEWACC',
  category: 'Financiero',
  categoryId: 'financiero',
  label: 'ROACE menos WACC',
  unit: '%',
  weightPct: null,
  owner: 'Liz Cardona',
  meta: null,
  metaReto: null,
  real: null,
  resultPct: null,
  retoPct: null,
  resultBand: 'tbd',
  retoBand: 'tbd',
  isTbd: true,
  isTextMode: false,
  lowerIsBetter: false,
  isEditable: false,
  traceability: { source: 'Capital IQ · fuentes internas Ecopetrol', capturedAt: '2025-12-31' },
};

const ROWS = [FCL, COBERTURA, TRR, ROACE_WACC];

describe('KviTable', () => {
  it('renders the table caption and every row', () => {
    const onTargetsChange = vi.fn();
    render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
    expect(screen.getByText('Monitor de Valor Grupo Ecopetrol · KVIs')).toBeInTheDocument();
    expect(screen.getByText('Flujo de Caja Libre')).toBeInTheDocument();
    expect(screen.getByText('Cobertura de Intereses')).toBeInTheDocument();
    expect(screen.getByText('TRR (renta variable)')).toBeInTheDocument();
    expect(screen.getByText('ROACE menos WACC')).toBeInTheDocument();
  });

  it('formats values through the shared formatters (es-CO, unit-aware Real column)', () => {
    const onTargetsChange = vi.fn();
    render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
    expect(screen.getByText('10,69')).toBeInTheDocument(); // FCL Real (BCOP, no unit suffix)
    expect(screen.getByText('24,0%')).toBeInTheDocument(); // TRR Real (% unit)
    expect(screen.getByText('149%')).toBeInTheDocument(); // FCL result chip
    expect(screen.getByText('10%')).toBeInTheDocument(); // FCL weight
  });

  describe('filters', () => {
    it('filters rows by category, multi-select, none selected = all', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Mercado' }));
      expect(screen.queryByText('Flujo de Caja Libre')).not.toBeInTheDocument();
      expect(screen.getByText('TRR (renta variable)')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Financiero' }));
      expect(screen.getByText('Flujo de Caja Libre')).toBeInTheDocument();
      expect(screen.getByText('TRR (renta variable)')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Mercado' }));
      fireEvent.click(screen.getByRole('button', { name: 'Financiero' }));
      expect(screen.getByText('TRR (renta variable)')).toBeInTheDocument();
    });

    it('filters rows by compliance band, ANDed with the category group', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      fireEvent.click(screen.getByRole('button', { name: '70–89%' }));
      expect(screen.getByText('Cobertura de Intereses')).toBeInTheDocument();
      expect(screen.queryByText('Flujo de Caja Libre')).not.toBeInTheDocument();
      expect(screen.queryByText('TRR (renta variable)')).not.toBeInTheDocument();
    });

    it('shows the empty state and clears the filters', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      fireEvent.click(screen.getByRole('button', { name: '<70%' }));
      expect(screen.getByText('No hay KVIs que coincidan con los filtros')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Limpiar filtros'));
      expect(screen.getByText('Flujo de Caja Libre')).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('recomputes the row result % and band live while editing Meta, and commits on blur', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      fireEvent.change(screen.getByTestId('kvi-table-meta-input-kvi-fcl'), {
        target: { value: '10,69' },
      }); // Real/Meta = 100 % now
      expect(screen.getByTestId('kvi-table-result-chip-kvi-fcl')).toHaveTextContent('100%');
      // The edit re-renders the row (new % and band), so the commit is fired on the input DataTable just rendered,
      // not the one queried before the edit.
      fireEvent.blur(screen.getByTestId('kvi-table-meta-input-kvi-fcl'));
      expect(onTargetsChange).toHaveBeenCalledWith({
        kviId: 'kvi-fcl',
        meta: 10.69,
        metaReto: 10.53,
      });
    });

    it('recomputes the reto % and band from Meta Reto independently of Meta', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      const metaRetoInput = screen.getByTestId('kvi-table-meta-reto-input-kvi-cobertura');
      fireEvent.change(metaRetoInput, { target: { value: '6,1' } }); // Real/MetaReto = 100 %
      expect(screen.getByTestId('kvi-table-reto-chip-kvi-cobertura')).toHaveTextContent('100%');
      expect(screen.getByTestId('kvi-table-result-chip-kvi-cobertura')).toHaveTextContent('75%'); // untouched
    });

    it('keeps the previous value when the input is emptied, per V2 parity', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      const metaInput = screen.getByTestId('kvi-table-meta-input-kvi-fcl');
      fireEvent.change(metaInput, { target: { value: '' } });
      expect(screen.getByTestId('kvi-table-result-chip-kvi-fcl')).toHaveTextContent('149%');
      fireEvent.blur(metaInput);
      expect(onTargetsChange).not.toHaveBeenCalled();
    });

    it('a TBD row has no editable Meta / Meta Reto cell and shows the TBD marker', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      expect(screen.queryByTestId('kvi-table-meta-input-kvi-roacewacc')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('kvi-table-meta-reto-input-kvi-roacewacc'),
      ).not.toBeInTheDocument();
      const row = screen.getByTestId('kvi-table-table-root-row-kvi-roacewacc');
      expect(within(row).getAllByText('TBD').length).toBeGreaterThan(0);
    });
  });

  describe('traceability', () => {
    it('opens the OVL-11 modal with the row sources on a name click', () => {
      const onTargetsChange = vi.fn();
      render(<KviTable rows={ROWS} year={2025} onTargetsChange={onTargetsChange} />);
      fireEvent.click(screen.getByTestId('kvi-table-indicator-trigger-kvi-fcl'));
      const modal = screen.getByTestId('kvi-table-traceability-modal');
      expect(within(modal).getByText('Flujo de Caja Libre')).toBeInTheDocument();
      expect(
        within(modal).getByText('Capital IQ · fuentes internas Ecopetrol'),
      ).toBeInTheDocument();
      expect(within(modal).getByText('Diego Gómez')).toBeInTheDocument();
      expect(within(modal).getByText('BCOP')).toBeInTheDocument();
    });
  });
});
