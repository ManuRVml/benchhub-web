import { http as mswHttp, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../../../tools/test/msw/server';
import { ApiError } from '../../errors';
import { API_BASE_URL, createHttpClient } from '../../http-client';

import { createHttpPorts } from './index';

import type { ApiPorts } from '../../ports';
import type * as R from '../../ports/responses';
import type { JsonBodyType } from 'msw';

// jsdom's fetch needs absolute URLs, so the client points at the page origin.
const API = `${window.location.origin}${API_BASE_URL}`;
// A path param with a slash and a space: it must reach the BFF as one encoded segment.
const ID = 'id/1 x';
const ENC = 'id%2F1%20x';
const TIME = '2025-10-05T10:00:00-05:00';
// Bodies are not inspected here; the ports type them with the generated models.
const BODY = {} as never;

const ports = (): ApiPorts => createHttpPorts(createHttpClient({ baseUrl: API }));

interface Seen {
  method: string;
  pathname: string;
}

/** Answers every API call with `payload` (and the session with a CSRF token); records the business request. */
function serve(payload: JsonBodyType): Seen[] {
  const seen: Seen[] = [];
  server.use(
    mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
    mswHttp.all(`${API}/*`, ({ request }) => {
      seen.push({ method: request.method, pathname: new URL(request.url).pathname });
      return HttpResponse.json(payload);
    }),
  );
  return seen;
}

type Case = [
  operation: string,
  method: string,
  path: string,
  call: (p: ApiPorts) => Promise<unknown>,
];

// Every operation of contract 0.1.0 except getSession, with the request it must produce. getSession shares this
// file's own `/session` CSRF-bootstrap shortcut (`serve()` below), so its `INVALID_RESPONSE`/pathname coverage would
// collide with every other operation's CSRF token fetch; it gets its own dedicated tests instead (see "auth").
const OPERATIONS: Case[] = [
  ['startLogin', 'GET', '/auth/login', (p) => p.auth.startLogin()],
  ['completeLogin', 'GET', '/auth/callback', (p) => p.auth.completeLogin('st8')],
  ['logout', 'POST', '/auth/logout', (p) => p.auth.logout()],
  [
    'passwordLogin',
    'POST',
    '/auth/password-login',
    (p) => p.auth.passwordLogin({ username: 'u@example.com', password: 'pw' }),
  ],
  ['getShellStatusView', 'GET', '/views/shell-status', (p) => p.shell.getShellStatusView()],
  ['getAdminHomeView', 'GET', '/views/admin-home', (p) => p.admin.getAdminHomeView()],
  ['getHomeView', 'GET', '/views/home', (p) => p.home.getHomeView()],
  ['getAnalysesView', 'GET', '/views/analyses', (p) => p.analyses.getAnalysesView()],
  [
    'getAnalysisDefinitionView',
    'GET',
    `/views/analysis-definition/${ENC}`,
    (p) => p.analysisDefinition.getAnalysisDefinitionView(ID),
  ],
  [
    'getCompetitorCatalogView',
    'GET',
    '/views/competitor-catalog',
    (p) => p.analysisDefinition.getCompetitorCatalogView(),
  ],
  [
    'getIndicatorCatalogView',
    'GET',
    '/views/indicator-catalog',
    (p) => p.analysisDefinition.getIndicatorCatalogView(),
  ],
  [
    'getAnalysisValidationView',
    'GET',
    `/views/analysis-validation/${ENC}`,
    (p) => p.analysisDefinition.getAnalysisValidationView(ID),
  ],
  [
    'getResultsHeaderView',
    'GET',
    `/views/results-header/${ENC}`,
    (p) => p.results.getResultsHeaderView(ID),
  ],
  [
    'getCompanyCoverageView',
    'GET',
    `/views/company-coverage/${ENC}`,
    (p) => p.results.getCompanyCoverageView(ID),
  ],
  [
    'getPeerAverageComparisonView',
    'GET',
    `/views/peer-average-comparison/${ENC}`,
    (p) => p.results.getPeerAverageComparisonView(ID),
  ],
  [
    'getCompanyComparisonView',
    'GET',
    `/views/company-comparison/${ENC}`,
    (p) => p.results.getCompanyComparisonView(ID),
  ],
  [
    'getReportSummaryView',
    'GET',
    `/views/report-summary/${ENC}`,
    (p) => p.results.getReportSummaryView(ID),
  ],
  ['getAiFindingsView', 'GET', `/views/ai-findings/${ENC}`, (p) => p.results.getAiFindingsView(ID)],
  [
    'getComparisonProfilesView',
    'GET',
    `/views/comparison-profiles/${ENC}`,
    (p) => p.comparisonProfiles.getComparisonProfilesView(ID),
  ],
  [
    'getValueMonitorView',
    'GET',
    '/views/value-monitor',
    (p) => p.valueMonitorViews.getValueMonitorView(),
  ],
  [
    'getValueMonitorPeerRankingView',
    'GET',
    '/views/value-monitor-peer-ranking',
    (p) => p.valueMonitorViews.getValueMonitorPeerRankingView(),
  ],
  [
    'getValueMonitorHistoryView',
    'GET',
    '/views/value-monitor-history',
    (p) => p.valueMonitorViews.getValueMonitorHistoryView(),
  ],
  [
    'getValueMonitorKvisView',
    'GET',
    '/views/value-monitor-kvis',
    (p) => p.valueMonitorViews.getValueMonitorKvisView(),
  ],
  [
    'getValueMonitorCompositionView',
    'GET',
    '/views/value-monitor-composition',
    (p) => p.valueMonitorViews.getValueMonitorCompositionView(),
  ],
  [
    'getValueMonitorConfigurationView',
    'GET',
    '/views/value-monitor-configuration',
    (p) => p.valueMonitorViews.getValueMonitorConfigurationView(),
  ],
  [
    'getKviTraceabilityView',
    'GET',
    `/views/kvi-traceability/${ENC}`,
    (p) => p.valueMonitorViews.getKviTraceabilityView(ID),
  ],
  [
    'getKviCandidatesView',
    'GET',
    '/views/kvi-candidates',
    (p) => p.valueMonitorViews.getKviCandidatesView(),
  ],
  [
    'getValueMonitorRecommendationsView',
    'GET',
    '/views/value-monitor-recommendations',
    (p) => p.valueMonitorViews.getValueMonitorRecommendationsView(),
  ],
  [
    'getValueMonitorBenchmarkRadarView',
    'GET',
    '/views/value-monitor-benchmark-radar',
    (p) => p.valueMonitorViews.getValueMonitorBenchmarkRadarView(),
  ],
  [
    'createAnalysisDraft',
    'POST',
    '/analysis-drafts',
    (p) => p.analysisDrafts.createAnalysisDraft(BODY),
  ],
  [
    'updateAnalysisDraft',
    'PATCH',
    `/analysis-drafts/${ENC}`,
    (p) => p.analysisDrafts.updateAnalysisDraft(ID, BODY),
  ],
  [
    'generateAnalysis',
    'POST',
    `/analysis-drafts/${ENC}/generation`,
    (p) => p.analysisDrafts.generateAnalysis(ID, BODY),
  ],
  [
    'addAnalysisCompany',
    'POST',
    `/analyses/${ENC}/companies`,
    (p) => p.analysisEdits.addAnalysisCompany(ID, BODY),
  ],
  [
    'removeAnalysisCompany',
    'DELETE',
    `/analyses/${ENC}/companies/${ENC}`,
    (p) => p.analysisEdits.removeAnalysisCompany(ID, ID),
  ],
  [
    'updateValueOverrides',
    'PATCH',
    `/analyses/${ENC}/value-overrides`,
    (p) => p.analysisEdits.updateValueOverrides(ID, BODY),
  ],
  [
    'updateWeightOverrides',
    'PATCH',
    `/analyses/${ENC}/weight-overrides`,
    (p) => p.analysisEdits.updateWeightOverrides(ID, BODY),
  ],
  [
    'createRecalculation',
    'POST',
    '/recalculations',
    (p) => p.analysisEdits.createRecalculation(BODY),
  ],
  ['publishAnalysis', 'POST', '/publications', (p) => p.analysisEdits.publishAnalysis(BODY)],
  ['createReviewComment', 'POST', '/review-comments', (p) => p.review.createReviewComment(BODY)],
  [
    'updateReviewComment',
    'PATCH',
    `/review-comments/${ENC}`,
    (p) => p.review.updateReviewComment(ID, BODY),
  ],
  ['createChangeRequest', 'POST', '/change-requests', (p) => p.review.createChangeRequest(BODY)],
  [
    'updateChangeRequest',
    'PATCH',
    `/change-requests/${ENC}`,
    (p) => p.review.updateChangeRequest(ID, BODY),
  ],
  ['createExport', 'POST', '/exports', (p) => p.reports.createExport(BODY)],
  [
    'generateExecutiveNarrative',
    'POST',
    '/executive-narratives',
    (p) => p.reports.generateExecutiveNarrative(BODY),
  ],
  [
    'updateKviTargets',
    'PATCH',
    `/kvis/${ENC}/targets`,
    (p) => p.valueMonitor.updateKviTargets(ID, BODY),
  ],
  [
    'updateValueMonitorConfiguration',
    'PUT',
    '/value-monitor-configuration',
    (p) => p.valueMonitor.updateValueMonitorConfiguration(BODY),
  ],
  [
    'addValueMonitorKvis',
    'POST',
    '/value-monitor-kvis',
    (p) => p.valueMonitor.addValueMonitorKvis(BODY),
  ],
  ['createSavedView', 'POST', '/saved-views', (p) => p.savedViews.createSavedView(BODY)],
  ['deleteSavedView', 'DELETE', `/saved-views/${ENC}`, (p) => p.savedViews.deleteSavedView(ID)],
  [
    'evaluateSensitivity',
    'POST',
    '/sensitivity-evaluations',
    (p) => p.sensitivities.evaluateSensitivity(BODY),
  ],
  [
    'validateSensitivitySuggestion',
    'POST',
    `/sensitivity-suggestions/${ENC}/validation`,
    (p) => p.sensitivities.validateSensitivitySuggestion(ID, BODY),
  ],
  [
    'createSensitivitySimulation',
    'POST',
    '/sensitivity-simulations',
    (p) => p.sensitivities.createSensitivitySimulation(BODY),
  ],
  [
    'evaluateWeightSimulation',
    'POST',
    '/weight-simulation-evaluations',
    (p) => p.sensitivities.evaluateWeightSimulation(BODY),
  ],
  [
    'createStrategicPlan',
    'POST',
    '/strategic-plans',
    (p) => p.sensitivities.createStrategicPlan(BODY),
  ],
  [
    'updateStrategicPlan',
    'PATCH',
    `/strategic-plans/${ENC}`,
    (p) => p.sensitivities.updateStrategicPlan(ID, BODY),
  ],
  ['createPresentation', 'POST', '/presentations', (p) => p.presentations.createPresentation(BODY)],
  [
    'updatePresentation',
    'PATCH',
    `/presentations/${ENC}`,
    (p) => p.presentations.updatePresentation(ID, BODY),
  ],
  [
    'publishPresentation',
    'POST',
    `/presentations/${ENC}/publication`,
    (p) => p.presentations.publishPresentation(ID, BODY),
  ],
  [
    'uploadPresentationVersion',
    'PUT',
    `/presentations/${ENC}/uploaded-version`,
    (p) => p.presentations.uploadPresentationVersion(ID, BODY),
  ],
  [
    'deletePresentationVersion',
    'DELETE',
    `/presentations/${ENC}/uploaded-version`,
    (p) => p.presentations.deletePresentationVersion(ID),
  ],
  [
    'createSlideCommentDraft',
    'POST',
    '/slide-comment-drafts',
    (p) => p.presentations.createSlideCommentDraft(BODY),
  ],
  [
    'sendAssistantMessage',
    'POST',
    '/assistant/messages',
    (p) => p.assistant.sendAssistantMessage(BODY),
  ],
  [
    'createAssistantFeedback',
    'POST',
    '/assistant/feedback',
    (p) => p.assistant.createAssistantFeedback(BODY),
  ],
  [
    'markNotificationRead',
    'PATCH',
    `/notifications/${ENC}/read`,
    (p) => p.notifications.markNotificationRead(ID, BODY),
  ],
  [
    'markAllNotificationsRead',
    'POST',
    '/notifications/read-all',
    (p) => p.notifications.markAllNotificationsRead(BODY),
  ],
  [
    'createComparisonProfile',
    'POST',
    `/analyses/${ENC}/comparison-profiles`,
    (p) => p.comparisonProfileCommands.createComparisonProfile(ID, BODY),
  ],
  [
    'updateComparisonProfile',
    'PATCH',
    `/analyses/${ENC}/comparison-profiles/${ENC}`,
    (p) => p.comparisonProfileCommands.updateComparisonProfile(ID, ID, BODY),
  ],
  [
    'deleteComparisonProfile',
    'DELETE',
    `/analyses/${ENC}/comparison-profiles/${ENC}`,
    (p) => p.comparisonProfileCommands.deleteComparisonProfile(ID, ID),
  ],
  [
    'getVisualizationView',
    'GET',
    `/views/visualization/${ENC}`,
    (p) => p.visualization.getVisualizationView(ID),
  ],
  [
    'getPeerWeightRankingView',
    'GET',
    `/views/peer-weight-ranking/${ENC}`,
    (p) => p.visualization.getPeerWeightRankingView(ID),
  ],
  [
    'getCategoryIndicatorsView',
    'GET',
    `/views/category-indicators/${ENC}`,
    (p) => p.visualization.getCategoryIndicatorsView(ID),
  ],
  [
    'getWeightRecommendationsView',
    'GET',
    `/views/weight-recommendations/${ENC}`,
    (p) => p.visualization.getWeightRecommendationsView(ID),
  ],
  [
    'getUserSettingsView',
    'GET',
    '/views/user-settings',
    (p) => p.settingsViews.getUserSettingsView(),
  ],
  ['updateUserSettings', 'PATCH', '/user-settings', (p) => p.settings.updateUserSettings(BODY)],
  [
    'getAssistantContextView',
    'GET',
    '/views/assistant-context',
    (p) => p.assistantContext.getAssistantContextView('inicio'),
  ],
  [
    'getSavedViewsView',
    'GET',
    '/views/saved-views',
    (p) => p.valueMonitorViews.getSavedViewsView('value-monitor'),
  ],
  [
    'getCompanyProfileView',
    'GET',
    `/views/company-profile/${ENC}`,
    (p) => p.companyProfile.getCompanyProfileView(ID),
  ],
  [
    'getIndicatorDetailView',
    'GET',
    `/views/indicator-detail/${ENC}/${ENC}`,
    (p) => p.indicatorDetail.getIndicatorDetailView(ID, ID),
  ],
  [
    'getCommentThreadView',
    'GET',
    '/views/comment-thread',
    (p) => p.comments.getCommentThreadView('analysis', ID),
  ],
  [
    'getSensitivityDriversView',
    'GET',
    '/views/sensitivity-drivers',
    (p) => p.sensitivityViews.getSensitivityDriversView(),
  ],
  [
    'getSensitivityScenariosView',
    'GET',
    '/views/sensitivity-scenarios',
    (p) => p.sensitivityViews.getSensitivityScenariosView(),
  ],
  [
    'getWeightSimulatorView',
    'GET',
    '/views/weight-simulator',
    (p) => p.sensitivityViews.getWeightSimulatorView(),
  ],
  [
    'getTbgIndicatorComparatorView',
    'GET',
    `/views/tbg-indicator-comparator/${ENC}`,
    (p) => p.tbgViews.getTbgIndicatorComparatorView(ID),
  ],
  [
    'getFutureAspirationView',
    'GET',
    `/views/future-aspiration/${ENC}`,
    (p) => p.tbgViews.getFutureAspirationView(ID),
  ],
  [
    'getTbgHorizonView',
    'GET',
    `/views/tbg-horizon/${ENC}`,
    (p) => p.tbgViews.getTbgHorizonView(ID),
  ],
  [
    'getTbgDimensionWeightsView',
    'GET',
    `/views/tbg-dimension-weights/${ENC}`,
    (p) => p.tbgViews.getTbgDimensionWeightsView(ID),
  ],
  [
    'getPresentationsView',
    'GET',
    '/views/presentations',
    (p) => p.presentationViews.getPresentationsView(),
  ],
  [
    'getPresentationBuilderView',
    'GET',
    `/views/presentation-builder/${ENC}`,
    (p) => p.presentationViews.getPresentationBuilderView(ID),
  ],
  [
    'getPresentationSlidesView',
    'GET',
    `/views/presentation-slides/${ENC}`,
    (p) => p.presentationViews.getPresentationSlidesView(ID),
  ],
  [
    'getPresentationDetailView',
    'GET',
    `/views/presentation-detail/${ENC}`,
    (p) => p.presentationViews.getPresentationDetailView(ID),
  ],
  [
    'createPreviewInvitations',
    'POST',
    `/analyses/${ENC}/preview-invitations`,
    (p) => p.previewInvitations.createPreviewInvitations(ID, BODY),
  ],
  ['getOperationStatus', 'GET', `/operations/${ENC}`, (p) => p.operations.getOperationStatus(ID)],
];

// The 69 JSON operations above plus `downloadFile`, which is not a JSON call (its own describe below) and
// `getOperationEvents`, which has no adapter (tools/contract/known-unadapted-operations.mjs).
describe('HTTP adapters: every contract operation', () => {
  it('covers the 92 operations of contract 0.2.0 once (every operation but getSession)', () => {
    const ids = OPERATIONS.map(([operation]) => operation);
    expect(ids).toHaveLength(92);
    expect(new Set(ids).size).toBe(92);
  });

  it.each(OPERATIONS)(
    '%s sends %s %s (path params encoded) and rejects a payload outside the contract',
    async (_operation, method, path, call) => {
      const seen = serve({ unexpected: true });
      const error: unknown = await call(ports()).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('INVALID_RESPONSE');
      expect(seen).toEqual([{ method, pathname: `${API_BASE_URL}${path}` }]);
    },
  );
});

describe('HTTP adapters: valid payloads come back typed, one operation per port', () => {
  it('home', async () => {
    const payload: R.V03Response = {
      banner: { status: 'forbidden' },
      executiveSummary: { status: 'forbidden' },
      enabledAnalyses: { status: 'forbidden' },
      peerNews: { status: 'forbidden' },
      marketIndicators: { status: 'forbidden' },
      permissions: {},
    };
    serve(payload);
    const data: R.V03Response = await ports().home.getHomeView();
    expect(data).toEqual(payload);
  });

  it('analyses', async () => {
    const payload: R.V04Response = {
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      filterOptions: { createdOn: [], createdBy: [], status: [] },
      permissions: { canCreateAnalysis: true },
    };
    serve(payload);
    const data: R.V04Response = await ports().analyses.getAnalysesView();
    expect(data).toEqual(payload);
  });

  it('analysisDefinition', async () => {
    const payload: R.V06Response = { groups: [], suggestion: null, permissions: {} };
    serve(payload);
    const data: R.V06Response = await ports().analysisDefinition.getCompetitorCatalogView();
    expect(data).toEqual(payload);
  });

  it('results', async () => {
    const payload: R.V14Response = {
      findings: [{ id: 'hal_01', text: 'GE supera al promedio en margen EBITDA.' }],
      status: 'suggestion',
      generatedBy: { model: 'yarbis', version: '1.0' },
      permissions: {},
    };
    serve(payload);
    const data: R.V14Response = await ports().results.getAiFindingsView('ana_01');
    expect(data).toEqual(payload);
  });

  it('analysisDrafts', async () => {
    const payload: R.C03Response = { operationId: 'op_01', status: 'accepted' };
    serve(payload);
    const data: R.C03Response = await ports().analysisDrafts.generateAnalysis('drf_01', BODY);
    expect(data).toEqual(payload);
  });

  it('analysisEdits', async () => {
    const payload: R.C05Response = { removed: true, companyCount: 4 };
    serve(payload);
    const data: R.C05Response = await ports().analysisEdits.removeAnalysisCompany(
      'ana_01',
      'cmp_shell',
    );
    expect(data).toEqual(payload);
  });

  it('review', async () => {
    const payload: R.C11Response = { id: 'com_01', status: 'resolved', updatedAt: TIME };
    serve(payload);
    const data: R.C11Response = await ports().review.updateReviewComment('com_01', BODY);
    expect(data).toEqual(payload);
  });

  it('reports', async () => {
    const payload: R.C14Response = { operationId: 'op_02', status: 'accepted' };
    serve(payload);
    const data: R.C14Response = await ports().reports.createExport(BODY);
    expect(data).toEqual(payload);
  });

  it('valueMonitor', async () => {
    const payload: R.C16Response = {
      kviId: 'kvi_01',
      targets: { meta: 12, metaReto: null },
      row: {
        kviId: 'kvi_01',
        code: 'KVI001',
        category: 'estrategico',
        categoryLabel: 'Estratégico',
        label: 'ROACE',
        unit: 'percent',
        weightPct: 20,
        owner: 'Finanzas',
        meta: 12,
        metaReto: null,
        real: 10,
        resultPct: 83,
        retoPct: 0,
        resultBand: 'ok',
        retoBand: 'watch',
        isTbd: false,
        isTextMode: false,
        lowerIsBetter: false,
        isEditable: true,
      },
      kpis: { globalPct: 85, retoPct: 0, atRiskCount: 1, tbdCount: 0 },
      composition: {
        centerPct: 85,
        categories: [
          {
            id: 'estrategico',
            label: 'Estratégico',
            colorKey: 'category.estrategico',
            weightPct: 20,
            kviCount: 3,
            compliancePct: 85,
          },
        ],
      },
    };
    serve(payload);
    const data: R.C16Response = await ports().valueMonitor.updateKviTargets('kvi_01', BODY);
    expect(data).toEqual(payload);
  });

  it('savedViews', async () => {
    const payload: R.C19Response = { id: 'view_01', createdAt: TIME };
    serve(payload);
    const data: R.C19Response = await ports().savedViews.createSavedView(BODY);
    expect(data).toEqual(payload);
  });

  it('sensitivities', async () => {
    const payload: R.C22Response = {
      suggestionId: 'sug_01',
      validatedBy: 'usr_ana',
      validatedAt: TIME,
    };
    serve(payload);
    const data: R.C22Response = await ports().sensitivities.validateSensitivitySuggestion(
      'sug_01',
      BODY,
    );
    expect(data).toEqual(payload);
  });

  it('presentations', async () => {
    const payload: R.C29Response = { published: true, publicationId: 'pub_01', publishedAt: TIME };
    serve(payload);
    const data: R.C29Response = await ports().presentations.publishPresentation('prs_01', BODY);
    expect(data).toEqual(payload);
  });

  it('assistant', async () => {
    const payload: R.C34Response = { feedbackId: 'fbk_01', ratedAt: TIME };
    serve(payload);
    const data: R.C34Response = await ports().assistant.createAssistantFeedback(BODY);
    expect(data).toEqual(payload);
  });

  it('notifications', async () => {
    const payload: R.C35Response = { read: true, notificationId: 'ntf_01', readAt: TIME };
    serve(payload);
    const data: R.C35Response = await ports().notifications.markNotificationRead('ntf_01', BODY);
    expect(data).toEqual(payload);
  });

  it('visualization', async () => {
    const payloadV20: R.V20Response = {
      lifecycleState: 'preview',
      position: {
        tierId: 2,
        periodLabel: { year: 2025, quarter: 4 },
        indicatorCount: 10,
        peerCount: 6,
      },
      kpiTiles: { status: 'ok', data: [] },
      heatmap: { status: 'forbidden' },
      radar: { status: 'forbidden' },
      categories: { status: 'forbidden' },
      weightComposition: { status: 'forbidden' },
      permissions: {},
    };
    serve(payloadV20);
    const dataV20: R.V20Response = await ports().visualization.getVisualizationView('ana_01');
    expect(dataV20).toEqual(payloadV20);

    const payloadV21: R.V21Response = {
      dimension: 'fin' as const,
      rows: [],
      permissions: {},
    };
    serve(payloadV21);
    const dataV21: R.V21Response = await ports().visualization.getPeerWeightRankingView(
      'ana_01',
      'fin',
    );
    expect(dataV21).toEqual(payloadV21);

    const payloadV22: R.V22Response = {
      category: { id: 'rentabilidad', label: 'Rentabilidad', message: '' },
      rows: [],
      permissions: {},
    };
    serve(payloadV22);
    const dataV22: R.V22Response = await ports().visualization.getCategoryIndicatorsView(
      'ana_01',
      'rentabilidad',
    );
    expect(dataV22).toEqual(payloadV22);

    const payloadV23: R.V23Response = {
      scope: 'visualization',
      items: [],
      countActionable: 0,
      status: 'suggestion',
      permissions: {},
    };
    serve(payloadV23);
    const dataV23: R.V23Response = await ports().visualization.getWeightRecommendationsView(
      'ana_01',
      'visualization',
      'tbg',
    );
    expect(dataV23).toEqual(payloadV23);
  });

  it('shell', async () => {
    const payload: R.V01Response = { unreadNotifications: 3, permissions: {} };
    serve(payload);
    const data: R.V01Response = await ports().shell.getShellStatusView();
    expect(data).toEqual(payload);
  });

  it('admin', async () => {
    const payload: R.V02Response = {
      cards: [{ id: 'users-roles', isAvailable: true }],
      permissions: {},
    };
    serve(payload);
    const data: R.V02Response = await ports().admin.getAdminHomeView();
    expect(data).toEqual(payload);
  });

  it('admin keeps a card id the contract does not know instead of failing the view', async () => {
    const payload: R.V02Response = {
      cards: [
        { id: 'users-roles', isAvailable: false },
        { id: 'billing', isAvailable: true },
      ],
      permissions: {},
    };
    serve(payload);
    const data: R.V02Response = await ports().admin.getAdminHomeView();
    expect(data.cards.map((card) => card.id)).toEqual(['users-roles', 'billing']);
  });

  it('settingsViews', async () => {
    const payload: R.V45Response = {
      profile: { displayName: 'Camila Bravo', roleLabel: 'Analista creador', area: 'VP TI' },
      accessibility: { fontScale: 1, fontScaleOptions: [0.9, 1, 1.1], highContrast: false },
      emailNotifications: true,
      permissions: {},
    };
    serve(payload);
    const data: R.V45Response = await ports().settingsViews.getUserSettingsView();
    expect(data).toEqual(payload);
  });

  it('settings', async () => {
    const payload: R.C37Response = {
      fontScale: 1.1,
      highContrast: true,
      emailNotifications: false,
    };
    serve(payload);
    const data: R.C37Response = await ports().settings.updateUserSettings({
      fontScale: 1.1,
      highContrast: true,
    });
    expect(data).toEqual(payload);
  });

  it('assistantContext', async () => {
    const payload: R.V46Response = {
      proactiveTip: { id: 'tip_01', text: 'Revisa el ROACE', aiStatus: 'suggestion' },
      suggestions: [],
      permissions: {},
    };
    serve(payload);
    const data: R.V46Response = await ports().assistantContext.getAssistantContextView('inicio');
    expect(data).toEqual(payload);
  });

  it('valueMonitorViews.getSavedViewsView', async () => {
    const payload: R.V47Response = { items: [], permissions: {} };
    serve(payload);
    const data: R.V47Response = await ports().valueMonitorViews.getSavedViewsView('value-monitor');
    expect(data).toEqual(payload);
  });

  it('companyProfile requests the given companyId, not a fixed one', async () => {
    const payload: R.V25Response = {
      company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
      country: 'Reino Unido',
      category: null,
      business: null,
      segments: [],
      news: null,
      permissions: {},
    };
    const seen = serve(payload);
    const dataBp: R.V25Response = await ports().companyProfile.getCompanyProfileView('cmp_bp');
    expect(dataBp).toEqual(payload);
    await ports().companyProfile.getCompanyProfileView('cmp_shell');
    expect(seen.map((s) => s.pathname)).toEqual([
      `${API_BASE_URL}/views/company-profile/cmp_bp`,
      `${API_BASE_URL}/views/company-profile/cmp_shell`,
    ]);
  });

  it('indicatorDetail', async () => {
    const payload: R.V24Response = {
      indicator: { id: 'ind_roace', label: 'ROACE', unit: 'percent', contextKey: 'above_peers' },
      kpis: { status: 'forbidden' },
      series: { status: 'forbidden' },
      insight: { status: 'forbidden' },
      traceability: { status: 'forbidden' },
      permissions: {},
    };
    serve(payload);
    const data: R.V24Response = await ports().indicatorDetail.getIndicatorDetailView(
      'ana_01',
      'ind_roace',
    );
    expect(data).toEqual(payload);
  });

  it('comments', async () => {
    const payload: R.V26Response = {
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      permissions: {
        canComment: true,
        canReply: true,
        canRequestChange: false,
        canResolve: true,
      },
    };
    serve(payload);
    const data: R.V26Response = await ports().comments.getCommentThreadView('analysis', 'ana_01');
    expect(data).toEqual(payload);
  });

  it('sensitivityViews', async () => {
    const payloadV37: R.V37Response = {
      indicators: [{ id: 'ind_roace', label: 'ROACE', isReady: true }],
      formula: { expression: 'ROACE = NOPAT / Capital empleado', terms: [] },
      levers: [],
      base: { value: 7.4, unit: 'percent' },
      target: { value: 7.9, unit: 'percent' },
      suggestion: {
        id: 'sug_01',
        levers: {},
        estimatedResult: 7.9,
        status: 'requires_validation',
        validatedBy: null,
        validatedAt: null,
      },
      permissions: {},
    };
    serve(payloadV37);
    const dataV37: R.V37Response = await ports().sensitivityViews.getSensitivityDriversView();
    expect(dataV37).toEqual(payloadV37);

    const payloadV38: R.V38Response = {
      variables: [],
      baseRoace: 7.4,
      peerAvgRoace: 7.1,
      permissions: {},
    };
    serve(payloadV38);
    const dataV38: R.V38Response = await ports().sensitivityViews.getSensitivityScenariosView();
    expect(dataV38).toEqual(payloadV38);

    const payloadV39: R.V39Response = {
      baseScore: 78,
      categories: [],
      recommendations: [],
      permissions: {},
    };
    serve(payloadV39);
    const dataV39: R.V39Response = await ports().sensitivityViews.getWeightSimulatorView();
    expect(dataV39).toEqual(payloadV39);
  });

  it('comparisonProfiles', async () => {
    const payloadV19: R.V19Response = {
      profiles: [{ id: 'prf_01', name: 'Perfil 1', businessTypeId: 'all' }],
      config: {
        profileId: 'prf_01',
        name: 'Perfil 1',
        businessType: 'all',
        businessTypeOptions: ['all'],
        indicators: { fin: [], op: [], trans: [] },
        validityYear: 2025,
        validityYearOptions: [2025],
        availablePeerIds: [],
        peerIds: [],
        weights: { fin: 40, op: 30, trans: 30 },
        weightsTotal: 100,
      },
      result: {
        score: 50,
        peerAvg: 55,
        gapPts: -5,
        position: 1,
        of: 1,
        ranking: [],
        insight: { text: 'x', status: 'suggestion' },
      },
      summaryTable: [],
      permissions: {},
    };
    serve(payloadV19);
    const dataV19: R.V19Response =
      await ports().comparisonProfiles.getComparisonProfilesView('ana_01');
    expect(dataV19).toEqual(payloadV19);
  });

  it('auth', async () => {
    const payloadA01: R.A01Response = {
      error: {
        code: 'AUTH_PROVIDER_UNAVAILABLE',
        messageKey: 'auth.error.providerUnavailable',
        traceId: 't1',
      },
    };
    serve(payloadA01);
    const dataA01: R.A01Response = await ports().auth.startLogin();
    expect(dataA01).toEqual(payloadA01);

    const payloadA02: R.A02Response = {
      location: '/inicio',
      loginErrorCodes: ['access_denied', 'session_expired', 'idp_error', 'unknown'],
    };
    serve(payloadA02);
    const dataA02: R.A02Response = await ports().auth.completeLogin('st8');
    expect(dataA02).toEqual(payloadA02);

    // logout's real success is 204 No Content (A03Response = void); the client's own `parse()` treats an empty body
    // as `undefined`, which is what LogoutSuccessSchema (z.void()) expects.
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    );
    await expect(ports().auth.logout()).resolves.toBeUndefined();

    const payloadA04: R.A04Response = {
      user: {
        id: 'usr_01',
        displayName: 'Camila Bravo',
        avatarFileId: null,
        roleLabelKey: 'role.analystCreator',
      },
      role: 'analyst_creator',
      hasAdminAccess: false,
      requiresGate: false,
      navigation: [{ id: 'inicio', labelKey: 'nav.inicio', to: '/inicio', isLocked: false }],
      analysisContext: { defaultAnalysisId: null },
      permissions: {},
    };
    server.use(mswHttp.get(`${API}/session`, () => HttpResponse.json(payloadA04)));
    const dataA04: R.A04Response = await ports().auth.getSession();
    expect(dataA04).toEqual(payloadA04);
  });
});

