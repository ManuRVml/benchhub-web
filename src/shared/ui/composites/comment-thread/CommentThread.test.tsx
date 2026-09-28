import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommentThread } from './CommentThread';

import type { CommentThreadItem, CommentThreadPermissions } from './types';

const NOW = Date.parse('2026-09-25T10:00:00-05:00');
const ALL: CommentThreadPermissions = {
  canComment: true,
  canReply: true,
  canRequestChange: true,
  canResolve: true,
};
const NONE: CommentThreadPermissions = {
  canComment: false,
  canReply: false,
  canRequestChange: false,
  canResolve: false,
};

const CHANGE_REQUEST: CommentThreadItem = {
  id: 'chr_1',
  kind: 'change_request',
  author: { name: 'Alejandra Ríos', roleLabel: 'Ejecutivo integral' },
  text: 'Solicito ampliar el histórico a 3 años para este indicador.',
  createdAt: '2026-09-25T09:59:30-05:00',
  status: null,
  decision: null,
  replies: [],
};

const ITEMS: CommentThreadItem[] = [
  {
    id: 'cmt_1',
    kind: 'comment',
    author: { name: 'Alejandra Ríos', roleLabel: 'Ejecutivo integral' },
    text: '¿Por qué la brecha con Shell se amplió tanto en el último trimestre?',
    createdAt: '2026-09-23T09:10:00-05:00',
    status: 'in_analysis',
    decision: null,
    replies: [
      {
        id: 'cmt_2',
        author: { name: 'Camilo Vega', roleLabel: 'Analista creador' },
        text: 'Shell reportó una revisión al alza en su margen EBITDA.',
        createdAt: '2026-09-25T06:00:00-05:00',
      },
    ],
  },
  CHANGE_REQUEST,
];

function renderThread(
  props: Partial<Parameters<typeof CommentThread>[0]> & { items?: CommentThreadItem[] } = {},
) {
  const callbacks = {
    onSubmit: vi.fn(),
    onReply: vi.fn(),
    onRequestChange: vi.fn(),
    onStatusChange: vi.fn(),
    onDecision: vi.fn(),
  };
  render(
    <CommentThread
      items={ITEMS}
      permissions={ALL}
      emptyLabel="Todavía no hay comentarios."
      now={NOW}
      {...callbacks}
      {...props}
    />,
  );
  return callbacks;
}

const composer = () => screen.queryByRole('textbox', { name: 'Comentario' });

