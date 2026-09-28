import type { SlideCommentDraft } from './use-slide-comment-draft';

/**
 * Runs slide comment drafts sequentially, max 8 at a time, with per-item loading/error state. `generateDraft` already
 * closes over the presentation id and language (it comes from `useGenerateSlideCommentDraft().mutateAsync`), so this
 * orchestrator only sequences the slide keys.
 */
export async function runSlideCommentBatch({
  slideKeys,
  generateDraft,
  onProgress,
}: {
  slideKeys: readonly string[];
  generateDraft: (slideKey: string) => Promise<SlideCommentDraft>;
  onProgress?: (current: number, total: number) => void;
}): Promise<{
  results: { slideKey: string; success: boolean; error?: string }[];
  aggregateError?: string;
}> {
  const maxBatchSize = 8;
  const results: { slideKey: string; success: boolean; error?: string }[] = [];
  const chunkedKeys = slideKeys.slice(0, maxBatchSize);

  let index = 0;
  for (const slideKey of chunkedKeys) {
    onProgress?.(index, chunkedKeys.length);
    index += 1;

    try {
      await generateDraft(slideKey);
      results.push({ slideKey, success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudo generar el comentario.';
      results.push({ slideKey, success: false, error: errorMessage });
    }
  }

  const hasFailures = results.some((r) => !r.success);
  if (hasFailures) {
    return {
      results,
      aggregateError: 'No se pudieron generar todos los comentarios.',
    };
  }

  return { results };
}
