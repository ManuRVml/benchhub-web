import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { AiPill, type AiPillSize } from '@/shared/ui/primitives/ai-pill';

import { ExecutiveNarrativeModal } from './ExecutiveNarrativeModal';

import type { ExecutiveNarrativeSection } from '../api/use-generate-executive-narrative';

export interface ExecutiveNarrativeButtonProps {
  analysisId: string;
  section: ExecutiveNarrativeSection;
  /** Section name for the modal's title ("Narrativa ejecutiva · {title}"). */
  title: string;
  /** Pill label; default "Narrativa" (overlays.md's compact per-module pill — the frame action row already has its
   * own full "Generar narrativa ejecutiva" pill and is not wired to this component in this task). */
  label?: string;
  size?: AiPillSize;
  testId?: string;
}

/**
 * Drop-in OVL-08 trigger for any inert Resultados AI pill: owns the modal's open state itself, so a widget only
 * needs `analysisId`, `section` and `title`. The pill is a plain controlled `onClick` (not `Modal`'s `trigger`
 * prop), which is what lets the modal fire C-15 exactly once per open via its own `open`-keyed effect.
 */
export function ExecutiveNarrativeButton({
  analysisId,
  section,
  title,
  label,
  size = 'sm',
  testId = 'executive-narrative-button',
}: ExecutiveNarrativeButtonProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AiPill
        size={size}
        testId={testId}
        onClick={() => {
          setOpen(true);
        }}
      >
        {label ?? t('analysis-results.actionRow.aiPill.narrative')}
      </AiPill>
      <ExecutiveNarrativeModal
        open={open}
        onOpenChange={setOpen}
        analysisId={analysisId}
        section={section}
        title={title}
        testId={`${testId}-modal`}
      />
    </>
  );
}
