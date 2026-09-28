## SCR-07 — Definición del análisis (5-step wizard)

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (quote the path in shell;
> `Lnnn` = line number). Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not
> literally in `HTML` carries `[inference]` or `[Paquete:<file name>]`. Field labels are written in sentence case in the source
> and rendered uppercase by CSS (`text-transform:uppercase`); they ship in sentence case through i18n and are uppercased by
> style. Components are tagged `Cmp:PascalName` (reconciled by P1-17). Conflict ids (`CF-nn`), open questions (`OQ-nn`),
> endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18;
> business rules (`BR-nn`) to `.plan/source-map/04-requirements-docs.md` §BR.

- Source files:
  - Primary (precedence 1): `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` template L445–718
    (screen block `isDefinicion`); logic: `CATEGORIES` L3295 (feeds step 5 list), `COMPANY_PROFILES` L3504–3522,
    `COMPANY_GROUPS` L3523–3530, `LINEAS_NEGOCIO` L3531–3535, initial state L3547 (`selectedCompanies`), L3548
    (`wizardStep:1`), L3591 (`step3Source`, `step3ConceptFilter`, `step3HorizonteFilter`), L3616 (`tipoAnalisis:'tbg'`,
    `analysisName`), `PROACTIVE.definicion` L3226, `openProfile` L3751, `tipoAnalisisOptions` L3853–3857, `lineaOptions`
    L3858–3862, `companyGroups` L3863–3875, `wizardSteps`/`wizard` L3966–3972, `wizardNext`/`wizardBack` L3974–3975,
    `selectedCompanyCount`/`Names` L3976–3977, `validationIndicators` L3978, `PARES_METRICS` L5018–5046 (27 entries),
    `TBGILP_METRICS` L5049–5114 (64 entries), step-3 tabs/filters/groups L5124–5153, title map `definicion` L5156,
    `suggestionsMap.definicion` L5160, `goDefinicionNuevo` L5203, bindings L5214, L5223–5225, L5231, L5484–5486.
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador\README.md` §7 "Definición del análisis" and
    `design_handoff_benchud_comparador\BACKEND.md` (enums `estrategico_tbg|estrategico_ilp|desempeno_pares`, `lineaNegocio`,
    source enum `capital_iq|bloomberg|platts|interna_ecp`, `periodoActual`/`periodoComparado`, homologation rule 1) — digest in
    `.plan/source-map/01-handoff-docs.md` L248–262, L738.
  - Uploads (reference only): `"V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-08 a la(s) 3.35.11 p.m..png"`
    (early "Definición general" card, 4T 2024 — superseded, CF-25); `Captura de pantalla 2026-09-08 a la(s) 11.52.15 a.m..png`
    (workshop wireframe "WIREFRAME PARA COCREAR · Definición del análisis" — requirements context); `Captura de pantalla
    2026-09-07 a la(s) 2.53.46 p.m..png` (AS-IS benchmark "Ficha técnica", 34-indicator catalog — CF-54); `Captura de pantalla
    2026-09-08 a la(s) 12.02.03 p.m..png` (Ecopetrol DS "Tema 3" stepper form — pattern reference, CF-61).
  - Reference images: none. No Paquete image covers this screen, and
    `design_handoff_benchud_comparador\screenshots\04-definicion.png` is mislabelled (it shows the Dashboard,
    `03-reference-images.md` H6). The visual baseline is the P1-03 render of `HTML`.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.7 (L212–243), §1.19, §5; `.plan/source-map/02-prototype-html.md`
    §3 "SCR-06 Definición del análisis" (L168–199; the 02 file numbers screens differently), §9.2, §9.8 (L486–488), §9.9
    (L489–493).
- Proposed route: `/analisis/:analysisId/definicion?paso=1..5` — `:analysisId` is the draft id; `paso` in the URL (default 1,
  clamped to 1..5, invalid → 1). Creation: Análisis "+ Crear nuevo análisis" (HTML L387, `goDefinicionNuevo` L5203 clears the
  name) → `C-01 POST /api/v1/analysis-drafts` → redirect to `/analisis/<draftId>/definicion?paso=1`. Editing: analysis tab
  "Configuración" (SCR-04 tab bar) and Inicio card "Monitor de Valor" (HTML L4324 `setScreen('definicion')`) open the current
  analysis' definition. Guard: authenticated and `analyst_creator` (others → SCR-17 `/403`). Header title: "Definición del
  análisis" (HTML L5156). Sidebar active item: none [inference: `definicion` is not a rendered sidebar row].
- Layout:
  - Inside `Cmp:AppShell` (SCR-04) with the analysis tab bar at the top, "Configuración" active (`showAnalysisTabs`, HTML
    L3796).
  - Content root: `display:grid; gap:20px; max-width:960px`, `fadeUp .3s ease` (HTML L446).
  - Stepper row: flex, gap 6, `margin-bottom:4px` (HTML L448); 5 items `flex:1` each = 26px circle (`600 12px`) + label
    (`500 12px #424E63`, nowrap) + 2px connector `#DFE2E6` (HTML L450–453).
  - Step card: `#fff`, `1px solid #DFE2E6`, radius 12, padding 22 (HTML L459); header row = title `600 14px` + 16px info "i"
    `#518CD1` (HTML L461–462); inline info panel `#F5F6F7`, radius 8, `400 12px #424E63` (HTML L465).
  - Step 1 fields in a vertical grid; the two period groups sit side by side [inference from the flex wrapper L488–516].
  - Footer: flex `space-between`, gap 10 (HTML L708): "‹ Anterior" left; "Generar análisis" (step 5) or "Siguiente ›" (steps
    1–4) right.
