import { useValueMonitorRecommendationsView } from '@/entities/value-monitor';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Modal } from '@/shared/ui/composites/modal';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import type { ValueMonitorRecommendation } from '@/entities/value-monitor';

export interface ValueMonitorRecommendationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selected snapshot id; `undefined` = latest. */
  snapshot?: string | undefined;
}

const TONE_CLASS: Record<ValueMonitorRecommendation['tone'], string> = {
  ok: 'bg-status-success-bg text-status-success-text',
  watch: 'bg-status-warning-bg text-status-warning-text',
  action: 'bg-status-danger-bg text-status-danger-text',
};

/** OVL-02 "✦ Recomendaciones estratégicas de Yarbis" (V-35, SCR-11 header AI pill). Fetched only while open. */
export function ValueMonitorRecommendationsModal({
  open,
  onOpenChange,
  snapshot,
}: ValueMonitorRecommendationsModalProps) {
  const t = useT();
  const query = useValueMonitorRecommendationsView(snapshot, open);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('value-monitor.modal.recommendations.title')}
      description={t('value-monitor.modal.recommendations.subtitle')}
      width={520}
      testId="value-monitor-recommendations-modal"
    >
      {query.isError ? (
        <SectionErrorPanel
          testId="value-monitor-recommendations-error"
          retryTestId="value-monitor-recommendations-retry"
          errorCode={isApiError(query.error) ? query.error.code : 'UNKNOWN'}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : query.data ? (
        <ul className="flex flex-col gap-8" data-testid="value-monitor-recommendations-list">
          {query.data.items.map((item) => (
            <li
              key={item.label}
              className={cn('rounded-card p-12 text-small', TONE_CLASS[item.tone])}
            >
              <strong>
                {item.label}
                {'.'}
              </strong>{' '}
              {item.text}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-8" aria-busy="true">
          <div className="h-40 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
          <div className="h-40 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
        </div>
      )}
    </Modal>
  );
}