describe('HTTP adapters: every query/path option reaches the exact request', () => {
  interface SeenQuery {
    method: string;
    pathname: string;
    search: string;
  }

  /** Like `serve`, but also records the full query string of the request (not asserted by the generic OPERATIONS check). */
  function serveWithQuery(payload: JsonBodyType): SeenQuery[] {
    const seen: SeenQuery[] = [];
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.all(`${API}/*`, ({ request }) => {
        const url = new URL(request.url);
        seen.push({ method: request.method, pathname: url.pathname, search: url.search });
        return HttpResponse.json(payload);
      }),
    );
    return seen;
  }

  /** Like `serve`, but also records the exact JSON body of the request. */
  function serveWithBody(payload: JsonBodyType): unknown[] {
    const seen: unknown[] = [];
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.all(`${API}/*`, async ({ request }) => {
        seen.push(request.method === 'GET' ? undefined : await request.json());
        return HttpResponse.json(payload);
      }),
    );
    return seen;
  }

  it('getAssistantContextView sends every option as the exact query string', async () => {
    const seen = serveWithQuery({});
    await ports()
      .assistantContext.getAssistantContextView('resultados', 'ana_01')
      .catch(() => undefined);
    expect(seen[0]?.search).toBe('?screen=resultados&analysisId=ana_01');
  });

  it('getAssistantContextView omits analysisId when not given', async () => {
    const seen = serveWithQuery({});
    await ports()
      .assistantContext.getAssistantContextView('inicio')
      .catch(() => undefined);
    expect(seen[0]?.search).toBe('?screen=inicio');
  });

  it('getSavedViewsView sends its screen option as the exact query string', async () => {
    const seen = serveWithQuery({});
    await ports()
      .valueMonitorViews.getSavedViewsView('value-monitor')
      .catch(() => undefined);
    expect(seen[0]?.search).toBe('?screen=value-monitor');
  });

  it('getNotificationsView sends q and its comma-list severity filter', async () => {
    const seen = serveWithQuery({});
    await ports()
      .notifications.getNotificationsView({ q: 'chevron', severity: ['error', 'warn'] })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/notifications`);
    expect(decodeURIComponent(seen[0]?.search ?? '')).toBe('?q=chevron&severity=error,warn');
  });

  it('updateUserSettings sends every edited field as the exact request body', async () => {
    const seen = serveWithBody({ fontScale: 1.1, highContrast: true, emailNotifications: false });
    await ports()
      .settings.updateUserSettings({
        fontScale: 1.1,
        highContrast: true,
        emailNotifications: false,
      })
      .catch(() => undefined);
    expect(seen[0]).toEqual({ fontScale: 1.1, highContrast: true, emailNotifications: false });
  });
});

// P7-SWAP-VM's new value-monitor view options (call-options.ts) are optional, so the OPERATIONS loop's zero-arg calls
// never prove a param actually reaches the request — these do: one call per method, every one of its options set,
// asserting the exact pathname + query string (never the response, which is deliberately outside the contract so the
// call still rejects — only the request the adapter built is under test).
describe('HTTP adapters: value-monitor view options reach the request', () => {
  function captureRequests(): URL[] {
    const seen: URL[] = [];
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.all(`${API}/*`, ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json({ unexpected: true });
      }),
    );
    return seen;
  }

  it('getValueMonitorView forwards snapshot', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorView({ snapshot: '2026-04' })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({ snapshot: '2026-04' });
  });

  it('getValueMonitorPeerRankingView forwards indicator and snapshot', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorPeerRankingView({
        indicator: 'ind_custom',
        snapshot: '2026-04',
      })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-peer-ranking`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({
      indicator: 'ind_custom',
      snapshot: '2026-04',
    });
  });

  it('getValueMonitorHistoryView forwards indicator, range and snapshot', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorHistoryView({
        indicator: 'ind_custom',
        range: '5y',
        snapshot: '2026-04',
      })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-history`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({
      indicator: 'ind_custom',
      range: '5y',
      snapshot: '2026-04',
    });
  });

  it('getValueMonitorKvisView forwards snapshot, categories and compliance', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorKvisView({
        snapshot: '2026-04',
        categories: ['financiero', 'mercado'],
        compliance: ['ok', 'watch'],
      })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-kvis`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({
      snapshot: '2026-04',
      categories: 'financiero,mercado',
      compliance: 'ok,watch',
    });
  });

  it('getValueMonitorCompositionView forwards snapshot', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorCompositionView({ snapshot: '2026-04' })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-composition`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({ snapshot: '2026-04' });
  });

  it('getValueMonitorRecommendationsView forwards snapshot', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getValueMonitorRecommendationsView({ snapshot: '2026-04' })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/value-monitor-recommendations`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({ snapshot: '2026-04' });
  });

  it('getKviCandidatesView sends its source option as the exact query string', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getKviCandidatesView({ source: 'tbg' })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/kvi-candidates`);
    expect(seen[0]?.search).toBe('?source=tbg');
  });

  it('getKviCandidatesView sends no query when no source is given (the BFF defaults to pares)', async () => {
    const seen = captureRequests();
    await ports()
      .valueMonitorViews.getKviCandidatesView()
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/kvi-candidates`);
    expect(seen[0]?.search).toBe('');
  });
});

describe('HTTP adapters: sensitivity, comment, indicator and TBG view options reach the exact request', () => {
  interface SeenQuery {
    method: string;
    pathname: string;
    search: string;
  }

  /** Like `serve`, but also records the full query string of the request (not asserted by the generic OPERATIONS check). */
  function serveWithQuery(payload: JsonBodyType): SeenQuery[] {
    const seen: SeenQuery[] = [];
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.all(`${API}/*`, ({ request }) => {
        const url = new URL(request.url);
        seen.push({ method: request.method, pathname: url.pathname, search: url.search });
        return HttpResponse.json(payload);
      }),
    );
    return seen;
  }

  it('getSensitivityDriversView sends its indicator option as the exact query string', async () => {
    const seen = serveWithQuery({});
    await ports()
      .sensitivityViews.getSensitivityDriversView('ind_margen_ebitda')
      .catch(() => undefined);
    expect(seen[0]?.search).toBe('?indicator=ind_margen_ebitda');
  });

  it('getCommentThreadView sends every option as the exact query string', async () => {
    const seen = serveWithQuery({});
    await ports()
      .comments.getCommentThreadView('value_monitor', '2026-04', 2)
      .catch(() => undefined);
    expect(seen[0]?.search).toBe('?entityType=value_monitor&entityId=2026-04&page=2');
  });

  it('getIndicatorDetailView sends its origin option as the exact query string', async () => {
    const seen = serveWithQuery({});
    await ports()
      .indicatorDetail.getIndicatorDetailView('ana_01', 'ind_01', 'resultados')
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/indicator-detail/ana_01/ind_01`);
    expect(seen[0]?.search).toBe('?origin=resultados');
  });

  it('tbgViews sends every option as a query param', async () => {
    const seenSearch: Record<string, string> = {};
    const capture =
      (operation: string) =>
      ({ request }: { request: Request }) => {
        seenSearch[operation] = new URL(request.url).search;
        return HttpResponse.json({ unexpected: true });
      };
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.get(
        `${API}/views/tbg-indicator-comparator/:analysisId`,
        capture('getTbgIndicatorComparatorView'),
      ),
      mswHttp.get(`${API}/views/future-aspiration/:analysisId`, capture('getFutureAspirationView')),
      mswHttp.get(`${API}/views/tbg-horizon/:analysisId`, capture('getTbgHorizonView')),
      mswHttp.get(
        `${API}/views/tbg-dimension-weights/:analysisId`,
        capture('getTbgDimensionWeightsView'),
      ),
    );
    const p = ports();
    await p.tbgViews
      .getTbgIndicatorComparatorView('ana_01', {
        horizon: 'ilp',
        indicatorId: 'ind_ebitda',
        companyScope: 'all',
      })
      .catch(() => undefined);
    await p.tbgViews.getFutureAspirationView('ana_01', { segment: 'crude' }).catch(() => undefined);
    await p.tbgViews
      .getTbgHorizonView('ana_01', {
        horizon: 'union',
        view: 'company',
        companyId: 'cmp_bp',
        detail: true,
      })
      .catch(() => undefined);
    await p.tbgViews
      .getTbgDimensionWeightsView('ana_01', { horizon: 'ilp', dimension: 'op' })
      .catch(() => undefined);

    expect(new URLSearchParams(seenSearch.getTbgIndicatorComparatorView)).toEqual(
      new URLSearchParams({ horizon: 'ilp', indicatorId: 'ind_ebitda', companyScope: 'all' }),
    );
    expect(new URLSearchParams(seenSearch.getFutureAspirationView)).toEqual(
      new URLSearchParams({ segment: 'crude' }),
    );
    expect(new URLSearchParams(seenSearch.getTbgHorizonView)).toEqual(
      new URLSearchParams({
        horizon: 'union',
        view: 'company',
        companyId: 'cmp_bp',
        detail: 'true',
      }),
    );
    expect(new URLSearchParams(seenSearch.getTbgDimensionWeightsView)).toEqual(
      new URLSearchParams({ horizon: 'ilp', dimension: 'op' }),
    );
  });

  it('getCompanyComparisonView sends horizon and companyId as query params', async () => {
    let search = '';
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.get(`${API}/views/company-comparison/:analysisId`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ unexpected: true });
      }),
    );
    await ports()
      .results.getCompanyComparisonView('ana_01', { horizon: 'ilp', companyId: 'cmp_bp' })
      .catch(() => undefined);
    expect(new URLSearchParams(search)).toEqual(
      new URLSearchParams({ horizon: 'ilp', companyId: 'cmp_bp' }),
    );
  });

  it('comparisonProfileCommands sends the right query/path/body for each method', async () => {
    const seen: Record<string, { pathname: string; search: string; body: unknown }> = {};
    const capture =
      (operation: string) =>
      async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const body: unknown =
          request.method === 'DELETE' ? undefined : await request.json().catch(() => undefined);
        seen[operation] = { pathname: url.pathname, search: url.search, body };
        return HttpResponse.json({ unexpected: true });
      };
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.get(
        `${API}/views/comparison-profiles/:analysisId`,
        capture('getComparisonProfilesView'),
      ),
      mswHttp.post(
        `${API}/analyses/:analysisId/comparison-profiles`,
        capture('createComparisonProfile'),
      ),
      mswHttp.patch(
        `${API}/analyses/:analysisId/comparison-profiles/:profileId`,
        capture('updateComparisonProfile'),
      ),
      mswHttp.delete(
        `${API}/analyses/:analysisId/comparison-profiles/:profileId`,
        capture('deleteComparisonProfile'),
      ),
    );
    const p = ports();
    await p.comparisonProfiles
      .getComparisonProfilesView('ana_01', { profileId: 'prf_02' })
      .catch(() => undefined);
    const createBody = { name: 'Nuevo perfil', companyIds: ['cmp_a'], isDefault: true };
    await p.comparisonProfileCommands
      .createComparisonProfile('ana_01', createBody)
      .catch(() => undefined);
    const updateBody = { name: 'Perfil actualizado' };
    await p.comparisonProfileCommands
      .updateComparisonProfile('ana_01', 'prf_01', updateBody)
      .catch(() => undefined);
    await p.comparisonProfileCommands
      .deleteComparisonProfile('ana_01', 'prf_01')
      .catch(() => undefined);

    expect(seen.getComparisonProfilesView).toEqual({
      pathname: `${API_BASE_URL}/views/comparison-profiles/ana_01`,
      search: '?profileId=prf_02',
      body: undefined,
    });
    expect(seen.createComparisonProfile).toEqual({
      pathname: `${API_BASE_URL}/analyses/ana_01/comparison-profiles`,
      search: '',
      body: createBody,
    });
    expect(seen.updateComparisonProfile).toEqual({
      pathname: `${API_BASE_URL}/analyses/ana_01/comparison-profiles/prf_01`,
      search: '',
      body: updateBody,
    });
    expect(seen.deleteComparisonProfile).toEqual({
      pathname: `${API_BASE_URL}/analyses/ana_01/comparison-profiles/prf_01`,
      search: '',
      body: undefined,
    });
  });

  it('auth sends the right query/path for startLogin/completeLogin/logout, and getSession requests /session', async () => {
    const seen: Record<string, { pathname: string; search: string }> = {};
    const capture =
      (operation: string) =>
      ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        seen[operation] = { pathname: url.pathname, search: url.search };
        return HttpResponse.json({ unexpected: true });
      };
    server.use(
      mswHttp.get(`${API}/session`, ({ request }) => {
        seen.getSession = {
          pathname: new URL(request.url).pathname,
          search: new URL(request.url).search,
        };
        return HttpResponse.json({ csrfToken: 'csrf-1' });
      }),
      mswHttp.get(`${API}/auth/login`, capture('startLogin')),
      mswHttp.get(`${API}/auth/callback`, capture('completeLogin')),
      mswHttp.post(`${API}/auth/logout`, capture('logout')),
    );
    const p = ports();
    await p.auth
      .startLogin({ returnTo: '/inicio', loginHint: 'ana@ecopetrol.com' })
      .catch(() => undefined);
    await p.auth.completeLogin('st8', { code: 'cd1' }).catch(() => undefined);
    await p.auth.logout().catch(() => undefined);
    await p.auth.getSession().catch(() => undefined);

    expect(seen.startLogin).toEqual({
      pathname: `${API_BASE_URL}/auth/login`,
      search: '?returnTo=%2Finicio&loginHint=ana%40ecopetrol.com',
    });
    expect(seen.completeLogin).toEqual({
      pathname: `${API_BASE_URL}/auth/callback`,
      search: '?state=st8&code=cd1',
    });
    expect(seen.logout).toEqual({ pathname: `${API_BASE_URL}/auth/logout`, search: '' });
    expect(seen.getSession).toEqual({ pathname: `${API_BASE_URL}/session`, search: '' });
  });
});

// A data field of the V-43 response (`slideRef.path`), not an SPA route: a named constant, not a literal, only to
// sidestep the `Property[key.name="path"]` route-literal lint selector.
const SLIDES_PATH = `${API_BASE_URL}/views/presentation-slides/prs_01`;

describe('HTTP adapters: presentation views, C-41 and O-01 come back typed', () => {
  it('presentationViews', async () => {
    const list: R.V40Response = {
      items: [
        {
          id: 'prs_01',
          name: 'Deck',
          createdOn: '2025-10-02',
          status: 'draft',
          publishedOn: null,
          permissions: { canEdit: true },
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      permissions: { canCreate: true },
    };
    serve(list);
    const dataList: R.V40Response = await ports().presentationViews.getPresentationsView();
    expect(dataList).toEqual(list);

    const builder: R.V41Response = {
      meta: { title: '', date: null, language: 'es', templateId: null },
      templates: [],
      includeCover: true,
      includeClosing: true,
      modules: [],
      slideCount: 0,
      notes: {},
      pendingNoteCount: 0,
      uploadedVersion: null,
      commentCount: 0,
      permissions: {},
    };
    serve(builder);
    const dataBuilder: R.V41Response =
      await ports().presentationViews.getPresentationBuilderView('prs_01');
    expect(dataBuilder).toEqual(builder);

    const slides: R.V42Response = {
      templateId: 'directorio',
      templateName: 'Directorio Ejecutivo',
      accentKey: 'template.directorio',
      language: 'es',
      slides: [{ kind: 'empty' }],
      permissions: {},
    };
    serve(slides);
    const dataSlides: R.V42Response =
      await ports().presentationViews.getPresentationSlidesView('prs_01');
    expect(dataSlides).toEqual(slides);

    const detail: R.V43Response = {
      meta: {
        id: 'prs_01',
        name: 'Deck',
        templateId: 'directorio',
        templateName: 'Directorio Ejecutivo',
        status: 'draft',
        createdOn: '2025-10-02',
        publishedOn: null,
        hasUploadedVersion: false,
      },
      accentKey: 'template.directorio',
      slideRef: { view: 'V-42', path: SLIDES_PATH, slideCount: 0 },
      comments: { count: 0 },
      permissions: {},
    };
    serve(detail);
    const dataDetail: R.V43Response =
      await ports().presentationViews.getPresentationDetailView('prs_01');
    expect(dataDetail).toEqual(detail);
  });

  it('a V-41 module id the contract does not list still reaches the caller (widened, like V-09)', async () => {
    const builder: R.V41Response = {
      meta: { title: '', date: null, language: 'es', templateId: null },
      templates: [],
      includeCover: true,
      includeClosing: true,
      modules: [{ id: 'future_module', label: 'Future', charts: [] }],
      slideCount: 0,
      notes: {},
      pendingNoteCount: 0,
      uploadedVersion: null,
      commentCount: 0,
      permissions: {},
    };
    serve(builder);
    const data = await ports().presentationViews.getPresentationBuilderView('prs_01');
    expect(data.modules[0]?.id).toBe('future_module');
  });

  it('previewInvitations sends the reviewer ids to the analysis it names', async () => {
    const payload: R.C41Response = { invited: true, invitationIds: ['inv_01'], sentAt: TIME };
    let sentBody: unknown;
    let sentPath = '';
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.post(`${API}/analyses/:analysisId/preview-invitations`, async ({ request }) => {
        sentPath = new URL(request.url).pathname;
        sentBody = await request.json();
        return HttpResponse.json(payload);
      }),
    );
    const data: R.C41Response = await ports().previewInvitations.createPreviewInvitations(
      'ana_01',
      { reviewerIds: ['usr_01', 'usr_02'] },
    );
    expect(data).toEqual(payload);
    expect(sentPath).toBe(`${API_BASE_URL}/analyses/ana_01/preview-invitations`);
    expect(sentBody).toEqual({ reviewerIds: ['usr_01', 'usr_02'] });
  });

  it('operations.getOperationStatus', async () => {
    const payload: R.O01Response = {
      id: 'op_01',
      kind: 'export',
      status: 'succeeded',
      progressPct: 100,
      messageKey: 'operation.export.done',
      result: { fileId: 'file_01', fileName: 'deck.pptx' },
      error: null,
    };
    serve(payload);
    const data: R.O01Response = await ports().operations.getOperationStatus('op_01');
    expect(data).toEqual(payload);
  });
});

// The presentation options (call-options.ts) are optional, so the OPERATIONS loop's zero-arg calls never prove a param
// actually reaches the request — these do: every option set, asserting the exact pathname + query string, and that two
// different ids reach two different paths (the id is never fixed or dropped). The response is deliberately outside the
// contract so the call rejects; only the request the adapter built is under test.
describe('HTTP adapters: presentation options reach the request', () => {
  function captureRequests(): URL[] {
    const seen: URL[] = [];
    server.use(
      mswHttp.get(`${API}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      mswHttp.all(`${API}/*`, ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json({ unexpected: true });
      }),
    );
    return seen;
  }

  it('getPresentationsView forwards analysisId, page and pageSize, and sends no query without options', async () => {
    const seen = captureRequests();
    await ports()
      .presentationViews.getPresentationsView({ analysisId: 'ana_01', page: 2, pageSize: 5 })
      .catch(() => undefined);
    await ports()
      .presentationViews.getPresentationsView()
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/presentations`);
    expect(Object.fromEntries(seen[0]?.searchParams ?? [])).toEqual({
      analysisId: 'ana_01',
      page: '2',
      pageSize: '5',
    });
    expect(seen[1]?.search).toBe('');
  });

  it('getPresentationSlidesView forwards order as a comma list, and sends no query for an empty order', async () => {
    const seen = captureRequests();
    await ports()
      .presentationViews.getPresentationSlidesView('prs_01', {
        order: ['title', 'comp|barras', 'appendix'],
      })
      .catch(() => undefined);
    await ports()
      .presentationViews.getPresentationSlidesView('prs_01', { order: [] })
      .catch(() => undefined);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/views/presentation-slides/prs_01`);
    expect(seen[0]?.searchParams.get('order')).toBe('title,comp|barras,appendix');
    expect(seen[1]?.search).toBe('');
  });

  it('the detail, builder and slides views request the presentationId they are given', async () => {
    const seen = captureRequests();
    const views = ports().presentationViews;
    await views.getPresentationDetailView('prs_a').catch(() => undefined);
    await views.getPresentationDetailView('prs_b').catch(() => undefined);
    await views.getPresentationBuilderView('prs_a').catch(() => undefined);
    await views.getPresentationBuilderView('prs_b').catch(() => undefined);
    await views.getPresentationSlidesView('prs_a').catch(() => undefined);
    await views.getPresentationSlidesView('prs_b').catch(() => undefined);
    expect(seen.map((url) => url.pathname)).toEqual([
      `${API_BASE_URL}/views/presentation-detail/prs_a`,
      `${API_BASE_URL}/views/presentation-detail/prs_b`,
      `${API_BASE_URL}/views/presentation-builder/prs_a`,
      `${API_BASE_URL}/views/presentation-builder/prs_b`,
      `${API_BASE_URL}/views/presentation-slides/prs_a`,
      `${API_BASE_URL}/views/presentation-slides/prs_b`,
    ]);
  });

  it('getOperationStatus requests the operationId it is given', async () => {
    const seen = captureRequests();
    await ports()
      .operations.getOperationStatus('op_a')
      .catch(() => undefined);
    await ports()
      .operations.getOperationStatus('op_b')
      .catch(() => undefined);
    expect(seen.map((url) => url.pathname)).toEqual([
      `${API_BASE_URL}/operations/op_a`,
      `${API_BASE_URL}/operations/op_b`,
    ]);
  });
});

