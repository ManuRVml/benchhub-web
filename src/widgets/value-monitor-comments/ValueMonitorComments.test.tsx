import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ValueMonitorComments } from './ValueMonitorComments';

import type { CommentThreadView } from '@/shared/api';

const THREAD: CommentThreadView = {
  items: [
    {
      id: 'cmt_01',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
      createdAt: '2026-09-24T10:00:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 1,
  permissions: { canComment: true, canReply: false, canRequestChange: false, canResolve: false },
};

describe('ValueMonitorComments (SCR-11 §11)', () => {
  it('renders the flat comment list (author, role, text) with no status chip', () => {
    render(<ValueMonitorComments data={THREAD} onSubmit={vi.fn()} />);
    expect(screen.getByText('Jorge Salas')).toBeInTheDocument();
    expect(
      screen.getByText('Excelente que ahora se pueda ver el comparativo de pesos por compañía.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ejecutivo visualizador')).toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });

  it('shows the empty state and no composer when there is nothing to comment on / no permission', () => {
    render(
      <ValueMonitorComments
        data={{ ...THREAD, items: [], permissions: { ...THREAD.permissions, canComment: false } }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByTestId('value-monitor-comments-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('value-monitor-comments-composer')).not.toBeInTheDocument();
  });

  it('posting a comment calls onSubmit with the trimmed text and clears the composer', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup({ delay: null });
    render(<ValueMonitorComments data={THREAD} onSubmit={onSubmit} />);

    const input = screen.getByTestId('value-monitor-comments-composer-input');
    await user.type(input, '¿Podemos agregar exportación a PDF del dashboard completo?');
    await user.click(screen.getByTestId('value-monitor-comments-composer-submit'));

    expect(onSubmit).toHaveBeenCalledWith(
      '¿Podemos agregar exportación a PDF del dashboard completo?',
    );
    expect(input).toHaveValue('');
  });
});
