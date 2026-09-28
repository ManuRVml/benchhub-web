import { delay, http, HttpResponse } from 'msw';

import { API_BASE_URL, TRACE_ID_HEADER } from '@/shared/api';
import {
  INVALID_CREDENTIALS_MESSAGE,
  MOCK_OPERATIONS,
  mockCredentialsMatch,
  mockPayload,
} from '@/shared/api/mock';

import { apiErrorBody, emptyPayload, partialPayload, SLOW_DELAY_MS } from './scenarios';

import type { Scenario } from './scenarios';
import type { MockOperationId } from '@/shared/api/mock';
import type { HttpHandler, JsonBodyType } from 'msw';

// MSW handlers of every operation of contract 0.1.0 (P5-03), with the paths the HTTP adapters call. Paths are relative
// to the page origin (jsdom in tests, the dev server in the browser). Each handler declares its operation with
// `@operation`, checked by `pnpm contract:mocks`.

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

function operation(
  operationId: MockOperationId,
  method: Method,
  path: string,
  scenario: Scenario,
): HttpHandler {
  return http[method](`${API_BASE_URL}${path}`, async () => {
    const traceId = `mock-${operationId}-${scenario}`;
    const headers = { [TRACE_ID_HEADER]: traceId };
    if (scenario === 'error') {
      return HttpResponse.json(
        apiErrorBody('INTERNAL_ERROR', `Mock scenario "error" for ${operationId}`, traceId),
        { status: 500, headers },
      );
    }
    if (scenario === 'forbidden') {
      return HttpResponse.json(
        apiErrorBody('FORBIDDEN', `Mock scenario "forbidden" for ${operationId}`, traceId),
        { status: 403, headers },
      );
    }
    if (scenario === 'slow') await delay(SLOW_DELAY_MS);
    const payload = await mockPayload(operationId);
    const body =
      scenario === 'empty'
        ? emptyPayload(payload, MOCK_OPERATIONS[operationId].schema)
        : scenario === 'partial'
          ? partialPayload(payload)
          : payload;
    return HttpResponse.json(body as JsonBodyType, { headers });
  });
}

/**
 * `GET /api/v1/session` (A-04): the http client's own CSRF bootstrap (`createCsrfTokenStore`, `sessionCsrfSchema`)
 * reads `csrfToken` off this same endpoint before every unsafe-method call, so — unlike every other operation — it
 * always answers `200` with a token, regardless of the blanket scenario a test picks for some other operation
 * (`scenarioHandlers('error')` and friends exist to make "every other endpoint stays healthy" easy, not to take the
 * CSRF bootstrap down with them). `getSession`'s own error/forbidden/slow behavior is exercised with a dedicated
 * `server.use()` override instead, same as any operation with request-specific test needs.
 */
// Loaded once at import time: every unsafe-method call fetches this endpoint first, and a fixture import per request
// stalls the CSRF bootstrap long enough that debounce / fake-timer tests see their POST arrive late or not at all.
const sessionPayload = mockPayload('getSession');

function sessionHandler(scenario: Scenario): HttpHandler {
  return http.get(`${API_BASE_URL}/session`, async () => {
    if (scenario === 'slow') await delay(SLOW_DELAY_MS);
    const payload = await sessionPayload;
    const body =
      scenario === 'empty' ? emptyPayload(payload, MOCK_OPERATIONS.getSession.schema) : payload;
    return HttpResponse.json({
      ...(body as Record<string, unknown>),
      csrfToken: 'mock-csrf-token',
    });
  });
}

/**
 * `POST /api/v1/auth/logout` (A-03): success is `204 No Content` (see `LogoutSuccessSchema`) — the fixture models the
 * 403 `CSRF_INVALID` example instead (this operation's only documented JSON shape), so `ok`/`empty`/`slow` all answer
 * empty, matching what the real BFF and the HTTP adapter's schema expect.
 */
function logoutHandler(scenario: Scenario): HttpHandler {
  return http.post(`${API_BASE_URL}/auth/logout`, async () => {
    const traceId = `mock-logout-${scenario}`;
    const headers = { [TRACE_ID_HEADER]: traceId };
    if (scenario === 'error') {
      return HttpResponse.json(
        apiErrorBody('INTERNAL_ERROR', 'Mock scenario "error" for logout', traceId),
        { status: 500, headers },
      );
    }
    if (scenario === 'forbidden') {
      return HttpResponse.json(
        apiErrorBody('FORBIDDEN', 'Mock scenario "forbidden" for logout', traceId),
        { status: 403, headers },
      );
    }
    if (scenario === 'slow') await delay(SLOW_DELAY_MS);
    return new HttpResponse(null, { status: 204, headers });
  });
}

