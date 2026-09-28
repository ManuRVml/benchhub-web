import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

import type { ModalProps } from './Modal';

const TITLE = 'Añadir indicador';
const DESCRIPTION = 'Selecciona indicadores desde una de las tres fuentes disponibles';
const OPEN = 'Abrir';
const CANCEL = 'Cancelar';
const CONFIRM = 'Añadir al monitor';

function Harness(props: Partial<ModalProps> & { withInitialFocus?: boolean }) {
  const { withInitialFocus = false, ...rest } = props;
  const [open, setOpen] = useState(false);
  const secondRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        {OPEN}
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={TITLE}
        description={DESCRIPTION}
        footer={
          <>
            <button type="button">{CANCEL}</button>
            <button type="button" ref={secondRef}>
              {CONFIRM}
            </button>
          </>
        }
        {...(withInitialFocus ? { initialFocusRef: secondRef } : {})}
        {...rest}
      >
        <input aria-label="Buscar" />
      </Modal>
    </>
  );
}

async function openModal(props: Parameters<typeof Harness>[0] = {}) {
  const user = userEvent.setup();
  render(<Harness {...props} />);
  await user.click(screen.getByRole('button', { name: 'Abrir' }));
  return user;
}

describe('Modal', () => {
  it('names the dialog with its title and description', async () => {
    await openModal();
    const dialog = screen.getByRole('dialog', { name: TITLE });
    expect(dialog).toHaveAccessibleDescription(DESCRIPTION);
    expect(dialog).toHaveClass('rounded-modal', 'shadow-modal', 'max-w-120');
    expect(screen.getByTestId('modal-overlay')).toHaveClass('z-(--z-modal)', 'bg-overlay-scrim');
  });

  it('traps focus inside the card', async () => {
    const user = await openModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    for (let step = 0; step < 6; step += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('focuses initialFocusRef when given', async () => {
    await openModal({ withInitialFocus: true });
    expect(screen.getByRole('button', { name: 'Añadir al monitor' })).toHaveFocus();
  });

  it('closes on Esc and returns focus to the trigger', async () => {
    const user = await openModal();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });

  it('closes on a click on the scrim but not on a click inside the card', async () => {
    const user = await openModal();
    await user.click(screen.getByRole('textbox', { name: 'Buscar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByTestId('modal-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with the ✕ button, labelled from i18n', async () => {
    const user = await openModal();
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the modal open when Esc and overlay closing are disabled', async () => {
    const user = await openModal({ closeOnEscape: false, closeOnOverlayClick: false });
    await user.keyboard('{Escape}');
    await user.click(screen.getByTestId('modal-overlay'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens from an uncontrolled trigger and reports open changes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal
        trigger={<button type="button">{'Ayuda'}</button>}
        onOpenChange={onOpenChange}
        title="Ayuda y documentación"
        description="Preguntas frecuentes"
        hideDescription
        width={440}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Ayuda' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-110');
    expect(screen.getByText('Preguntas frecuentes')).toHaveClass('sr-only');
  });
});
