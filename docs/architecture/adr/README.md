# Architecture Decision Records — eco-comparator-web

Each ADR records one decision with its context, alternatives and consequences. Brief line references point to
`prompt_Start_Eco.md` (the master brief, outside this repository). New ADRs take the next free number and are added to
this table; superseded ADRs keep their file and change status to `Superseded by ADR-NNNN`.

| ID | Title | Status |
|---|---|---|
| [0001](0001-source-precedence.md) | Source Precedence | Approved |
| [0002](0002-styling.md) | Styling — Tailwind CSS v4, CSS-first tokens | Accepted |
| [0003](0003-charts.md) | Charts — Apache ECharts with CSS primitives | Accepted |
| [0004](0004-contract-consumption.md) | Contract consumption — vendored tarball, Orval-generated types | Accepted |
| [0005](0005-state-and-url.md) | State and URL — TanStack Query, Zustand, useTypedSearchParams | Accepted |
| [0006](0006-icons.md) | Icons — Inline 20x20 stroke SVGs, no icon font | Accepted |
| [0007](0007-visual-regression.md) | Visual regression — baselines from prototype renders, Playwright screenshot tests | Accepted |
| [0008](0008-locale-formatting.md) | Locale and formatting — es-CO via Intl, format library only | Accepted |
| [0009](0009-ci-platform-and-responsive.md) | CI platform and responsive policy — GitHub Actions, responsive breakpoints | Accepted |
| [0010](0010-routing.md) | Routing — React Router data mode, typed route table, guards as loaders | Accepted |
| [0011](0011-visual-regression-baselines.md) | Visual regression baselines — own renders, frozen clock, mask allowlist | Accepted |
| [0012](0012-mock-adapters-out-of-http-builds.md) | Mock adapters out of http builds — separate mock entry, compile-time branch, bundle check | Accepted |
