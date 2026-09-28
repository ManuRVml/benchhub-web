# STATUS — eco-comparator-web

- Current phase: Phase 7 — close-out.
- Contract version pinned: 0.1.0 (a0bc17428d1ab6d4017bdfab566f7e1bda687598bdf836ac61571996df69775b)
- Plan: ../../.plan/PLAN.md (workspace planning folder, outside this repo)

---

## Phases

### Phase 1 — Design analysis — DONE

- Repo: web
- Contract version: none yet (view-data contracts handed to the BFF lane for P2-B07 / Phase 2)
- Delivered: 17 screen inventories (docs/design/screen-inventory/, generated index), design tokens (DTCG json + md, 324 tokens),
  component catalogue (92 canonical components / 210 tags), 96 view-data contracts (55 A/O/V + 41 commands, generated index),
  navigation map (21 routes, role matrix), overlays OVL-01..16, mock-data catalogue A+B, KVI oracle (kvi.json + print-kvi),
  conflicts CF-01..87, open questions OQ-01..38, source coverage (188/188 files), reference images + 128 prototype renders + overlays.
- Decisions (ADR links): docs/architecture/adr/0001-source-precedence.md … 0009-ci-platform-and-responsive.md
- Deviations from prototypes: tracked in docs/design/conflicts.md (CF-01..87) and open-questions.md (defaults applied).
- Gate results: `pnpm gate:1` OK (16 PASS, 0 FAIL); `pnpm verify` (lint + typecheck + test) ✅; build n/a (no app code yet); e2e n/a.
- Closed after the gate: P1-26c (consistency checker, OQ-39) and P1-26d (NC-01..11 → CF-88..94 / OQ-40..43, reference index
  regenerated, 0 uncited sources); gate now 17 checks. Open: gate-1.md 1.4 copy into the BFF repo (P2-B07, BFF lane).
- Next: Phase 2 post-Gate-1 rows (P2-W01b runtime + harness UMD move, P2-W03 theme from tokens, P2-W04b Storybook,
  P2-W06 router, P2-W07 i18n), Phase 3 contract consumption once the BFF publishes v1.0.0.

---

### Phase 2 — Technical decisions and scaffolding — PARTIAL

- Repo: web
- Contract version: none (contract v0.1.0 pinned in P3-13, see Phase 3)
- Delivered: React 19 + Vite runtime; harness UMDs vendored with SRI check (P2-W01b, Sol 2); Tailwind v4 theme from tokens + cn() (P2-W03, Sol 2); FSD skeleton + typed router: 21 routes, guards, 17 lazy pages, ADR-0010 (P2-W06, Marco 2); i18n foundation es-CO: typed keys, page namespaces, literal-text lint, missing-key test (P2-W07, Iris 2); ESLint 10 + FSD boundaries + Prettier (P2-W02, Sol 2); Husky + lint-staged + commitlint + verify hooks (P2-W05, Kai 2); test runners (jsdom, Testing Library, MSW, Playwright) + Storybook 10 with a11y + Button primitive (P2-W04a, Sol 2); web tooling scaffold pre-Gate-1 (P2-W01a, Sol 2); AGENTS.md + CLAUDE.md pointer + README + checker (P2-W09, Iris 2).
- Decisions (ADR links): docs/architecture/adr/0002-styling.md, 0003-charts.md, 0005-state-and-url.md, 0006-icons.md, 0007-visual-regression.md, 0008-locale-formatting.md, 0009-ci-platform-and-responsive.md, 0010-routing.md
- Deviations from prototypes: none (Phase 2 is scaffolding, no prototype deviations)
- Gate results: `pnpm verify` ✅; `pnpm check:architecture` ✅; build n/a (no app code yet); e2e n/a.
- Closed after the gate: P2-W01a web tooling scaffold, P2-W01b React 19 + Vite runtime + harness UMD move, P2-W02 ESLint + FSD + Prettier, P2-W03 Tailwind theme, P2-W04a test runners + Storybook, P2-W05 Husky + hooks, P2-W06 router, P2-W07 i18n, P2-W09 AGENTS.md.
- Next: Phase 3 contract consumption (vendoring 0.1.0), Phase 5 web per screen / widget.

---

### Phase 3 — Contract v1 (web side: consumption) — DONE

