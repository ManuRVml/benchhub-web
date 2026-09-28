import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from './ToastProvider';
import { useToast } from './use-toast';

import type { ToastApi } from './toast-context';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Renders a provider and hands back its API. */
function renderToasts(maxVisible?: number): ToastApi {
  let api: ToastApi | undefined;
  function Capture() {
    api = useToast();
    return null;
  }
  render(
    <ToastProvider {...(maxVisible === undefined ? {} : { maxVisible })}>
      <Capture />
    </ToastProvider>,
  );
  if (!api) throw new Error('provider did not render');
  return api;
}

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('ToastProvider / useToast', () => {
  it('fires the undo callback when "Deshacer" is pressed within 5 s, and not onExpire', () => {
    const api = renderToasts();
    const onUndo = vi.fn();
    const onExpire = vi.fn();
    act(() => {
      api.undo({ message: 'Se quitó Shell del análisis.', onUndo, onExpire });
    });
    expect(screen.getByTestId('toast-stack-bottom-center')).toContainElement(
      screen.getByTestId('toast-undo'),
    );
    advance(4000);
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('toast-undo')).not.toBeInTheDocument();
    advance(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('fires onExpire instead of the callback when the undo toast times out after 5 s', () => {
    const api = renderToasts();
    const onUndo = vi.fn();
    const onExpire = vi.fn();
    act(() => {
      api.undo({ message: 'Se quitó Shell del análisis.', onUndo, onExpire });
    });
    advance(4999);
    expect(screen.getByTestId('toast-undo')).toBeInTheDocument();
    expect(onExpire).not.toHaveBeenCalled();
    advance(1);
    expect(screen.queryByTestId('toast-undo')).not.toBeInTheDocument();
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('hides the autosave toast after its 1.8 s duration, bottom-right, and reuses one toast', () => {
    const api = renderToasts();
    act(() => {
      api.autosave('Cambios guardados automáticamente');
      api.autosave('Cambios guardados automáticamente');
    });
    expect(screen.getAllByTestId('toast-autosave')).toHaveLength(1);
    expect(screen.getByTestId('toast-stack-bottom-right')).toContainElement(
      screen.getByTestId('toast-autosave'),
    );
    advance(1799);
    expect(screen.getByTestId('toast-autosave')).toBeInTheDocument();
    advance(1);
    expect(screen.queryByTestId('toast-autosave')).not.toBeInTheDocument();
  });

  it('honours a per-toast duration', () => {
    const api = renderToasts();
    act(() => {
      api.success('✓ Vista guardada', { durationMs: 2500 });
    });
    advance(2400);
    expect(screen.getByText('✓ Vista guardada')).toBeInTheDocument();
    advance(100);
    expect(screen.queryByText('✓ Vista guardada')).not.toBeInTheDocument();
  });

  it('pauses the timer while hovered and resumes with the remaining time', () => {
    const api = renderToasts();
    act(() => {
      api.success('✓ Cambios guardados');
    });
    advance(1000);
    const toast = screen.getByTestId('toast-success');
    fireEvent.pointerOver(toast);
    advance(10_000);
    expect(toast).toBeInTheDocument();
    fireEvent.pointerOut(toast);
    advance(1100);
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    advance(200);
    expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
  });

  it('pauses the timer while a control inside the toast has focus', () => {
    const api = renderToasts();
    const onExpire = vi.fn();
    act(() => {
      api.undo({ message: 'Se quitó BP del análisis.', onUndo: vi.fn(), onExpire });
    });
    act(() => {
      screen.getByRole('button', { name: 'Deshacer' }).focus();
    });
    advance(20_000);
    expect(onExpire).not.toHaveBeenCalled();
    act(() => {
      screen.getByRole('button', { name: 'Deshacer' }).blur();
    });
    advance(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('announces errors assertively and keeps them until dismissed', () => {
    const api = renderToasts();
    act(() => {
      api.error('No se pudo guardar.');
      api.success('✓ Copiado');
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toContainElement(screen.getByText('No se pudo guardar.'));
    expect(screen.getByTestId('toast-stack-bottom-right')).toHaveAttribute('aria-live', 'polite');
    advance(60_000);
    expect(screen.getByText('No se pudo guardar.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByText('No se pudo guardar.')).not.toBeInTheDocument();
  });

  it('keeps at most maxVisible toasts per position, dropping the oldest', () => {
    const api = renderToasts(2);
    const onExpire = vi.fn();
    act(() => {
      api.undo({ message: 'Se quitó Shell del análisis.', onUndo: vi.fn(), onExpire });
      api.undo({ message: 'Se quitó BP del análisis.', onUndo: vi.fn() });
      api.undo({ message: 'Se quitó Exxon del análisis.', onUndo: vi.fn() });
    });
    expect(screen.getAllByTestId('toast-undo')).toHaveLength(2);
    expect(screen.queryByText('Se quitó Shell del análisis.')).not.toBeInTheDocument();
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('closes a toast by id with dismiss()', () => {
    const api = renderToasts();
    let id = '';
    act(() => {
      id = api.success('✓ Presentación publicada correctamente.');
    });
    act(() => {
      api.dismiss(id);
    });
    expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
  });

  it('throws when useToast is used outside the provider', () => {
    function Orphan() {
      useToast();
      return null;
    }
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Orphan />)).toThrow('useToast() must be used inside <ToastProvider>');
  });
});