- Tabs:
  - Analysis tab bar (SCR-04): "Configuración" (this screen, active) | "Resultados" | "Presentación".
  - Wizard stepper (acts as tabs): order "Información general" · "Competidores" · "Indicadores" · "Fuentes" · "Validación"
    (HTML L3966); default step 1 (HTML L3548); every step is clickable in any order (HTML L3971). The stepper label
    "Indicadores" differs from the card title "Paso 3 · Selección de indicadores" (HTML L586) — both kept verbatim (CF-35).
  - Step 3 source tabs: "Referenciamiento de pares" (default) | "TBG e ILP" (HTML L5125–5126).
- Sections:
  1. Stepper (HTML L448–456).
  2. Active step card — one of "Paso 1 · Información general" (HTML L461), "Paso 2 · Competidores" (HTML L553), "Paso 3 ·
     Selección de indicadores" (HTML L586), "Paso 4 · Fuentes" (HTML L650), "Paso 5 · Validación" (HTML L673). Content per
     step in `### Steps` below.
  3. Footer navigation (HTML L708–716).
- Components:
  - `Cmp:AppShell`, `Cmp:SegmentedTabs` (analysis tab bar, from SCR-04)
  - `Cmp:WizardStepper` (with `Cmp:WizardStep` states `done`, `current`, `pending`)
  - `Cmp:Card` (step card)
  - `Cmp:SectionTitle` (title + `Cmp:InfoToggle`)
  - `Cmp:InfoToggle` ("i" 16px / 14px) + `Cmp:InfoPanel` (inline `#F5F6F7` text, one open at a time — CF-61 click-toggle)
  - `Cmp:FieldLabel` (eyebrow label `500 11px #98A1B0` uppercase)
  - `Cmp:ChoiceChip` (single-select: Tipo de análisis; multi-select: Alcance) and `Cmp:FilterChip` (Línea de negocio,
    Concepto de planeación, Horizonte)
  - `Cmp:TextField`, `Cmp:TextArea`, `Cmp:Select` (quarter, year), `Cmp:DateField`
  - `Cmp:SourceTabs` (step 3 "Referenciamiento de pares" / "TBG e ILP" — pill tabs `#672DBD`)
  - `Cmp:CompanyTile` (selectable, with `Cmp:InfoIconButton` → OVL-13)
  - `Cmp:CompanyProfileModal` (OVL-13)
  - `Cmp:GroupEyebrow` (company group label `600 11px #808A9B` uppercase)
  - `Cmp:IndicatorGroup` (bordered group box) with `Cmp:IndicatorPill` (label + `Cmp:CodeTag`) and `Cmp:IndicatorRow` (label +
    `Cmp:CodeTag` + `Cmp:HorizonBadge`)
  - `Cmp:CodeTag` (`600 10px 'Roboto Mono' #98A1B0`)
  - `Cmp:HorizonBadge` (TBG `#E9F1FD`/`#47A4D5`; ILP `#E3F6FA`/`#0E7490`)
  - `Cmp:SelectAllToggle` (bulk select per group) [inference: BR-13]
  - `Cmp:StaticChip` (read-only source chips, selected competitor chips, indicator chips)
  - `Cmp:AiSuggestionBox` (`#E3F6FA`/`#A8E6EC`/`#0E7490`, "✦ Yarbis: …")
  - `Cmp:AlertBanner` (variant `warning`: exclusion alert, step 5) [inference]
  - `Cmp:SummaryRow` (step 5 label/value rows)
  - `Cmp:Button` (variants `secondary` outline "‹ Anterior", `primary` "Siguiente ›", `ai` `#49BCD8` "Generar análisis")
  - `Cmp:AutosaveToast` ("Guardando…/Guardado" after `C-02`) [inference]
  - `Cmp:OperationProgress` (after "Generar análisis", `202` + operation SSE — M-06) [inference]
  - `Cmp:SectionResult` (loading / error wrapper per catalog)
