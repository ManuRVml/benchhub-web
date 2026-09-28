# ADR-0005: State and URL — TanStack Query, Zustand, useTypedSearchParams

## Status

Accepted.

## Context

The prototype uses URL query params for state (e.g., `/analisis?q=&fecha=&creador=&estado=&ref=&page=`). The decision must balance server state (caching, refetching), client UI state, and shareable URLs.

Constraints:
- Server state (API responses) needs caching, refetching, and optimistic updates.
- Client UI state (modal visibility, filters) should persist in URL for shareability.
- TypeScript safety is required for query params.

Sources: `prompt_Start_Eco.md` §5.3 (L482-487); P5-05 task (stores, URL hook).

## Decision

1. **TanStack Query** for server state:
   - Automatic caching, refetching on focus/reconnect.
   - Optimistic updates and suspense mode.
   - Integration with React Query DevTools.

2. **Zustand 5.0.15** (exact pin) for client UI state, implemented in P5-05:
   - One store per domain, in the `model` segment of the slice that owns it: `src/shared/model/layout.store.ts`
     (`useLayoutStore`), `src/features/assistant/model/assistant.store.ts` (`useAssistantStore`),
     `src/entities/comparison/model/comparison-ui.store.ts` (`useComparisonUiStore`). Other layers import them only
     through the slice's `index.ts`.
   - Actions are imperative functions on the store (`toggleSidebar()`, `openPanel()`, `toggleRow(id)`), named in
     DevTools as `<store>/<action>`. Every state field and action has an exported atomic selector
     (`useLayoutStore(selectSidebarCollapsed)`); per-id reads use selector factories (`selectRowExpanded(id)`).
   - `devtools` is wired through `storeDevtools(name)` (`src/shared/lib/store/`), enabled only when
     `import.meta.env.DEV`.
   - `persist` only with a written justification in the store file. Today only the layout store persists
     (`sidebarCollapsed`, localStorage key `eco.layout`): the V2 "‹ Colapsar" sidebar control is a user preference.
     The assistant's per-screen "tip seen" flags are session-only by design; comparison UI state is ephemeral.
   - Stores never hold server data (that is TanStack Query's cache).

3. **`useTypedSearchParams(schema)`** with **Zod 4.6.5** (exact pin, same major as the BFF) for URL state, in
   `src/shared/lib/url/` (no third-party wrapper):
   ```ts
   import { z } from 'zod';
   import { useTypedSearchParams } from '@/shared/lib/url';

   const analysesSearch = z.object({
     q: z.string().optional(),
     estado: z.enum(['borrador', 'completado']).optional(),
     page: z.coerce.number().int().min(1).default(1),
   });

   const [search, setSearch] = useTypedSearchParams(analysesSearch);
   setSearch({ q: 'eco', page: null }, { replace: true });
   ```
   - The hook wraps React Router's `useSearchParams`. Each key is parsed on its own with its field schema: defaults
     apply, an invalid value falls back to the field's default and never throws; lists (`z.array`) are read
     comma-separated.
   - `set(patch, { replace? })` writes only the patched keys, removes keys patched to `null` / `''` / `[]`, removes
     schema keys whose current value is invalid, and keeps every other param untouched.
   - The encoding (`encodeQueryValue`) is shared with `routes.<key>.build()` in `src/shared/config/routes.ts`, so the
     route table and the hook write the same URL for the same values. Every field must be `.optional()` or have a
     `.default()`; object-level refinements are not applied.

4. **URL as source of truth**: All shareable state (filters, pagination, search) is in URL query params. Non-shareable UI state (modals, tabs) is in Zustand.

5. **State normalization**: Server state in TanStack Query cache, client state in Zustand stores, URL state parsed by `useTypedSearchParams`.

## Alternatives considered

- **React Query only for all state**: No separation of concerns; UI state in URL becomes unwieldy.
- **Zustand only for all state**: No caching/refetching for server state; URL params require manual parsing.
- **Jotai**: Context-based; more verbose than Zustand for simple stores.
- **Manual URL parsing**: No type safety; duplicated logic across screens.

## Consequences

- Positive: Clear separation of server, client, and URL state.
- Positive: TypeScript-safe query params prevent runtime errors.
- Positive: TanStack Query handles network resilience automatically.
- Negative: Learning curve for three state management concepts.
- Negative: URL schema changes require Zod migration strategy; an old link with a removed or renamed value falls back
  to the default instead of failing.
- Negative: tests of the hook need a DOM (jsdom, per-file `@vitest-environment jsdom`) because the router only
  navigates after its layout effects ran.
