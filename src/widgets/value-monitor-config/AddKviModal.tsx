import { useState } from 'react';

import { useAddValueMonitorKvis, useKviCandidatesView } from '@/entities/value-monitor';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { Button } from '@/shared/ui/primitives/button';
import { ChipGroup } from '@/shared/ui/primitives/chip';

import { testIds } from './test-ids';

import type { KviCandidatesSource } from '@/entities/value-monitor';

export interface AddKviModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selected snapshot id; `undefined` = latest. */
  snapshot?: string | undefined;
}

const SOURCE_TABS = [
  { id: 'pares', labelKey: 'value-monitor.modal.addIndicator.tabs.peerReferencing' },
  { id: 'tbg', labelKey: 'value-monitor.modal.addIndicator.tabs.tbg' },
  { id: 'ilp', labelKey: 'value-monitor.modal.addIndicator.tabs.ilp' },
] as const satisfies readonly { id: KviCandidatesSource; labelKey: string }[];

/**
 * OVL-05 "Añadir indicador" (V-34 candidates, C-18 add): one multi-select list per source tab (pares / TBG / ILP, V-34
 * `source`). The checked ids live in this modal, not in a tab, so a selection survives switching tabs and "{n}
 * seleccionados" counts every tab. C-18 takes an unrelated `source: 'categories' | 'all' | 'custom'` enum, so the
 * checked ids are always saved as `source: 'custom'` (see `useAddValueMonitorKvis`). A candidate the monitor already
 * has (`isAlreadyIncluded`) is disabled with its reason in the label, and never counted or saved. No dedicated
 * Checkbox primitive exists yet, so the multi-select reuses `ChipGroup`, same as the config card's own indicator
 * toggles.
 */
export function AddKviModal({ open, onOpenChange, snapshot }: AddKviModalProps) {
  const t = useT();
  const [source, setSource] = useState<KviCandidatesSource>('pares');
  const candidates = useKviCandidatesView(snapshot, open, source);
  const addKvis = useAddValueMonitorKvis(snapshot);
  const [selected, setSelected] = useState<readonly string[]>([]);
  // Resets the selection and the tab every time the modal opens (adjusting state during render, not in an effect --
  // React's own pattern for "state that depends on a prop changing"; avoids react-hooks/set-state-in-effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected([]);
      setSource('pares');
    }
  }

  // A candidate already on the monitor (V-34 `isAlreadyIncluded`, SCR-11 A10) is shown disabled. `checked` also drops
  // an id that a refetch flipped to included after it was ticked, so the count and the C-18 ids never carry one.
  const includedIds = new Set(
    (candidates.data?.items ?? [])
      .filter((item) => item.isAlreadyIncluded)
      .map((item) => item.indicatorId),
  );
  const checked = selected.filter((id) => !includedIds.has(id));

  const handleConfirm = async () => {
    await addKvis.mutateAsync(checked);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('value-monitor.modal.addIndicator.title')}
      description={t('value-monitor.modal.addIndicator.subtitle')}
      width={520}
      testId="value-monitor-add-kvi-modal"
      footer={
        <>
          <span className="mr-auto text-small text-text-secondary">
            {t('value-monitor.modal.addIndicator.footer', { count: checked.length })}
          </span>
          <Button
            variant="primary"
            disabled={checked.length === 0 || addKvis.isPending}
            loading={addKvis.isPending}
            testId={testIds.addKviModalConfirm}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {t('value-monitor.modal.addIndicator.add')}
          </Button>
        </>
      }
    >
      <div className="grid gap-12">
        <SegmentedTabs
          aria-label={t('value-monitor.modal.addIndicator.sourceTabs')}
          variant="brand"
          size="sm"
          value={source}
          items={SOURCE_TABS.map((tab) => ({ id: tab.id, label: t(tab.labelKey) }))}
          onChange={(id) => {
            const next = SOURCE_TABS.find((tab) => tab.id === id);
            if (next) setSource(next.id);
          }}
          testIds={{ scope: 'value-monitor-config', component: 'source-tabs' }}
        />
        {candidates.isError ? (
          <SectionErrorPanel
            testId="value-monitor-add-kvi-error"
            retryTestId="value-monitor-add-kvi-retry"
            errorCode={isApiError(candidates.error) ? candidates.error.code : 'UNKNOWN'}
            title={t('common.section.error.title')}
            retryLabel={t('common.section.error.retry')}
            onRetry={() => {
              void candidates.refetch();
            }}
          />
        ) : candidates.data ? (
          <ChipGroup
            mode="multi"
            value={checked}
            onChange={setSelected}
            aria-label={t('value-monitor.modal.addIndicator.title')}
            testIds={{ scope: 'value-monitor-config', component: 'candidate' }}
            items={candidates.data.items.map((item) => ({
              id: item.indicatorId,
              // The reason is part of the accessible name: the chip is a native disabled button, so it can be neither
              // clicked nor focused, and a screen reader still hears why.
              label: item.isAlreadyIncluded
                ? `${item.label} (${item.categoryLabel}) · ${t('value-monitor.modal.addIndicator.alreadyIncluded')}`
                : `${item.label} (${item.categoryLabel})`,
              disabled: item.isAlreadyIncluded,
            }))}
          />
        ) : (
          <div
            className="h-40 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none"
            aria-busy="true"
          />
        )}
      </div>
    </Modal>
  );
}
