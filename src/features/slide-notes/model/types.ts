export interface SlideCommentBatchResult {
  results: { slideKey: string; success: boolean; error?: string }[];
  aggregateError?: string;
}

/** One chart-slide row of "Comentarios por slide": its C-32 / C-28 key (`moduleId|chartId`) and label. */
export interface SlideNoteRow {
  slideKey: string;
  label: string;
}

export interface SlideNoteProps {
  /** The module's selected charts, in module order: one row each (HTML L2491-2530). */
  rows: readonly SlideNoteRow[];
  /** Analyst notes keyed `moduleId|chartId` (V-41 / C-28 `notes`). */
  notes: Readonly<Record<string, string>>;
  /** Slide keys Yarbis is drafting right now (single or batch). */
  draftingKeys: ReadonlySet<string>;
  /** V-41 `permissions.canEdit`: add / edit / remove notes. */
  canEdit: boolean;
  /** V-41 `permissions.canDraftWithAssistant`: "✦ Sugerir / Redactar con Yarbis" (CF-40). */
  canDraft: boolean;
  /** Saves (C-28) the note of one slide. */
  onSave: (slideKey: string, text: string) => void;
  /** Removes (C-28) the note of one slide. */
  onRemove: (slideKey: string) => void;
  /** Asks Yarbis (C-32) for a draft of one slide; resolves with the text, or `undefined` when it failed. */
  onDraft: (slideKey: string) => Promise<string | undefined>;
  testId?: string;
}

export interface SlideNoteStatus {
  slideKey: string;
  hasNote: boolean;
  isGenerating: boolean;
}
