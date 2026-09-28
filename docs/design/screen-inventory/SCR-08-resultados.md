## SCR-08 — Resultados · {analysisName}

> Part A (P1-10a): frame, analysis tabs, horizon segmented control, action row, Hallazgos de IA rail, footer actions and
> modules 1–2. Modules 3–4 and 10–11 are specified in P1-10b; scope-gated modules 5–9 (PQ-only) in P1-11.
> `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (`Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, each with an `HTML Lnnn` pointer; anything not literally in
> `HTML` carries `[inference]` or `[Paquete:<file name>]`. Template bindings and strings resolved from mock data are written
> in code spans (`{{ … }}` or the resolved text) with the line of the template or data. Components are tagged
> `Cmp:PascalName` (reconciled by P1-17). `CF-nn`, `OQ-nn`, `V-nn`, `C-nn`, `O-nn`, `OVL-nn` refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4, §1.18 and `docs/design/conflicts.md` / `docs/design/overlays.md`.
> Module numbers follow the merged order of synthesis §1.8 (CF-03): 1 action row · 2 Detalle y edición · 3 Comparativo GE
> vs. Promedio Pares · 4 PVC · 5–9 scope-gated PQ modules · 10 Resumen del informe · 11 footer.

- Source files:
  - Primary (precedence 1): `HTML` template L720–1078 (screen block `isResultados`): grid frame L721–722, action row
    L723–727, module 2 L730–854, modules 3–4 L857–1002 (P1-10b), module 10 + footer inside the second
    `showOtherResCards` block L1003–1058, Hallazgos rail L1063–1076; analysis tab bar L238–244 (logic `ANALYSIS_TABS`
    L3779–3796); undo toast L3101–3106. Logic: `QUAL_DATA` L3364–3420 (11 companies), `QUAL_ILP_DATA` L3421–3457 (7
    companies, "hito" items), initial state L3573–3577 (`qualHorizonte:'tbg'`, `qualUnionCompanyId:'shell'`),
    `analysisName` default L3616, `removeHomCompany` / undo L3667–3675, `HOM_POOL` L4334–4345, `HOM_LOGO_COLORS` L4346,
    coverage cards / KPIs / insights L4347–4412, `QDIM_COLORS` L4419, `qualComputed` L4422, edit groups + save / cancel
    L4432–4466, horizon tabs + union state L4501–4530, `hallazgosIA` L4837–4843, `TBGILP_METRICS` (ILP rows) L5049–5114,
    `ilpDimGroups` L5115–5118, title map `resultados:'Resultados · '+s.analysisName` L5156, bindings L5194, L5214,
    L5232–5243, L5266–5270 (`showOtherResCards`, `horizonteModuleTitle`), narrative sections L5299–5326, `PROACTIVE.resultados`
    L3227. Sidebar entry "Ref. Competitivo" → this screen, `navRefCompetitivo` L3829–3834.
  - Reference images: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"`
    (P4, lossless, full page) and `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_1_Tablero_Andrea_Cualitativo.jpg"`
    (P3, same screen, other state; `03-reference-images.md` §3.5); repo copies
    `docs/design/screenshots/reference/pq-3-tablero-alejandra-cuantitativo.png`, `pq-3-1-tablero-andrea-cualitativo.png`.
  - Uploads: `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-18 a la(s) 5.24.46 p.m..png"`
    (horizon control + module 2, current iteration, `06-uploads-png-batch-2.md` E10); superseded:
    `V2 _CUAN_ECO_Comparador 2\screenshots\add-company-card.png`, `after-add.png`, `chevron-cobertura.png` (older coverage
    module, CF-26) and `uploads\Captura de pantalla 2026-09-10 a la(s) 1.44.18 p.m..png` (tab bar with Visualización, CF-21).
    Current-iteration crops that match `HTML`: `uploads\Captura de pantalla 2026-09-19 a la(s) 7.59.47 a.m..png` (module 3
    card "Comparativo GE vs. Promedio Pares", `07-uploads-png-batch-3.md` #5) and
    `uploads\Captura de pantalla 2026-09-23 a la(s) 12.21.12 p.m..png` (+ pixel-identical `-247e0a0a` copy: the "✦ Generar
    narrativa ejecutiva" pill of the module headers, CF-12, `07-uploads-png-batch-3.md` #8–#9).
  - Intent only: `design_handoff_benchud_comparador/README.md` §8 (module list, TBG / ILP / TBG + ILP, `no save step` —
    CF-37) and `BACKEND.md` (`GET /analyses/:id/results?horizonte=TBG|ILP|TBG_ILP`, coverage / values / companies endpoints).
  - Spec digests: `10-synthesis.md` §1.8 (L244–328), §1.18, §1.19, critic M-01 (L1445) and M-06 (L1450);
    `02-prototype-html.md` §3 `SCR-07 Resultados` (the 02 file numbers screens differently), §4, §5; `03-reference-images.md`
    §3.5–3.6.
- Proposed route: `/analisis/:analysisId/resultados?horizonte=tbg|ilp|tbg-ilp&compania=` — part-A params: `horizonte`
  (default `tbg`, absent = `tbg`) and `compania` (company selected in module 2; absent = first company of the set, V2
  L4355). Part-B params (`categoria`, `pvc`, `resumen`) are defined in P1-10b. Guard: analyst_creator only (preparation
  space, §1.19); other roles → `/403` or redirected to `/analisis/:analysisId/visualizacion` when the analysis is
  published [inference: P1-21 decides]. Entry points: Análisis list "Ver detalle" (SCR-06), Inicio card "En revisión"
  (SCR-05), wizard "Generar análisis" (SCR-07), analysis tab "Resultados", sidebar "Ref. Competitivo" (L3829–3834: active
  nav when reached from the sidebar). Header title `Resultados · {{ analysisName }}` (L5156; mock `Desempeño comparativo —
  4T 2025`, L3616).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04) with the analysis tab bar above the content (`showAnalysisTabs`, L3796).
  - Root grid `grid-template-columns:1fr 300px; gap:20px`, `fadeUp .3s ease` (L721).
  - Left column: `display:grid; grid-template-columns:minmax(0,1fr); gap:16px; min-width:0` (L722) — action row, modules in
    registry order, footer row.
  - Right rail (300 px): `display:grid; gap:12px; align-self:start; position:sticky; top:20px; max-height:calc(100vh -
    112px); overflow:auto` (L1063).
  - Module cards: `#fff`, `1px solid #DFE2E6`, radius 12; module 2 uses `overflow:hidden` with internal bands separated by
    `1px solid #F5F6F7` (L731–756); card header `padding:16px 20px`, title `600 13px`.
  - Top bar in P4: tab bar and horizon control on one row with the action pills to the right; "TBG + ILP" wraps to two
    lines in P4 [Paquete:3_Tablero_Alejandra_Cuantitativo.png] → product keeps the label on one line (`white-space:nowrap`)
    [inference].
  - Below 1280 px the rail drops under the left column [inference: OQ-16 minimum width].
- Tabs:
  - Analysis tab bar (`Cmp:SegmentedTabs`, L239–243, container `#F5F6F7` radius 10 padding 3; tab `500 13px`, padding
    `8px 16px`, radius 8): "Configuración" → `/analisis/:analysisId/definicion`, "Resultados" (active `#672DBD`/white),
    "Presentación" → the analysis's presentation if one exists, else the Presentaciones list (L3779–3792; CF-21, CF-46).
  - Horizon segmented control (`Cmp:SegmentedTabs`, dark variant): "TBG" | "ILP" | "TBG + ILP" (L4502–4504), active bg
    `#1C2535` / white, inactive `#F5F6F7` / `#59667C` (L4505); default TBG. V2 computes it but renders no template (CF-04:
    include, per README, P3/P4 and UP 5.24.46). Sizing/placement from the captures: left of the action row, same height as
    the tab bar [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. The selected horizon lives in the URL (`horizonte`). See
    `#### Horizon states`.
- Sections: top to bottom (left column), then the right rail.
  1. Module 1 — action row (right-aligned).
  2. Module 2 — "Detalle y edición de datos por compañía" (hidden in S-UNION).
  3. Modules 3–4 (P1-10b), 5–9 scope-gated (P1-11), 10 "Resumen del informe" (P1-10b; hidden in S-UNION).
  4. Footer row (right-aligned, L1053–1057; inside the S-UNION-hidden block L1003–1058): "Guardar" (outline, padding
     `11px 18px`), "Actualizar" (outline), "Generar vista de reporte" (`#10B981`, white, padding `11px 20px`).
  5. Right rail: eyebrow "Hallazgos de IA" (`600 11px #808A9B` uppercase `.04em`, L1065) + 14px info "i" → panel
     "Observaciones generadas por Yarbis a partir de los datos homologados: anomalías, atípicos frente al histórico o
     brechas relevantes con pares." (L1069); 5 cards `#E3F6FA`, `1px solid #A8E6EC`, radius 10, padding 14, text
     `400 12px #0E7490` (L1072–1073), in order (L4838–4842):
     - "El grupo Ecopetrol mantiene margen EBITDA superior al promedio de pares a pesar de la caída general del sector."
     - "La brecha en crecimiento de producción es el mayor rezago identificado frente a Super Majors."
     - "3 indicadores dependen de la actualización manual de ISA — riesgo para el cierre del informe."
     - "6 de 7 compañías reportan ROACE de forma homologada — es el indicador con mayor cobertura para benchmarking directo."
     - "Solo 2 de 7 compañías reportan Flujo de Caja Libre — limita la comparabilidad de este indicador y debería priorizarse
       en la próxima ronda de homologación."
     The same 5 cards appear in P3/P4 [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. Findings are AI suggestions
     (`status:'suggestion'`, V-14); the rail stays visible in every horizon state [inference].
- Components:
  - Shell (SCR-04): `Cmp:AppShell`, `Cmp:Sidebar`, `Cmp:AppHeader`, `Cmp:YarbisFab`, `Cmp:YarbisChatPanel`.
  - Frame: `Cmp:SegmentedTabs` (analysis tab bar; horizon control dark variant), `Cmp:AiPillButton` (cyan ✦ pill, sizes md
    "Generar narrativa ejecutiva" and sm "Narrativa"), `Cmp:Button` (primary / outline / success), `Cmp:StickyRail`,
    `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiFindingCard`, `Cmp:Modal` (OVL-08
    `Cmp:NarrativeModal`), `Cmp:Toast` (undo, save), `Cmp:OperationProgressBanner` (M-06), `Cmp:SectionSkeleton`,
    `Cmp:SectionError`.
  - Module 2: `Cmp:Card`, `Cmp:KpiStatCard` (compact left-aligned variant), `Cmp:AiInsightList` (✦ bullet lines),
    `Cmp:CompanyCoverageCard` (with `Cmp:CompanyInitialsChip`, `Cmp:StatusChip`, `Cmp:ProgressBar`, remove `Cmp:IconButton`),
    `Cmp:AddCompanyTile` (dashed tile + `Cmp:SelectFilter`), `Cmp:DimensionGroup` (colour square + label + total),
    `Cmp:EditableValueRow` (label + `Cmp:EstimateToggleChip` "Real"/"Estimado" + `Cmp:NumberInput` + unit + optional
    justification `Cmp:TextField`), `Cmp:AlertBanner` (success / danger), `Cmp:MissingValueRow`, `Cmp:InlineSaveConfirmation`.
  - Horizon states: `Cmp:HorizonUnionPanel` (company tabs + two `Cmp:DimensionGroup` columns + `Cmp:StackedBar`),
    `Cmp:HitoItem` (hito row with sub-items) [inference: no V2 template, from logic L4511–4530].
- Charts: frame has none. Module 2: per-company coverage progress bar (see Module 2). Horizon S-UNION: two 100 % stacked
  bars (TBG vs ILP composition) [inference: `qualUnionTbgSegments` / `qualUnionIlpSegments`, L4529–4530, no template].
- Tables: n/a in the frame (module tables: module 2 below; Resumen del informe in P1-10b).
- Filters & controls:
  - Horizon (`horizonte` in URL, default `tbg`): single-select; switching refetches `V-09` + every module with the new
    `horizon` param and scrolls to top [inference].
  - Analysis tabs: navigation links (not filters).
  - Module 2 company selection (`compania` in URL): click a card to select; clicking the selected card again deselects
    (V2 L4380; the edit area then falls back to the first company, L4355).
  - Module 2 status filter chips (Completa / Requiere revisión / Incompleta) and company search exist in logic
    (L4385–4395) but have no template (the filter band L753–754 is empty) → **not rendered** (CF-83 dead blocks)
    [inference].
  - Info toggles: rail "Hallazgos de IA", module 2 (one open at a time, CF-61).
- States:
  - Loading: frame (`V-09 results-header`) blocks the tab bar + horizon + module list; each module and the rail then load
    independently as `SectionResult` skeletons [inference: synthesis §1.8 States].
  - Empty: an analysis with no companies → module 2 shows the KPI row at 0 and only the "+ Añadir compañía" tile
    [inference]; rail with no findings → hide the cards, keep the eyebrow with a muted note (copy missing in `HTML`
    [inference: open question A6]).
  - Error: per module / rail `Cmp:SectionError` with retry; frame error → full-page error with retry [inference].
  - Forbidden: non-analyst roles never reach the route (guard). `permissions.canEditValues=false` renders module-2 inputs
    read-only; `canRecalculate=false` hides "Actualizar"; `canCreatePresentation=false` hides "Crear presentación"
    [inference: V-09 flags].
  - Partial: any module may fail while the others render (independent `SectionResult`).
  - Operation progress (M-06, shared with SCR-07 "Generar análisis" and SCR-11 "Aplicar configuración"): "Actualizar" →
    `C-08` → `202 {operationId}`; a `Cmp:OperationProgressBanner` at the top of the left column shows queued → running
    (progress %, from `O-02` SSE or `O-01` polling) → succeeded (banner turns success, modules refetch) or failed (danger
    banner with retry); while running, "Guardar", "Actualizar" and edits are disabled. Copy is not in `HTML` and must come
    from i18n (e.g. `Recalculando resultados…`) [inference: M-06; spec shared with `overlays.md`].
  - Unsaved edits: leaving the route with dirty module-2 edits asks for confirmation [inference].
  - Proactive tip on first visit: "Detecté 3 indicadores pendientes por información de ISA — te aviso apenas se
    actualicen." (L3227), only with `canUseAssistant`.
- Interactions:
  - "✦" + "Generar narrativa ejecutiva" (L725) → OVL-08 titled `Narrativa ejecutiva · Resultados` with sections Comparativo,
    PVC, Datos por compañía, Resumen (L5312–5316) → `C-15` `{scope:'results', section:'all'}`; "Copiar texto" / "✓ Copiado"
    (L5319); "Usar en presentación" (overlays.md OVL-08).
  - "Crear presentación" (L726; V2 goes to the Presentaciones list, L5194) → `/presentaciones/nueva?analysisId=:analysisId`
    (synthesis §1.8).
  - "Guardar" (no handler in V2) → persists pending value overrides (`C-06`) and shows the "✓ Cambios guardados" toast
    (CF-81) [inference: toast reuse].
  - "Actualizar" (no handler in V2) → `C-08` recalculation (F22) with the operation-progress state above (CF-81, M-06).
  - "Generar vista de reporte" (L1056, `goVisualizacion`) → `/analisis/:analysisId/visualizacion` (SCR-09).
  - Horizon switch → URL `horizonte` → refetch; S-UNION hides modules 2 and 10 and the footer (L5270).
  - Analysis tabs → Configuración (SCR-07) / Presentación (SCR-13/14).
  - Rail info "i" → toggle panel. Findings cards are not clickable.
- Data fields:
  - `V-09 GET /api/v1/views/results-header/:analysisId?horizon=tbg|ilp|union`: `title` (string, rendered after
    `Resultados · `), `status` (analysis status enum), `horizonOptions[]{id: tbg|ilp|union, label}` (labels from i18n),
    `modules[]{id, order, isGated, visibleInHorizons[]}` (ordered registry per analysis type — CF-03; BFF-derived),
    `companySet[]{id, name, colorKey}`, `analysisTabs[]{id, route, isEnabled}`; permissions `canEditValues`,
    `canRecalculate`, `canCreatePresentation`, `canExport`. `lifecycleState` (preparation | preview | published) per critic
    M-04 [inference].
  - `V-14 GET /api/v1/views/ai-findings/:analysisId`: `findings[]{id, text (string, es-CO), status:'suggestion',
    generatedBy{model, version}}` — BFF-derived (AI), max 5 in the rail [inference: V2 shows 5].
  - `C-08 POST /api/v1/recalculations` `{analysisId, reason}` → `202 {operationId}`; `O-01` → `{status: queued | running |
    succeeded | failed, progress (0–100 %), messageKey}`; `O-02` SSE.
  - `C-15 POST /api/v1/executive-narratives` `{scope:'results', section: all | hom | comp | pvc | resumen, analysisId}` →
    `{sections[{title, text}], status:'suggestion', generatedBy}`.
- Role visibility:
  - analyst_creator: whole screen, edit, recalculate, narratives, create presentation, generate report view.
  - explorer_viewer, explorer_integral, executive_viewer, executive_integral: no access (board 09: preparation space
    exclusive to the analyst — §1.19); they consume SCR-09 Visualización [inference: redirect target decided in P1-21].
  - Yarbis chat only with `canUseAssistant`; AI pills are analyst-only here because the screen is analyst-only.
- Open questions / assumptions:
  - A1 — CF-04 / M-01: V2 has the horizon logic but no template; ILP and TBG + ILP layouts below are derived from logic
    (L4501–4530) and README, not from a rendered prototype. PO to confirm S-ILP scope (which modules have ILP data).
  - A2 — S-UNION company tabs come from the 11 TBG companies (`qualComputed`), but ILP data exists for 7; V2 silently falls
    back to Shell's ILP for Chevron, ISA, Exxon and PTTEP (L4516) — a prototype defect; product shows an explicit
    no-ILP-data state for those companies [inference].
  - A3 — Module 2 "Datos reportados · editable" shows each company's TBG weight composition (`QUAL_DATA`, %) while the
    coverage cards and missing rows come from `HOM_POOL` (different data): V2 mixes two datasets. Proposed: the edit area
    edits the reported indicator values of the company for the selected horizon (V-10 `selected.groups`), keeping the V2
    labels and layout; values of the fixture = V2 numbers (screen parity) [inference]. Confirm with PO.
  - A4 — "Guardar" / "Actualizar" have no handlers in V2 (CF-81 resolution applied); module-2 "Guardar cambios" persists
    the selected company only, the footer "Guardar" persists every pending override [inference].
  - A5 — Footer placement: inside the S-UNION-hidden block in V2 (L1003–1058), so TBG + ILP has no footer; kept as in V2.
  - A6 — Missing copy: empty findings rail, no-ILP-data state, operation-progress messages, unsaved-changes confirmation.
  - A7 — Module-2 status filter chips and search exist only in logic (L4385–4395) → not built (CF-83).
  - A8 — Undo toast for company removal is bottom-center 5 s (overlays.md); removal is committed through `C-05` only
    after the 5 s window, "Deshacer" cancels it (no `C-04` round trip) [inference; synthesis lists C-04 for undo as an
    alternative].

### Modules (part A)

#### Module 1 — Action row
- Charts: n/a
- Tables: n/a
- Layout / copy: right-aligned flex row, gap 8, wraps (L723). AI pill "✦" + "Generar narrativa ejecutiva" (`#E3F6FA`, border
  `#A8E6EC`, radius 999, padding `8px 14px`, text `600 12px #0E7490`, L725) → OVL-08; primary button "Crear presentación"
  (`#672DBD`, white `500 13px`, padding `9px 16px`, radius 8, L726). P3/P4 show the older label "Generar análisis
  ejecutivo" in the same place [Paquete:3_Tablero_Alejandra_Cuantitativo.png] → V2 wording kept (CF-12).
- States: pill disabled while a narrative request is in flight (spinner inside the pill) [inference]; "Crear presentación"
  hidden without `canCreatePresentation`; both disabled during an operation in progress (M-06) [inference].
- Data fields: none of its own (permissions from `V-09`; narrative from `C-15`).

#### Module 2 — "Detalle y edición de datos por compañía"
- Header (L732–736): title `600 13px` (L733) + 16px info "i" + right-aligned sm AI pill "✦" "Narrativa" (L735) → OVL-08
  titled `Narrativa ejecutiva · Datos por compañía` (L5312, section `hom`). Info panel (L738): "El % indica cuántos de los
  indicadores requeridos tiene reportados cada compañía. Verde ≥90%, ámbar 70–89%, rojo &lt;70%. Clic en una tarjeta la
  selecciona para editar sus datos debajo." (HTML entity `&lt;` renders as `<`).
- KPI band (4 columns, L741–746; value `700 20px`, label `400 11px #98A1B0`): `{{ homTotalCompanies }}` "Compañías"
  `#1C2535` · `{{ homCompletas }}` "Completas" `#047857` · `{{ homIncompletas }}` "Incompletas" `#9A1616` ·
  `{{ homTotalPendientes }}` "Indicadores pendientes" `#672DBD`. Mock: 5 · 2 · 1 · 7 (L4396–4400). Note: companies "En
  revisión" (70–89 %) are counted in neither Completas nor Incompletas (`homRevision` computed, not rendered, L4398).
- AI insights band (L747–751): lines `✦ {{ hi }}` `400 12px #424E63`, generated by rules (L4405–4407): `{n} de {total}`
  + " compañías tienen 90% o más de información completa." (when n > 0); `{n}` + " compañía(s) presenta(n) indicadores
  críticos sin información (<70%)." (when n > 0); `{company}` + " concentra el mayor número de datos faltantes (" +
  `{count}` + ")." Mock resolved: `2 de 5 …`, `1 compañía(s) …`, `ISA concentra el mayor número de datos faltantes (3).`
- Company cards (grid `repeat(auto-fill,minmax(150px,1fr))` gap 10, L756; card border `2px solid` `#DFE2E6`, selected
  `#672DBD`, radius 10, padding 12): remove "✕" (16px circle `#F5F6F7`/`#98A1B0`, hover `#EF4444`/white, L759) · 24px
  initials chip on `HOM_LOGO_COLORS` (L4346; Chevron `#7C35EA`, Shell `#83E377`, Equinor `#16DB93`, BP `#048BA8`, ISA
  `#F1C453`) + name `600 12px` ellipsis (L761–762) · `{{ c.pct }}%` `700 20px` in tone fg (L765) · status chip
  `600 10px` (L767) · 5px bar (L768) · `{{ c.missingCount }}` + " indicador(es) faltante(s)" `400 11px #98A1B0` (L769).
  Status (L4372–4375): ≥ 90 → "Completa" `#D1FAE5`/`#047857`/bar `#10B981`; 70–89 → "Requiere revisión"
  `#FEF3C7`/`#92400E`/`#FBBF24`; < 70 → "Incompleta" `#FEE2E2`/`#991B1B`/`#EF4444`. Mock (`HOM_POOL` L4335–4339, set
  `homCompanies` L3576): Chevron 96 % Completa 0 · Shell 88 % Requiere revisión 1 (`ROACE ajustado`) · Equinor 74 % Requiere
  revisión 2 (`Crecimiento de reservas`, `Producción diaria`) · BP 91 % Completa 1 (`Prueba ácida`) · ISA 52 % Incompleta 3
  (`Deuda Neta/EBITDA`, `Cobertura de intereses`, `Capex proyectado`).
- Add tile (L772–782, only when addable companies exist): dashed `2px #DFE2E6`, min-height 96: "+ Añadir compañía"
  (`600 11px #98A1B0`, L774) + select with first option "Elegir..." (L776) listing pool companies not in the set (V2:
  Exxon, Total, Petrobras, PTTEP, Repsol — `homAddOptions`, L4348).
- Edit area (L785–846) for the selected company (default first = Chevron):
  - Eyebrow "Datos reportados · editable" (`600 11px #424E63` uppercase `.03em`, L791), one bordered group per dimension
    (radius 10, padding `12px 14px`, L794): 8px colour square (`QDIM_COLORS` L4419: Financiera `#672DBD`, Operativa
    `#49BCD8`, Transversal `#FBBF24`, Financiera/Operativa `#94A3B8`) + dimension label + `{{ d.total }}%` `700 12px`
    (L796–797). Rows (L802–807): label `400 13px #424E63`, chip toggle "Real" (`#D1FAE5`/`#047857`) ↔ "Estimado"
    (`#FEF3C7`/`#92400E`) (L4457), number input step 1 width 64 `600 12px Roboto Mono` right-aligned + "%" (L805–806).
    When Estimado: justification input (dashed `#FBBF24`, bg `#FEF9E7`) placeholder "Justificación del estimado
    (opcional)..." (L809). Chevron mock (L3401–3403): Financiera 40 % (`ROACE relativo` 20, `Flujo de Caja Libre` 20),
    Operativa 25 % (`Crecimiento Producción total` 15, `Programa de Mejora de la Competitividad` 10), Transversal 35 %
    (`TRIF` 10, `Reducción de Emisiones GEI` 10, `Índice de seguridad, fatalidades e incidentes` 15) — matches
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png] and UP 5.24.46.
  - Missing = 0 → success banner "✓ Sin indicadores faltantes — homologación completa." (`#D1FAE5`/`#047857`, L820).
  - Missing > 0 → danger banner "⚠" + `Faltan {{ homMissingCount }} indicadores por homologar en {{ homEditCompanyId }}.`
    (`#FEE2E2`/`#991B1B`, L823) + eyebrow "Datos faltantes" (L824) + rows (L829–835; bg `#FEF3C7`, `1px dashed #FBBF24`,
    radius 8): chip "Faltante" (`#FEE2E2`/`#9A1616`, L830), label, empty number input + "%", "✕" remove (hover `#EF4444`).
    Missing value is `null` and the input starts empty, never 0 (CF-37; V2 shows 0, L4367).
  - Buttons (L839–845): inline "✓ Cambios guardados" `500 12px #047857` for 2.2 s (L841, L4438) · "Cancelar cambios"
    (outline, L843; reverts this company's overrides, estimate flags and justifications, L4440–4448) · "Guardar cambios"
    (primary, L844).
- Charts: coverage progress bar per company card — 5px track `#F5F6F7`, fill = coverage % in tone colour (≥ 90 `#10B981`,
  70–89 `#FBBF24`, < 70 `#EF4444`), no axis / legend / tooltip (L768).
- Tables: n/a as a grid; the edit area is a grouped form list (dimension → rows) and the missing rows list. No sort, paging
  or totals beyond the per-dimension total.
- States:
  - Loading: skeleton for KPI band + 5 card placeholders + edit area [inference].
  - Empty: no companies → KPIs 0, no insights, only the add tile; selected company without reported data → edit area shows
    only the missing rows / banner (V2 `homEditNoDetail`, L5243, no template) [inference: note copy missing, A6].
  - Error: `Cmp:SectionError` in the card; save error → inline danger text next to the buttons, edits kept [inference].
  - Saving: "Guardar cambios" shows a busy state; success → "✓ Cambios guardados" 2.2 s.
  - Remove company: card disappears, undo toast `Se quitó {company} del análisis.` + "Deshacer" (`#83E377`) bottom-center
    5 s (L3101–3106, L3667–3675); "Deshacer" restores the company.
  - Hidden in S-UNION (`showOtherResCards`, L730, L5270).
  - Read-only without `canEditValues` (inputs disabled, no toggle, no ✕, no add tile) [inference].
- Data fields (`V-10 GET /api/v1/views/company-coverage/:analysisId?horizon=&companyId=`):
  - `kpis{companies, complete, incomplete, pendingIndicators}` — integers, BFF-derived counts (raw: per-company coverage).
  - `insights[]` — strings (es-CO), BFF-derived by rule (the three templates above).
  - `companies[]{id, name, colorKey, coveragePct (0–100 %, integer, derived = reported / required indicators), status
    (complete | needs_review | incomplete, derived from coveragePct with thresholds 90 / 70), missingCount (integer,
    derived)}`.
  - `addableCompanies[]{id, name}` — derived (pool minus set).
  - `selected{companyId, groups[{dimension (fin | op | trans | finop), label, totalPct (%, derived sum), items[{indicatorId,
    label, value (number, raw, unit per indicator: % in V2 mock), isEstimate (boolean), justification (string | null)}]}],
    missing[{indicatorId, label, value: null}]}`.
  - Commands: `C-06 PATCH /value-overrides` batch `{companyId, indicatorId, value | null, isEstimate, justification?}`
    (keeps the original raw value; derived coverage recomputed server-side); `C-04` add company; `C-05` remove company.
  - Formats: percentages as integers with `%` (es-CO, CF-70); counts plain integers.

#### Horizon states
- S-TBG (default, `horizonte=tbg`): V2's only rendered state. Frame + module 1 + module 2 + modules 3–4, 5–9 (gated), 10 +
  footer + rail. Module 7 title "Horizonte TBG" (`horizonteModuleTitle`, L5270). Data: every view called with `horizon=tbg`.
- S-ILP (`horizonte=ilp`): same module list and layout as S-TBG, data requested with `horizon=ilp` [inference: V2 sets
  `isQualIlp` (L4506) but no template reads it]. ILP-specific content (for module 7, P1-11): ILP indicators grouped by
  dimension from the catalog (`ilpDimGroups` L5115–5118: dimensions Financiera `#672DBD`, Operativa `#0E7490`, Transversal
  `#92400E` — `ILP_DIM_COLOR` L5048; ILP rows of `TBGILP_METRICS` L5056–5111, e.g. "Retorno Total al Accionista Relativo",
  "Avance Estratégico", "Hito: Avance en la transición energética"). Companies without ILP data (Chevron, ISA, Exxon,
  PTTEP) show an explicit no-data state (A2) [inference]. Module 7 title stays "Horizonte TBG" in V2 logic (only union
  changes it) → product shows the horizon name `Horizonte ILP` [inference: logic gap, PO to confirm].
- S-UNION (`horizonte=tbg-ilp`, logic id `union`): `showOtherResCards=false` hides module 2, module 10 and the footer
  (L730, L1003, L5270); modules 3–4 stay (they sit outside the hidden blocks, L857–1002); module 7 is retitled "Horizonte
  TBG y ILP" (L5270) and shows the side-by-side comparison [inference: layout; data from logic L4511–4530]:
  - Company tabs from the TBG company set (`qualUnionCompanyTabs`, L4511–4514; active `#672DBD`/white, inactive
    `#F5F6F7`/`#59667C`), default Shell (`qualUnionCompanyId:'shell'`, L3577).
  - Two columns: TBG dimensions of the company (`qualUnionTbgDims`) and ILP dimensions (`qualUnionIlpDims`), each
    dimension with colour (`QDIM_COLORS`), total % (sum of item %, L4518) and items `{label, pct, isHito, subItems[]}`.
  - Column totals `qualUnionTbgTotal` / `qualUnionIlpTotal` (%, 1 decimal) and counts: TBG `{n}` indicators
    (`qualUnionTbgCount`); ILP label built as `{n}` + " indicador(es)" + (when hitos exist) " · " + `{k}` + " hito" (L4528),
    e.g. Shell ILP `3 indicador(es) · 1 hito`.
  - One 100 % stacked bar per column (`qualUnionTbgSegments` / `qualUnionIlpSegments`, L4529–4530).
  - Hito rows: an ILP item flagged `isHito` renders its label (e.g. "Hito: Avance en la transición energética", L3425,
    25 %) with its sub-items as a bullet list (L3425: `Intensidad de carbono`, `Reducción GEI 1 y 2`, `Crecimiento negocio
    de energía`, `Combustibles bio`, `Desarrollo sumidero de emisiones`) and no individual weights [inference: display].
  - Mock Shell union (L3390–3394 TBG, L3422–3426 ILP): ILP Financiera 75 % (3 × 25), Operativa 0 %, Transversal 25 % (hito).
  - Data: `V-17 GET /api/v1/views/tbg-horizon/:analysisId?horizon=union&companyId=` extended with `isHito` and
    `subItems[]` (critic M-01; contract in P1-19/P3-06).
- Switching horizon keeps the rail and the tab bar; module-level state (selected company, open accordions) resets
  [inference].

### Modules (part B)

> P1-10b: modules 3, 4, 10 and 11 (ungated). Visual reference for all four: the P1-03a render
> `docs/design/screenshots/prototype/SCR-08@1440-full.png` (default state: Rentabilidad, Chevron, no category filter).
> Part-B URL params: `categoria` (module 3, default `rentabilidad`), `pvc` (module 4 company id, default first company of
> the set), `resumen` (module 10, comma-separated category ids, absent = all). Module 3 and 4 values edited here and in
> module 10 are the same overrides (`indicatorOverrides` in V2 L4768–4776, L4825–4832), so an edit in one module shows in
> the others.

#### Module 3 — "Comparativo GE vs. Promedio Pares"
- Layout / copy: card `#fff`, `1px solid #DFE2E6`, radius 12, padding 22 (L857). Header: title `600 14px` (L859) + 16px info
  "i" (L860) + right-aligned sm AI pill "✦" "Narrativa" (L861) → OVL-08 titled `Narrativa ejecutiva · GE vs. pares`
  (L5312, section `comp`). Subtitle `400 12px #98A1B0` "Valor Grupo Ecopetrol frente al promedio de pares, por indicador"
  (L863). Info panel (L865; the copy wraps the words Ver más in straight double quotes, so it is quoted in segments):
  "Compara el valor de Ecopetrol (GE) contra el promedio de pares para cada indicador de la categoría seleccionada. Los
  valores son editables; " + "Ver más" + " abre el detalle del indicador."
- Category chips (single-select, L867–871; padding `7px 14px`, radius 8, `600 12px`; active `#672DBD`/white, inactive
  `#F5F6F7`/`#59667C`, L4765), from `CATEGORIES` L3296–3316 in order: "Rentabilidad" (default, `chartCategory`
  L3576), "Liquidez", "Operacional", "Competitividad OPEX", "Solvencia", "ESG".
- Rows (grid gap 22, L872–892), one per indicator of the selected category: label `600 13px` (L876) + link "Ver más ›"
  (`500 12px #672DBD`, L877); two bar lines (gap 6): row label "GE" / "Pares" (`600 11px #98A1B0`, width 36, L881, L886),
  bar track and number input (step 0.1, width 72, `600 12px Roboto Mono`, GE value `#1C2535`, Pares value `#59667C`,
  L883, L888).
- Mock (Rentabilidad, L3297–3299): "ROACE (%)" GE 7.4 / Pares 5.5 · "Margen EBITDA (%)" 39.0 / 32.0 · "Crecimiento EBITDA
  (%)" −13.8 / −2.2. Other categories: "Prueba ácida (x)" 1.3 / 0.8, "Razón corriente (x)" 1.5 / 1.2 (Liquidez);
  "Crecimiento Producción (%)" −0.1 / 5.1 (Operacional); "Costo de Levantamiento (USD/B)" 12.2 / 6.7, "Costo de ventas/BI
  (USD/B)" 66.1 / 130.7 (Competitividad OPEX); "Deuda Neta/EBITDA (x)" 2.4 / 1.6 (Solvencia); "Gobernanza (puntos)" 78 / 70
  (ESG) (L3302–3316).
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton` (sm),
  `Cmp:CategoryChips` (single-select), `Cmp:PairedBarRow` (label + `Cmp:LinkButton` "Ver más ›" + two `Cmp:BarLine` with
  `Cmp:NumberInput`), `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Charts: paired horizontal bars per indicator (div bars, no library): height 18, radius 5, track `#F5F6F7`, GE fill
  `#83E377`, Pares fill `#B3B9C4` (L882, L887); width = |value| / (max(|GE|, |Pares|, 0.01) × 1.15) × 100 % (L4771–4772);
  bars grow from 0 on mount with `transition:width 500ms` (`geWAnim`, L4773). No axis, legend, gridlines or tooltip; the
  value is the input at the right. Negative values are drawn with positive length (render: Crecimiento EBITDA −13.8) —
  keep the length rule and show the signed value (CF-72; diverging axis = OQ-10).
- Tables: n/a (list of paired bars).
- States:
  - Loading: skeleton of the chip row + 3 bar pairs [inference].
  - Empty: a category with no indicators → muted note (copy missing in `HTML`) [inference; open question B4].
  - Error: `Cmp:SectionError` in the card; an override save error keeps the typed value and shows an inline error
    [inference].
  - "Ver más ›": V2 renders it on every row but the handler is a no-op when the indicator has no detail (`ind.peers`
    absent, L4774; render shows it on "Crecimiento EBITDA (%)") → product shows the link only when `hasDetail` (synthesis
    §1.8) [inference].
  - Edits: typing a number updates the bars at once (optimistic) and persists through `C-06` with debounce 500 ms (same
    autosave as module 10) [inference: V2 module 3 edits do not call `scheduleAutosave`, only module 10 does, L4775 vs
    L4831]; an empty input is ignored in V2 (`isNaN` guard, L4775).
  - Read-only without `canEditValues`: values shown as text [inference]. Visible in every horizon state (outside the
    `showOtherResCards` blocks).
- Interactions: chip → `categoria` in URL → rows for that category (client-side filter of `V-11` or refetch
  [inference]); "Ver más ›" → `/analisis/:analysisId/indicadores/:indicatorId` (SCR-10, V2 L4774); "Narrativa" → OVL-08
  (`C-15`, section `comp`); info "i" toggles the panel.
- Data fields (`V-11 GET /api/v1/views/peer-average-comparison/:analysisId?category=rentabilidad`):
  - `categories[]{id, label}` (6, order as above).
  - `rows[]{indicatorId, label (string incl. unit suffix as in V2, e.g. `ROACE (%)`), unit (`%` | `x` | `USD/B` | `pts`),
    geValue (number, raw, 1 decimal; override applied), peerAvg (number, **derived** = average of the peer set;
    `peerAvgCompanies[]` lists the companies averaged), hasDetail (boolean)}`.
  - Bar widths are derived in the front from the two numbers (formula above); no percentages are sent.
  - Command: `C-06 PATCH /value-overrides` `{indicatorId, geValue? | peerAvg?}` (keeps the original value).
  - Formats: es-CO decimals in inputs and labels (`7,4`, `-13,8`; the render already shows the comma because of the
    browser locale) (CF-70).

#### Module 4 — "Comparativo GE vs. compañía · detalle por indicador"
- Layout / copy: card as module 3 (L896). Header (L897–914): left block with title `600 14px` (L900) + info "i" (L901) + sm
  AI pill "✦" "Narrativa" (L902) → OVL-08 titled `Narrativa ejecutiva · GE vs. {company}` (L5312, section `pvc`); subtitle
  "Grupo Ecopetrol frente a cada compañía par, indicador por indicador" (L904). Right summary box (`#F5F6F7`, radius 10,
  padding `10px 14px`, L906–913): `GE supera a {{ pvcCompany }}` (`400 11px #98A1B0`, L908), `{{ pvcWins }} de
  {{ pvcTotal }}` `700 18px` + "indicadores" `500 12px #59667C` (L909), 80×6 bar (`#DFE2E6` track, `#83E377` fill,
  `transition:width 400ms`, L911), `{{ pvcWinPct }}%` `700 13px Roboto Mono #047857` (L912). Mock (Chevron): `6 de 10`,
  60 %.
- Info panel (L916; quoted in segments because the copy contains straight double quotes): "Elige una compañía para ver cada
  indicador de Grupo Ecopetrol (verde) frente al valor de esa compañía. La diferencia se expresa en puntos (GE − compañía).
  En indicadores marcados " + "Menor es mejor" + " (deuda, costos) GE supera cuando su valor es menor. El valor de la
  compañía es editable; " + "Ver más" + " abre el detalle del indicador."
- Company tabs (L919–925; padding `7px 14px`, radius 8, `600 12px`; active `#672DBD`/white, inactive `#F5F6F7`/`#59667C`;
  8px colour square with 1.5px white ring): one per company of the analysis set (`homCompanies`, L4781), default the first
  (Chevron). Legend (L927–930, `400 11px #59667C`): 9px square `#83E377` "Grupo Ecopetrol" + 9px square in the company
  colour + company name.
- Category accordions (L932–980; border `1px solid #DFE2E6`, radius 10): header `#F5F6F7`, padding `12px 16px`, category
  label `600 13px #1C2535` + `GE supera en {{ pc.summary }}` (`500 11px #59667C`, L938; summary `{wins} de {n}`, L4812) +
  chevron "⌄" open / "›" collapsed (L4813); all open by default (`pvcCollapsed:{}`, L3578). Rows (L945–974, padding
  `12px 16px`, top border `#F5F6F7`): label `500 13px #1C2535` (L948); code `600 10px Roboto Mono #98A1B0` built as `IND-`
  + upper-cased id with `_`→`-` (e.g. `IND-MARGEN-EBITDA`, L4803); polarity tag "Menor es mejor" (`400 10px #98A1B0`,
  L4805) when the id matches `deuda|opex|costo|gasto` (L4785); right: diff `700 12px Roboto Mono` in status colour
  (`+1.1 pts`, `+0.7 x`, `+7.5 USD/B`; unit ` pts` for `%`, L4801–4805) + status chip "GE supera" (`#D1FAE5`/`#047857`) or
  "GE por debajo" (`#FEE2E2`/`#991B1B`) (L4806–4807); two bar lines: "GE" label (width 44), bar, GE value as text
  (`600 12px Roboto Mono`, width 64, L963); company name label (ellipsis), bar in company colour, editable company value
  (number input step 0.1, width 64, L968); "Ver más ›" (`500 11px #672DBD`, right) only when the indicator has detail
  (L971–973).
- Mock GE vs Chevron (default; `02-prototype-html.md` §9.12; synthetic values, CF-66): Rentabilidad 2 de 3 — "ROACE (%)"
  7.4 vs 6.3 `+1.1 pts` supera, "Margen EBITDA (%)" 39 vs 29.8 `+9.2 pts` supera, "Crecimiento EBITDA (%)" −13.8 vs −2
  `-11.8 pts` por debajo; Liquidez 2 de 2 — "Prueba ácida (x)" 1.3 vs 0.6 `+0.7 x`, "Razón corriente (x)" 1.5 vs 1
  `+0.5 x`; Operacional 0 de 1 — "Crecimiento Producción (%)" −0.1 vs 5.8 `-5.9 pts`; Competitividad OPEX 1 de 2 — "Costo
  de Levantamiento (USD/B)" 12.2 vs 4.7 `+7.5 USD/B` por debajo (Menor es mejor), "Costo de ventas/BI (USD/B)" 66.1 vs
  151.6 `-85.5 USD/B` supera (Menor es mejor); Solvencia 0 de 1 — "Deuda Neta/EBITDA (x)" 2.4 vs 1.7 `+0.7 x` por debajo
  (Menor es mejor); ESG 1 de 1 — "Gobernanza (puntos)" 78 vs 61.6 `+16.4 pts` supera. Matches the render.
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton` (sm),
  `Cmp:WinRatioSummary` (text + mini `Cmp:ProgressBar` + %), `Cmp:SegmentedTabs` (company tabs with colour dot),
  `Cmp:ChartLegend`, `Cmp:Accordion` (category group), `Cmp:ComparisonIndicatorRow` (label, code, polarity tag, signed
  diff, `Cmp:StatusChip`, two `Cmp:BarLine`, `Cmp:NumberInput`, `Cmp:LinkButton`), `Cmp:SectionSkeleton`,
  `Cmp:SectionError`.
- Charts: paired horizontal bars per indicator (div): height 14, radius 4, track `#F5F6F7`, GE `#83E377`, company = PVC
  colour (L962, L967; `PVC_COLORS` L4780: BP `#048BA8`, Equinor `#16DB93`, Shell `#F29E4C`, TotalEnergies `#B9E769`, Oxy
  `#EFEA5A`, Petrobras `#2C699A`, Chevron `#7C35EA`, ISA `#F1C453`, Exxon `#0DB39E`, fallback `#59667C`); width =
  |value| / (max(|GE|, |company|, 0.01) × 1.1) × 100 % (L4800, L4804), `transition:width 400ms`; win-ratio mini bar in the
  summary box. No axis, tooltip or gridlines. Company colours follow the canonical map (CF-47), so Shell is not
  `#83E377` here (PVC map already avoids the GE green). Negative values: CF-72 as in module 3.
- Tables: n/a (grouped list of indicator rows inside accordions; the accordion header carries the per-category
  wins / total).
- States:
  - Loading: skeleton of summary box + tabs + 2 accordions [inference].
  - Empty: analysis without companies → tabs and accordions hidden, muted note (copy missing in `HTML`) [inference; B4];
    company without a value for an indicator → company bar empty, input empty, status chip hidden and the row excluded from
    wins / total (never compared as 0) [inference: CF-37 null rule].
  - Error: `Cmp:SectionError` in the card [inference].
  - Collapsed / expanded accordions: kept per session, not in the URL [inference].
  - Company removed in module 2 → its tab disappears; if it was selected, the first company is selected (L4782).
  - Read-only without `canEditValues` [inference]. Visible in every horizon state.
- Interactions: company tab → `pvc` in URL → refetch `V-12` for that company; accordion header toggles its rows; company
  value input → override (`C-06`, per company + indicator, V2 `pvcOverrides` L4808) → diff, status, category summary and
  win ratio recomputed (server-derived); "Ver más ›" → SCR-10; "Narrativa" → OVL-08 section `pvc`.
- Data fields (`V-12 GET /api/v1/views/company-comparison/:analysisId?companyId=chevron`):
  - `summary{wins (integer), total (integer), winPct (0–100 %, integer, derived)}`.
  - `groups[{category (id + label), wins, total (integers, derived), rows[{indicatorId, code (display code, string),
    label, unit (`%` | `x` | `USD/B` | `pts`), geValue (number, raw), companyValue (number | null, raw, override applied),
    diff (number, **derived** = GE − company, 1 decimal; unit `pts` when the indicator unit is `%`), lowerIsBetter
    (boolean, catalog attribute — replaces V2's id regex), outcome (`above` | `below`, derived with polarity), hasDetail
    (boolean)}]}]`.
  - Company `colorKey` comes from the company set in `V-09`.
  - Formats: diff signed with explicit `+` (`+1,1 pts`, `-85,5 USD/B`), es-CO decimals (CF-70).

#### Module 10 — "Resumen del informe"
- Layout / copy: card `overflow:hidden` (L1012), inside the S-UNION-hidden block (L1003–1058). Header band (padding
  `16px 20px`, bottom border `#F5F6F7`, L1013): title `600 14px` (L1015) + info "i" (L1016) + sm AI pill "✦" "Narrativa"
  (L1017) → OVL-08 titled `Narrativa ejecutiva · Resumen del informe` (section `resumen`); right: outline button with grid
  icon (stroke `#2D6D06`) "Excel" (`500 12px #59667C`, L1020–1023).
- Info panel (L1029) — V2 copy is truncated and still mentions a PDF button (CF-80, CF-82: drop the PDF fragment). Product
  copy = the first sentence plus the Excel sentence: "Tabla en el formato del informe ejecutivo actual (Categoría, KPI,
  Valor GE, Promedio pares). " + "Excel" + " descarga esta tabla en .xlsx; " (trailing fragment removed; final punctuation
  adjusted in i18n) [inference: CF-80 resolution].
- Export feedback row (L1031–1033): full-width band `#D1FAE5`/`#047857` `500 12px` under the header with "Exportando a
  Excel (.xlsx)…" (L5292) for 3 s (L3738–3741).
- Category filter chips (L1034–1038; padding `6px 13px`, radius 8, `500 12px`): multi-select, none selected = all
  (L4823); active `#672DBD`/white, inactive `#F5F6F7`/`#59667C`; same 6 labels as module 3.
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton` (sm),
  `Cmp:Button` (outline with icon, "Excel"), `Cmp:InlineStatusBand` (export feedback), `Cmp:CategoryChips` (multi-select
  variant), `Cmp:DataTable` (flex-column variant) with `Cmp:TierDot` and `Cmp:NumberInput`, `Cmp:Toast` (autosave),
  `Cmp:TableSkeleton`, `Cmp:SectionError`.
- Charts: n/a (only a 6px tier dot per row).
- Tables:
  - Header row (L1039–1041; padding `10px 20px`, `#F5F6F7`, `600 11px #808A9B` uppercase `.04em`): "Categoría" (flex
    1.2) · "KPIs" (flex 1.6) · "Valor GE" (flex 1, right) · "Promedio pares" (flex 1, right).
  - Rows (L1043–1048; padding `12px 20px`, bottom border `#F5F6F7`): 6px dot in the category tier colour (`TIERS[tier].bg`
    L3218–3223: tier 1 `#10B981`, 2 `#34D399`, 3 `#FBBF24`, 4 `#EF4444`) + category `600 12px`; KPI `400 13px #424E63`;
    Valor GE = number input step 0.1, width 78, `600 13px Roboto Mono #1C2535`; Promedio pares = number input, `400 13px
    Roboto Mono #59667C` (L1046–1047).
  - 10 rows = every indicator of every category in `CATEGORIES` order (L4824): Rentabilidad (tier 2) ROACE (%) 7.4 / 5.5,
    Margen EBITDA (%) 39 / 32, Crecimiento EBITDA (%) −13.8 / −2.2; Liquidez (1) Prueba ácida (x) 1.3 / 0.8, Razón
    corriente (x) 1.5 / 1.2; Operacional (3) Crecimiento Producción (%) −0.1 / 5.1; Competitividad OPEX (1) Costo de
    Levantamiento (USD/B) 12.2 / 6.7, Costo de ventas/BI (USD/B) 66.1 / 130.7; Solvencia (4) Deuda Neta/EBITDA (x) 2.4 /
    1.6; ESG (2) Gobernanza (puntos) 78 / 70. Matches the render.
  - Sorting: none (catalog order). Paging: none. Grouping: category repeated per row (no merged cells). Totals: none.
  - Filtering by the category chips (`resumen` in URL).
- States:
  - Loading: `Cmp:TableSkeleton` (header + 6 rows) [inference].
  - Empty: filter combination with no rows cannot happen (chips are categories with indicators); no data at all → muted
    row (copy missing in `HTML`) [inference; B4].
  - Error: `Cmp:SectionError` in the card [inference].
  - Autosave: editing an input schedules a save after 500 ms and shows the bottom-right toast "Cambios guardados
    automáticamente" for 1.8 s (L3717–3723, L3032–3037; overlays.md autosave toast). Clearing an input restores the
    original value in V2 (L4831) → product sends `null` override removal instead [inference].
  - Export: "Excel" → `C-14` `{kind:'report-summary-xlsx', params:{categories}}` → `202 {operationId}` → feedback row
    "Exportando a Excel (.xlsx)…" while running, then the file downloads through `O-03`; failure → danger band with retry
    (copy missing) [inference: V2 only shows the 3 s band].
  - Hidden in S-UNION. Read-only without `canEditValues`; "Excel" hidden without `canExport` [inference].
- Interactions: chips toggle categories; inputs edit GE / peer average (autosave); "Excel" exports the filtered table;
  "Narrativa" → OVL-08 section `resumen`; info "i" toggles the panel.
- Data fields (`V-13 GET /api/v1/views/report-summary/:analysisId?categories=`):
  - `rows[]{category (id + label), tier (1–4 integer, derived by the engine), indicatorId, label, unit, geValue (number,
    raw, override applied), peerAvg (number, derived average)}`.
  - Permissions `canEditValues`, `canExport`.
  - Commands: `C-06` overrides (autosave), `C-14` export → `O-01` / `O-03`.
  - Formats: es-CO decimals (`7,4`, `130,7`), integers without decimals (`39`, `78`) (render); units are in the KPI label.

#### Module 11 — Footer actions
- Specified in the frame (part A): Sections item 4 (buttons "Guardar", "Actualizar", "Generar vista de reporte", L1053–1057)
  and Interactions (Guardar → `C-06`, Actualizar → `C-08` + M-06 operation progress, Generar vista de reporte → SCR-09);
  not repeated here.
- Components: `Cmp:Button` (outline × 2, success × 1) — defined in the frame.
- Charts: n/a
- Tables: n/a
- States: see the frame (operation progress M-06, disabled while an operation runs, "Actualizar" hidden without
  `canRecalculate`); hidden in S-UNION (inside L1003–1058).
- Data fields: none of its own (permissions from `V-09`; `C-06`, `C-08`, `O-01`, `O-02`).

#### Part B open questions
- B1 — CF-72 / OQ-10: negative values keep positive-length bars with the signed value shown; a diverging axis needs PO
  approval.
- B2 — CF-66: module-4 company values are hash-generated in V2; fixtures reproduce them deterministically (screen parity);
  the real source is the per-company homologated value.
- B3 — CF-80 / CF-82: the PDF export is dropped; the Resumen info copy loses its truncated PDF fragment.
- B4 — Missing copy: empty category (module 3), no companies (module 4), no rows and export failure (module 10).
- B5 — V2 autosaves only module-10 edits; the product autosaves module-3 / module-4 edits the same way (one override
  store), otherwise the footer "Guardar" would be the only persistence path for them [inference].
- B6 — Dead blocks between module 4 and module 10 (coverage info L983–985 without trigger, Tier info L989–991 and empty
  `categories` grid L992–996) are not built (CF-83).

### Modules (gated)

> P1-11: modules 5–9 are **scope-gated** (CF-02, OQ-02, PLAN D10): they exist only in the Paquete captures (plus README
> intent and uploads), not in the V2 template, so they are built last and can be dropped cleanly if the PO rejects them.
> Gating contract: each module appears in `V-09 modules[]` with `isGated:true`; when the PO disables it the BFF omits it and
> the front renders nothing (no placeholder, no empty card, no route change) [inference: D10 "dropped cleanly"]. Each
> module has its own view endpoint (V-15..V-19) and fails independently (`SectionResult`).
> Numbering and order follow synthesis §1.8 (CF-03): 5 Comparador de Indicadores TBG, 6 Aspiración futura 2040+, 7
> Horizonte TBG, 8 Peso en TBG por dimensión, 9 Perfiles de comparación. This matches the relative order of both Paquete
> captures (Detalle y edición → Comparador → Aspiración → Horizonte → Peso → Perfiles → Resumen); the captures have no
> modules 3–4 (V2-only). README §8 lists a different order (Peso, Aspiración, then the qualitative module) — not followed.
> Copy in these modules is quoted from the captures (`[Paquete:<file>]`); strings that also exist in `HTML` logic carry an
> `HTML Lnnn` pointer. Visual precedence: `3_Tablero_Alejandra_Cuantitativo.png` (lossless) over
> `3_1_Tablero_Andrea_Cualitativo.jpg` (JPEG, same screen, other peer state). Ecopetrol highlight colour is normalised to
> `#83E377` wherever the captures use amber or `#10B981` (CF-11). AI wording follows V2 (CF-12).

#### Module 5 — Comparador de Indicadores TBG [gated]
- Source: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"` (module 2 of
  the capture, `03-reference-images.md` §3.5 item 2); same content in `3_1_Tablero_Andrea_Cualitativo.jpg`. No `HTML`
  template or logic; synthesis §1.8 item 5.
