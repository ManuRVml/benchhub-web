import { useId, useState } from 'react';

import { useT } from '@/shared/i18n';
import { formatPeriod, formatRelativeTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui/primitives/button';

import type { IndicatorDetailView } from '@/shared/api';

type TraceabilityData = Extract<IndicatorDetailView['traceability'], { status: 'ok' }>['data'];

export interface IndicatorTraceabilityProps {
  data: TraceabilityData;
  /** Reference time of the relative dates (tests pin it); default: now, taken by the formatter. */
  now?: number | undefined;
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <dt className="text-eyebrow text-text-muted">{label}</dt>
      <dd className="m-0 text-13 text-text-body">{children}</dd>
    </div>
  );
}

/**
 * "Trazabilidad del dato" (SCR-10 L1408–1421): source, data update ("T4 2025 · actualizado hace 3 días") and the
 * "Ver cambios ›" history toggle, a disclosure (`aria-expanded` / `aria-controls`) over the change history.
 */
export function IndicatorTraceability({ data, now }: IndicatorTraceabilityProps) {
  const t = useT();
  const [showHistory, setShowHistory] = useState(false);
  const historyId = useId();

  return (
    <div className="flex flex-col gap-14">
      {/* Four columns as in the prototype (repeat(4, 1fr), BencHUD.dc.html:1409); the fourth is free. */}
      <dl
        className="m-0 grid grid-cols-1 gap-14 laptop:grid-cols-4"
        data-testid="indicator-detail-traceability-grid"
      >
        <Cell label={t('indicator-detail.sections.traceability.source')}>{data.source}</Cell>
        <Cell label={t('indicator-detail.sections.traceability.dataUpdate')}>
          {t('indicator-detail.sections.traceability.updated', {
            period: formatPeriod(data.period),
            relative: formatRelativeTime(data.updatedAt, now),
          })}
        </Cell>
        <Cell label={t('indicator-detail.sections.traceability.history')}>
          <Button
            variant="link"
            aria-expanded={showHistory}
            aria-controls={historyId}
            data-testid="indicator-detail-history-toggle"
            onClick={() => {
              setShowHistory((open) => !open);
            }}
          >
            {t('indicator-detail.sections.traceability.changeLink')}
          </Button>
        </Cell>
      </dl>
      <ul
        id={historyId}
        hidden={!showHistory}
        aria-label={t('indicator-detail.sections.traceability.historyList')}
        data-testid="indicator-detail-history"
        className="m-0 flex list-none flex-col gap-8 border-t border-surface-page p-0 pt-12"
      >
        {data.history.map((entry) => (
          <li
            key={`${entry.occurredAt}-${entry.text}`}
            className="flex justify-between gap-12 text-13"
          >
            <span className="text-text-body">{entry.text}</span>
            <span className="shrink-0 text-12 text-text-muted">
              {formatRelativeTime(entry.occurredAt, now)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
