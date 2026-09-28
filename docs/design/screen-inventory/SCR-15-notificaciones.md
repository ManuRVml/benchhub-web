## SCR-15 — Notificaciones (header title "Notificaciones")

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary (precedence 1): `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` template L2943–2990 (screen block `isAlertas`);
    logic: `ALERTS` L3486–3498, `alertItems` L4973; `ALERTS` contains 11 notification items with severity types.
  - Reference image: `HO/screenshots/09-notificaciones.png` (older-HTML state: label "TIPO"; P9 in
    `.plan/source-map/03-reference-images.md` §3.11); repo copy `docs/design/screenshots/reference/ho-09-notificaciones.png`.
  - V2 screenshots (fade-in frames, 916×540): `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/09-notificaciones.png`.
  - Intent only (lose against `HTML`): README §13 `Notificaciones`; BACKEND Notificación contract.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.15 (L478–488), §1.18, §1.19; `02-prototype-html.md` §2 `SCR-15 Alertas`.
- Proposed route: `/notificaciones?q=&severidad=`. Guard: authenticated (all 5 roles). URL params: `q` (search term),
  `severidad` (multi-select array of severities: `info`, `success`, `warn`, `error`). Sidebar active item: "Notificaciones"
  (sidebar row HTML L194–205, colours from `navState` L3808–3819, active bg `#7C35EA`, CF-28; CF-94). Header title:
  "Notificaciones" (title map HTML L5156; nav label and header title match).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04: sidebar 220/68 px, 4px gradient strip + 64px header, content `padding:28px 32px 100px`,
    `overflow:auto`). No analysis tab bar on this screen (`showAnalysisTabs` only for definicion/resultados/presentaciones,
    HTML L3796).
  - Content root: single column, `gap:28px`, entry animation `fadeUp .3s ease` (HTML L2943; keyframes L29).
  - Search bar: `max-width:760px`, `padding:12px 16px`, `border-radius:8px`, `border:1px solid #DFE2E6`, `background:#fff`.
    Placeholder: "Buscar notificaciones..." (`400 14px #98A1B0`).
  - Severity filter chips: horizontal layout, `gap:8px`, selected chip `#672DBD` background, white text, `padding:6px 12px`,
    `border-radius:20px`, `600 12px`; unselected `#F5F6F7` background, `#424E63` text, `500 12px`.
  - Notification list: `max-width:760px`, cards with `border-left:3px solid {severity-color}`, 34px icon circle `#F5F6F7`
    with type SVG, type eyebrow (Dato, Comentario, Publicación, Yarbis, Noticia, Colaboración, Sistema), text `500 13px`,
    relative time, severity tag (info `#47A4D5`/`#E9F1FD` "INFO"; success `#10B981`/`#D1FAE5` "OK"; warn `#FBBF24`/`#FEF3C7`
    "ATENCIÓN"; error `#EF4444`/`#FEE2E2` "CRÍTICO").
  - Empty state: "No hay notificaciones que coincidan con la búsqueda o los filtros." (`400 14px #98A1B0`).
- Tabs: n/a
- Sections: top to bottom, one column.
  1. Search and filter row — search input (max-width 760px) + severity filter chips (horizontal, all selected by default).
  2. Notification list — cards with severity border, icon circle, type eyebrow, text, relative time, severity tag; max-width 760px.
  3. Empty state — centered when search/filters yield no results.
- Components:
  - Shell (owned by SCR-04): `Cmp:AppShell`, `Cmp:SidebarNav`, `Cmp:AppHeader`.
  - `Cmp:SearchInput` (search bar with placeholder, debounce 300ms, clear button).
  - `Cmp:SeverityFilterChips` (multi-select chips: Info, OK, Atención, Crítico).
  - `Cmp:NotificationCard` (left border severity color, 34px icon circle, type eyebrow, text, relative time, severity tag).
  - `Cmp:NotificationIcon` (type-based SVG: Dato, Comentario, Publicación, Yarbis, Noticia, Colaboración, Sistema).
  - `Cmp:SeverityTag` (4 variants: info `#47A4D5`/`#E9F1FD`, success `#10B981`/`#D1FAE5`, warn `#FBBF24`/`#FEF3C7`,
    error `#EF4444`/`#FEE2E2`).
  - `Cmp:EmptyState` (inline muted text variant).
  - `Cmp:NotificationSkeleton`, `Cmp:NotificationError` [inference: required by the brief "States" field].
