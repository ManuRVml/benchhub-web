import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SlideNotes } from './SlideNotes';

import type { SlideNotesProps } from './SlideNotes';

const ROWS = [
  { slideKey: 'comp|barras', label: 'Barras GE vs. pares' },
  { slideKey: 'comp|tabla', label: 'Tabla de indicadores' },
];

function renderNotes(props: Partial<SlideNotesProps> = {}) {
  const callbacks = {
    onSave: vi.fn(),
    onRemove: vi.fn(),
    onDraft: vi.fn().mockResolvedValue('Borrador de Yarbis'),
  };
  render(
    <SlideNotes
      rows={ROWS}
      notes={{ 'comp|barras': 'Destacar el margen EBITDA.' }}
      draftingKeys={new Set()}
      canEdit
      canDraft
      {...callbacks}
      {...props}
    />,
  );
  return callbacks;
}

describe('SlideNotes ("Comentarios por slide", HTML L2491-2530)', () => {
  it('shows the eyebrow and one row per selected chart: note + Editar/Quitar, or Agregar + Sugerir', () => {
    renderNotes();
    expect(screen.getByText('Comentarios por slide')).toBeInTheDocument();
    const withNote = screen.getByTestId('slide-notes-comp-barras');
    expect(within(withNote).getByText('Destacar el margen EBITDA.')).toBeInTheDocument();
    expect(within(withNote).getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(within(withNote).getByRole('button', { name: 'Quitar' })).toBeInTheDocument();
    const empty = screen.getByTestId('slide-notes-comp-tabla');
    expect(within(empty).getByRole('button', { name: '+ Agregar comentario' })).toBeInTheDocument();
    expect(within(empty).getByRole('button', { name: /Sugerir con Yarbis/ })).toBeInTheDocument();
  });

  it('renders nothing without selected charts', () => {
    renderNotes({ rows: [] });
    expect(screen.queryByTestId('slide-notes')).toBeNull();
  });

  it('"Sugerir con Yarbis" drafts (C-32) and saves the draft as the note', async () => {
    const { onDraft, onSave } = renderNotes();
    await userEvent.click(screen.getByTestId('slide-notes-comp-tabla-suggest'));
    expect(onDraft).toHaveBeenCalledWith('comp|tabla');
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('comp|tabla', 'Borrador de Yarbis');
    });
  });

  it('adds a note through the editor and saves it; Quitar removes one', async () => {
    const user = userEvent.setup();
    const { onSave, onRemove } = renderNotes();
    await user.click(screen.getByTestId('slide-notes-comp-tabla-add'));
    await user.type(screen.getByTestId('slide-notes-comp-tabla-input'), 'Nota nueva');
    await user.click(screen.getByTestId('slide-notes-comp-tabla-save'));
    expect(onSave).toHaveBeenCalledWith('comp|tabla', 'Nota nueva');
    await user.click(screen.getByTestId('slide-notes-comp-barras-remove'));
    expect(onRemove).toHaveBeenCalledWith('comp|barras');
  });

  it('"Redactar con Yarbis" fills the editor without saving', async () => {
    const user = userEvent.setup();
    const { onSave } = renderNotes();
    await user.click(screen.getByTestId('slide-notes-comp-barras-edit'));
    await user.click(screen.getByTestId('slide-notes-comp-barras-draft'));
    expect(await screen.findByDisplayValue('Borrador de Yarbis')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows "Yarbis está redactando…" while a slide is drafting, and no Yarbis without permission', () => {
    renderNotes({ draftingKeys: new Set(['comp|tabla']) });
    expect(screen.getByText('✦ Yarbis está redactando…')).toBeInTheDocument();
  });

  it('hides the Yarbis actions without canDraftWithAssistant', () => {
    renderNotes({ canDraft: false });
    expect(screen.queryByRole('button', { name: /Sugerir con Yarbis/ })).toBeNull();
  });
});
