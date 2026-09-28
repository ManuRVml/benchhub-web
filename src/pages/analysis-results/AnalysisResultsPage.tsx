import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useResultsHeaderView } from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { useTypedSearchParams } from '@/shared/lib/url';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';
import { AiFindingsRail } from '@/widgets/ai-findings-rail';
import {
  AnalysisModules,
  PendingOverridesProvider,
  RESULTS_MODULE_REGISTRY,
} from '@/widgets/analysis-modules';
import { CompanyCoverage } from '@/widgets/company-coverage';

import {
  CompanyComparisonModule,
  PeerAverageComparisonModule,
  ReportSummaryModule,
} from './result-modules';
import { horizonFromParam, resultsSearchSchema } from './results-search';
import { ResultsActionRow, ResultsFooter } from './ResultsActions';

import type { V09Response } from '@/shared/api';

type AnalysisTabId = V09Response['analysisTabs'][number]['id'];

const TAB_LABEL_KEY = {
  configuration: 'analysis-results.frame.analysisTabs.configuration',
  results: 'analysis-results.frame.analysisTabs.results',
  presentation: 'analysis-results.frame.analysisTabs.presentation',
} as const satisfies Record<AnalysisTabId, string>;

/**
 * `RESULTS_MODULE_REGISTRY` with its placeholders replaced by the real modules (P5-41, P5-RES, P5-RES2). Composed
 * here, not inside `ModuleFrame.tsx`: `analysis-modules` and each content widget are sibling widgets, and a widget
 * may only import a lower layer, never another widget (FSD boundary, `tools/architecture/fsd-rules.js`); the page
 * layer can import both.
 */
const MODULE_REGISTRY = {
  ...RESULTS_MODULE_REGISTRY,
  companyCoverage: CompanyCoverage,
  peerAverageComparison: PeerAverageComparisonModule,
  companyComparison: CompanyComparisonModule,
  reportSummary: ReportSummaryModule,
};

/**
 * SCR-08 Resultados frame (docs/design/screen-inventory/SCR-08-resultados.md): analysis tabs, horizon control (URL
 * `horizonte`), the V-09 modules through the module registry (action row and footer are frame slots), and the sticky
 * "Hallazgos de IA" rail (V-14). V-09 blocks the frame; a V-09 failure is a full-page error with retry.
 */
export function AnalysisResultsPage() {
  const { analysisId = '' } = useParams();
  return (
    <ToastProvider>
      <PendingOverridesProvider key={analysisId}>
        <section data-testid="analysis-results-page" className="flex flex-col gap-16">
          <ResultsFrame analysisId={analysisId} />
        </section>
      </PendingOverridesProvider>
    </ToastProvider>
  );
}

function ResultsFrame({ analysisId }: { analysisId: string }) {
  const t = useT();
  const navigate = useNavigate();
  const [search] = useTypedSearchParams(resultsSearchSchema);
  const horizon = horizonFromParam(search.horizonte);
  const header = useResultsHeaderView(analysisId, horizon);
  const [busy, setBusy] = useState(false);

  if (header.data === undefined) {
    if (header.error) {
      return (
        <SectionErrorPanel
          testId="analysis-results-error"
          retryTestId="analysis-results-retry"
          errorCode={isApiError(header.error) ? header.error.code : 'UNKNOWN'}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={() => {
            void header.refetch();
          }}
        />
      );
    }
    return (
      <div data-testid="analysis-results-loading">
        <Skeleton shape="block" size={320} />
      </div>
    );
  }

  const { analysisTabs, modules, permissions } = header.data;

  const onTab = (id: string) => {
    const tab = analysisTabs.find((candidate) => candidate.id === id);
    if (!tab || tab.id === 'results') return;
    if (tab.id === 'configuration') {
      void navigate(routes.analysisDefinition.build({ analysisId }));
      return;
    }
    void navigate(
      tab.presentationId
        ? routes.presentationDetail.build({ presentationId: tab.presentationId })
        : routes.analysisPresentations.build({ analysisId }),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-20 desktop:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-16">
        <div className="flex flex-wrap items-center justify-between gap-12">
          <SegmentedTabs
            aria-label={t('common.a11y.analysisTabs')}
            variant="brand"
            value="results"
            items={analysisTabs.map((tab) => ({
              id: tab.id,
              label: t(TAB_LABEL_KEY[tab.id]),
              disabled: !tab.isEnabled,
            }))}
            onChange={onTab}
            testIds={{ scope: 'analysis-results', component: 'analysis-tabs' }}
          />
        </div>
        <AnalysisModules
          analysisId={analysisId}
          horizon={horizon}
          modules={modules}
          registry={MODULE_REGISTRY}
          slots={{
            actionRow: (
              <ResultsActionRow analysisId={analysisId} permissions={permissions} busy={busy} />
            ),
            // The footer is hidden in TBG + ILP (SCR-08 A5, S-UNION).
            footerActions:
              horizon === 'union' ? null : (
                <ResultsFooter
                  analysisId={analysisId}
                  permissions={permissions}
                  onBusyChange={setBusy}
                />
              ),
          }}
        />
      </div>
      <div className="self-start desktop:sticky desktop:top-20 desktop:max-h-[calc(100vh-112px)] desktop:overflow-auto">
        <AiFindingsRail analysisId={analysisId} horizon={horizon} />
      </div>
    </div>
  );
}
