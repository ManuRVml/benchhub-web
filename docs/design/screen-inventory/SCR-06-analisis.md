## SCR-06 — Análisis (list "Todos los análisis creados")

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary (precedence 1): `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` template L383–443 (screen block `isAnalisis`); logic:
    `ANALISIS_LIST` L3261–3265, initial filter state L3589, `publishedAnalyses` flip L3599/L3678, sidebar entry
    `navRefTbgIlp` L3823–3828 (label L176), `ESTADO_COLORS` + rows + filter options + filtering + empty/active flags
    L4740–4763, title map `analisis:'Análisis'` L5156, "Ver todos ›" entry `goAnalisis` L5189, bindings L5198–5203,
    `isAnalisis` L5214, rows binding L5297.
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador/README.md` §6 "Análisis";
    `design_handoff_benchud_comparador/BACKEND.md` L43 (status enum incl. `en_construccion`) and L154
    (`GET /analyses?q=&fecha=&creador=&estado=`).
  - Reference images: none. No Paquete image covers this screen, and `design_handoff_benchud_comparador/screenshots/05-analisis-list.png`
    and `03-analisis.png` are mislabelled (they show the Dashboard, `03-reference-images.md` H5/H7; repo copies
    `docs/design/screenshots/reference/ho-05-analisis-list.png`, `ho-03-analisis.png` must not be used as SCR-06 baselines). The visual baseline is the
    P1-03 render of `HTML`.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.6 (L195–211), §1.19; `02-prototype-html.md` §3 `SCR-05 Análisis
    (list)` (the 02 file numbers screens differently), §5, §7, §8.
- Proposed route: `/analisis?q=&fecha=&creador=&estado=&ref=&page=` — all filters live in the URL (defaults = absent param =
  "todos"). `ref=tbg-ilp` is set by the sidebar item "Ref. TBG I ILP" (HTML L176, L3824; CF-78 label verbatim) and only drives
  the active-nav highlight in v1 (OQ-03). `page` [inference: `V-04` pages with `page=1,pageSize=20`; V2 has no pagination].
  Guard: authenticated and role ≠ executive_viewer (locked → SCR-17 `/403`, §1.19). Header title: "Análisis" (L5156).
  Sidebar active item: "Ref. TBG I ILP" when `ref=tbg-ilp`, otherwise none (the V2 sidebar has no "Análisis" item — CF-01,
  OQ-01).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04). No analysis tab bar (`showAnalysisTabs` excludes `analisis`, L3796).
  - Content root: block with `fadeUp .3s ease` (L384).
  - Toolbar row: flex space-between, `margin-bottom:20px` (L385): left title "Todos los análisis creados" (`<b>` inside
    `400 14px #59667C`, L386); right primary button "+ Crear nuevo análisis" (padding `10px 16px`, radius 8, `#672DBD`, white
    `500 13px`, L387).
  - Filter row: flex wrap, gap 10, `margin-bottom:16px` (L390): search input `flex:1; min-width:220px` (padding `9px 14px`,
    `1px solid #DFE2E6`, radius 8, `400 13px`, L391) + 3 selects (padding `9px 12px`, same border, `400 13px #424E63`,
    L392–409) + conditional link "Limpiar filtros" (`500 13px #672DBD`, L411).
  - Table card: `#fff`, `1px solid #DFE2E6`, radius 12, `overflow:hidden` (L415). Grid columns
    `minmax(0,2.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 110px`, gap 12 (L416, L424). Header row padding `10px 20px`,
    bg `#F5F6F7`, `600 11px #808A9B` uppercase `letter-spacing:.04em`. Body rows padding `14px 20px`, bottom border
    `1px solid #F5F6F7`.
- Tabs: n/a
- Sections: top to bottom.
  1. Toolbar: "Todos los análisis creados" (L386) + "+ Crear nuevo análisis" (L387).
  2. Filter bar: search placeholder "Buscar por nombre o descripción..." (L391); select "Fecha: todas" (L393); select
     "Creador: todos" (L399); select "Estado: todos" (L405); "Limpiar filtros" when any filter is active (L410–412).
  3. Analyses table: header "Nombre del análisis" · "Fecha de creación" · "Creado por" · "Estado" · (empty action column)
     (L417); rows (L422–440) with an expandable description row under each (L436–438); empty row (L419–421).
  4. Pagination footer below the table [inference: only when `V-04` returns more than one page; not in V2].
