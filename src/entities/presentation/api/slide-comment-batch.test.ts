import { describe, expect, it } from 'vitest';

describe('slide-comment-batch', () => {
  it('runs drafts sequentially', async () => {
    const executeOrder: string[] = [];
    const generateDraft = async (key: string) => {
      executeOrder.push(key);
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        text: `draft ${key}`,
        status: 'suggestion' as const,
        generatedBy: { model: 'mock', version: '1' },
      };
    };

    const { results } = await import('./slide-comment-batch').then((m) =>
      m.runSlideCommentBatch({
        slideKeys: ['slide1', 'slide2', 'slide3'],
        generateDraft,
        onProgress: () => undefined,
      }),
    );

    expect(results).toHaveLength(3);
    expect(executeOrder).toEqual(['slide1', 'slide2', 'slide3']);
  });
});
