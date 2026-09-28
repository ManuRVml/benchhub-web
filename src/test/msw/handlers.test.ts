import { describe, expect, it } from 'vitest';

import {
  API_BASE_URL,
  ApiError,
  createHttpClient,
  createHttpPorts,
  TRACE_ID_HEADER,
} from '@/shared/api';
import { MOCK_GAPS, MOCK_LOGIN_CREDENTIALS } from '@/shared/api/mock';

import { scenarioHandlers } from './handlers';
import {
  emptyPayload,
  partialPayload,
  scenarioFromSearch,
  SCENARIOS,
  SLOW_DELAY_MS,
} from './scenarios';
import { server } from './server';

import type { ApiPorts, V03Response } from '@/shared/api';
import type { z } from 'zod';

// The handlers are relative to the page origin; jsdom's fetch needs an absolute base.
const ports = (): ApiPorts =>
  createHttpPorts(createHttpClient({ baseUrl: `${window.location.origin}${API_BASE_URL}` }));
const BODY = {} as never;

async function failure(call: Promise<unknown>): Promise<ApiError> {
  const error: unknown = await call.catch((e: unknown) => e);
  if (!(error instanceof ApiError)) throw new Error('expected an ApiError');
  return error;
}

describe('MSW handlers', () => {
  it('serve the 94 operations, the download handler and the O-02 stream in every scenario', () => {
    for (const scenario of SCENARIOS) expect(scenarioHandlers(scenario)).toHaveLength(96);
  });

  // 94 round trips through MSW; generous timeout for a busy full-suite run.
  it('answer every HTTP adapter call in the default ok scenario', { timeout: 30_000 }, async () => {
    const p = ports();
    const calls: Record<string, () => Promise<unknown>> = {
      startLogin: () => p.auth.startLogin(),
      completeLogin: () => p.auth.completeLogin('st8'),
      logout: () => p.auth.logout(),
      getSession: () => p.auth.getSession(),
      passwordLogin: () => p.auth.passwordLogin(MOCK_LOGIN_CREDENTIALS),
      getHomeView: () => p.home.getHomeView(),
      getAnalysesView: () => p.analyses.getAnalysesView(),
      getAnalysisDefinitionView: () => p.analysisDefinition.getAnalysisDefinitionView('drf 1'),
      getCompetitorCatalogView: () => p.analysisDefinition.getCompetitorCatalogView(),
      getIndicatorCatalogView: () => p.analysisDefinition.getIndicatorCatalogView(),
      getAnalysisValidationView: () => p.analysisDefinition.getAnalysisValidationView('drf 1'),
      getResultsHeaderView: () => p.results.getResultsHeaderView('ana 1'),
      getCompanyCoverageView: () => p.results.getCompanyCoverageView('ana 1'),
      getPeerAverageComparisonView: () => p.results.getPeerAverageComparisonView('ana 1'),
      getCompanyComparisonView: () => p.results.getCompanyComparisonView('ana 1'),
      getReportSummaryView: () => p.results.getReportSummaryView('ana 1'),
      getAiFindingsView: () => p.results.getAiFindingsView('ana 1'),
      getComparisonProfilesView: () => p.comparisonProfiles.getComparisonProfilesView('ana 1'),
      createAnalysisDraft: () => p.analysisDrafts.createAnalysisDraft(BODY),
      updateAnalysisDraft: () => p.analysisDrafts.updateAnalysisDraft('drf 1', BODY),
      generateAnalysis: () => p.analysisDrafts.generateAnalysis('drf 1', BODY),
      addAnalysisCompany: () => p.analysisEdits.addAnalysisCompany('ana 1', BODY),
      removeAnalysisCompany: () => p.analysisEdits.removeAnalysisCompany('ana 1', 'cmp 1'),
      updateValueOverrides: () => p.analysisEdits.updateValueOverrides('ana 1', BODY),
      updateWeightOverrides: () => p.analysisEdits.updateWeightOverrides('ana 1', BODY),
      createRecalculation: () => p.analysisEdits.createRecalculation(BODY),
      publishAnalysis: () => p.analysisEdits.publishAnalysis(BODY),
      createReviewComment: () => p.review.createReviewComment(BODY),
      updateReviewComment: () => p.review.updateReviewComment('com 1', BODY),
      createChangeRequest: () => p.review.createChangeRequest(BODY),
      updateChangeRequest: () => p.review.updateChangeRequest('req 1', BODY),
      createExport: () => p.reports.createExport(BODY),
      generateExecutiveNarrative: () => p.reports.generateExecutiveNarrative(BODY),
      updateKviTargets: () => p.valueMonitor.updateKviTargets('kvi 1', BODY),
      updateValueMonitorConfiguration: () => p.valueMonitor.updateValueMonitorConfiguration(BODY),
      addValueMonitorKvis: () => p.valueMonitor.addValueMonitorKvis(BODY),
      getValueMonitorView: () => p.valueMonitorViews.getValueMonitorView(),
      getValueMonitorPeerRankingView: () => p.valueMonitorViews.getValueMonitorPeerRankingView(),
      getValueMonitorHistoryView: () => p.valueMonitorViews.getValueMonitorHistoryView(),
      getValueMonitorKvisView: () => p.valueMonitorViews.getValueMonitorKvisView(),
      getValueMonitorCompositionView: () => p.valueMonitorViews.getValueMonitorCompositionView(),
      getValueMonitorConfigurationView: () =>
        p.valueMonitorViews.getValueMonitorConfigurationView(),
      getKviTraceabilityView: () => p.valueMonitorViews.getKviTraceabilityView('kvi 1'),
      getKviCandidatesView: () => p.valueMonitorViews.getKviCandidatesView(),
      getValueMonitorRecommendationsView: () =>
        p.valueMonitorViews.getValueMonitorRecommendationsView(),
      getValueMonitorBenchmarkRadarView: () =>
        p.valueMonitorViews.getValueMonitorBenchmarkRadarView(),
      getVisualizationView: () => p.visualization.getVisualizationView('ana 1'),
      getPeerWeightRankingView: () => p.visualization.getPeerWeightRankingView('ana 1'),
      getCategoryIndicatorsView: () => p.visualization.getCategoryIndicatorsView('ana 1'),
      getWeightRecommendationsView: () => p.visualization.getWeightRecommendationsView('ana 1'),
      getCompanyProfileView: () => p.companyProfile.getCompanyProfileView('cmp 1'),
      getTbgIndicatorComparatorView: () => p.tbgViews.getTbgIndicatorComparatorView('ana 1'),
      getFutureAspirationView: () => p.tbgViews.getFutureAspirationView('ana 1'),
      getTbgHorizonView: () => p.tbgViews.getTbgHorizonView('ana 1'),
      getTbgDimensionWeightsView: () => p.tbgViews.getTbgDimensionWeightsView('ana 1'),
      createSavedView: () => p.savedViews.createSavedView(BODY),
      deleteSavedView: () => p.savedViews.deleteSavedView('view 1'),
      evaluateSensitivity: () => p.sensitivities.evaluateSensitivity(BODY),
      validateSensitivitySuggestion: () =>
        p.sensitivities.validateSensitivitySuggestion('sug 1', BODY),
      createSensitivitySimulation: () => p.sensitivities.createSensitivitySimulation(BODY),
      evaluateWeightSimulation: () => p.sensitivities.evaluateWeightSimulation(BODY),
      createStrategicPlan: () => p.sensitivities.createStrategicPlan(BODY),
      updateStrategicPlan: () => p.sensitivities.updateStrategicPlan('plan 1', BODY),
      createPresentation: () => p.presentations.createPresentation(BODY),
      updatePresentation: () => p.presentations.updatePresentation('prs 1', BODY),
      publishPresentation: () => p.presentations.publishPresentation('prs 1', BODY),
      uploadPresentationVersion: () => p.presentations.uploadPresentationVersion('prs 1', BODY),
      deletePresentationVersion: () => p.presentations.deletePresentationVersion('prs 1'),
      createSlideCommentDraft: () => p.presentations.createSlideCommentDraft(BODY),
      sendAssistantMessage: () => p.assistant.sendAssistantMessage(BODY),
      createAssistantFeedback: () => p.assistant.createAssistantFeedback(BODY),
      markNotificationRead: () => p.notifications.markNotificationRead('ntf 1', BODY),
      markAllNotificationsRead: () => p.notifications.markAllNotificationsRead(BODY),
      getIndicatorDetailView: () => p.indicatorDetail.getIndicatorDetailView('ana 1', 'ind 1'),
      getCommentThreadView: () => p.comments.getCommentThreadView('analysis', 'ana 1'),
      getSensitivityDriversView: () => p.sensitivityViews.getSensitivityDriversView(),
      getSensitivityScenariosView: () => p.sensitivityViews.getSensitivityScenariosView(),
      getWeightSimulatorView: () => p.sensitivityViews.getWeightSimulatorView(),
      createComparisonProfile: () =>
        p.comparisonProfileCommands.createComparisonProfile('ana 1', BODY),
      updateComparisonProfile: () =>
        p.comparisonProfileCommands.updateComparisonProfile('ana 1', 'prf 1', BODY),
      deleteComparisonProfile: () =>
        p.comparisonProfileCommands.deleteComparisonProfile('ana 1', 'prf 1'),
      getShellStatusView: () => p.shell.getShellStatusView(),
      getAdminHomeView: () => p.admin.getAdminHomeView(),
      getUserSettingsView: () => p.settingsViews.getUserSettingsView(),
      updateUserSettings: () => p.settings.updateUserSettings(BODY),
      getAssistantContextView: () => p.assistantContext.getAssistantContextView('inicio'),
      getSavedViewsView: () => p.valueMonitorViews.getSavedViewsView('value-monitor'),
      getPresentationsView: () => p.presentationViews.getPresentationsView(),
      getPresentationBuilderView: () => p.presentationViews.getPresentationBuilderView('prs 1'),
      getPresentationSlidesView: () => p.presentationViews.getPresentationSlidesView('prs 1'),
      getPresentationDetailView: () => p.presentationViews.getPresentationDetailView('prs 1'),
      createPreviewInvitations: () =>
        p.previewInvitations.createPreviewInvitations('ana 1', { reviewerIds: ['usr 1'] }),
      getOperationStatus: () => p.operations.getOperationStatus('op 1'),
      downloadFile: () => p.operations.downloadFile('file 1'),
    };
    expect(Object.keys(calls)).toHaveLength(94);
    const outcomes = await Promise.all(
      Object.entries(calls).map(async ([operationId, call]) => {
        const outcome: unknown = await call().catch((e: unknown) => e);
        return outcome instanceof ApiError ? `${operationId}:${outcome.code}` : null;
      }),
    );
    const rejected = outcomes.filter((entry) => entry !== null);
    // Only the gap without a valid 0.1.0 payload fails, and it fails validation (not the network or a 404).
    const invalid = Object.entries(MOCK_GAPS)
      .filter(([, gap]) => gap.payload === undefined)
      .map(([operationId]) => `${operationId}:INVALID_RESPONSE`);
    expect(rejected).toEqual(invalid);
  });
});

