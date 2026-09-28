import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';

import { CommentThread } from './CommentThread';

import type { CommentThreadItem, CommentThreadPermissions } from './types';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Comments are data from the prototype seeds (SCR-09 L123–124, SCR-11 L189–191, SCR-10 V-26 example, SCR-14 L52); UI copy
// comes from i18n keys. `now` is pinned so the relative times read as in the prototype.
const NOW = Date.parse('2026-09-25T10:00:00-05:00');

const THREADS: CommentThreadItem[] = [
  {
    id: 'cmt_seed_1',
    kind: 'comment',
    author: { name: 'Jorge Salas', roleLabel: 'Ejecutivo visualizador' },
    text: 'Excelente que ahora se pueda ver el comparativo de pesos por compañía.',
    createdAt: '2026-09-24T10:00:00-05:00',
    status: 'resolved',
    decision: null,
    replies: [],
  },
  {
    id: 'cmt_seed_2',
    kind: 'comment',
    author: { name: 'Alejandra Ríos', roleLabel: 'Ejecutivo integral' },
    text: '¿Por qué la brecha con Shell se amplió tanto en el último trimestre?',
    createdAt: '2026-09-23T09:10:00-05:00',
    status: 'in_analysis',
    decision: null,
    replies: [
      {
        id: 'cmt_seed_3',
        author: { name: 'Camilo Vega', roleLabel: 'Analista creador' },
        text: 'Shell reportó una revisión al alza en su margen EBITDA; ya está reflejada en la fuente Capital IQ.',
        createdAt: '2026-09-24T11:00:00-05:00',
      },
    ],
  },
  {
    id: 'chr_seed_1',
    kind: 'change_request',
    author: { name: 'Alejandra Ríos', roleLabel: 'Ejecutivo integral' },
    text: 'Solicito ampliar el histórico a 3 años para este indicador.',
    createdAt: '2026-09-25T06:00:00-05:00',
    status: null,
    decision: null,
    replies: [],
  },
];

const EXECUTIVE_INTEGRAL: CommentThreadPermissions = {
  canComment: true,
  canReply: true,
  canRequestChange: true,
  canResolve: false,
};

const meta = {
  title: 'Composites/CommentThread',
  component: CommentThread,
  args: {
    items: THREADS,
    permissions: EXECUTIVE_INTEGRAL,
    emptyLabel: t('common.section.empty'),
    now: NOW,
    onSubmit: fn(),
    onReply: fn(),
    onRequestChange: fn(),
    onStatusChange: fn(),
    onDecision: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-140 rounded-card border border-border-default bg-surface-card p-20">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

/** executive_integral: comments, replies and "Solicitar ajuste"; no analyst controls. */
export const ExecutiveIntegral: Story = {};

/** analyst_creator: status select on comments, Aceptar / Rechazar on open change requests, no "Solicitar ajuste". */
export const AnalystCreator: Story = {
  args: {
    permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: true },
  },
};

/** executive_viewer / explorers: read only, no composer or reply controls. */
export const ReadOnly: Story = {
  args: {
    permissions: { canComment: false, canReply: false, canRequestChange: false, canResolve: false },
  },
};

export const Decided: Story = {
  args: {
    items: THREADS.map((item) =>
      item.kind === 'change_request' ? { ...item, decision: 'accepted' as const } : item,
    ),
  },
};

export const Empty: Story = { args: { items: [] } };

/** SCR-13 / SCR-14: one-line composer with "Enviar" inline (HTML L2350-2353). */
export const InlineComposer: Story = {
  args: {
    composerLayout: 'inline',
    permissions: { canComment: true, canReply: false, canRequestChange: false, canResolve: false },
  },
};
