import { useState } from 'react';

import { useIndicatorCatalogView } from '@/entities/analysis';
import { useIndicatorPickerStep } from '@/features/analysis-draft-indicators';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import { IndicatorPicker } from './IndicatorPicker';

import type { IndicatorSource } from './IndicatorPicker';

export interface IndicatorPickerStepProps {
  draftId: string;
  /** The draft's own `indicatorIds` (V-05). */
  indicatorIds: readonly string[];
  canEdit: boolean;
}

/**
 * Data-wired step 3: the V-07 indicator catalog of the active source tab plus the autosaved selection
 * (`useIndicatorPickerStep`), rendered through the presentational `IndicatorPicker`. The source tab is this step's own
 * view state (it drives which catalog is fetched); switching it keeps the selection.
 */
export function IndicatorPickerStep({ draftId, indicatorIds, canEdit }: IndicatorPickerStepProps) {
  const t = useT();
  const [source, setSource] = useState<IndicatorSource>('pares');
  const catalog = useIndicatorCatalogView(source);
  const step = useIndicatorPickerStep({ draftId, initialSelectedIds: indicatorIds });

  if (catalog.isPending) {
    return (
      <div className="grid gap-10" data-testid="indicator-picker-step-loading">
        <Skeleton shape="line" />
        <Skeleton shape="block" />
      </div>
    );
  }
  if (catalog.isError) {
    const { error } = catalog;
    return (
      <SectionErrorPanel
        testId="indicator-picker-step-error"
        retryTestId="indicator-picker-step-retry"
        errorCode={isApiError(error) ? error.code : 'UNKNOWN'}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        onRetry={() => {
          void catalog.refetch();
        }}
      />
    );
  }
  return (
    <IndicatorPicker
      source={source}
      onSourceChange={setSource}
      catalog={catalog.data}
      selectedIds={step.selectedIds}
      onChange={step.onSelectedIdsChange}
      canEdit={canEdit}
      {...(step.error === undefined ? {} : { error: step.error })}
    />
  );
}
