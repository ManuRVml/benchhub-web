## SCR-17 — 403 / 404 (error pages, brief §5.4, no prototype)

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary: none (brief §5.4, no prototype). Specification derived from standard error page patterns and ADR record.
  - Intent only (lose against `HTML`): README §5.4 `Error pages`; ADR-XX (record that no prototype exists).
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.17 (L497–498), §1.18, §1.19.
- Proposed route: `/403` (Forbidden), `*` (catch-all for 404 Not Found). Guard: none (public routes). No URL params.
  Header title: "403" or "404" (i18n key: `error.403.title`, `error.404.title`). No sidebar (error pages bypass shell).
- Layout:
  - Standalone page (no `Cmp:AppShell`).
  - Content root: single column, `gap:28px`, entry animation `fadeUp .3s ease`.
  - Error card: centered, `max-width:480px`, `padding:40px 24px`, `background:#fff`, `border:1px solid #DFE2E6`,
    `border-radius:12px`, `text-align:center`.
  - Icon: 64px circle `#F5F6F7`, error SVG (lock for 403, exclamation for 404) `#EF4444`.
  - Message: title `600 24px #1C2535`, description `400 14px #424E63`, line-height 1.5.
  - Back button: "‹ Volver" (`500 14px #672DBD`), hover underline, left margin 6px.
- Tabs: n/a
- Sections: top to bottom, one column.
  1. Error card — centered, icon circle, title, description, back button.
- Components:
  - `Cmp:ErrorPage` (layout wrapper, center alignment).
  - `Cmp:ErrorIcon` (403 lock SVG or 404 exclamation SVG, 64px circle `#F5F6F7`).
  - `Cmp:ErrorMessage` (title + description, i18n keys).
  - `Cmp:BackButton` ("‹ Volver", navigate to `/inicio`).
  - `Cmp:ErrorSkeleton` [inference: required by the brief "States" field].
- Charts: n/a
- Tables: n/a
- Filters & controls:
  - Back button: navigate to `/inicio` (home page).
  - No search or filters (static error pages).
- States:
  - Loading: skeleton error card [inference: no loading state; static pages render immediately].
  - Empty: not applicable (error pages always show content).
  - Error: not applicable (pages are static).
  - Forbidden: 403 page shown when user lacks permissions (handled by router or middleware).
  - Not Found: 404 page shown for unknown routes (handled by router).
  - Partial: not applicable (pages are atomic).
- Interactions:
  - Back button click → navigate to `/inicio`.
  - Keyboard: focusable back button with visible focus [inference: brief accessibility rules].
- Data fields: i18n keys (`error.403.title`, `error.403.description`, `error.404.title`, `error.404.description`).
  - Copy via i18n (es-CO), no backend data.
- Role visibility: per §1.19 (CF-39/40).
  - All roles: same error pages (public routes).
- Open questions / assumptions:
  - A1 — 403 and 404 pages share layout but differ in icon and message. Confirm with PO if a single generic error page
    suffices or distinct pages are required.
  - A2 — Error pages are static (no backend data). Confirm with PO if analytics events should fire on error display.
  - A3 — Back button navigates to `/inicio`. Confirm with PO if "last visited page" or "breadcrumb" navigation is preferred.
  - A4 — Copy is via i18n (es-CO). Confirm with PO if English fallback is needed.