- Charts: n/a
- Tables: n/a (catalogs render as chip/pill groups and rows, not tables).
- Filters & controls:
  - Wizard step: integer 1..5, default 1, **in URL** (`paso`).
  - Step 1: Tipo de análisis (single choice, default "Estratégico TBG", HTML L3616), Nombre (text), Objetivo (textarea),
    Pregunta (textarea), Periodo actual (quarter Q1–Q4 + year 2022–2026, default Q4 2025), Periodo comparado (default Q3
    2025), Fecha de corte (date, empty), Alcance (chips) — persisted in the draft via `C-02`, **not** in the URL.
  - Step 2: Línea de negocio filter "Todas" (default) / "Oil & Gas" / "Energéticos" — view filter, not saved in the draft;
    in URL as `linea=todas|oil-gas|energeticos` [inference]; company selection saved in the draft.
  - Step 3: source tab `pares|tbg-ilp` (default `pares`), concept filter (multi, default none = all), horizon filter (multi,
    default none = all) — in URL as `fuente=`, `conceptos=`, `horizontes=` [inference]; indicator selection saved in the draft.
  - Step 4: none (read-only).
  - Step 5: none (summary).
  - Details and defaults per field in `### Steps`.
- States:
  - Loading: `V-05 analysis-definition` loading → stepper + card skeleton; step 2/3 catalogs (`V-06`, `V-07`) load
    independently inside `Cmp:SectionResult` [inference].
  - Empty: new draft → step 1 name empty (HTML L5203 clears `analysisName`), other fields use contract defaults; step 3 with
    all concept/horizon filters excluding everything cannot happen (empty filter = all, HTML L5129, L5140); no competitors
    selected → step 5 shows "Competidores seleccionados (0)" and generation blocked [inference].
  - Error: catalog error → `Cmp:SectionResult` error with retry inside the step; `C-02` failure → field-level errors from the
    `ApiError` `details` plus a non-blocking autosave error toast; `C-03` failure → `Cmp:AlertBanner` error above the footer
    [inference].
  - Validation: `V-05 stepStatus[]` drives stepper states (`done` = valid and visited, `current`, `pending`; invalid visited
    step → `pending` with error dot [inference]); "Generar análisis" disabled until `permissions.canGenerate` and all steps valid.
  - No permission: non-analyst → `/403`; draft owned by another analyst → read-only fields (`permissions.canEdit=false`)
    [inference].
  - Partial: exclusion alert on step 5 when `V-08 exclusionAlert.companies[]` is non-empty (companies below the homologation
    threshold, BACKEND rule 1).
  - Generating: after `C-03` → `202 { operationId }` → `Cmp:OperationProgress` (SSE `GET /api/v1/operations/:operationId/events`)
    → on success navigate to Resultados (SCR-08) [inference: prototype navigates immediately, HTML L711 `goResultados`].
