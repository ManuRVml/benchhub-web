export {
  assignLocation,
  AUTH_LOGIN_PATH,
  isInAppPath,
  loginRedirectUrl,
  type LoginRedirectParams,
} from './auth-redirect';
export { createCsrfTokenStore, sessionCsrfSchema, type CsrfTokenStore } from './csrf';
export {
  ApiError,
  apiErrorBodySchema,
  isApiError,
  type ApiErrorInit,
  type ClientErrorCode,
} from './errors';
export {
  API_BASE_URL,
  createHttpClient,
  CSRF_HEADER,
  SESSION_ENDPOINT,
  TRACE_ID_HEADER,
  type GetOptions,
  type HttpClient,
  type HttpClientOptions,
  type HttpMethod,
  type QueryParams,
  type RequestOptions,
} from './http-client';
export { apiPath, createHttpPorts } from './adapters/http';
export { fetchPendingView } from './fetch-pending-view';
export {
  createSseClient,
  readSseMessages,
  type SseClient,
  type SseClientOptions,
  type SseMessage,
  type SseStreamOptions,
} from './sse';
// The mock adapters are NOT re-exported here: they carry the contract fixtures, which must never ship in an `http`
// build. Mock-mode bootstrap code imports `@/shared/api/mock` dynamically; tests and stories import it directly.
export type * from './ports';
export type * from './ports/responses';
// V-12 has no port yet (P5-42b, ADR-0004): re-exported here so entities/analysis/api/use-company-comparison-view.ts
// validates against the real generated schema instead of hand-copying its shape; TODO(P7-PORTS) removes this once
// the port forwards companyId/horizon and the hook calls it directly.
export { GetCompanyComparisonViewResponse } from './generated/zod';
export type { SectionResult } from './section-result';
export {
  ServiceContext,
  useServices,
  type ApiMode,
  type ServiceContainer,
} from './service-context';
export { queryKeys } from './query-keys';
export {
  deepPatch,
  patchQueries,
  restoreQueries,
  shouldRetry,
  STALE_TIMES,
  type QuerySnapshot,
} from './query-policy';
// Response schemas that ARE vendored (ADR-0004) but have no port/adapter method yet: re-exported so entity hooks can
// validate against the real contract via the raw client without importing `./generated` directly (only shared/api
// may do that). Each consumer keeps its own `// TODO(P7-PORTS)` for the eventual port/adapter swap.
export {
  GetOperationEventsResponse,
  GetKviCandidatesViewResponse,
  GetValueMonitorConfigurationViewResponse,
} from './generated/zod';
// C-33 is streamed by the SSE client (features/assistant), not a JSON port call, so the feature validates each event
// and builds its request with the generated schemas themselves (contract 0.2.0 publishes the CF-111 event union).
export { SendAssistantMessageBody, SendAssistantMessageResponse } from './generated/zod';