- Components:
  - Shell (owned by SCR-04): `Cmp:AppShell`, `Cmp:SidebarNav`, `Cmp:AppHeader`, `Cmp:YarbisFab`, `Cmp:YarbisChatPanel`
    (OVL-14).
  - `Cmp:PageToolbar` (title + actions slot).
  - `Cmp:Button` (variant primary: "+ Crear nuevo análisis", size sm: "Ver detalle").
  - `Cmp:SearchInput`, `Cmp:SelectFilter` (first option = "all" label), `Cmp:LinkButton` ("Limpiar filtros").
  - `Cmp:DataTable` (CSS-grid table with header row, body rows, empty row, optional expandable detail row).
  - `Cmp:InfoToggleButton` (15px variant in the name cell) + `Cmp:ExpandableRowDetail` (description row `#F5F6F7`).
  - `Cmp:StatusChip` (analysis status variants).
  - `Cmp:EmptyState` (table-row variant), `Cmp:TableSkeleton`, `Cmp:SectionError`, `Cmp:Pagination` [inference: states and
    paging required by the brief; no prototype counterpart].
- Charts: n/a
- Tables:
  - Analyses table. Columns (L417, L426–433):
    1. "Nombre del análisis": name `600 13px` (dark) + 15px info "i" (`#518CD1`) that toggles the description row
       (`400 12px #424E63` on `#F5F6F7`, bottom border `#DFE2E6`, L437). One description open at a time (shared
       `chartInfoOpen` key `analisis{i}`, L4746).
    2. "Fecha de creación": `400 13px #59667C`, format `DD mmm YYYY` es-CO lower-case month, e.g. "03 oct 2025" (L3262).
    3. "Creado por": full name `400 13px #59667C`.
    4. "Estado": pill chip `600 11px`, padding `4px 10px` (L431); colours (L4740): "En revisión" `#FEF3C7`/`#92400E`,
       "Publicado" `#D1FAE5`/`#047857`, "Borrador" `#F5F6F7`/`#59667C` (also the fallback); plus "En construcción" amber
       [inference: BACKEND L43 enum `en_construccion`; colour from the `status.inProgress` token, KPI `#FBBF24` on SCR-05].
    5. Action (110px, right-aligned, no header label): button "Ver detalle" (`#672DBD`, white `500 12px`, padding `8px 12px`,
       L433).
  - Mock rows (L3262–3264, in this order):
    - "Desempeño comparativo — 4T 2025" · "03 oct 2025" · "Camila Bravo" · "En revisión" — description "Referenciamiento
      competitivo trimestral de Ecopetrol frente a pares del sector energético en solvencia, rentabilidad, liquidez, OPEX y
      crecimiento."
    - "Análisis anual 2024 vs. pares" · "14 ene 2025" · "Jorge Salas" · "Publicado" — "Comparación anual de indicadores
      financieros y operativos frente al grupo de pares del sector energético."
    - "Sensibilidad ROACE — Escenario optimista" · "22 ago 2025" · "Camila Bravo" · "Borrador" — "Simulación de productividad
      y costos operativos para evaluar el cierre de brecha en ROACE frente a pares."
  - Order: V2 keeps source order (no sort UI, `02-prototype-html.md` §7). Default server order = creation date descending
    [inference; would reorder the mock to 03 oct 2025, 22 ago 2025, 14 ene 2025 — PO to confirm or keep fixture order for
    parity].
  - Filtering: see Filters & controls. Grouping / totals: none. Pagination: none in V2; server page size 20 [inference].
  - The status of a row flips to "Publicado" after a publish in the session (L4742, `publishedAnalyses`), i.e. the list reads
    fresh status from the BFF after `C-09` [inference: query invalidation].
- Filters & controls: all state lives in the URL; a change replaces the history entry and resets `page` [inference].
  - Search `q`: free text, default empty; case-insensitive substring match on name **or** description (L4754–4756);
    placeholder "Buscar por nombre o descripción..."; debounced before updating the URL [inference: 300 ms].
  - `fecha` select: "Fecha: todas" (value empty) + distinct creation dates of the visible analyses (V2: "03 oct 2025",
    "14 ene 2025", "22 ago 2025", L4751); exact-match filter (L4757).
  - `creador` select: "Creador: todos" + distinct creators (V2: "Camila Bravo", "Jorge Salas", L4752); exact match (L4758).
  - `estado` select: "Estado: todos" + distinct statuses present (V2: "En revisión", "Publicado", "Borrador", L4753); exact
    match on the current status (L4759). The URL carries the status id, not the label [inference].
  - Options come from `V-04 filterOptions` (computed by the BFF over what the user can see) [inference: V2 derives them
    from the list itself].
  - "Limpiar filtros": visible when `q`, `fecha`, `creador` or `estado` is set (`analisisFiltersActive`, L4762); clears
    the four (L4763) and keeps `ref`.
  - `ref` (`tbg-ilp` or absent): not a visible control; no filtering effect in v1 (OQ-03).