- Interactions:
  - Stepper item click → go to that step (HTML L3971); "‹ Anterior" → step − 1 (min 1, HTML L3975); "Siguiente ›" → step + 1
    (max 5, HTML L3974); all update `?paso=`.
  - Every field change autosaves the step with `C-02 PATCH /api/v1/analysis-drafts/:draftId` (debounced ~500 ms)
    [inference: prototype has no persistence].
  - "i" toggles its inline info panel (steps 1, 3, 4, 5 and "Periodo comparado"; step 2's "i" toggles a state but renders no
    text — HTML L554, `02-prototype-html.md` L181 — ship without the icon or with PO-provided copy, OQ).
  - Step 2: tile click toggles selection (HTML L3870); tile "i" opens OVL-13 company profile without toggling (HTML L3871
    `stopPropagation`).
  - Step 5: "Generar análisis" → `C-03 POST /api/v1/analysis-drafts/:draftId/generation` → `202` → progress → Resultados
    (SCR-08, `/analisis/:analysisId/resultados`).
  - Yarbis (SCR-04 panel): proactive tip on first visit "Te sugiero incluir Chevron: comparte características operativas con
    Ecopetrol y mejora la comparabilidad del análisis." (HTML L3226); suggestion chips "Sugiéreme pares para Hidrocarburos",
    "¿Qué fuentes usa este análisis?" (HTML L5160). Different message from the step-2 box (CF-75, both kept).
  - Leaving with unsaved changes: none (autosave) [inference].
  - No drawers or exports.
