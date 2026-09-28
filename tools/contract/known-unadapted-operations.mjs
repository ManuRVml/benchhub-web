// Operations of the vendored @eco/bff-contract that have no typed HTTP adapter method (tools/contract/check-adapters.mjs,
// pnpm contract:adapters) and no mock adapter / MSW handler pair yet either (tools/contract/check-mocks.mjs, pnpm
// contract:mocks) — both checks share this one list. The contract's registry grew far ahead of the web's typed
// adapters/ports layer (P5-01/P5-02) and its mock/MSW coverage (P5-03) while individual pages were built against
// hand-written mirrors (raw `services.http` calls with a local Zod schema) instead of waiting on a real port method —
// the same pattern documented inline in every one of those pages' entity files. Re-vendoring the contract (CF-revendor)
// surfaced the full gap for the first time: the stale tarball this repo carried before only had the ~48 operations the
// adapters and mocks already covered, so neither check ever saw the rest.
//
// This is a real backlog, not something to silently ignore: an operation removed from this set (because a real adapter
// method now exists for it) is a real ADR-0004 win, and both checks flag an entry here that already has one, so the
// list cannot go stale in that direction either.
export const KNOWN_UNADAPTED_OPERATIONS = new Set([
  // O-02 (SSE, GET /operations/:operationId/events): the web's only SSE client (src/shared/api/sse.ts, C-33 Yarbis
  // chat) is POST-only (it sends the CSRF token and a JSON body, then reads the stream) — a GET stream needs neither,
  // so wiring O-02 through it would mean building a second, unexercised streaming path for an operation with no
  // consumer. O-01 polling (ported, ports/operations.ts) is the contract's own documented degradation path and is
  // already the only thing `useOperationStatus` does; add a GET variant of the SSE client when a screen needs it.
  'getOperationEvents',
  // Infra endpoints, not consumed by the SPA.
  'getHealth',
  'getReadiness',
]);