/**
 * `POST /api/v1/auth/password-login` (A-05, mock BFF only): like the BFF mock, it accepts only the mock credential
 * pair (username case-insensitive after trim, password exact) and answers everything else with the one generic 401
 * `INVALID_CREDENTIALS` body; a body without both strings is a 400. `error`/`forbidden`/`slow` behave as elsewhere.
 */
function passwordLoginHandler(scenario: Scenario): HttpHandler {
  return http.post(`${API_BASE_URL}/auth/password-login`, async ({ request }) => {
    const traceId = `mock-passwordLogin-${scenario}`;
    const headers = { [TRACE_ID_HEADER]: traceId };
    if (scenario === 'error') {
      return HttpResponse.json(
        apiErrorBody('INTERNAL_ERROR', 'Mock scenario "error" for passwordLogin', traceId),
        { status: 500, headers },
      );
    }
    if (scenario === 'forbidden') {
      return HttpResponse.json(
        apiErrorBody('FORBIDDEN', 'Mock scenario "forbidden" for passwordLogin', traceId),
        { status: 403, headers },
      );
    }
    if (scenario === 'slow') await delay(SLOW_DELAY_MS);
    const body = (await request.json().catch(() => null)) as {
      username?: unknown;
      password?: unknown;
    } | null;
    if (typeof body?.username !== 'string' || typeof body.password !== 'string') {
      return HttpResponse.json(
        apiErrorBody('BAD_REQUEST', 'The request could not be processed', traceId),
        { status: 400, headers },
      );
    }
    if (!mockCredentialsMatch(body.username, body.password)) {
      return HttpResponse.json(
        apiErrorBody('INVALID_CREDENTIALS', INVALID_CREDENTIALS_MESSAGE, traceId),
        { status: 401, headers },
      );
    }
    const payload = await sessionPayload;
    return HttpResponse.json(
      { ...(payload as Record<string, unknown>), csrfToken: 'mock-csrf-token' },
      { headers },
    );
  });
}

/**
 * O-03's generated response schema is the `ApiError` shape (its 200 is the file's bytes, not JSON — ports/operations.ts),
 * so it cannot go through the generic `operation()` factory: `error`/`forbidden` answer the real ApiError body (matching
 * the adapter's own error path), everything else answers a small binary body regardless of scenario.
 */
function downloadFileHandler(scenario: Scenario): HttpHandler {
  return http.get(`${API_BASE_URL}/files/:fileId/download`, async () => {
    const traceId = `mock-downloadFile-${scenario}`;
    const headers = { [TRACE_ID_HEADER]: traceId };
    if (scenario === 'error') {
      return HttpResponse.json(
        apiErrorBody('INTERNAL_ERROR', `Mock scenario "error" for downloadFile`, traceId),
        { status: 500, headers },
      );
    }
    if (scenario === 'forbidden') {
      return HttpResponse.json(
        apiErrorBody('FORBIDDEN', `Mock scenario "forbidden" for downloadFile`, traceId),
        { status: 403, headers },
      );
    }
    if (scenario === 'slow') await delay(SLOW_DELAY_MS);
    return new HttpResponse('mock file content', {
      headers: { ...headers, 'Content-Type': 'application/octet-stream' },
    });
  });
}