- Data fields:
  - `V-05 GET /api/v1/views/analysis-definition/:draftId?step=`: `draft{ type: 'estrategico_tbg'|'estrategico_ilp'|'desempeno_pares',
    name: string, objective: string, question: string, currentPeriod{ year: int, quarter: 1..4 }, comparedPeriod{ year, quarter },
    cutOffDate: ISO date|null, scope[]: ('grupo_ecopetrol'|'isa'), competitorIds[]: string, indicatorIds[]: string, sources[] }`,
    `stepStatus[]{ step, status: 'valid'|'invalid'|'untouched', errors[] }`, options (types, quarters, years, scopes),
    `permissions{ canEdit, canGenerate }`; optional `temporalView` (`ultimo_trimestre|dos_ultimos_trimestres|consolidada_3q|anual`,
    CF-35) not rendered in v1.
  - `V-06 GET /api/v1/views/competitor-catalog?businessLine=all`: `groups[]{ id, label, businessLine, companies[]{ id, name, country,
    category, colorKey } }`, `suggestion{ text }` (Yarbis box).
  - `V-07 GET /api/v1/views/indicator-catalog?source=pares|tbg-ilp&concepts=&horizons=`: `groups[]{ id, label, items[]{ id (stable),
    code (display, e.g. "PAR-01", "TBG-01", "ILP-01"), label, unit ('%'|'x'|'USD/B'|…), concept|dimension, horizon?, sources[] } }`,
    `totals{ categories, indicators }` (replaces the static sub-title, CF-73).
  - `V-08 GET /api/v1/views/analysis-validation/:draftId`: scope summary (string built by BFF, e.g. "Grupo Ecopetrol · Trimestral
    T4 2025"), competitors[]{ id, name }, indicators grouped[]{ label, count, items[]{ id, label } }, `exclusionAlert{ companies[],
    thresholdPct }`, `permissions.canGenerate`.
  - Commands: `C-01 POST /api/v1/analysis-drafts` `{ type, fromAnalysisId? }` → `{ draftId }`; `C-02 PATCH
    /api/v1/analysis-drafts/:draftId` (partial draft) → updated `stepStatus`; `C-03 POST /api/v1/analysis-drafts/:draftId/generation`
    → `202 { operationId }`.
  - `V-25 GET /api/v1/views/company-profile/:companyId` for OVL-13 (`country, category, business, segments, news[]`).
  - Formats: period display "T4 2025" (formatter, CF-76), selects show "Q1".."Q4"; dates es-CO `dd/mm/aaaa` [inference].
- Role visibility:
  - `analyst_creator`: full access (view, edit, generate) — BR-01 "Only the Analista creador modifies the definition", §1.19 row
    "Definición, Resultados (preparation)".
  - `explorer_viewer`, `explorer_integral`, `executive_viewer`, `executive_integral`: no access (`/403`); the "Configuración" tab
    is hidden for them (SCR-04 role table).
  - `hasAdminAccess` adds nothing here.
- Open questions / assumptions:
  - CF-35: README's 4 named temporal views and step name "Selección de indicadores" vs V2 Q/year selects and stepper "Indicadores"
    — V2 wins; `temporalView` stays optional in the contract.
  - CF-25: early fields (Audiencia, Foco, Rango temporal, 4T 2024 — `Captura de pantalla 2026-09-08 a la(s) 3.35.11 p.m..png`)
    are superseded by the V2 fields and 4T 2025.
  - CF-56 / BR-14: sources are indicator metadata, shown read-only in step 4 (no user source selection).
  - CF-73: "6 categorías · 34 indicadores financieros y operativos" (HTML L589) is static in V2 and matches neither catalog (27
    PAR, 64 TBG/ILP) — rendered from `V-07 totals`, copy pattern kept.
  - CF-77: PAR/TBG/ILP codes are positional in V2 (renumbered after filtering, HTML L5134–5138, L5147–5152) — BFF returns stable
    ids plus fixed display codes; source typos ("Disponiblidad", "Reponsabilidad") kept verbatim as data.
  - CF-54: AS-IS 34-indicator catalog (`Captura de pantalla 2026-09-07 a la(s) 2.53.46 p.m..png`) vs 27 PAR vs 10 Resumen —
    catalogs come from the BFF; v1 = V2 sets.
  - Selection model [inference]: V2 renders step-3 items as display-only and step 5 lists `CATEGORIES` (10 indicators, HTML L3978),
    not the step-3 choice. Default applied: step 3 selection is real state (bulk per group, BR-13) and step 5 lists the selected
    indicators; default selection = the 10 `CATEGORIES` indicators for "Desempeño de Pares" and all items of the chosen horizon
    for the strategic types — PO to confirm.
  - Controlled fields [inference]: Objetivo, Pregunta, periods and Fecha de corte are uncontrolled in V2 (no state) and Alcance
    chips are static; all become controlled, saved draft fields. BR-13 says "fixed name and objective" for M1 — default: editable,
    prefilled from the analysis type template (BR-10 "habitual exercises come preloaded, with fields still adjustable").
  - Periodo comparado default: V2 Q3 2025 (QoQ) vs BR-13 "quarter vs same quarter of the prior year" (YoY, Q4 2024) — default V2
    (Q3 2025); PO to confirm.
  - Tipo de análisis vs BR-10 analysis types (Desempeño comparativo / Referentes estratégicos / Generación de valor) — labels differ;
    V2 labels kept (OQ-02).
  - Homologation threshold for the step-5 exclusion alert: prototype ~60% (`01-handoff-docs.md` L738), configurable — handoff OQ-12
    (threshold value and where it is configured).
  - ISA appears as a scope chip ("ISA", HTML L543) and as the peer "Interconexión Eléctrica" (HTML L3529) — kept as two separate
    concepts (scope vs competitor) [inference].
  - Step 2 "i" has no copy in V2 (HTML L554) — needs copy or removal.

### Steps

#### Step 1 — Información general
- Card title "Paso 1 · Información general" (HTML L461); info "Define el alcance base del análisis: qué se va a comparar, para
  quién, y con qué corte de tiempo. Estos datos aparecen luego en el título y en la validación final (Paso 5)." (HTML L465).
- Fields (label → control, default, validation):
  - "Tipo de análisis" (HTML L469) → `Cmp:ChoiceChip` single-select: "Estratégico TBG" (default, HTML L3616), "Estratégico ILP",
    "Desempeño de Pares" (HTML L3853); selected `#EDE9FE`/`#672DBD`/border `#C4B5FD`, unselected `#F5F6F7`/`#59667C`/`#DFE2E6`
    (HTML L3855–3856). Enum `estrategico_tbg|estrategico_ilp|desempeno_pares`. Required.
  - "Nombre del análisis" (HTML L477) → `Cmp:TextField`, default "Desempeño comparativo — 4T 2025" (HTML L3616); empty for a new
    draft (HTML L5203). Required, trimmed, 3–120 chars [inference]; drives the header "Resultados · {name}" later.
  - "Objetivo" (HTML L481) → `Cmp:TextArea`, default "Evaluar la posición competitiva de Ecopetrol al cierre del cuarto trimestre
    de 2025 frente a pares del sector energético." (HTML L482). Required, ≤ 500 chars [inference].
  - "Pregunta del análisis" (HTML L485) → `Cmp:TextArea`, default "¿Cómo se posiciona Ecopetrol frente a comparables en EBITDA,
    márgenes y producción en el 4T 2025?" (HTML L486). Optional, ≤ 300 chars [inference].
  - "Periodo actual" (HTML L491) → two `Cmp:Select`: quarter "Q1"/"Q2"/"Q3"/"Q4" (default Q4) and year 2022–2026 (default 2025)
    (HTML L494–499). Options from `V-05`. Required.
  - "Periodo comparado" (HTML L504) + "i" "Elige contra qué periodo comparas el actual: el trimestre inmediatamente anterior (QoQ) o
    el mismo trimestre del año anterior (YoY). El resultado se muestra como variación entre ambos." (HTML L518) → quarter (default
    Q3) + year (default 2025) (HTML L508–513). Required; must be earlier than Periodo actual [inference].
  - "Fecha de corte" (HTML L525) → `Cmp:DateField` (native `type=date` in V2, empty, HTML L526). Optional; if set, not in the future
    and ≥ end of Periodo actual [inference].
  - "Alcance" (HTML L539) → `Cmp:ChoiceChip` multi-select: "Grupo Ecopetrol" (selected look, HTML L541), "ISA" (unselected, HTML
    L543); static in V2 → controlled. At least one required [inference].