describe('CommentThread', () => {
  it('renders threads and replies as nested lists with author, role, relative time and text', () => {
    renderThread();
    const [threadList] = screen.getAllByRole('list');
    if (!threadList) throw new Error('no thread list');
    const threads = within(threadList)
      .getAllByRole('listitem')
      .filter((li) => li.parentElement === threadList);
    expect(threads).toHaveLength(2);
    const [first] = threads;
    if (!first) throw new Error('no first thread');
    expect(within(first).getByText('Alejandra Ríos')).toBeInTheDocument();
    expect(within(first).getByText('Ejecutivo integral')).toBeInTheDocument();
    expect(within(first).getByText('hace 2 días')).toHaveAttribute(
      'datetime',
      '2026-09-23T09:10:00-05:00',
    );
    const replies = within(first).getByRole('list', { name: 'Respuestas' });
    expect(within(replies).getAllByRole('listitem')).toHaveLength(1);
    expect(within(replies).getByText('Camilo Vega')).toBeInTheDocument();
    expect(within(replies).getByText('hace 4 horas')).toBeInTheDocument();
  });

  it('shows the status chip per status and the change-request tag', () => {
    const statuses = (['pending', 'in_analysis', 'resolved'] as const).map(
      (status, index): CommentThreadItem => ({
        id: `cmt_s${String(index)}`,
        kind: 'comment',
        author: { name: 'A', roleLabel: 'Analista creador' },
        text: 't',
        createdAt: '2026-09-25T09:00:00-05:00',
        status,
        decision: null,
        replies: [],
      }),
    );
    renderThread({ items: [...statuses, CHANGE_REQUEST], permissions: NONE });
    expect(screen.getByTestId('comment-status-cmt_s0')).toHaveTextContent('Pendiente');
    expect(screen.getByTestId('comment-status-cmt_s0')).toHaveAttribute(
      'data-variant',
      'comment-status-pending',
    );
    expect(screen.getByTestId('comment-status-cmt_s1')).toHaveTextContent('En análisis');
    expect(screen.getByTestId('comment-status-cmt_s2')).toHaveTextContent('Resuelto');
    expect(screen.getByText('Solicitud de cambio')).toBeInTheDocument();
  });

  it('hides every control whose permission is false', () => {
    renderThread({ permissions: NONE });
    expect(composer()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Enviar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Responder' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Solicitar ajuste' })).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Estado del comentario' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Aceptar' })).toBeNull();
  });

  it('shows the composer without "Solicitar ajuste" when only canComment is true', () => {
    renderThread({ permissions: { ...NONE, canComment: true } });
    expect(composer()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Solicitar ajuste' })).toBeNull();
  });

  it('submits the trimmed text, clears the field and never submits empty text', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderThread();
    const input = composer();
    if (!input) throw new Error('no composer');
    const send = screen.getByRole('button', { name: 'Enviar' });
    expect(send).toBeDisabled();
    await user.type(input, '   ');
    expect(send).toBeDisabled();
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(input, 'Revisar la fuente  ');
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith('Revisar la fuente');
    expect(input).toHaveValue('');
  });

  it('inline composer: one-line field with "Enviar" beside it, Enter submits, 1000-char cap', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderThread({ composerLayout: 'inline' });
    const input = composer();
    if (!input) throw new Error('no composer');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('maxLength', '1000');
    const row = screen.getByTestId('comment-thread-composer');
    expect(row).toHaveClass('flex', 'items-start');
    expect(within(row).getByRole('button', { name: 'Enviar' })).toBeDisabled();
    await user.type(input, 'En línea{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('En línea');
    expect(input).toHaveValue('');
  });

  it('submits with Ctrl+Enter and Cmd+Enter, but not with Enter alone', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderThread();
    const input = composer();
    if (!input) throw new Error('no composer');
    await user.type(input, 'Primero{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenLastCalledWith('Primero');
    await user.type(input, 'Segundo');
    await user.keyboard('{Meta>}{Enter}{/Meta}');
    expect(onSubmit).toHaveBeenLastCalledWith('Segundo');
  });

  it('disables the composer while the submission is pending', async () => {
    const user = userEvent.setup({ delay: null });
    let resolve: () => void = () => undefined;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    renderThread({ onSubmit: () => pending });
    const input = composer();
    if (!input) throw new Error('no composer');
    await user.type(input, 'Hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(input).toBeDisabled();
    resolve();
    await vi.waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it('sends a change request through its own callback', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit, onRequestChange } = renderThread();
    const input = composer();
    if (!input) throw new Error('no composer');
    await user.type(input, 'Ampliar el histórico');
    await user.click(screen.getByRole('button', { name: 'Solicitar ajuste' }));
    expect(onRequestChange).toHaveBeenCalledWith('Ampliar el histórico');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('replies to a thread with its id', async () => {
    const user = userEvent.setup({ delay: null });
    const { onReply } = renderThread();
    const [replyToggle] = screen.getAllByRole('button', { name: 'Responder' });
    if (!replyToggle) throw new Error('no reply button');
    await user.click(replyToggle);
    const reply = screen.getByRole('textbox', { name: 'Respuesta' });
    expect(reply).toHaveFocus();
    await user.type(reply, 'Gracias');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onReply).toHaveBeenCalledWith('cmt_1', 'Gracias');
  });

  it('lets the analyst change a comment status and decide on a change request', async () => {
    const user = userEvent.setup({ delay: null });
    const { onStatusChange, onDecision } = renderThread();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Estado del comentario' }),
      'resolved',
    );
    expect(onStatusChange).toHaveBeenCalledWith('cmt_1', 'resolved');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(onDecision).toHaveBeenCalledWith('chr_1', 'rejected');
  });

  it('shows the empty label when there are no threads', () => {
    renderThread({ items: [] });
    expect(screen.getByTestId('comment-thread-empty')).toHaveTextContent(
      'Todavía no hay comentarios.',
    );
    expect(screen.queryByRole('list')).toBeNull();
    expect(composer()).toBeInTheDocument();
  });
});