- States:
  - Loading: toolbar and filter bar render immediately; table body shows skeleton rows (3) [inference].
  - Empty (filtered) `analisisEmpty` (L419–421, L4761): "No se encontraron análisis con los filtros aplicados." centred,
    `400 13px #98A1B0`, padding `32px 20px`; header row stays; "Limpiar filtros" stays visible.
  - Empty (no analyses at all, no filters): same row with a no-data message [inference: copy missing in `HTML`, to be defined
    in i18n; analysts still see "+ Crear nuevo análisis"].
  - Error: `Cmp:SectionError` inside the table card with retry; filters stay usable [inference].
  - Forbidden: executive_viewer → route guard redirects to `/403` (SCR-17) [inference: §1.19 lock; V2 has no permission
    screen]. `permissions.canCreate = false` hides "+ Crear nuevo análisis".
  - Partial: n/a (single data source `V-04`).
  - Proactive Yarbis tip: none (`PROACTIVE` has no `analisis` key, L3224–3237; `addProactive('analisis')` is a no-op).
- Interactions:
  - "+ Crear nuevo análisis" → `C-01 POST /api/v1/analysis-drafts` → navigate to `/analisis/:draftId/definicion?paso=1`
    (V2: `goDefinicionNuevo` opens the wizard with an empty name, L5203).
  - "Ver detalle" → analyst_creator: `/analisis/:analysisId/resultados` (V2 `onEnter`, L4747, sets the analysis name used in
    the header "Resultados · {analysisName}"); consumers: `/analisis/:analysisId/visualizacion` [inference: §1.6 + §1.19;
    decided per row by `canOpenResults`]. README row actions "Editar" / "Ver resultado" are not rendered (CF-34); editing
    goes through the "Configuración" tab of the analysis (V2 `onEdit` L4748 exists without a button).
  - Info "i" in a row → expands / collapses the description row below it (click toggle; opening another closes the first).
  - Filter changes → URL update → refetch `V-04`; browser back/forward restores filters [inference].
  - Sidebar "Ref. TBG I ILP" → `/analisis?ref=tbg-ilp` (V2 also sets `qualHorizonte:'tbg'` for later Resultados, L3824).
  - Yarbis FAB → chat panel titled with the screen title (OVL-14) for roles with `canUseAssistant`.
- Data fields: `V-04 GET /api/v1/views/analyses?q&createdOn&createdBy&status&ref&page&pageSize`.
  - `items[]` (`Page<AnalysisRow>`): `id` (branded id), `name` (string), `description` (string), `createdOn` (ISO date →
    `DD mmm YYYY` es-CO), `createdBy` (`{id, fullName}`), `status` (enum `draft | in_progress | in_review | published`
    → i18n labels "Borrador" / "En construcción" / "En revisión" / "Publicado"), per-row `canOpenResults` (boolean).
  - `page`, `pageSize`, `total` (integers).
  - `filterOptions`: `createdOn[]` (ISO dates), `createdBy[]` (`{id, fullName}`), `status[]` (enum values present).
  - `permissions.canCreate` (boolean).
  - URL ↔ API mapping: `q`→`q`, `fecha`→`createdOn`, `creador`→`createdBy` (user id), `estado`→`status`, `ref`→`ref`
    [inference: URL params keep the Spanish names of §1.6; the contract uses English field names].
- Role visibility: per §1.19 (CF-39).
  - analyst_creator: all analyses including drafts and in-review; "+ Crear nuevo análisis" visible; "Ver detalle" →
    Resultados.
  - explorer_viewer / explorer_integral: published analyses only (OQ-05); no create button; "Ver detalle" → Visualización.
  - executive_integral: published + invited previews; no create button; "Ver detalle" → Visualización (previews per
    `canOpenResults`).
  - executive_viewer: screen locked (sidebar entry "Ref. TBG I ILP" shown locked, direct URL → `/403`).
  - `hasAdminAccess` does not change this screen.
- Open questions / assumptions:
  - A1 — OQ-03: `ref=tbg-ilp` has no filtering effect in v1 (only the active nav highlight); if PO wants it to filter by
    analysis type (Referentes estratégicos / TBG-ILP), `V-04` already accepts `ref`.
  - A2 — OQ-01 / CF-01: the list is reached only via the sidebar "Ref. TBG I ILP" and Inicio "Ver todos ›"; no "Análisis" nav
    item (README) is added.
  - A3 — Pagination and default sort are not in V2; proposed server paging (20) and creation date descending — the fixture
    has only 3 rows, so the parity render is unaffected except for row order (PO to confirm order).
  - A4 — "En construcción" status exists in BACKEND and on the Inicio KPIs but has no row in the V2 mock nor a chip colour in
    `ESTADO_COLORS`; proposed amber chip.
  - A5 — Empty copy for the no-analyses-yet case (no filters) is missing in `HTML`; needs PO copy.
  - A6 — Header title is "Análisis" while the page title is "Todos los análisis creados"; both kept (V2).
  - A7 — Filter option lists are computed server-side over the user's visible analyses (explorers must not see creators of
    drafts they cannot open) [inference].