- Layout / copy: card (as modules 3–4). Title "Comparador de Indicadores TBG", subtitle "Analice la posición de Ecopetrol
  frente a las compañías líderes del sector para un indicador específico." [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Controls: two selects, indicator "ROACE" and company scope "Todas las compañías"
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - KPI tiles (4, grey `#F5F6F7`): "ROACE Ecopetrol" "12.8%" · "Promedio TBG" "19.8%" (`#16DB93`) · "Brecha" "-7 pts"
    (`#9A1616`) · "Posición ranking" "7 de 9" [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. The tile label is built as
    `{indicator} Ecopetrol` [inference].
  - Sub-block "Ranking TBG" (i): horizontal bars in rank order Shell, ExxonMobil, TotalEnergies, BP (TBG members, `#16DB93`),
    Chevron, Equinor, Ecopetrol, Petrobras, ISA (others `#B3B9C4`); the Ecopetrol row has a bold label, an editable value
    input and the value "12.8%"; its bar is amber in the capture → `#83E377` (CF-11)
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Sub-block "Pertenencia al TBG" (i): note "Compañías que integran actualmente el grupo de mejor desempeño para este
    indicador."; eyebrow "TOP BENCHMARK GROUP" (green) with chips "✓Shell", "✓ExxonMobil", "✓TotalEnergies", "✓BP"
    (`#D1FAE5`/`#047857`); eyebrow "FUERA DEL TBG" with grey chips "○ Ecopetrol", "○ Chevron", "○ Equinor", "○ Petrobras",
    "○ ISA" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Sub-block "Análisis de brecha" (i): "Distancia al líder" "-9.3 pts" (Roboto Mono, `#9A1616`) and a full-width primary
    button whose capture label "Generar análisis ejecutivo" becomes the V2 wording "Generar narrativa ejecutiva" (HTML L725;
    CF-12) → OVL-08 [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
- Charts: ranking horizontal bars (div): one bar per company sorted by value (descending for higher-is-better
  indicators), fill `#16DB93` for TBG members, `#B3B9C4` for the rest, `#83E377` for Ecopetrol (CF-11); value label at the
  right; no axis, legend or tooltip [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. Negative values follow CF-72.
- Tables: n/a (tiles, bar list and chip groups).
- States: loading skeleton (tiles + 9 bars) [inference]; indicator without TBG data → tiles show `—` and a muted note
  (copy missing) [inference]; error → `Cmp:SectionError`; editing the Ecopetrol value re-ranks and recomputes the tiles
  (server-derived) [inference]; read-only without `canEditValues`; visible in S-TBG and S-ILP, hidden in S-UNION
  [inference: README "TBG+ILP shows only the Horizonte TBG y ILP module"].
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:SelectFilter` × 2,
  `Cmp:KpiStatCard` (grey tile variant), `Cmp:RankingBarList` (member / non-member / Ecopetrol variants, editable Ecopetrol
  value via `Cmp:NumberInput`), `Cmp:ChipGroup` (membership: in / out), `Cmp:Button` (primary, full width),
  `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Data fields (`V-15 GET /api/v1/views/tbg-indicator-comparator/:analysisId?indicatorId=roace&companyScope=all`, gated):
  - `indicator{id, label, unit (%), lowerIsBetter}`; `tiles{ecopetrolValue (number, raw, % — 12,8 in the capture; a
    different ROACE definition from the 7,4 % of modules 3/10, flagged in CF-62), tbgAvg (number, derived = mean of TBG
    members, %), gapPts (number, derived = Ecopetrol − TBG avg, pts), rank (integer, derived), of (integer)}`.
  - `ranking[]{companyId, name, value (number, raw), isTbgMember (boolean, derived from the membership rule), isEcopetrol
    (boolean)}`; `membership{inside[], outside[]}` (company ids, derived); `gapToLeader` (number, derived = Ecopetrol −
    leader, pts; −9,3 in the capture).
  - Command: `C-06` to override the Ecopetrol value; permission `canEditValues`.
  - Formats: es-CO (`12,8 %`, `-7 pts`, `7 de 9`) (CF-70).
- Open points: membership rule (how "top benchmark group" is chosen — top-N, threshold or declared) is not in any source
  [inference: BFF-configurable; PO question G1]; the selects' option lists come from the analysis indicators and a scope
  list whose other values are unknown (G1).

#### Module 6 — Aspiración futura 2040+ [gated]
- Source: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"` (module 3 of
  the capture, `03-reference-images.md` §3.5 item 3); README §8 item 4 (intent); business slide
  `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-18 a la(s) 8.13.32 a.m..png"`
  (quadrant variant, reference only; `06-uploads-png-batch-2.md` D6/D7). `HTML` has quadrant data `QUADRANT_TOP` /
  `QUADRANT_BOTTOM` (L3331–3346) but no template.
- Layout / copy: card; title "Aspiración futura 2040+" (i), subtitle "Producción proyectada de barriles equivalentes por día
  (kbpe/d) por compañía, dividida en 4 segmentos" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Tiles: "Producción Ecopetrol 2040+" "855" kbpe/d · "Posición en producción total" "9 de 10" · "Peso bajas emisiones ·
    Ecopetrol vs. pares" "11%" vs. "9%" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Segment chips (single-select): "Total" (active `#1C2535`) · "Crudo convencional" · "Gas natural" · "No convencional /
    offshore" · "Bajas emisiones (boe eq.)", each non-total chip with its colour square
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Legend adds an outlined square "Grupo Ecopetrol" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Footnote: "Cifras ilustrativas en kbpe/d basadas en la aspiración de largo plazo anunciada por cada compañía · Análisis
    interno de la Gerencia de Estrategia." [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
- Charts: ranked horizontal stacked bars (div), one row per company: rank circle (#1 `#672DBD`, others grey, Ecopetrol
  `#83E377`), company name, stacked segments Crudo convencional `#3E1573`, Gas natural `#7C35EA`, No convencional /
  offshore `#47797A`, Bajas emisiones `#16DB93`, total in Roboto Mono at the right; the Ecopetrol row is highlighted light
  mint; with a segment chip selected, only that segment is drawn and the ranking re-sorts by it [inference]. Mock (Total,
  `docs/design/mock-data-catalog.md` ASPIRATION_2040): 1 Exxon 4.750 · 2 Petrobras 3.370 · 3 Chevron 3.120 · 4 Shell 3.070 ·
  5 TotalEnergies 2.930 · 6 BP 2.410 · 7 Equinor 2.060 · 8 Pemex 1.930 · 9 Ecopetrol 855 · 10 YPF 750 kbpe/d
  [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. Per-segment splits are not legible in the capture → fixtures define them
  so they sum to the totals [inference]. No axis or tooltip; README asks for "per-company interactive detail" → click a row
  opens the company profile (OVL-13) [inference].
- Tables: n/a.
- States: loading skeleton (3 tiles + 10 rows) [inference]; segment with no data for a company → zero-length segment, the
  total stays [inference]; error → `Cmp:SectionError`; read-only (no inputs in the capture); hidden in S-UNION [inference];
  the quadrant matrix of the business slide (I Empresas multienergéticas / II Diversificación / III Descarbonización / IV
  Tradicionales) is **not built** (reference only, synthesis §1.8).
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:KpiStatCard` (tile),
  `Cmp:CategoryChips` (single-select with colour squares), `Cmp:ChartLegend`, `Cmp:RankedStackedBarList` (rank circle,
  highlighted row variant), `Cmp:Footnote`, `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Data fields (`V-16 GET /api/v1/views/future-aspiration/:analysisId?segment=total`, gated):
  - `tiles{ecopetrolProductionKbped (number, raw, kbpe/d), totalRank (integer, derived), of (integer), lowEmissionsSharePct
    {ecopetrol (%, derived), peers (%, derived average)}}`.
  - `segments[]{id: crude | gas | unconventional | lowEmissions, label, colorKey}`.
  - `rows[]{rank (integer, derived for the selected segment), companyId, name, isEcopetrol, segments{crude, gas,
    unconventional, lowEmissions} (numbers, raw, kbpe/d), total (number, derived sum, kbpe/d)}`.
  - `footnoteKey` (i18n). Formats: thousands with `.` (es-CO: `4.750`), unit `kbpe/d` (CF-70).

#### Module 7 — Horizonte TBG / Horizonte TBG y ILP [gated]
- Source: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"` (module 4 of
  the capture, `03-reference-images.md` §3.5 item 4); `HTML` logic (no template): `QUAL_FIN_FOCOS` L3347–3363, `QUAL_DATA`
  L3364–3420, `QUAL_ILP_DATA` L3421–3457, `qualComputed` / averages / top indicators / recommendations L4422–4500,
  horizon + union L4501–4530, company editor L4532+, detail modal L5271–5278 + `DETAIL_DIM_STYLE` L5120–5123, title
  L5270; per-company editor captures `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla
  2026-09-18 a la(s) 11.01.46 a.m..png"` and `…2026-09-18 a la(s) 9.28.14 a.m..png` (CF-22); slides
  `…2026-09-09 a la(s) 1.52.40 p.m..png` (D1), `…2026-09-09 a la(s) 11.07.05 a.m..png` (D2), `…2026-09-18 a la(s) 8.51.39
  a.m..png` (D8).
- Layout / copy (S-TBG): card; title "Horizonte TBG" (HTML L5270), subtitle "Composición de peso por dimensión e indicador
  declarados por cada compañía par en su esquema TBG/ILP" [Paquete:3_Tablero_Alejandra_Cuantitativo.png]; AI pill with the
  V2 label "✦ Recomendaciones de Yarbis" (HTML L1106; the capture says "Recomendaciones de IA", CF-12) → OVL-01; view tabs
  "Resumen general" | "Por compañía" (HTML L4498–4499; active `#672DBD`/white, L4500).
  - "KPIs generales" (i): "11" "Compañías analizadas" · "47%" "Peso promedio Financiera" (`#672DBD`) · "22%" "Peso promedio
    Operativa" (`#0E7490`) · "33%" "Peso promedio Transversal" (`#92400E`) [Paquete:3_Tablero_Alejandra_Cuantitativo.png];
    values = `qualTotalCompanies` and `qualAvgFin/Op/Trans` (L4468–4475; the hybrid Financiera/Operativa dimension counts
    half to each, L4471).
  - "Comparativo de composición por compañía" (i): one 100 % stacked bar per company (Financiera `#672DBD`, Operativa
    `#49BCD8`, Transversal `#FBBF24`, Financiera/Operativa `#94A3B8` — `QDIM_COLORS` L4419; white % labels) with a right
    label "Total:" coloured red `#EF4444` when > 100.5, brown `#92400E` when < 99.5, green `#047857` otherwise (L4494). Mock
    (capture): BP 55/15/31 "Total: 101%" · Equinor 34/34/34 "102%" · Oxy 70/10/20 · Petrobras 33/–/66 "99%" · Repsol
    51/23/26 · Shell 35/40/26 "101%" · TotalEnergies 62/14/24 · Chevron 40/25/35 · ISA 50/20/30 · Exxon 45/20/35 · PTTEP
    45/20/35 [Paquete:3_Tablero_Alejandra_Cuantitativo.png]; legend Financiera / Operativa / Transversal.
  - "Principales indicadores por dimensión" (i) + outline button "Detalle por compañía (TBG e ILP)" → OVL-15
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. Three cards:
    - Financiera (`#672DBD`): three focus groups from `QUAL_FIN_FOCOS` (L3347–3363) — "Generación de caja" (Oxy "Flujo de
      caja libre (FCL) antes de capital de trabajo" 40 %, Shell "Flujo de caja operativo (FCO)" 35 %, BP "FCL" 30 %),
      "Eficiencia y resiliencia financiera" (Oxy "Costo total integrado por barril" 30 %, BP "Reducción de costos
      estructurales" 25 %, TotalEnergies "Punto de equilibrio de caja" 17 %), "Rentabilidad y creación de valor" (Petrobras
      "Valor económico generado" 33 %, Equinor "ROACE relativo y Retorno Total al Accionista relativo" 17 %, TotalEnergies
      "Retorno sobre patrimonio" 17 %); each ends with a green Ecopetrol callout `Ecopetrol → {ecoText}` where ecoText is
      "Flujo de Caja Libre (10%)", "Eficiencias (5%) y Costo Total Unitario de HC (5%)", "ROACE (10%) y Valor ISA (10%)"
      (L3352, L3357, L3362).
    - Operativa (`#0E7490`): top 3 by weight (`qualTopByDim('op')`, L4487–4491) — capture: ISA "Confiabilidad y
      Disponibilidad de la Red" 20 %, Exxon "Producción de hidrocarburos" 20 %, PTTEP "Producción de hidrocarburos" 20 %;
      amber callout "Ecopetrol: indicadores operativos del TBG en definición con los equipos expertos"
      [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
    - Transversal (`#92400E`): Petrobras "Reducción de GEI" 33 %, Petrobras "Volumen de petróleo y derivados derramados"
      33 %, Exxon "TRIF" 20 %; amber callout "Ecopetrol: indicadores transversales del TBG en definición con los equipos
      expertos" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
    README: Ecopetrol is always shown in a distinguished bordered callout (D8).
  - "Por compañía" tab — per-company weight editor (CF-22, placement [inference]): heading "Editar pesos por compañía"
    [inference: capture `Captura de pantalla 2026-09-18 a la(s) 9.28.14 a.m..png`]; company tabs (the 11 peers, no
    Ecopetrol; `qualCompanyTabs` L4507–4510, default BP `qualCompanyId:'bp'` L3577); danger banner when the company total
    is outside 99.5–100.5 (L4466–4467) with the capture copy "⚠ El total de" + company + " suma " + n + "%, no 100%.
    Ajusta los pesos." [inference: capture `Captura de pantalla 2026-09-18 a la(s) 11.01.46 a.m..png`; V2's generic
    variant is "⚠ Una o más compañías superan el 100% en la sumatoria de pesos." HTML L1239]; one bordered group per
    dimension (colour square + label + total %) with rows label + number input (Roboto Mono) + "%" — same
    `Cmp:DimensionGroup` / `Cmp:EditableValueRow` as module 2 without the Real/Estimado chip; totals update live
    (`qualComputed`, L4422–4430). Weights accept decimals (Shell 7,5 / 7,5 → 100 %, CF-65; V2 stores 8 / 8 → 101 %).
- Layout / copy (S-ILP): same card titled with the ILP horizon [inference: part A S-ILP], KPIs and composition computed
  over `QUAL_ILP_DATA` (7 companies: Shell, BP, Equinor, Oxy, Petrobras, Repsol, TotalEnergies, L3421–3457); "Principales
  indicadores por dimensión" lists ILP indicators per dimension (`ilpDimGroups`, L5115–5118; colours Financiera `#672DBD`,
  Operativa `#0E7490`, Transversal `#92400E`, L5048); hito items show their sub-items (see part A Horizon states).
- Layout / copy (S-UNION): title "Horizonte TBG y ILP" (HTML L5270) and the side-by-side TBG | ILP panel defined in part A
  `#### Horizon states`; the other sub-blocks are replaced by that panel [inference].
- OVL-15 "Detalle por compañía (TBG e ILP)" (critic M-03; overlays.md row OVL-15): modal (z 29, `Cmp:Modal`) opened by
  the outline button; company tabs (`qualDetailCompanyTabs` = `qualCompanyTabs`, L5271); header `{company}` + TBG
  indicator count `qualDetailTbgCount` (L5278); one block per TBG dimension with `DETAIL_DIM_STYLE` colours (L5120–5123:
  Financiera `#1E3A8A` on `#E9F0FB`, Operativa `#65A30D` on `#EAF6DC`, Transversal `#6B7280` on `#F1F2F4`,
  Financiera/Operativa `#475569` on `#EDEFF2`), dimension total %, item count and items label · % (L5273–5277); plus an
  ILP column for companies with ILP data (hito + sub-items) [inference: title says TBG e ILP; logic only builds TBG];
  default dimension focus `qualDetailDim:'fin'` (L3579). Close "✕" / scrim / Esc.
- OVL-01 content for this module (`qualRecos`, L4482–4486): three cards labelled "Indicador más concentrado", "Consistencia
  de datos", "Dimensión Financiera" (tones info / watch / action) with rule-built texts, e.g. `{company}` + " concentra el
  mayor peso individual con " … (L4483) and "El peso promedio en Financiera (" … (L4485).
- Charts: 100 % stacked horizontal bars (composition per company), weight bars inside the focus cards (Operativa /
  Transversal bars in the dimension colour), no axes / tooltips [Paquete:3_Tablero_Alejandra_Cuantitativo.png]; S-UNION
  adds two stacked bars (part A).
- Tables: n/a (bars, cards and the editor form list).
- States: loading skeleton per sub-block [inference]; a company whose weights do not sum to 100 shows the coloured
  "Total:" and, in the editor, the danger banner (saving is still allowed; `C-07` returns `warnings[]`, synthesis C-07);
  no ILP data for a company (S-ILP / S-UNION) → explicit empty state (part A A2) [inference]; error → `Cmp:SectionError`;
  editor read-only without `canEditWeights`; saving the editor shows the "✓ Cambios guardados" confirmation (HTML L841
  pattern) [inference].
- **M-02 decision — "Top 3 indicadores con mayor peso individual" (README §8.5; `qualTopIndicadores` L4478, not rendered):
  drop as a separate widget** [inference]. Reasons: neither Paquete capture (the newest source, `3_Tablero_Alejandra_
  Cuantitativo.png`) shows it; the same information is already surfaced by "Principales indicadores por dimensión" (top 3
  per dimension) and by the Yarbis recommendation "Indicador más concentrado" (L4483, built from `qualHighest` =
  `qualTopIndicadores[0]`). With the V2 data it would list Oxy "Flujo de caja libre antes de variaciones en capital de
  trabajo" 40 %, Shell "Flujo de caja de actividades operativas" 35 %, Petrobras "Valor financiero y económico generado"
  33 % (L3377, L3391, L3382). `V-17` keeps an optional `topIndicators[3]` so the PO can re-enable it without a contract
  change. Conflict reference: proposed **CF-87** (README widget vs V2 / Paquete) — to be appended to
  `docs/design/conflicts.md` by its owner (this task edits only this file).
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton` (md),
  `Cmp:SegmentedTabs` (view tabs; company tabs), `Cmp:KpiStatCard`, `Cmp:StackedBarRow` (100 % composition + total label),
  `Cmp:ChartLegend`, `Cmp:FocusCard` (dimension card with focus groups, weight rows and `Cmp:EcopetrolCallout` green /
  amber variants), `Cmp:Button` (outline), `Cmp:AlertBanner`, `Cmp:DimensionGroup`, `Cmp:EditableValueRow`,
  `Cmp:NumberInput`, `Cmp:Modal` (OVL-15 `Cmp:CompanyWeightDetailModal`; OVL-01), `Cmp:HorizonUnionPanel`, `Cmp:HitoItem`,
  `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Data fields (`V-17 GET /api/v1/views/tbg-horizon/:analysisId?horizon=tbg|ilp|union&view=summary|company&companyId=`,
  gated; extended per M-01):
  - `kpis{companies (integer), avgFinPct, avgOpPct, avgTransPct (%, integers, derived; finop split half/half)}`.
  - `composition[]{companyId, name, finPct, opPct, transPct, finOpPct? (%, derived sums of item weights), totalPct (%,
    1 decimal, derived), sumStatus (ok | over | under, derived with tolerance 99.5–100.5)}`.
  - `mainIndicators[]{dimension, foci[{title (string | null), items[{companyId, label, weightPct (%, raw)}], ecopetrolText
    (string), ecopetrolStatus (defined | in_definition)}]}`.
  - `companyEditor{companyId, groups[{dimension, label, totalPct (derived), items[{indicatorId, label, weightPct (number,
    raw, decimals allowed), isHito (boolean), subItems[] (strings)}]}], totalPct, sumStatus}`; command `C-07` weight
    overrides → `warnings[]`; permission `canEditWeights`.
  - `union{tbg{dims[], totalPct, count}, ilp{dims[], totalPct, count, hitoCount}}` (part A); `topIndicators[3]?`
    (optional, M-02); OVL-15 uses `companyDetail{companyId, tbg[], ilp[]}`; OVL-01 uses `V-23` (`scope=horizon`).

#### Module 8 — Peso en TBG por dimensión · GE vs. pares [gated]
- Source: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"` (module 5 of
  the capture, `03-reference-images.md` §3.5 item 5); README §8 item 3; slides D1 / D6 (`Captura de pantalla 2026-09-09 a
  la(s) 1.52.40 p.m..png`, `…2026-09-18 a la(s) 8.13.32 a.m..png`, dot plots). `HTML` logic shared with SCR-09
  "Composición de peso por línea de indicador": peer weights `pesosCompania` L3608–3615, `ECOPETROL_PESO` L4607, averages
  `pesoPromedio` L4601–4605, gaps / recommendations L4701–4706.
- Layout / copy: card; title "Peso en TBG por dimensión · GE vs. pares" (i), subtitle "Ponderación declarada por cada
  compañía en su TBG/ILP, comparada con el peso de Ecopetrol y el promedio del grupo"; AI pill "✦ Recomendaciones de Yarbis"
  (HTML L1106) → OVL-01 (`V-23`); dimension tabs "Financiera" (active) · "Operativa" · "Transversal" (HTML L4596)
  [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Comparison bars: "Ecopetrol" 45 % (capture `#10B981` → `#83E377`, CF-11) and "Promedio pares" 43 % (`#672DBD`); message
    "Ecopetrol está +2 pts vs. el promedio de pares en Financiera" (green when above, red when below [inference])
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. Values reproduce `ECOPETROL_PESO.fin` 45 (L4607) and the mean of
    `pesosCompania` fin (55+33+35+62+40+33)/6 = 43 (L3608–3615, L4602).
  - "Detalle por compañía · Financiera" ranking: 1 TotalEnergies 62 % · 2 BP 55 % · 3 Oxy 40 % · 4 Shell 35 % · 5 Equinor
    33 % · 6 Petrobras 33 % (grey bars) [Paquete:3_Tablero_Alejandra_Cuantitativo.png]; heading built as `Detalle por
    compañía · {dimension}` [inference].
- Charts: two comparison bars (Ecopetrol vs peer average, same scale 0–100 %) and a ranked bar list of peers for the active
  dimension (grey `#B3B9C4`), value labels at the right; no axis or tooltip [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  The slide dot-plot variant (D1 / D6) is not built.
- Tables: n/a.
- States: loading skeleton [inference]; Ecopetrol exactly at the average → neutral message (copy missing) [inference];
  error → `Cmp:SectionError`; read-only; hidden in S-UNION [inference].
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton`,
  `Cmp:SegmentedTabs` (dimension), `Cmp:ComparisonBars` (Ecopetrol vs average), `Cmp:RankingBarList`, `Cmp:Modal`
  (OVL-01), `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Data fields (`V-18 GET /api/v1/views/tbg-dimension-weights/:analysisId?horizon=tbg&dimension=fin`, gated):
  `ecopetrolPct` (%, raw — 45 in V2 / capture; the business slides D1 / D2 say 40 / 35 / 25, see G3), `peerAvgPct` (%,
  derived mean), `diffPts` (pts, derived, signed), `messageKey` + params (i18n), `detail[]{rank (derived), companyId,
  name, pct (%, raw)}`. Formats: integers with `%`, signed `+2 pts` (CF-70).

#### Module 9 — Perfiles de comparación + Ecopetrol en cada perfil [gated]
- Source: `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_Tablero_Alejandra_Cuantitativo.png"` (2 peers
  state) and `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\3_1_Tablero_Andrea_Cualitativo.jpg"` (4 peers
  state) — module 6 of both captures, `03-reference-images.md` §3.5 item 6 + the P3 vs P4 diff table. No `HTML` template or
  logic.
- Layout / copy: card; title "Perfiles de comparación" (i), subtitle "Compara a Ecopetrol bajo distintos escenarios
  estratégicos, cada uno con su propio set de pares, ponderación por dimensión TBG y vigencia"; AI pill (capture "✦
  Generar análisis ejecutivo" → V2 wording "Generar narrativa ejecutiva", CF-12) → OVL-08
  [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Profile tabs: "Perfil 1 · Descarbonización" (active) · "Perfil 2 · Hidrocarburos" · "Perfil 3 · Gas" · dashed "+ Nuevo
    perfil" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Left column "Configuración del perfil" (i): name input (value "Perfil 1 · Descarbonización"); "Tipo de negocio" chips
    "Todos los negocios" · "Hidrocarburos" · "Upstream" · "Gas y GNL" · "Descarbonización · Renovables" (active)
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Indicators of the business type, per dimension (heading "Indicadores del tipo de negocio · Descarbonización ·
    Renovables"): Financiera "EBITDA de generación baja en carbono", "TSR relativo", "Retorno sobre patrimonio"; Operativa
    "Capacidad renovable (GW)", "Combustibles renovables (mta)", "Puntos de carga EV"; Transversal "Índice de intensidad de
    carbono", "Intensidad de carbono ciclo de vida", "Proyectos de bajas emisiones"
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - "Vigencia de indicadores": "2023" · "2024" · "2025" (active `#1C2535`)
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - "Empresas pares del perfil · 4 disponibles en este tipo de negocio": peer chips (selected ✓ / addable +); capture state
    ✓Shell, +BP, +TotalEnergies, ✓Equinor [Paquete:3_Tablero_Alejandra_Cuantitativo.png]; the other capture has all four
    selected [Paquete:3_1_Tablero_Andrea_Cualitativo.jpg].
  - "Ponderación por dimensión TBG" "100%": Financiera slider 40 · Operativa 25 · Transversal 35, each with a numeric box
    (sliders themed, OQ-11); red link "Eliminar este perfil" [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Right column: tiles "Puntaje Ecopetrol" "64.8" · "Brecha vs. pares" (red) · "Posición"; ranking list (peers `#B3B9C4`,
    Ecopetrol `#83E377`); Yarbis note (`#E3F6FA`, bold "✦ Yarbis:" `#0E7490`)
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - "Ecopetrol en cada perfil" (i) summary table (see Tables); footnote "Puntajes por dimensión ilustrativos (0–100) por
    compañía y vigencia." [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
- **Profiles oracle (test contract, critic K.3 P1-11; P4-22 acceptance):** Perfil 1 · Descarbonización, vigencia 2025,
  weights 40 / 25 / 35, Ecopetrol score 64.8:
  - 4 peers (Shell, BP, TotalEnergies, Equinor) → Brecha **−11.6 pts** (capture text "-11.6 pts"), Posición **"5 de 5"**,
    peer average 76.4, ranking 1 TotalEnergies 78.4 · 2 Shell 77.6 · 3 Equinor 76.7 · 4 BP 73 · 5 Ecopetrol 64.8
    [Paquete:3_1_Tablero_Andrea_Cualitativo.jpg].
  - 2 peers (Shell, Equinor) → Brecha **−12.4 pts** (capture text "-12.4 pts"), Posición **"3 de 3"**, peer average 77.2,
    ranking 1 Shell 77.6 · 2 Equinor 76.7 · 3 Ecopetrol 64.8 [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
  - Yarbis note (2 peers): "…ocupa el puesto 3 de 3 con 64.8 pts (-12.4 vs. pares). Su mayor brecha está en la dimensión
    Transversal (-20 pts): subir su peso en el perfil amplifica el rezago, bajarlo mejora la posición relativa. Entre los
    perfiles, el escenario más favorable es "Perfil 2 · Hidrocarburos" y el más exigente "Perfil 1 · Descarbonización"."
    — 4 peers: "puesto 5 de 5 … (-11.6 vs. pares) … Transversal (-21 pts)"
    [Paquete:3_Tablero_Alejandra_Cuantitativo.png] [Paquete:3_1_Tablero_Andrea_Cualitativo.jpg].
  - The module is fully reactive to peer selection, weights and vigencia: every change recomputes score, gap, position,
    ranking, note and the table row server-side (`C-39`) [inference].
- Charts: ranking horizontal bars (peers `#B3B9C4`, Ecopetrol `#83E377`) with scores; sliders for the three dimension
  weights; no axis or tooltip [Paquete:3_Tablero_Alejandra_Cuantitativo.png].
- Tables:
  - "Ecopetrol en cada perfil": columns "PERFIL" · "AÑO" · "ECOPETROL" · "PARES" · "BRECHA" · "POSICIÓN" (header
    uppercase) [Paquete:3_Tablero_Alejandra_Cuantitativo.png]. One row per profile; the active profile row is highlighted
    `#F3EEFB`; the Perfil cell has a sub-line `{business type} · {peers}`. Rows (2-peer capture): Perfil 1 ·
    Descarbonización · 2025 · 64.8 · 77.2 · -12.4 pts · 3 de 3; Perfil 2 · Hidrocarburos ("Hidrocarburos · Upstream ·
    Exxon, Chevron, Petrobras, Pemex") · 2025 · 66.2 · 70.5 · -4.3 pts · 4 de 5; Perfil 3 · Gas ("Gas y GNL · Equinor,
    Shell, TotalEnergies, YPF") · 2024 · 62.1 · 70.8 · -8.7 pts · 4 de 5 [Paquete:3_Tablero_Alejandra_Cuantitativo.png]
    (`docs/design/mock-data-catalog.md` ASPIRATION_ECO_PERFIL). In the 4-peer capture only row 1 changes: sub-line "… ·
    Shell, BP, TotalEnergies, Equinor", pares 76.4, −11.6 pts, 5 de 5 [Paquete:3_1_Tablero_Andrea_Cualitativo.jpg].
  - Brecha in red when negative; no sorting, paging or totals; clicking a row selects that profile [inference].
- States: loading skeleton (tabs + two columns + table) [inference]; profile with no peers selected → right column shows a
  muted note and tiles `—` (copy missing) [inference]; weights not summing to 100 → the "100%" badge turns red and
  results are not recomputed until fixed [inference: README weight-sum rule]; "Eliminar este perfil" asks for confirmation
  (the last profile cannot be deleted) [inference]; "+ Nuevo perfil" creates "Perfil n" with default config (`C-38`)
  [inference]; error → `Cmp:SectionError`; editing requires `canEditProfiles`; hidden in S-UNION [inference].
- Components: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton`,
  `Cmp:SegmentedTabs` (profile tabs + dashed add tab), `Cmp:TextField`, `Cmp:CategoryChips` (business type, vigencia),
  `Cmp:ChipGroup` (indicator chips per dimension; peer chips selectable), `Cmp:WeightSliderRow` (slider + number box,
  from SCR-12) with `Cmp:Badge` (sum), `Cmp:TextLink` (danger variant), `Cmp:KpiStatCard`,
  `Cmp:RankingBarList`, `Cmp:AiTipBanner` (Yarbis note, from SCR-12), `Cmp:DataTable` (highlighted active row, sub-line
  cell), `Cmp:Footnote`, `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Data fields (`V-19 GET /api/v1/views/comparison-profiles/:analysisId?profileId=`, gated; commands `C-38` create, `C-39`
  update, `C-40` delete):
  - `profiles[]{id, name, businessTypeId}` (tabs).
  - `config{name (string), businessType (id; options Todos los negocios / Hidrocarburos / Upstream / Gas y GNL /
    Descarbonización · Renovables), indicators{fin[], op[], trans[]} (catalog labels, derived from business type),
    validityYear (2023 | 2024 | 2025), availablePeerIds[] (derived by business type), peerIds[] (selected), weights{fin,
    op, trans} (%, integers, must sum to 100)}`.
  - `result{score (number 0–100, 1 decimal, derived), gapPts (number, derived = score − peer average, signed), position
    (integer, derived), of (integer = peers + 1), peerAvg (number, derived), ranking[]{companyId, name, score,
    isEcopetrol}, insight (string, AI suggestion, status 'suggestion')}`.
  - `summaryTable[]{profileId, name, subtitle (business type · peers), year, ecopetrolScore, peerAvg, gapPts, position,
    of, isActive}`.
  - Formats: scores with one decimal (es-CO `64,8`), gap `-12,4 pts`, position `3 de 3` (CF-70). Oracle values above are
    fixtures for P4-22 tests.

#### Gated modules — open questions
- G1 — Module 5: TBG membership rule and the options of the two selects are not in any source; ROACE 12,8 % differs from
  the 7,4 % used elsewhere (CF-62: kept as a different metric definition, flagged).
- G2 — Module 6: per-segment kbpe/d splits are not legible; fixtures must define them. The quadrant matrix of slide D6 is
  reference only.
- G3 — Module 8: Ecopetrol's own weights disagree across sources — V2 and the capture 45 / 30 / 25 (HTML L4607) vs slides
  D1 / D2 40 / 35 / 25 (`docs/design/mock-data-catalog.md` TBG_WEIGHTS); screen parity keeps 45 (PO to confirm). Peer
  weights in module 8 (`pesosCompania`: Oxy 40, TotalEnergies op 20) also differ from module 7's `QUAL_DATA` (Oxy 70,
  TotalEnergies op 14) (CF-65).
- G4 — Module 7: the per-company editor placement under "Por compañía" is inferred (CF-22); OVL-15's ILP column is
  inferred from its title.
- G5 — M-02: the Top-3 individual-weight widget dropped (proposed CF-87); re-enable only via PO decision.
- G6 — Module 9: profile persistence scope (per analysis or per user) and deletion rules are not in any source.
- G7 — Visibility of modules 5, 6, 8, 9 in S-ILP / S-UNION is inferred from README (`TBG+ILP shows only the Horizonte TBG
  y ILP module`); module 7 is the only gated module shown in S-UNION.