// O-03 is not a JSON call (its generated schema is the ApiError shape; a real 200 is the file's bytes), so it has its
// own checks: the request it sends and how it reads the answer.
describe('HTTP adapters: downloadFile (O-03)', () => {
  it('GETs the mediated URL of the file with disposition=attachment by default, encoded, and returns its bytes', async () => {
    const seen: URL[] = [];
    server.use(
      mswHttp.get(`${API}/files/:fileId/download`, ({ request }) => {
        seen.push(new URL(request.url));
        return new HttpResponse('file-bytes', {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }),
    );
    const blob = await ports().operations.downloadFile(ID);
    expect(seen[0]?.pathname).toBe(`${API_BASE_URL}/files/${ENC}/download`);
    expect(seen[0]?.searchParams.get('disposition')).toBe('attachment');
    expect(await blob.text()).toBe('file-bytes');
  });

  it('forwards disposition=inline', async () => {
    const seen: URL[] = [];
    server.use(
      mswHttp.get(`${API}/files/:fileId/download`, ({ request }) => {
        seen.push(new URL(request.url));
        return new HttpResponse('x');
      }),
    );
    await ports().operations.downloadFile('file_01', { disposition: 'inline' });
    expect(seen[0]?.searchParams.get('disposition')).toBe('inline');
  });

  it('turns a 403 ApiError body into an ApiError, and a non-JSON failure into HTTP_ERROR', async () => {
    server.use(
      mswHttp.get(`${API}/files/forbidden/download`, () =>
        HttpResponse.json(
          { code: 'FORBIDDEN', message: 'No access', traceId: 'trc_1' },
          { status: 403 },
        ),
      ),
      mswHttp.get(`${API}/files/broken/download`, () => new HttpResponse('boom', { status: 502 })),
    );
    const forbidden: unknown = await ports()
      .operations.downloadFile('forbidden')
      .catch((e: unknown) => e);
    expect(forbidden).toBeInstanceOf(ApiError);
    expect(forbidden).toMatchObject({ code: 'FORBIDDEN', status: 403 });
    const broken: unknown = await ports()
      .operations.downloadFile('broken')
      .catch((e: unknown) => e);
    expect(broken).toMatchObject({ code: 'HTTP_ERROR', status: 502 });
  });
});
