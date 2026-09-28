import { useCompetitorCatalogView } from '@/entities/analysis';
import { useCompetitorPickerStep } from '@/features/analysis-draft-competitors';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import { CompetitorPicker, resolveInitialCompetitorIds } from './CompetitorPicker';

export interface CompetitorPickerStepProps {
  draftId: string;
  /** The draft's own `competitorIds` (V-05); empty on a brand-new draft. */
  competitorIds: readonly string[];
  canEdit: boolean;
}

/**
 * Data-wired step 2: the V-06 competitor catalog plus the autosaved selection (`useCompetitorPickerStep`), rendered
 * through the presentational `CompetitorPicker`. A widget, not a feature, because it composes a feature (the autosave
 * hook) with an entity query — same loading / error shape as `ValidationStep` (P5-36).
 */
export function CompetitorPickerStep({
  draftId,
  competitorIds,
  canEdit,
}: CompetitorPickerStepProps) {
  const t = useT();
  const catalog = useCompetitorCatalogView();
  const step = useCompetitorPickerStep({
    draftId,
    initialSelectedIds: resolveInitialCompetitorIds(competitorIds),
  });

  if (catalog.isPending) {
    return (
      <div className="grid gap-10" data-testid="competitor-picker-step-loading">
        <Skeleton shape="line" />
        <Skeleton shape="block" />
      </div>
    );
  }
  if (catalog.isError) {
    const { error } = catalog;
    return (
      <SectionErrorPanel
        testId="competitor-picker-step-error"
        retryTestId="competitor-picker-step-retry"
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
    <CompetitorPicker
      groups={catalog.data.groups}
      suggestion={catalog.data.suggestion}
      selectedIds={step.selectedIds}
      onChange={step.onSelectedIdsChange}
      canEdit={canEdit}
      {...(step.error === undefined ? {} : { error: step.error })}
    />
  );
}