- Charts: n/a
- Tables: n/a
- Filters & controls:
  - Search input: debounce 300ms, filters notifications by title/description content. Not in URL until user types.
  - Severity chips: multi-select (all selected by default), filters by severity type. Selected `#672DBD`/white (CF-15).
    Not in URL until user selects (ephemeral UI state).
  - No pagination visible in V2 prototype; list scrolls vertically.
- States:
  - Loading: skeleton cards (11 items, matching mock) [inference: `V-44` returns notifications as array; no loading state in
    V2, only the mount fade].
  - Empty: "No hay notificaciones que coincidan con la búsqueda o los filtros." when search or filters yield no results.
  - Error: notification fetch fails → `Cmp:NotificationError` with retry [inference: brief §5 notification list independence].
  - Forbidden: not applicable at page level (all roles); individual notifications returned as `forbidden` are hidden
    [inference].
  - Partial: any subset of notifications returned successfully renders; failed fetch shows error state [inference].
  - Read state: each notification has `leida` boolean; unread items show a badge (dot or number) [inference: driven by
    BACKEND `leida` field].
- Interactions:
  - Search input → update filter term (debounce 300ms), re-filter list.
  - Severity chip click → toggle selection, re-filter list.
  - Notification card click → open notification details (route TBD, likely `V-44` endpoint or overlay) [inference].
  - Mark as read: opening the page marks all visible notifications as read [inference: `leida` update].
  - Keyboard: focusable search input, chips, cards with visible focus [inference: brief accessibility rules].
- Data fields: `V-44 GET /api/v1/views/notifications`, `C-35 PATCH /api/v1/notifications/:notificationId/read` (mark one
  as read), `C-36 POST /api/v1/notifications/read-all` (mark all as read). Field names below are this inventory's proposal; the
  V-44 contract supersedes them (`text`, `createdAt`, `isRead`, `target` instead of `title`/`description`, `timestamp`,
  `leida`, `relatedEntityId`).
  - `notifications[]`: `id` (string), `title` (string), `description` (string), `type` (enum: `dato`, `comentario`,
    `publicacion`, `yarbis`, `noticia`, `colaboracion`, `sistema`), `severity` (enum: `info`, `success`, `warn`, `error`),
    `timestamp` (ISO datetime → relative es-CO text like "hace 3 días", "hoy"), `leida` (boolean), `relatedEntityId`
    (optional, for routing on click).
  - Severity colors: info `#47A4D5`/`#E9F1FD`, success `#10B981`/`#D1FAE5`, warn `#FBBF24`/`#FEF3C7`, error `#EF4444`/`#FEE2E2`
    [from spec].
- Role visibility: per §1.19 (CF-39/40).
  - analyst_creator: whole screen; all notification types visible.
  - explorer_viewer / explorer_integral: whole screen; notification visibility per published content they can access.
  - executive_viewer: whole screen; notification visibility per published content they can access.
  - executive_integral: whole screen; all notification types visible.
  - `hasAdminAccess` does not change this screen.
- Open questions / assumptions:
  - A1 — Notification types beyond those in the prototype (Dato, Comentario, Publicación, Yarbis, Noticia, Colaboración, Sistema)
    are inferred from the prototype's type SVG icons. Confirm with PO if additional types exist.
  - A2 — The "Buscar notificaciones..." placeholder is inferred from the spec's search requirement. V2 prototype may not
    explicitly show this text.
  - A3 — Read state (`leida` field) drives the badge (unread count). Confirm with PO if badges show on the nav item,
    card, or both.
  - A4 — Notification click behavior (open overlay vs navigate to detail page) is not specified in V2. Track in open-questions
    log.
  - A5 — Severity filter default: all selected (per spec). Confirm with PO if default should be "crítico" or "recent".
  - A6 — Search filters by title/description content. Confirm with PO if it should also filter by type/severity labels.
  - A7 — The 11 mock items count is from the prototype. Actual BFF response may vary per user.
