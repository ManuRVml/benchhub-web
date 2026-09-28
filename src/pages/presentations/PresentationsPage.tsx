import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { useResultsHeaderView } from '@/entities/analysis';
import { useCreatePresentationDraft, usePresentationsView } from '@/entities/presentation';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/format';
import { InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { createDataTableColumnHelper, DataTable } from '@/shared/ui/table';
import { MOCK_DEFAULT_ANALYSIS_ID } from '@/widgets/app-shell';
import { PresentationBuilderForm } from '@/widgets/presentation-builder';

import { presentationsPageTestIds } from './test-ids';

import type { PresentationsListItem } from '@/entities/presentation';

const presentationCol = createDataTableColumnHelper<PresentationsListItem>();

/** V-09 `analysisTabs[].id` → label (the prototype's ANALYSIS_TABS, HTML L3779-3783). */
const ANALYSIS_TAB_LABEL_KEY = {
  configuration: 'common.analysisTabs.definition',
  results: 'common.analysisTabs.results',
  presentation: 'common.analysisTabs.presentation',
} as const satisfies Record<string, string>;

/**
 * SCR-13: `/presentaciones`, `/presentaciones/nueva`, `/presentaciones/:presentationId/editar` and
 * `/analisis/:analysisId/presentaciones` all resolve to this one page (router.tsx PAGES), matching the screen
 * inventory's single SCR-13 screen. Three route shapes, one component (rules-of-hooks: every hook below always runs,
 * only what is rendered differs):
 * - `:presentationId` present (`/editar`) → the builder (`@/widgets/presentation-builder`) for that existing draft.
 * - the bare `/presentaciones/nueva` path → transient: creates a draft (C-27) for `?analysisId=` (or the session
 *   default) and replaces the URL with the `editar` route, per the screen inventory ("Creates a draft with C-27 and
 *   replaces the URL", inference).
 * - otherwise → "Presentaciones creadas" (V-40): the sidebar route (no `analysisId`, every presentation the role can
 *   see) or the analysis tab route (scoped to one analysis, `:analysisId` path param, OQ-14).
 */
export function PresentationsPage() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const { analysisId, presentationId } = useParams<{
    analysisId?: string;
    presentationId?: string;
  }>();
  const isNewRoute = location.pathname === routes.presentationNew.path;
  const { data, isLoading, error } = usePresentationsView(analysisId, {
    enabled: presentationId === undefined && !isNewRoute,
  });
  const createDraft = useCreatePresentationDraft();
  // The analysis tab bar (SCR-08's, V-09 `analysisTabs`) only exists where there is an analysis: the
  // `/analisis/:analysisId/presentaciones` route. The sidebar list is global and shows no tabs.
  const analysisFrame = useResultsHeaderView(
    presentationId === undefined ? (analysisId ?? '') : '',
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const titleId = useId();
  const infoId = useId();

  const redirecting = useRef(false);
  useEffect(() => {
    if (!isNewRoute || redirecting.current) return;
    redirecting.current = true;
    createDraft.mutate(search.get('analysisId') ?? MOCK_DEFAULT_ANALYSIS_ID, {
      onSuccess: (draft) => {
        void navigate(routes.presentationEdit.build({ presentationId: draft.id }), {
          replace: true,
        });
      },
    });
    // Runs once when this mount lands on /nueva; a redirect away unmounts the branch below anyway.
    // eslint-disable-next-line
  }, [isNewRoute]);

  if (presentationId !== undefined) {
    return (
      <div data-testid={presentationsPageTestIds.root}>
        <ToastProvider>
          <PresentationBuilderForm presentationId={presentationId} />
        </ToastProvider>
      </div>
    );
  }

  if (isNewRoute) {
    return (
      <p data-testid={presentationsPageTestIds.root} className="text-label text-text-secondary">
        {t('common.section.loading')}
      </p>
    );
  }

  if (error) {
    return (
      <section
        data-testid={presentationsPageTestIds.error}
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
          testId={presentationsPageTestIds.retry}
        >
          {t('common.section.error.retry')}
        </Button>
      </section>
    );
  }

  const rows = data?.items ?? [];
  const canCreate = data?.permissions.canCreate === true;

  const handleCreate = () => {
    createDraft.mutate(analysisId ?? MOCK_DEFAULT_ANALYSIS_ID, {
      onSuccess: (draft) => {
        void navigate(routes.presentationEdit.build({ presentationId: draft.id }));
      },
    });
  };

  const columns = [
    presentationCol.accessor('name', {
      header: () => t('presentations.list.headers.name'),
      meta: { rowHeader: true, width: 'minmax(220px, 2.2fr)' },
      cell: (info) => <span className="text-body-strong text-text-heading">{info.getValue()}</span>,
    }),
    presentationCol.accessor('createdOn', {
      header: () => t('presentations.list.headers.createdOn'),
      meta: { width: 'minmax(130px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
    }),
    presentationCol.accessor('status', {
      header: () => t('presentations.list.headers.status'),
      meta: { width: '140px' },
      cell: (info) => {
        const status = info.getValue();
        const label = {
          published: t('presentations.list.status.published'),
          in_review: t('presentations.list.status.inReview'),
          draft: t('presentations.list.status.draft'),
        }[status];
        return (
          <Badge kind="status" status={status}>
            {label}
          </Badge>
        );
      },
    }),
    presentationCol.accessor('publishedOn', {
      header: () => t('presentations.list.headers.publishedOn'),
      meta: { width: 'minmax(130px, 1fr)' },
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
    }),
    presentationCol.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('common.a11y.rowActions')}</span>,
      meta: { width: '190px', align: 'end' },
      cell: ({ row }) => {
        const presentation = row.original;
        return (
          <div className="flex justify-end gap-8">
            {presentation.permissions.canEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigate(routes.presentationEdit.build({ presentationId: presentation.id }));
                }}
                testId={presentationsPageTestIds.editAction(presentation.id)}
              >
                {t('presentations.list.actions.edit')}
              </Button>
            ) : null}
            {presentation.permissions.canView ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  void navigate(
                    routes.presentationDetail.build({ presentationId: presentation.id }),
                  );
                }}
                testId={presentationsPageTestIds.viewAction(presentation.id)}
              >
                {t('presentations.list.actions.viewDetail')}
              </Button>
            ) : null}
          </div>
        );
      },
    }),
  ];

  const emptyState = (
    <div data-testid={presentationsPageTestIds.empty} className="py-24 text-center">
      <p className="text-text-secondary">{t('presentations.empty.noPresentations')}</p>
    </div>
  );

  const tabs = analysisId !== undefined ? analysisFrame.data?.analysisTabs : undefined;
  const onTab = (id: string) => {
    if (analysisId === undefined) return;
    if (id === 'configuration') void navigate(routes.analysisDefinition.build({ analysisId }));
    if (id === 'results') void navigate(routes.analysisResults.build({ analysisId }));
  };

  return (
    <section data-testid={presentationsPageTestIds.root} className="flex flex-col gap-20">
      {tabs ? (
        <SegmentedTabs
          aria-label={t('common.a11y.analysisTabs')}
          variant="brand"
          value="presentation"
          className="self-start"
          items={tabs.map((tab) => ({
            id: tab.id,
            label: t(ANALYSIS_TAB_LABEL_KEY[tab.id]),
            disabled: !tab.isEnabled,
          }))}
          onChange={onTab}
          testIds={{ scope: presentationsPageTestIds.root, component: 'analysis-tabs' }}
        />
      ) : null}
      {/* The shell header is the page h1 ("Presentaciones"); the list title is a section heading (F0-3). */}
      <div className="flex items-center gap-6">
        <h2 id={titleId} className="text-title-card text-text-heading">
          {t('presentations.list.title')}
        </h2>
        <InfoToggle
          expanded={infoOpen}
          controls={infoId}
          describedBy={titleId}
          onToggle={() => {
            setInfoOpen((open) => !open);
          }}
          testId={presentationsPageTestIds.infoToggle}
        />{' '}
      </div>
      <InlineInfoPanel
        id={infoId}
        labelledBy={titleId}
        open={infoOpen}
        testId={presentationsPageTestIds.infoPanel}
      >
        {t('presentations.list.info')}
      </InlineInfoPanel>

      {isLoading ? (
        <p className="text-label text-text-secondary">{t('common.section.loading')}</p>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          caption={t('presentations.list.title')}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          emptyState={emptyState}
          minWidth="760px"
          testId={presentationsPageTestIds.table}
        />
      )}
      {/* "+ Crear presentación" sits below the table card, left-aligned (HTML L2389). */}
      {canCreate ? (
        <Button
          size="md"
          variant="primary"
          className="self-start"
          onClick={handleCreate}
          loading={createDraft.isPending}
          testId={presentationsPageTestIds.createButton}
        >
          {t('presentations.list.buttons.create')}
        </Button>
      ) : null}
    </section>
  );
}
