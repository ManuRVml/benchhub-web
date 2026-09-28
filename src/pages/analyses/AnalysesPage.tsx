import { useNavigate } from 'react-router';
import { z } from 'zod';

import { useAnalysesView, useCreateAnalysisDraft } from '@/entities/analysis';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/format';
import { useTypedSearchParams } from '@/shared/lib/url';
import { ToastProvider, useToast } from '@/shared/ui/composites/toast';
import { Button } from '@/shared/ui/primitives/button';
import { SearchInput, Select } from '@/shared/ui/primitives/inputs';
import { AnalysesTable } from '@/widgets/analyses-table';

import { analysesPageTestIds } from './test-ids';

import type { SelectOption } from '@/shared/ui/primitives/inputs';
import type { AnalysesTableRow } from '@/widgets/analyses-table';

const ANALYSIS_STATUSES = ['draft', 'in_progress', 'in_review', 'published'] as const;

const analysesSearchParamsSchema = z.object({
  q: z.string().optional(),
  fecha: z.string().optional(),
  creador: z.string().optional(),
  estado: z.string().optional(),
  ref: z.string().optional(),
  page: z.coerce.number().optional().default(1),
});

export type AnalysesPageFilters = z.output<typeof analysesSearchParamsSchema>;

export function AnalysesPage() {
  return (
    <ToastProvider>
      <AnalysesPageContent />
    </ToastProvider>
  );
}