- Catalogs: analysis types, quarters, years, scopes from `V-05` options.

#### Step 2 — Competidores
- Card title "Paso 2 · Competidores" (HTML L553); "i" without copy (HTML L554). Sub "Catálogo por categoría estratégica · clic para
  incluir/excluir · clic en el nombre en otras pantallas abre su perfil" (HTML L556).
- "Línea de negocio" (HTML L557) → `Cmp:FilterChip` single-select "Todas" (default) / "Oil & Gas" / "Energéticos" (HTML
  L3531–3535); selected `#672DBD`/white (HTML L3861). Filters groups by `linea` (HTML L3863).
- Company catalog (`V-06`), groups in order (HTML L3523–3530; eyebrow `600 11px #808A9B` uppercase, HTML L565):
  - "Super Majors" (Oil & Gas): Exxon, Total, Shell, BP, Chevron
  - "IOCs" (Oil & Gas): Repsol
  - "NOCs" (Oil & Gas): Equinor, Pemex, PTTEP, Petrobras, ENI
  - "Junior Latam" (Oil & Gas): Geopark, Parex, Gran Tierra
  - "Utilities & Renovables" (Energéticos): Enel, Iberdrola, AES, NextEra Energy, Celsia
  - "Transmisión & Energía" (Energéticos): Interconexión Eléctrica
- `Cmp:CompanyTile` (min-width 130, radius 10, padding `9px 13px`; HTML L568): name `500 12px` + "i" 16px (→ OVL-13); meta line
  "{pais} · {categoria}" `400 10px #98A1B0` (HTML L573) from `COMPANY_PROFILES` (HTML L3504–3522); unknown profile → "— · Par
  sectorial" (HTML L3867). Selected `#EDE9FE`/`#672DBD`/`#C4B5FD`, unselected `#F5F6F7`/`#59667C`/`#DFE2E6` (HTML L3872).
- Default selection (7): Chevron, Exxon, Shell, Equinor, Total, BP, PTTEP (HTML L3547). BR-13 alternative "all companies preselected"
  — V2 default kept [inference].
- Bulk select/deselect per group (`Cmp:SelectAllToggle`) [inference: README "select/deselect all", BR-13].
- Yarbis box: "✦ Yarbis: te sugiero incluir Petrobras — comparte características NOC con Ecopetrol." (HTML L579) — from
  `V-06 suggestion`.
- Validation: ≥ 1 competitor selected [inference]; selection persists even when the line filter hides a group.

#### Step 3 — Indicadores
- Card title "Paso 3 · Selección de indicadores" (HTML L586); sub "6 categorías · 34 indicadores financieros y operativos" (HTML
  L589, static — CF-73); info "Elige la fuente de indicadores: Referenciamiento de pares (indicadores comparados contra el sector) o
  TBG e ILP (métricas de los esquemas de compensación variable). Cada indicador lleva un código para homologación técnica." (HTML
  L591).
- `Cmp:SourceTabs`: "Referenciamiento de pares" (default) | "TBG e ILP" (HTML L5125–5126); active `#672DBD`/white, inactive
  `#F5F6F7`/`#59667C` (HTML L5127).
