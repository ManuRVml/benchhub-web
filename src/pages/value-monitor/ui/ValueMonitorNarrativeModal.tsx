import { useEffect } from 'react';

import { useGenerateValueMonitorNarrative } from '@/entities/value-monitor';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

export interface ValueMonitorNarrativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * OVL-09 "Narrativa ejecutiva" (SCR-11 header AI pill): 4 fixed sections resolved by the BFF in one call (see
 * `useGenerateValueMonitorNarrative`). Regenerates every time the modal opens — a Yarbis suggestion, not a cached
 * view.
 */
export function ValueMonitorNarrativeModal({
  open,
  onOpenChange,
}: ValueMonitorNarrativeModalProps) {
  const t = useT();
  const narrative = useGenerateValueMonitorNarrative();
  const { mutate } = narrative;

  useEffect(() => {
    if (open) mutate();
  }, [open, mutate]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('value-monitor.modal.narrative.title')}
      description={t('value-monitor.modal.narrative.subtitle')}
      width={520}
      testId="value-monitor-narrative-modal"
    >
      {narrative.isError ? (
        <SectionErrorPanel
          testId="value-monitor-narrative-error"
          retryTestId="value-monitor-narrative-retry"
          errorCode={isApiError(narrative.error) ? narrative.error.code : 'UNKNOWN'}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={mutate}
        />
      ) : narrative.data ? (
        <div className="flex flex-col gap-12" data-testid="value-monitor-narrative-sections">
          {narrative.data.sections.map((section) => (
            <div key={section.title} className="rounded-card bg-surface-page p-14">
              <p className="mb-4 text-body-strong text-text-heading">{section.title}</p>
              <p className="text-small text-text-body">{section.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12" aria-busy="true">
          <div className="h-56 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
          <div className="h-56 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
        </div>
      )}
    </Modal>
  );
}