function AnalysesPageContent() {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useTypedSearchParams(analysesSearchParamsSchema);
  const createDraft = useCreateAnalysisDraft();

  const { data, isLoading, error } = useAnalysesView({
    q: filters.q,
    createdOn: filters.fecha,
    createdBy: filters.creador,
    status: filters.estado,
    ref: filters.ref,
    page: filters.page,
  });

  const handleFilterChange = (patch: Partial<AnalysesPageFilters>) => {
    const updates: Record<string, string | number | undefined> = {};

    if ('q' in patch) updates.q = patch.q;
    if ('fecha' in patch) updates.fecha = patch.fecha;
    if ('creador' in patch) updates.creador = patch.creador;
    if ('estado' in patch) updates.estado = patch.estado;
    if ('ref' in patch) updates.ref = patch.ref;
    if ('page' in patch) updates.page = patch.page;

    setFilters(updates, { replace: true });
  };

  const handleClearFilters = () => {
    setFilters(
      {
        q: undefined,
        fecha: undefined,
        creador: undefined,
        estado: undefined,
        ref: undefined,
        page: undefined,
      },
      { replace: true },
    );
  };

  const handleRowClick = (analysisId: string) => {
    const analysis = data?.items.find((a) => a.id === analysisId);
    if (analysis?.canOpenResults) {
      void navigate(routes.analysisResults.build({ analysisId }, {}));
    } else {
      void navigate(routes.analysisReport.build({ analysisId }, {}));
    }
  };

  const createNewAnalysis = () => {
    createDraft.mutate(
      { type: 'generacion_valor' },
      {
        onSuccess: ({ draftId }) => {
          void navigate(routes.analysisDefinition.build({ analysisId: draftId }, { paso: '1' }));
        },
        onError: () => {
          toast.error(t('common.section.error.title'));
        },
      },
    );
  };

  // The wire enum is English snake_case (CF-101); each label is its own literal t() call, since the i18n helper's
  // types only accept keys it can see statically (no dynamic template interpolation).
  const statusLabels: Record<(typeof ANALYSIS_STATUSES)[number], string> = {
    draft: t('analyses.status.draft'),
    in_progress: t('analyses.status.inProgress'),
    in_review: t('analyses.status.inReview'),
    published: t('analyses.status.published'),
  };
  // Prototype L392-L409: the options come from V-04 `filterOptions` (BFF-derived over what the user can see).
  const filterOptions = data?.filterOptions;
  const dateOptions: SelectOption[] = (filterOptions?.createdOn ?? []).map((iso) => ({
    value: iso,
    label: formatDate(iso),
  }));
  const creatorOptions: SelectOption[] = (filterOptions?.createdBy ?? []).map((user) => ({
    value: user.id,
    label: user.fullName,
  }));
  const statusOptions: SelectOption[] = (filterOptions?.status ?? ANALYSIS_STATUSES).map(
    (status) => ({ value: status, label: statusLabels[status] }),
  );
  const orUndefined = (value: string) => (value === '' ? undefined : value);
  const hasActiveFilters = Boolean(
    filters.q ?? filters.fecha ?? filters.creador ?? filters.estado ?? filters.ref,
  );
  const rows: AnalysesTableRow[] = (data?.items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description === '' ? null : item.description,
    createdAt: item.createdOn,
    createdBy: item.createdBy.fullName,
    status: item.status,
  }));

  // Handle error state
  if (error) {
    return (
      <section
        data-testid={analysesPageTestIds.error}
        className="flex flex-col items-center justify-center py-48"
      >
        <h2 className="text-title-card-lg mb-8 text-text-heading">
          {t('common.section.error.title')}
        </h2>
        <Button
          size="md"
          onClick={() => {
            window.location.reload();
          }}
          testId={analysesPageTestIds.retry}
        >
          {t('common.section.error.retry')}
        </Button>
      </section>
    );
  }

  return (
    <section data-testid={analysesPageTestIds.root} className="flex flex-col">
      {/* Toolbar (prototype L385-L388): the shell header holds the page h1, so the list title is an h2. */}
      <div className="mb-20 flex items-center justify-between gap-12">
        <h2 className="text-14 font-bold text-text-secondary">{t('analyses.page.title')}</h2>
        <Button
          variant="primary"
          onClick={createNewAnalysis}
          disabled={createDraft.isPending}
          loading={createDraft.isPending}
          testId={analysesPageTestIds.createButton}
        >
          {t('analyses.actions.create')}
        </Button>
      </div>

      {/* Filters (prototype L390-L413): full-width search + Fecha / Creador / Estado selects, URL-synced (ADR-0005)
          and sent to V-04 as q / createdOn / createdBy / status. */}
      <div
        data-testid={analysesPageTestIds.filters}
        className="mb-16 flex flex-wrap items-center gap-10"
      >
        <SearchInput
          label={t('analyses.search.label')}
          hideLabel
          placeholder={t('analyses.search.placeholder')}
          value={filters.q ?? ''}
          onValueChange={(q) => {
            handleFilterChange({ q: orUndefined(q) });
          }}
          testId={analysesPageTestIds.search}
          className="min-w-55 flex-1"
        />
        <Select
          label={t('analyses.filters.date.label')}
          hideLabel
          allLabel={t('analyses.filters.date.all')}
          options={dateOptions}
          value={filters.fecha ?? ''}
          onValueChange={(fecha) => {
            handleFilterChange({ fecha: orUndefined(fecha) });
          }}
          testId={analysesPageTestIds.dateFilter}
        />
        <Select
          label={t('analyses.filters.creator.label')}
          hideLabel
          allLabel={t('analyses.filters.creator.all')}
          options={creatorOptions}
          value={filters.creador ?? ''}
          onValueChange={(creador) => {
            handleFilterChange({ creador: orUndefined(creador) });
          }}
          testId={analysesPageTestIds.creatorFilter}
        />
        <Select
          label={t('analyses.filters.status.label')}
          hideLabel
          allLabel={t('analyses.filters.status.all')}
          options={statusOptions}
          value={filters.estado ?? ''}
          onValueChange={(estado) => {
            handleFilterChange({ estado: orUndefined(estado) });
          }}
          testId={analysesPageTestIds.statusFilter}
        />
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="link"
            onClick={handleClearFilters}
            testId={analysesPageTestIds.clearFilters}
          >
            {t('analyses.filters.clear')}
          </Button>
        )}
      </div>
      {isLoading ? (
        <p className="text-label text-text-secondary">{t('common.section.loading')}</p>
      ) : rows.length === 0 ? (
        <p data-testid={analysesPageTestIds.empty} className="text-label text-text-secondary">
          {t('analyses.empty.noResults')}
        </p>
      ) : (
        <AnalysesTable rows={rows} onViewDetails={handleRowClick} />
      )}
    </section>
  );
}
