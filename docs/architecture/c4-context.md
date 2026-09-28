# C4 — System context

Eco-Comparador (BencHUD) is two repositories that deploy as one Databricks App (ADR-0007 of the BFF): the React SPA
`eco-comparator-web` and the Node/Express BFF `eco-comparator-bff`. Sources: `prompt_Start_Eco.md` §1 "Contexto de
arquitectura end-to-end" (L61–74) and §2.1 "Responsabilidades" (L82–89).

**Rule:** the web talks **only** to the BFF, over relative `/api/v1/*` calls on the same origin with the session cookie.
It never calls Databricks, Lakebase, Entra ID, Capital IQ or any other downstream service, and never sees their tokens.
The web is the BFF's only client; the BFF owns every external integration (all of them start as mocks,
`PROVIDERS_DEFAULT=mock`).

```mermaid
C4Context
  title System context — Eco-Comparador (BencHUD)

  Person(analyst, "Analista creador", "Prepares analyses, edits values, publishes reports and presentations")
  Person(explorer, "Explorador (visualizador / integral)", "Reads published analyses, dashboards and exports")
  Person(executive, "Ejecutivo (visualizador / integral)", "Consumes presentations; integral also comments and requests changes")
  Person(admin, "Administrador funcional", "Users, roles, sources and parameters (admin flag)")

  System_Boundary(eco, "Eco-Comparador — one Databricks App, same origin") {
    System(web, "eco-comparator-web", "React SPA: screens, interactions, es-CO formatting; no business logic")
    System(bff, "eco-comparator-bff", "Node / Express BFF: view composition, derivations, authorization, orchestration")
  }

  System_Ext(entra, "Microsoft Entra ID + Graph", "SSO OIDC / OAuth2, group-to-role mapping")
  System_Ext(lakebase, "Lakebase (PostgreSQL)", "Transactional authority: drafts, comments, change requests, saved views, RBAC, audit, PublicationManifest")
  System_Ext(sqlwh, "Databricks SQL Warehouse", "Read-only analytics over Gold and authorized Silver views")
  System_Ext(vector, "Mosaic AI Vector Search", "RAG search with BFF-derived ACL filters")
  System_Ext(volumes, "Unity Catalog Volumes / ADLS Gen2", "Source files and published artefacts (PPTX, PDF)")
  System_Ext(llm, "Model Serving / Azure AI Foundry", "LLM for storytelling, variation explanations and the assistant")
  System_Ext(jobs, "Databricks Jobs / Workflows API", "Ingestion, calculation engine, cascade recalculation, export rendering")
  System_Ext(vault, "Azure Key Vault / Secret Scopes", "Secrets")
  System_Ext(market, "S&P Capital IQ, Bloomberg", "External market and financial data APIs")
  System_Ext(internal, "Hyperion, Artemisa, SharePoint", "Internal Ecopetrol systems")

  Rel(analyst, web, "Uses", "HTTPS, browser")
  Rel(explorer, web, "Uses", "HTTPS, browser")
  Rel(executive, web, "Uses", "HTTPS, browser")
  Rel(admin, web, "Uses", "HTTPS, browser")
  Rel(web, bff, "Only client: relative /api/v1/* calls", "HTTPS, same origin, HttpOnly session cookie, JSON + SSE")

  Rel(bff, entra, "Signs users in, reads groups", "OIDC code + PKCE")
  Rel(bff, lakebase, "Reads / writes transactional data", "PostgreSQL")
  Rel(bff, sqlwh, "Runs analytical reads", "SQL, OAuth M2M")
  Rel(bff, vector, "Semantic search", "HTTPS")
  Rel(bff, volumes, "Reads sources, stores and streams artefacts", "HTTPS")
  Rel(bff, llm, "Generates narratives and assistant answers", "HTTPS")
  Rel(bff, jobs, "Starts jobs, follows job_id", "REST")
  Rel(bff, vault, "Reads secrets", "HTTPS")
  Rel(bff, market, "Fetches market data", "HTTPS")
  Rel(bff, internal, "Reads internal data", "HTTPS")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

| Knows | `eco-comparator-web` | `eco-comparator-bff` |
| --- | --- | --- |
| Purpose | Paint screens and interactions | Serve those screens, and nothing else |
| Knows about | Only the BFF HTTP contract | The contract and every external service |
| Business logic | None (locale formatting and interaction logic only) | Aggregation, derivations, authorization, orchestration |
| Downstream tokens and secrets | Never | Holds and uses them |

Related documents: `docs/architecture/c4-containers.md` (layers of the web app), `docs/design/view-data-contracts.md`
(the contract the web consumes), `docs/architecture/adr/0004-contract-consumption.md` (how the web consumes it).