describe('V-03 home scenarios', () => {
  it('ok: every section ok', async () => {
    const data: V03Response = await ports().home.getHomeView();
    expect(data.banner.status).toBe('ok');
    expect(data.peerNews.status).toBe('ok');
  });

  it('error: ApiError 500 with the X-Trace-Id header', async () => {
    server.use(...scenarioHandlers('error'));
    const error = await failure(ports().home.getHomeView());
    expect(error).toMatchObject({
      code: 'INTERNAL_ERROR',
      status: 500,
      traceId: 'mock-getHomeView-error',
    });
  });

  it('forbidden: ApiError 403', async () => {
    server.use(...scenarioHandlers('forbidden'));
    const error = await failure(ports().home.getHomeView());
    expect(error).toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('partial: the first section fails, the others stay ok', async () => {
    server.use(...scenarioHandlers('partial'));
    const data = await ports().home.getHomeView();
    expect(data.banner).toEqual({ status: 'error', errorCode: 'PROVIDER_ERROR' });
    expect(data.executiveSummary.status).toBe('ok');
  });

  it('empty: lists are emptied, the payload stays valid', async () => {
    server.use(...scenarioHandlers('empty'));
    const data = await ports().home.getHomeView();
    expect(data.peerNews.status === 'ok' && data.peerNews.data).toEqual([]);
  });

  it(
    'slow: answers ok after the delay',
    async () => {
      server.use(...scenarioHandlers('slow'));
      const start = performance.now();
      const data = await ports().home.getHomeView();
      expect(performance.now() - start).toBeGreaterThanOrEqual(SLOW_DELAY_MS - 50);
      expect(data.banner.status).toBe('ok');
    },
    SLOW_DELAY_MS + 5000,
  );
});

describe('C-02 update draft scenarios', () => {
  it('ok: the validation state', async () => {
    const data = await ports().analysisDrafts.updateAnalysisDraft('drf_01', BODY);
    expect(typeof data.validationState.isValid).toBe('boolean');
  });

  it('error: ApiError 500 with the X-Trace-Id header', async () => {
    server.use(...scenarioHandlers('error'));
    const error = await failure(ports().analysisDrafts.updateAnalysisDraft('drf_01', BODY));
    expect(error).toMatchObject({
      code: 'INTERNAL_ERROR',
      status: 500,
      traceId: 'mock-updateAnalysisDraft-error',
    });
  });

  it('forbidden: ApiError 403', async () => {
    server.use(...scenarioHandlers('forbidden'));
    const error = await failure(ports().analysisDrafts.updateAnalysisDraft('drf_01', BODY));
    expect(error).toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('partial: a command has no sections, so it answers as ok', async () => {
    server.use(...scenarioHandlers('partial'));
    const data = await ports().analysisDrafts.updateAnalysisDraft('drf_01', BODY);
    expect(typeof data.validationState.isValid).toBe('boolean');
  });
});

describe('scenario helpers', () => {
  it('reads the scenario from the URL query, defaulting to ok', () => {
    expect(scenarioFromSearch('?msw=partial')).toBe('partial');
    expect(scenarioFromSearch('?msw=nope')).toBe('ok');
    expect(scenarioFromSearch('')).toBe('ok');
  });

  it('keeps a payload whose schema rejects the empty lists, and ignores payloads without sections', () => {
    const needsItems = { safeParse: () => ({ success: false }) } as unknown as z.ZodType;
    expect(emptyPayload({ rows: [1] }, needsItems)).toEqual({ rows: [1] });
    expect(partialPayload({ saved: true })).toEqual({ saved: true });
  });

  it('sends X-Trace-Id on the ok scenario too', async () => {
    const response = await fetch(`${window.location.origin}${API_BASE_URL}/views/home`);
    expect(response.headers.get(TRACE_ID_HEADER)).toBe('mock-getHomeView-ok');
  });
});
