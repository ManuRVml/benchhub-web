import { useT } from '@/shared/i18n';
import { EMPTY, formatDate } from '@/shared/lib/format';
import { Modal } from '@/shared/ui/composites/modal';

import { kviTableTestIds } from './test-ids';

import type { KviTableRow } from './KviTable';

export interface KviTraceabilityModalProps {
  /** `null` when no row is selected: the modal stays closed and unmounts its content. */
  row: KviTableRow | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * OVL-11 KVI traceability (SCR-11): title = KVI name, five label/value pairs — category, source, capture date,
 * owner, unit. Opened from a KVI's name in the table; `row` also carries the values already shown in its own
 * columns (category, owner, unit), so the caller does not have to duplicate them.
 */
export function KviTraceabilityModal({ row, onOpenChange }: KviTraceabilityModalProps) {
  const t = useT();
  const fields: [string, string][] = row
    ? [
        [t('value-monitor.modal.traceability.category'), row.category],
        [t('value-monitor.modal.traceability.source'), row.traceability.source],
        [t('value-monitor.modal.traceability.capturedAt'), formatDate(row.traceability.capturedAt)],
        [t('value-monitor.modal.traceability.owner'), row.owner ?? EMPTY],
        [t('value-monitor.modal.traceability.unit'), row.unit],
      ]
    : [];

  return (
    <Modal
      open={row !== null}
      onOpenChange={onOpenChange}
      title={row?.label ?? ''}
      description={row?.code ?? ''}
      hideDescription
      width={420}
      testId={kviTableTestIds.traceabilityModal}
    >
      <dl className="flex flex-col gap-12">
        {fields.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-12">
            <dt className="text-small font-medium text-text-secondary uppercase">{label}</dt>
            <dd className="m-0 text-body-strong text-text-heading">{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
