# C4 — Containers and layers of eco-comparator-web

The web app is one container: a React SPA that the BFF serves from its own public folder (same origin). Inside, the code
follows Feature-Sliced Design (`prompt_Start_Eco.md` §5.1, L443; `AGENTS.md` "Where does this file go?"). The layer rules
are enforced by `pnpm lint` and `pnpm check:architecture` (rules in `tools/architecture/fsd-rules.js`).

## Container view

```mermaid
C4Container
  title Containers — Eco-Comparador (web perspective)

  Person(user, "User", "Any of the five roles, in a browser")

  Container_Boundary(app, "Databricks App (one origin)") {
    Container(spa, "eco-comparator-web", "React 19 SPA, Vite build", "Screens SCR-01..17, overlays, charts, i18n es-CO; talks only to /api")
    Container(bff, "eco-comparator-bff", "Node 24, Express 5", "Serves the SPA build and /api/v1/*; composes views; owns every integration")
  }

  System_Ext(downstream, "Downstream services", "Lakebase, SQL Warehouse, Entra ID, LLM, Jobs, Capital IQ, … (see c4-context)")

  Rel(user, spa, "Uses", "HTTPS")
  Rel(spa, bff, "Relative /api/v1/* calls", "JSON, SSE, session cookie")
  Rel(bff, spa, "Serves index.html and hashed assets", "HTTPS")
  Rel(bff, downstream, "Calls through ports and providers", "mocks first")
```

## Layers (Feature-Sliced Design)

Arrows point from the importing layer to the layers it may import. A layer imports only the layers **below** it; slices
of the same layer never import each other; another slice is reached only through its public API (`<slice>/index.ts`).

```mermaid
flowchart TD
  app["app — providers, router, route table, global styles (src/app)"]
  pages["pages — one per screen SCR-xx, composition only (src/pages)"]
  widgets["widgets — self-contained screen blocks: cards, rails, chart sections (src/widgets)"]
  features["features — user actions / commands C-xx, forms, mutations (src/features, planned)"]
  entities["entities — business entities: model, query hooks, entity UI (src/entities)"]
  shared["shared — domain-agnostic: ui, api ports + adapters, lib, i18n, config (src/shared)"]

  app --> pages
  app --> widgets
  app --> features
  app --> entities
  app --> shared
  pages --> widgets
  pages --> features
  pages --> entities
  pages --> shared
  widgets --> features
  widgets --> entities
  widgets --> shared
  features --> entities
  features --> shared
  entities --> shared

  shared -. "HTTP adapter (only place that calls the network)" .-> api(["BFF /api/v1/*"])
```

| Layer | Folder | May import | Never imports |
| --- | --- | --- | --- |
| app | `src/app/` | pages, widgets, features, entities, shared | — |
| pages | `src/pages/` | widgets, features, entities, shared | app, other pages |
| widgets | `src/widgets/` | features, entities, shared | app, pages, other widgets |
| features | `src/features/` (planned) | entities, shared | app, pages, widgets, other features |
| entities | `src/entities/` | shared | app, pages, widgets, features, other entities |
| shared | `src/shared/` | nothing above it (npm packages only) | every other layer |

Where a new file goes, with the tie-breakers (a block used by two pages is a widget; anything that sends a command is a
feature; anything that knows a business term is not `shared`), is in `AGENTS.md`.
