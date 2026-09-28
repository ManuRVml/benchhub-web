// Presentational shapes of the V-26 comment thread (docs/design/view-data-contracts/V-26-comment-thread.md, CF-101 /
// CF-133). The vendored contract 0.1.0 has no V-26 model yet, so these mirror it; the container (P5-04 hooks) maps the
// generated model into them and resolves `author.roleLabelKey` to the translated `roleLabel`.

/** Review comment workflow (C-10 creates `pending`, C-11 moves it). */
export type CommentStatus = 'pending' | 'in_analysis' | 'resolved';

/** Analyst decision on a change request (C-13). */
export type ChangeRequestDecision = 'accepted' | 'rejected';

export interface CommentAuthor {
  name: string;
  /** Translated role, e.g. "Analista creador" (from V-26 `roleLabelKey`). */
  roleLabel: string;
}

export interface CommentReply {
  id: string;
  author: CommentAuthor;
  text: string;
  /** ISO date-time with offset. */
  createdAt: string;
}

interface ThreadBase {
  id: string;
  author: CommentAuthor;
  text: string;
  createdAt: string;
  replies: readonly CommentReply[];
}

/** A comment carries a status; a change request carries a decision (`null` while open). */
export type CommentThreadItem =
  | (ThreadBase & { kind: 'comment'; status: CommentStatus; decision: null })
  | (ThreadBase & { kind: 'change_request'; status: null; decision: ChangeRequestDecision | null });

/** V-26 permissions: each flag false hides its controls entirely. */
export interface CommentThreadPermissions {
  /** Composer (C-10). */
  canComment: boolean;
  /** "Responder" on each thread (C-10 with parentId). */
  canReply: boolean;
  /** "Solicitar ajuste" beside the composer's submit (C-12). */
  canRequestChange: boolean;
  /** Status select on comments (C-11) and Aceptar / Rechazar on change requests (C-13). */
  canResolve: boolean;
}

/** A callback may return a promise; the control stays disabled until it settles. */
export type MaybePromise = void | Promise<void>;
