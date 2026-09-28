import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

// C-32 — Generate slide comment draft, through the typed presentations port (POST /api/v1/slide-comment-drafts).

export interface SlideCommentDraft {
  text: string;
  status: 'suggestion';
  generatedBy: {
    model: string;
    version: string;
  };
}

export interface GenerateSlideCommentDraftInput {
  presentationId: string;
  slideKey: string;
  language: 'es' | 'en';
}

export function useGenerateSlideCommentDraft() {
  const { presentations } = useServices();

  return useMutation({
    mutationFn: (input: GenerateSlideCommentDraftInput) =>
      presentations.createSlideCommentDraft({
        presentationId: input.presentationId,
        slideKey: input.slideKey,
        language: input.language,
      }),
  });
}