- Repo: web
- Contract version: 0.1.0 (a0bc17428d1ab6d4017bdfab566f7e1bda687598bdf836ac61571996df69775b)
- Delivered: BFF contract v0.1.0 vendored + Orval types/Zod + contract:check (P3-13, Bruno 2); contract notes CF-95..CF-135 applied (P3-CN1..P3-CN6, Ren 2, Nova 2, Kai 2); Orval types/Zod schemas generated from OpenAPI spec.
- Decisions (ADR links): docs/architecture/adr/0004-contract-consumption.md
- Deviations from prototypes: none (contract-driven)
- Gate results: `pnpm verify` ✅; `pnpm check:architecture` ✅; `pnpm contract:check` ✅.
- Closed after the gate: P3-13 contract vendoring + Orval, P3-CN1..P3-CN6 contract notes application.
- Next: Phase 5 web per screen / widget.

---

### Phase 5 — Web per screen / widget — PARTIAL

- Repo: web
- Contract version: 0.1.0
- Delivered: 17 screens on main (git log --first-parent main): SCR-01..06 (P5-30, 60a2a50), SCR-07 (P5-36, 169eac1), SCR-08 (P5-40, 56081cf), SCR-09..14 (P5-47..P5-49, 6181eb8), SCR-15..17 (P5-57..P5-62, e599358); post-main work: task/P5-72A (a927778 C-01 create, 4ff8d9f SCR-14 download, 97b2846 stack critical flows); task/G3 (295d607, recalculation over O-02); task/G4 (72f2288, Yarbis mounted).
- Decisions (ADR links): docs/architecture/adr/0003-charts.md
- Deviations from prototypes: tracked in docs/design/conflicts.md (CF-01..CF-138); CF-138 eyebrow token resolved.
- Gate results: `pnpm verify` ✅; `pnpm check:architecture` ✅; e2e-mock ✅; visual regression 16/16 (task/P5-73, pending integration).
- Closed after the gate: P5-07 test ids, P5-06 formatters, P5-05 URL state + Zustand, P5-10 icons, P5-13 Badge/Chip, P5-11 buttons, P5-16 Modal/Toast, P5-18 div charts, P5-19 ECharts, P5-12 SectionCard, P5-14 tabs, P5-15 inputs, P5-17 DataTable, P5-22 CommentThread, P5-23 composites, P5-TK1..TK3 tokens.
- Next: Phase 6 quality and CI, Phase 7 documentation.

---

### Phase 6 — Quality and CI — PARTIAL

- Repo: web
- Contract version: 0.1.0
- Delivered: CI pipeline verify → contract:check → E2E vs bff mock image → publish versioned dist/ (on task/P6-02, b041fa8, pending integration); coverage and architecture gates (on task/P6-04, 1adb20b): 91.74%, 2123 tests (pending integration); visual regression baselines vs docs/design/screenshots + tolerance (on task/P5-73, 8f65e8f, ADR-0011, 16/16 twice, pending integration).
- Decisions (ADR links): docs/architecture/adr/0011-visual-regression.md
- Deviations from prototypes: none
- Gate results: `pnpm verify` ✅; `pnpm check:architecture` ✅; e2e-mock ✅; visual regression 16/16 (task/P5-73); coverage 91.74% (2123 tests, task/P6-04).
- Closed after the gate: P6-02 web CI pipeline, P6-04 gate hardening.
- Next: wire screen components to data sources via ports/adapters, implement data flow patterns.

---

### Phase 7 — Documentation — PARTIAL

- Repo: web
- Contract version: 0.1.0
- Delivered: C4 context/containers diagrams + adding-a-screen guide + check-docs (P7-03a, Bruno 2); AGENTS.md aligned with layout, definition of done and guides (P7-04, Nova 2); design system, testing and contract workflow guides (P7-03, Bruno 2).
- Decisions (ADR links): docs/architecture/adr/0011-visual-regression.md (mask allowlist + tolerance)
- Deviations from prototypes: none
- Gate results: `pnpm verify` ✅; `pnpm check:architecture` ✅; visual regression 16/16 twice (task/P5-73, 8f65e8f); coverage 91.74% (2123 tests, task/P6-04, 1adb20b).
- Closed after the gate: P7-03a C4/context + guides, P7-04 AGENTS.md alignment.
- Next: P7-05 web AGENTS.md, P7-06 docs index, P7-07 roadmap.