- **Referenciamiento de pares** (`V-07 source=pares`):
  - "Concepto de planeación" (HTML L600) → `Cmp:FilterChip` multi-select "Rentabilidad", "Liquidez", "Operacional", "Solvencia",
    "Opex" (HTML L5128); none selected = all (HTML L5129).
  - Groups by concept (bordered box, HTML L608–609) with `Cmp:IndicatorPill` "label + code" (HTML L612): **27 PAR indicators,
    `PAR-01`..`PAR-27`** — full list in `.plan/source-map/02-prototype-html.md` §9.8 (L486–488), source `PARES_METRICS` HTML
    L5018–5046 (Rentabilidad 13, Liquidez 4, Operacional 3, Solvencia 5, Opex 2). Not re-listed here.
- **TBG e ILP** (`V-07 source=tbg-ilp`):
  - "Horizonte" (HTML L621) → `Cmp:FilterChip` multi-select "TBG", "ILP" (HTML L5141); none selected = all (HTML L5140).
  - Groups "Financiero" (27), "Operativo" (15), "Transversal" (22) (HTML L5146) with `Cmp:IndicatorRow` = label `400 13px` +
    code + `Cmp:HorizonBadge` (HTML L633–636): **64 TBG/ILP metrics, `TBG-01`..`TBG-47` and `ILP-01`..`ILP-17`** — full list in
    `.plan/source-map/02-prototype-html.md` §9.9 (L489–493), source `TBGILP_METRICS` HTML L5049–5114. Not re-listed here.
- Selection: items are display-only in V2 (`02-prototype-html.md` L192); here each item is selectable, with per-group bulk
  select (BR-13) and a selected-count per group [inference]. Stable ids from the BFF; codes are display-only (CF-77).
- Validation: ≥ 1 indicator selected [inference].

#### Step 4 — Fuentes
- Card title "Paso 4 · Fuentes" (HTML L650); sub "Fuentes asociadas al cálculo de cada indicador" (HTML L653); info "Capital IQ es la
  fuente principal; las demás se usan para validar o completar datos faltantes. La métrica derivada permite crear un indicador propio
  a partir de una fórmula." (HTML L655).
- Read-only `Cmp:StaticChip` list: "Capital IQ · principal" (selected look `#EDE9FE`/`#672DBD` `600 12px`, HTML L658), "Bloomberg"
  (HTML L659), "Platts" (HTML L660) — derived from the selected indicators' `sources[]` (BR-14, CF-56); BACKEND also lists
  `interna_ecp` ("Fuentes internas Ecopetrol", `02-prototype-html.md` §9.2 fallback) [inference: shown when any indicator uses it].
- No derived-metric UI exists although the info text mentions it (`02-prototype-html.md` L194) — out of v1 [inference].
- Validation: none (always valid).

#### Step 5 — Validación
- Card title "Paso 5 · Validación" (HTML L673); info "Revisa el resumen antes de generar el análisis. "Generar análisis" te lleva a
  Resultados con estos parámetros aplicados; aún podrás ajustar competidores e indicadores después." (HTML L677).
- Summary rows (`V-08`):
  - "Alcance" → "Grupo Ecopetrol · Trimestral T4 2025" (HTML L680; static in V2 → built by the BFF from scope + period).
  - "Competidores seleccionados ({n})" (HTML L682) → chips `#EDE9FE`/`#672DBD` (HTML L685), live from step 2 (HTML L3976–3977).
  - "Indicadores a analizar" (HTML L690) → groups "{label} ({count})" (HTML L694) with chips (HTML L697). V2 source = `CATEGORIES`
    (10 indicators: Rentabilidad (3), Liquidez (2), Operacional (1), Competitividad OPEX (2), Solvencia (1), ESG (1) —
    `02-prototype-html.md` L199, §9.2); here = the step-3 selection grouped by concept/dimension [inference].
- Exclusion alert (`Cmp:AlertBanner` warning) when `exclusionAlert.companies[]` is non-empty: companies under the homologation
  threshold (BACKEND rule 1, ~60%) — copy [inference], e.g. built from Yarbis tone; no literal V2 string exists.
- Footer: "Generar análisis" (HTML L711; `#49BCD8`, hover `#0E7490` / text `#E3F6FA`) replaces "Siguiente ›"; enabled only when
  `canGenerate` and steps 1–3 valid → `C-03` → `202` → progress → Resultados.