/** O-02 uses the same progress → terminal event sequence as the mock BFF's stateful operation stream. */
function operationEventsHandler(scenario: Scenario): HttpHandler {
  return http.get(`${API_BASE_URL}/operations/:operationId/events`, ({ params }) => {
    const operationId = String(params.operationId);
    const events =
      scenario === 'error'
        ? [
            {
              operationId,
              status: 'failed',
              progressPct: 100,
              messageKey: 'operation.failed',
              error: { code: 'OPERATION_FAILED', messageKey: 'operation.failed' },
            },
          ]
        : [
            { operationId, status: 'running', progressPct: 50, messageKey: 'operation.running' },
            {
              operationId,
              status: 'succeeded',
              progressPct: 100,
              messageKey: 'operation.done',
              result: { targetRoute: '/analisis' },
            },
          ];
    return new HttpResponse(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  });
}

/** Handlers of the operations for one scenario (default ok); tests pick one with `server.use(...)`. */
export function scenarioHandlers(scenario: Scenario = 'ok'): HttpHandler[] {
  const s = scenario;
  return [
    /** @operation getSession */
    sessionHandler(s),
    /** @operation startLogin */
    operation('startLogin', 'get', '/auth/login', s),
    /** @operation completeLogin */
    operation('completeLogin', 'get', '/auth/callback', s),
    /** @operation logout */
    logoutHandler(s),
    /** @operation passwordLogin */
    passwordLoginHandler(s),
    /** @operation getShellStatusView */
    operation('getShellStatusView', 'get', '/views/shell-status', s),
    /** @operation getAdminHomeView */
    operation('getAdminHomeView', 'get', '/views/admin-home', s),
    /** @operation getHomeView */
    operation('getHomeView', 'get', '/views/home', s),
    /** @operation getAnalysesView */
    operation('getAnalysesView', 'get', '/views/analyses', s),
    /** @operation getAnalysisDefinitionView */
    operation('getAnalysisDefinitionView', 'get', '/views/analysis-definition/:draftId', s),
    /** @operation getCompetitorCatalogView */
    operation('getCompetitorCatalogView', 'get', '/views/competitor-catalog', s),
    /** @operation getIndicatorCatalogView */
    operation('getIndicatorCatalogView', 'get', '/views/indicator-catalog', s),
    /** @operation getAnalysisValidationView */
    operation('getAnalysisValidationView', 'get', '/views/analysis-validation/:draftId', s),
    /** @operation getResultsHeaderView */
    operation('getResultsHeaderView', 'get', '/views/results-header/:analysisId', s),
    /** @operation getCompanyCoverageView */
    operation('getCompanyCoverageView', 'get', '/views/company-coverage/:analysisId', s),
    /** @operation getPeerAverageComparisonView */
    operation(
      'getPeerAverageComparisonView',
      'get',
      '/views/peer-average-comparison/:analysisId',
      s,
    ),
    /** @operation getCompanyComparisonView */
    operation('getCompanyComparisonView', 'get', '/views/company-comparison/:analysisId', s),
    /** @operation getReportSummaryView */
    operation('getReportSummaryView', 'get', '/views/report-summary/:analysisId', s),
    /** @operation getAiFindingsView */
    operation('getAiFindingsView', 'get', '/views/ai-findings/:analysisId', s),
    /** @operation getComparisonProfilesView */
    operation('getComparisonProfilesView', 'get', '/views/comparison-profiles/:analysisId', s),
    /** @operation createAnalysisDraft */
    operation('createAnalysisDraft', 'post', '/analysis-drafts', s),
    /** @operation updateAnalysisDraft */
    operation('updateAnalysisDraft', 'patch', '/analysis-drafts/:draftId', s),
    /** @operation generateAnalysis */
    operation('generateAnalysis', 'post', '/analysis-drafts/:draftId/generation', s),
    /** @operation addAnalysisCompany */
    operation('addAnalysisCompany', 'post', '/analyses/:analysisId/companies', s),
    /** @operation removeAnalysisCompany */
    operation('removeAnalysisCompany', 'delete', '/analyses/:analysisId/companies/:companyId', s),
    /** @operation updateValueOverrides */
    operation('updateValueOverrides', 'patch', '/analyses/:analysisId/value-overrides', s),
    /** @operation updateWeightOverrides */
    operation('updateWeightOverrides', 'patch', '/analyses/:analysisId/weight-overrides', s),
    /** @operation createRecalculation */
    operation('createRecalculation', 'post', '/recalculations', s),
    /** @operation publishAnalysis */
    operation('publishAnalysis', 'post', '/publications', s),
    /** @operation createReviewComment */
    operation('createReviewComment', 'post', '/review-comments', s),
    /** @operation updateReviewComment */
    operation('updateReviewComment', 'patch', '/review-comments/:commentId', s),
    /** @operation createChangeRequest */
    operation('createChangeRequest', 'post', '/change-requests', s),
    /** @operation updateChangeRequest */
    operation('updateChangeRequest', 'patch', '/change-requests/:requestId', s),
    /** @operation createExport */
    operation('createExport', 'post', '/exports', s),
    /** @operation generateExecutiveNarrative */
    operation('generateExecutiveNarrative', 'post', '/executive-narratives', s),
    /** @operation updateKviTargets */
    operation('updateKviTargets', 'patch', '/kvis/:kviId/targets', s),
    /** @operation updateValueMonitorConfiguration */
    operation('updateValueMonitorConfiguration', 'put', '/value-monitor-configuration', s),
    /** @operation addValueMonitorKvis */
    operation('addValueMonitorKvis', 'post', '/value-monitor-kvis', s),
    /** @operation getValueMonitorView */
    operation('getValueMonitorView', 'get', '/views/value-monitor', s),
    /** @operation getValueMonitorPeerRankingView */
    operation('getValueMonitorPeerRankingView', 'get', '/views/value-monitor-peer-ranking', s),
    /** @operation getValueMonitorHistoryView */
    operation('getValueMonitorHistoryView', 'get', '/views/value-monitor-history', s),
    /** @operation getValueMonitorKvisView */
    operation('getValueMonitorKvisView', 'get', '/views/value-monitor-kvis', s),
    /** @operation getValueMonitorCompositionView */
    operation('getValueMonitorCompositionView', 'get', '/views/value-monitor-composition', s),
    /** @operation getValueMonitorConfigurationView */
    operation('getValueMonitorConfigurationView', 'get', '/views/value-monitor-configuration', s),
    /** @operation getKviTraceabilityView */
    operation('getKviTraceabilityView', 'get', '/views/kvi-traceability/:kviId', s),
    /** @operation getKviCandidatesView */
    operation('getKviCandidatesView', 'get', '/views/kvi-candidates', s),
    /** @operation getValueMonitorRecommendationsView */
    operation(
      'getValueMonitorRecommendationsView',
      'get',
      '/views/value-monitor-recommendations',
      s,
    ),
    /** @operation getValueMonitorBenchmarkRadarView */
    operation(
      'getValueMonitorBenchmarkRadarView',
      'get',
      '/views/value-monitor-benchmark-radar',
      s,
    ),
    /** @operation getVisualizationView */
    operation('getVisualizationView', 'get', '/views/visualization/:analysisId', s),
    /** @operation getPeerWeightRankingView */
    operation('getPeerWeightRankingView', 'get', '/views/peer-weight-ranking/:analysisId', s),
    /** @operation getCategoryIndicatorsView */
    operation('getCategoryIndicatorsView', 'get', '/views/category-indicators/:analysisId', s),
    /** @operation getWeightRecommendationsView */
    operation(
      'getWeightRecommendationsView',
      'get',
      '/views/weight-recommendations/:analysisId',
      s,
    ),
    /** @operation getCompanyProfileView */
    operation('getCompanyProfileView', 'get', '/views/company-profile/:companyId', s),
    /** @operation getTbgIndicatorComparatorView */
    operation(
      'getTbgIndicatorComparatorView',
      'get',
      '/views/tbg-indicator-comparator/:analysisId',
      s,
    ),
    /** @operation getFutureAspirationView */
    operation('getFutureAspirationView', 'get', '/views/future-aspiration/:analysisId', s),
    /** @operation getTbgHorizonView */
    operation('getTbgHorizonView', 'get', '/views/tbg-horizon/:analysisId', s),
    /** @operation getTbgDimensionWeightsView */
    operation('getTbgDimensionWeightsView', 'get', '/views/tbg-dimension-weights/:analysisId', s),
    /** @operation createSavedView */
    operation('createSavedView', 'post', '/saved-views', s),
    /** @operation deleteSavedView */
    operation('deleteSavedView', 'delete', '/saved-views/:viewId', s),
    /** @operation evaluateSensitivity */
    operation('evaluateSensitivity', 'post', '/sensitivity-evaluations', s),
    /** @operation validateSensitivitySuggestion */
    operation(
      'validateSensitivitySuggestion',
      'post',
      '/sensitivity-suggestions/:suggestionId/validation',
      s,
    ),
    /** @operation createSensitivitySimulation */
    operation('createSensitivitySimulation', 'post', '/sensitivity-simulations', s),
    /** @operation evaluateWeightSimulation */
    operation('evaluateWeightSimulation', 'post', '/weight-simulation-evaluations', s),
    /** @operation createStrategicPlan */
    operation('createStrategicPlan', 'post', '/strategic-plans', s),
    /** @operation updateStrategicPlan */
    operation('updateStrategicPlan', 'patch', '/strategic-plans/:planId', s),
    /** @operation createPresentation */
    operation('createPresentation', 'post', '/presentations', s),
    /** @operation updatePresentation */
    operation('updatePresentation', 'patch', '/presentations/:presentationId', s),
    /** @operation publishPresentation */
    operation('publishPresentation', 'post', '/presentations/:presentationId/publication', s),
    /** @operation uploadPresentationVersion */
    operation(
      'uploadPresentationVersion',
      'put',
      '/presentations/:presentationId/uploaded-version',
      s,
    ),
    /** @operation deletePresentationVersion */
    operation(
      'deletePresentationVersion',
      'delete',
      '/presentations/:presentationId/uploaded-version',
      s,
    ),
    /** @operation createSlideCommentDraft */
    operation('createSlideCommentDraft', 'post', '/slide-comment-drafts', s),
    /** @operation sendAssistantMessage */
    operation('sendAssistantMessage', 'post', '/assistant/messages', s),
    /** @operation createAssistantFeedback */
    operation('createAssistantFeedback', 'post', '/assistant/feedback', s),
    /** @operation getNotificationsView */
    operation('getNotificationsView', 'get', '/views/notifications', s),
    /** @operation markNotificationRead */
    operation('markNotificationRead', 'patch', '/notifications/:notificationId/read', s),
    /** @operation markAllNotificationsRead */
    operation('markAllNotificationsRead', 'post', '/notifications/read-all', s),
    /** @operation getIndicatorDetailView */
    operation(
      'getIndicatorDetailView',
      'get',
      '/views/indicator-detail/:analysisId/:indicatorId',
      s,
    ),
    /** @operation getCommentThreadView */
    operation('getCommentThreadView', 'get', '/views/comment-thread', s),
    /** @operation getSensitivityDriversView */
    operation('getSensitivityDriversView', 'get', '/views/sensitivity-drivers', s),
    /** @operation getSensitivityScenariosView */
    operation('getSensitivityScenariosView', 'get', '/views/sensitivity-scenarios', s),
    /** @operation getWeightSimulatorView */
    operation('getWeightSimulatorView', 'get', '/views/weight-simulator', s),
    /** @operation createComparisonProfile */
    operation('createComparisonProfile', 'post', '/analyses/:analysisId/comparison-profiles', s),
    /** @operation updateComparisonProfile */
    operation(
      'updateComparisonProfile',
      'patch',
      '/analyses/:analysisId/comparison-profiles/:profileId',
      s,
    ),
    /** @operation deleteComparisonProfile */
    operation(
      'deleteComparisonProfile',
      'delete',
      '/analyses/:analysisId/comparison-profiles/:profileId',
      s,
    ),
    /** @operation updateUserSettings */
    operation('updateUserSettings', 'patch', '/user-settings', s),
    /** @operation getUserSettingsView */
    operation('getUserSettingsView', 'get', '/views/user-settings', s),
    /** @operation getAssistantContextView */
    operation('getAssistantContextView', 'get', '/views/assistant-context', s),
    /** @operation getSavedViewsView */
    operation('getSavedViewsView', 'get', '/views/saved-views', s),
    /** @operation getPresentationsView */
    operation('getPresentationsView', 'get', '/views/presentations', s),
    /** @operation getPresentationBuilderView */
    operation(
      'getPresentationBuilderView',
      'get',
      '/views/presentation-builder/:presentationId',
      s,
    ),
    /** @operation getPresentationSlidesView */
    operation('getPresentationSlidesView', 'get', '/views/presentation-slides/:presentationId', s),
    /** @operation getPresentationDetailView */
    operation('getPresentationDetailView', 'get', '/views/presentation-detail/:presentationId', s),
    /** @operation createPreviewInvitations */
    operation('createPreviewInvitations', 'post', '/analyses/:analysisId/preview-invitations', s),
    /** @operation getOperationStatus */
    operation('getOperationStatus', 'get', '/operations/:operationId', s),
    operationEventsHandler(s),
    /** @operation downloadFile */
    downloadFileHandler(s),
  ];
}

/** Default handlers of the test server and the browser worker: every operation in the ok scenario. */
export const handlers = scenarioHandlers('ok');
