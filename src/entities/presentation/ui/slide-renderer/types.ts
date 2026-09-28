import type { V42Response } from '@/shared/api';

// Slide data of V-42 GET /api/v1/views/presentation-slides/:presentationId (docs/design/view-data-contracts/V-42-…md,
// docs/design/slide-renderer.md). The types are derived from the generated V-42 response (the port's output), so the
// renderer draws exactly what the contract validates: one discriminated union on `kind` (14 kinds), no parallel
// hand-written copy to drift from it.

/** One slide of V-42, discriminated by `kind`. */
export type Slide = V42Response['slides'][number];

export type SlideKind = Slide['kind'];

type SlideOf<K extends SlideKind> = Extract<Slide, { kind: K }>;

/** Presentation template (SCR-13 "Tipo de presentación"); no template selected → `directorio`. */
export type SlideTemplateId = V42Response['templateId'];

/** Unit codes the slide values use (contract `UnitCode`); unknown codes format as plain numbers. */
export type SlideUnit = string;

export type TitleSlide = SlideOf<'title'>;
export type BarsSlide = SlideOf<'bars'>;
export type TableSlide = SlideOf<'table'>;
export type PvcSlide = SlideOf<'pvc'>;
export type HomSlide = SlideOf<'hom'>;
export type HomMissingSlide = SlideOf<'homMissing'>;
export type RadarSlide = SlideOf<'radar'>;
/**
 * `findings[]{text}` (≤ 5) plus ONE `status: 'suggestion'` for the whole slide (AI / template suggestions until the
 * analyst accepts them, OQ-19): the status sits next to `findings`, not on each finding, and the spec draws no status
 * marker, so the view renders the texts only.
 */
export type HallazgosSlide = SlideOf<'hallazgos'>;
export type SummarySlide = SlideOf<'summary'>;
export type RankingSlide = SlideOf<'ranking'>;
export type CategoriesSlide = SlideOf<'categories'>;
export type FindingsSlide = SlideOf<'findings'>;
export type AppendixSlide = SlideOf<'appendix'>;
/** `[{ kind: 'empty' }]` when no module is selected; carries no other member. */
export type EmptySlide = SlideOf<'empty'>;

/** The 14 kinds, in catalogue order (slide-renderer.md "Kind catalogue"). */
export const SLIDE_KINDS = [
  'title',
  'bars',
  'table',
  'pvc',
  'hom',
  'homMissing',
  'radar',
  'hallazgos',
  'summary',
  'ranking',
  'categories',
  'findings',
  'appendix',
  'empty',
] as const satisfies readonly SlideKind[];

/** Deck-level members of V-42 the renderer needs. */
export interface SlideDeckTemplate {
  templateId: SlideTemplateId;
  templateName: string;
}