---

## Done

- P1-01 repo bootstrap
- P1-02 ADR-0001 source precedence + conflicts.md CF-01..86 (Nova 2)
- P1-03a offline prototype render harness + 128 reference renders, SCR-01..16 × 4 widths (Iris 2)
- P1-04 reference image catalogue (Kai 2) — 22 sRGB PNGs
- P1-05 design tokens (DTCG) + schema + hex checker (Sol 2) — 324 tokens, 84 hex covered
- P1-06 design-tokens.md companion + coverage check (Nova 2)
- P1-07 screen inventory SCR-01..04 (Marco 2)
- P1-08 screen inventory SCR-05 / SCR-06 (Bruno 2)
- P1-09 screen inventory SCR-07 Definición wizard (Marco 2)
- P1-10a screen inventory SCR-08 Resultados part A, frame + modules 1-2 + horizon states (Bruno 2)
- P1-14 screen inventory SCR-12 Sensibilidades (Bruno 2)
- P1-16 screen inventory SCR-15/16/17 + overlays.md OVL-01..16 + toasts (Kai 2)
- P1-22 mock-data catalog part A (Ren 2)
- P1-23 mock-data catalog part B (Ren 2) — KVI derivation traced to Excel D4 after revision 2
- P1-10b SCR-08 modules 3, 4, 10, 11 (Bruno 2)
- P1-13b KVI oracle kvi.json + print-kvi.mjs (Ren 2) — recomputes 96,15 / 78,56 / 143,49 from Excel D4 rows
- P1-24a design index generator + generated screen-inventory.md (Nova 2)
- P1-25 open questions & decisions log OQ-01..32, Owner = PO (Kai 2, after 2 revisions)
- P1-15a screen inventory SCR-13 / SCR-14 Presentaciones (Marco 2)
- P1-11 SCR-08 gated modules 5-9 (Bruno 2)
- P1-03b overlay renders OVL-01..14 incl. unreachable OVL-04 via state injection (Iris 2)
- P1-12a SCR-09 Visualización + report lifecycle [proposed] (Bruno 2)
- P1-13a SCR-11 Monitor de Valor, all 22 KVIs (Sol 2)
- P1-15b slide-renderer.md, 14 slide kinds (Marco 2)
- P2-W08 web ADR set 0002-0009 + README index (Nova 2)
- P1-12b SCR-10 Detalle de indicador (Iris 2) — all 17 screens inventoried
- P1-19 view-data contracts part B, V-09..V-24 (Bruno 2)
- P1-20a view-data contracts part C, V-27..V-47 (Marco 2)
- P2-W05 Husky + lint-staged + commitlint + verify — hooks active, bad messages rejected (Kai 2)
- P1-17 component catalogue, 92 canonical components covering 210 inventory tags (Bruno 2)
- P1-24b design index generator: contract headings + endpoint cells (Kai 2)
- P1-20b command contracts C-01..C-41 (Nova 2)
- P1-26a Gate-1 backlog reconciliation: CF-87, OVL-16 trigger, 22 KVI rows, OQ-33..38 (Bruno 2)
- P1-18 view-data contracts part A + check-view-contracts.mjs (Iris 2) — 96 contracts total (A/O/V/C)
- P1-24c Gate-1 source coverage: 188 files indexed and classified (Marco 2)
- P1-21 navigation map + route/role checker (Ren 2 + Marco 2)
- P2-W02 ESLint 10 + FSD boundaries + Prettier (Sol 2)
- P1-26b Gate-1 checklist + pnpm gate:1 (Bruno 2)
- P1-26c design consistency checker + report, 4 reference errors fixed, OQ-39 (Iris 2)
- P2-W01b React 19 + Vite runtime; harness UMDs vendored with SRI check (Sol 2)
- P2-W09 AGENTS.md + CLAUDE.md pointer + README + checker (Iris 2, escalated from Kai 2)
- P2-W03 Tailwind v4 theme generated from design tokens + cn() (Sol 2)
- P2-W07 i18n foundation es-CO: typed keys, page namespaces, literal-text lint, missing-key test (Iris 2)
- P2-W06 FSD skeleton + typed data router: 21 routes, guards, 17 lazy pages, ADR-0010 (Marco 2)
- P5-07 test ids + data-state helpers + SectionBoundary (Iris 2)
- P3-CN1 BFF contract notes: CF-95 (SectionResult errorCode), CF-96 (usd_b), docs/design/unit-codes.md (Ren 2)
- P5-06 es-CO display formatters (Iris 2, rescued from Ren 2)
- P7-03a C4 context/containers + adding-a-screen guide + check-docs (Bruno 2, escalated from Kai 2)
- P5-I01 login namespace seeded from SCR-01 (Kai 2)
- P5-I16 settings namespace seeded from SCR-16 (Nova 2)
- P2-W04a test runners (jsdom, Testing Library, MSW, Playwright) + P2-W04b Storybook 10 with a11y + Button primitive (Sol 2)
- P5-05 typed URL state (useTypedSearchParams, zod) + Zustand UI stores (Marco 2)
- P5-I15 notifications, P5-I03 admin namespaces (Ren 2, Nova 2)
- P5-10 prototype icon set: 27 icons extracted + generated, check-icons (Bruno 2, escalated from Nova 2)
- P5-I02 access-gate namespace (Kai 2)
- P5-I06 analyses (Ren 2), P5-I14 presentation-detail (Nova 2) namespaces
- P5-13 Badge (status/severity/tier/coverage/horizon/urgency/TBD) + Chip / ToggleChip / FilterChipGroup (Iris 2)
- P5-I10 indicator-detail (Kai 2), P5-I09 analysis-report (Nova 2) namespaces
- P5-I05 home (Ren 2), P5-I13 presentations (Nova 2), P5-I12 sensitivities (Kai 2), P5-I07 analysis-definition (Ren 2) namespaces
- CF-97..CF-106 decisions on the 27 BFF contract divergences (Pia)
- P5-11 button family (forward, dashed, gradient, cyan) + IconButton + AiPill (Bruno 2); CF-113/114 contrast
- P3-CN2 contracts apply CF-97..CF-106 (Nova 2); CF-107..CF-112 decided
- P5-I08 analysis-results namespace (Kai 2)
- P5-16 Modal / Toast system / Popover (Marco 2)
- P5-18 div chart primitives: ProgressBar, PairedBarRow, StackedShareBar, RankingBarRow, WinMiniBar (Iris 2)
- P5-I11 value-monitor namespace (Nova 2)
- P5-19 ECharts wrapper + GroupedBarChart (Bruno 2); P5-23a company colour map (Ren 2); P5-I08b (Kai 2)
- P3-CN3 contracts apply CF-107..CF-112 (Nova 2); CF-115..CF-122 decided
- P3-13 contract 0.1.0 vendored + Orval types/Zod + contract:check (Bruno 2)
- P5-14 tabs/stepper/accordion (Iris 2); P5-15 inputs with es-CO NumberInput (Marco 2)
- P5-TK1 size tokens, P5-I13b (Nova 2); CF-115..CF-127 decided
- P5-01 fetch httpClient (Zod-validated responses, CSRF from /session, X-Trace-Id, ApiError) + ServiceContainer (Iris 2)
- P3-CN4 / P3-CN5 contracts apply CF-115..CF-135 (Kai 2); P5-10s icon gallery (Ren 2)
- P5-12 SectionCard + InfoToggle + single-open InfoGroup (Marco 2); P5-06b parser moved to lib/format (Kai 2)
- P5-TK2 size tokens in components (Nova 2); P5-07s SectionBoundary stories (Kai 2); P3-CN6 V-36 (Kai 2)
- P2-W01a web tooling scaffold, pre-Gate-1 (Sol 2) — TS 7.0.2, vitest 5, no app code

---

## In progress

- P5-02 ports + HTTP adapters (Iris 2); P5-17 DataTable (Sol 2); P5-22 CommentThread (Marco 2); P5-23 composites (Bruno 2)
- Qwen: P5-TK3 eyebrow token CF-138 (Kai 2); P5-FX1 contract fixtures fix (Ren 2)

---

## Pending (Phase 1)

- After Gate 1: contract hand-off to the BFF (P2-B07)

---

## Follow-ups

- parseEsCoNumber lives in shared/ui/primitives/inputs (P5-15); move to shared/lib/format; NumberInput md width 72px has no token

---

## Blockers

- none
