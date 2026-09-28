import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { useToast } from '@/shared/ui/composites/toast';
import { Button } from '@/shared/ui/primitives/button';

import {
  narrativeTextOf,
  useGenerateExecutiveNarrative,
} from '../api/use-generate-executive-narrative';

import type { ExecutiveNarrativeSection } from '../api/use-generate-executive-narrative';

export interface ExecutiveNarrativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  section: ExecutiveNarrativeSection;
  /** Caller-supplied section name for the title ("Narrativa ejecutiva · {title}", OVL-08). */
  title: string;
  testId?: string;
}

/**
 * OVL-08: one C-15 call per open (not per render, not per re-render while open) — loading, the narrative text once
 * it settles, or an error with retry. "Copiar texto" writes the exact text and confirms via the "✓ Copiado" Toast
 * (overlays.md's Toasts table: bottom-center, 1.6 s) rather than an inline label swap. "Usar en presentación"
 * closes the modal and navigates with `analysisId`. Built on the shared `Modal`, fully controlled and without its
 * `trigger` prop, so it returns focus to whatever opened it (its own `onCloseAutoFocus` fallback) — the caller
 * (`ExecutiveNarrativeButton`) owns the open state and renders the actual trigger button itself.
 */
export function ExecutiveNarrativeModal({
  open,
  onOpenChange,
  analysisId,
  section,
  title,
  testId = 'executive-narrative-modal',
}: ExecutiveNarrativeModalProps) {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const generate = useGenerateExecutiveNarrative();
  const { mutate: generateNarrative, reset: resetNarrative } = generate;

  useEffect(() => {
    if (open) {
      generateNarrative({ analysisId, section });
    } else {
      resetNarrative();
    }
    // `generateNarrative` / `resetNarrative` are TanStack Query's own stable references: this fires only when
    // `open` (or the target) actually changes, never on an unrelated re-render while it stays open.
  }, [open, analysisId, section, generateNarrative, resetNarrative]);

  const text = generate.data ? narrativeTextOf(generate.data) : undefined;

  const handleRetry = () => {
    generate.mutate({ analysisId, section });
  };

  const handleCopy = () => {
    if (text === undefined) return;
    void navigator.clipboard.writeText(text).then(() => {
      toast.success(t('analysis-results.modals.narrative.copied'), { durationMs: 1600 });
    });
  };

  const handleUseInPresentation = () => {
    onOpenChange(false);
    void navigate(routes.presentationNew.build({}, { analysisId }));
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('analysis-results.modals.narrative.title', { title })}
      description={t('common.a11y.aiSuggestionContent')}
      hideDescription
      width={560}
      testId={testId}
      footer={
        generate.isSuccess ? (
          <>
            <Button variant="outline" onClick={handleCopy} testId={`${testId}-copy`}>
              {t('analysis-results.modals.narrative.copyText')}
            </Button>
            <Button onClick={handleUseInPresentation} testId={`${testId}-use-in-presentation`}>
              {t('analysis-results.modals.narrative.useInPresentation')}
            </Button>
          </>
        ) : null
      }
    >
      {generate.isError ? (
        <div data-testid={`${testId}-error`}>
          <p className="text-body text-text-body">{t('common.section.error.title')}</p>
          <Button
            variant="outline"
            className="mt-12"
            onClick={handleRetry}
            testId={`${testId}-retry`}
          >
            {t('common.section.error.retry')}
          </Button>
        </div>
      ) : null}

      {!generate.isError && !generate.isSuccess ? (
        <p data-testid={`${testId}-loading`} className="text-body text-text-secondary">
          {t('common.section.loading')}
        </p>
      ) : null}

      {generate.isSuccess ? (
        <p data-testid={`${testId}-text`} className="text-body whitespace-pre-wrap text-text-body">
          {text ?? ''}
        </p>
      ) : null}
    </Modal>
  );
}
