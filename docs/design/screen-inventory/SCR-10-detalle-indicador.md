## SCR-10 — Detalle de indicador

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; values computed at runtime
> (e.g. `+34.5% frente a pares`) are shown in backticks with the line that computes them. Anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`), overlays (`OVL-nn`) and critic items
> (`M-nn`) refer to `docs/design/conflicts.md`, `docs/design/open-questions.md` and `.plan/source-map/10-synthesis.md`
> §4, §1.18 and §K.2.

- Source files:
  - Primary (precedence 1): `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` template L1350–1464 (screen block `isDetalle`);
    logic: proactive tip `PROACTIVE.detalle` L3229, indicator catalogue rows with `peers` L3297 (ROACE), L3298 (Margen
    EBITDA), L3306 (Crecimiento Producción), `PEER_SETS` L3319–3323, state `showHistorial` L3572, comment state L3582,
    comment seeds `detalleComments` L3603–3606, `sendDetalleComment` / `toggleDetalleReply` / `sendDetalleReply`
    L3650–3665, `buildBars` L3754–3772, detalle view model L3933–3964, entry points L3914 / L4774 / L4809, title map
    `detalle:'Detalle de indicador'` L5156, assistant suggestions L5163, back link `goResultadosDetalle` L5195, `isDetalle`
    L5215, info toggle `onInfoDetalle` L5344, comment bindings L5389–5396, history toggle L5504.
  - Reference images: `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-09-19 a la(s) 8.29.54 a.m..png`
    (current; a crop of the chart legend plus the first three bar groups: "2024" / "2025", `-27.5%` `10.2 → 7.4`, `-20%`
    `9 → 7.2`, `-21.2…`; matches V2). Superseded iteration 1 (outlined pills, teal context): `uploads/Captura de pantalla
    2026-09-19 a la(s) 8.13.38 a.m..png` (CF-23; do not use as a baseline). The reference catalogue lists SCR-10 as
    `none (render only)` (`docs/design/screenshots/reference/index.md` L18).
  - Visual baseline: P1-03 renders `docs/design/screenshots/prototype/SCR-10@1440.png` and `SCR-10@1440-full.png`
    (1440×1309, `detalleIndicator=roace`), plus `@1280/@1024/@768`. At 1024 and below the bar row scrolls horizontally.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.10 (L353–369), §1.19 (roles), §4 (V-24, V-26, C-10..C-13);
    `02-prototype-html.md` §9.3 (`PEER_SETS`) and §9.4 (Detalle derived values); critic M-05 (analyst side of F32/F33)
    and M-11 (click-a-number drill); `docs/design/conflicts.md` CF-23, CF-58, CF-67, CF-70, CF-85, CF-86.
- Proposed route: `/analisis/:analysisId/indicadores/:indicatorId?origen=resultados|visualizacion|presentacion`.
  `indicatorId` is the catalogue id (`roace`, `margen_ebitda`, `crec_produccion`; L3297–3306). `origen` only picks the back
  target and its label, and defaults to the role's report screen [inference: V2 always goes back to Resultados, L5195].
  The history disclosure and the info panel are not in the URL (transient UI) [inference]. Guard: authenticated and
  `canViewReport(analysisId)`. executive_viewer is allowed only with `origen=presentacion` and a presentation that includes
  the indicator (§1.19 `detail only via presentation`); otherwise `/403` (SCR-17). An unknown `indicatorId`, or one without
  a peer set, goes to `*` (404) [inference]. Header title: "Detalle de indicador" (L5156). Sidebar active item: none (the
  render shows no highlighted item). Analysis tab bar: not shown (the render shows none).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04). Content column `max-width:980px`, `fadeUp .3s ease` (L1351).
  - Back link "‹ Volver a Resultados" (`500 13px #672DBD`, `margin-bottom:14px`, L1352).
  - Title row: `700 20px` label + context in `#59667C` after "|" (L1353). Subtitle row: flex gap 10, `margin-bottom:20px`:
    subtitle `400 13px #59667C` + delta `600 12px` coloured `#10B981` (≥0) / `#EF4444` (<0) (L1354–1356, colours L3952).
  - KPI row: grid `1fr 1fr 1fr`, gap 14, `margin-bottom:20px` (L1359). Each card is `#fff`, `1px solid #DFE2E6`, radius 12,
    padding 16. Label `400 12px #98A1B0`, value `700 24px` (L1360–1371).
  - Chart card: `#fff`, border `#DFE2E6`, radius 12, padding 22, `margin-bottom:20px` (L1374). Header row: legend left,
    16px "i" right (L1375–1381). Optional info panel `#F5F6F7`, radius 8 (L1383). Plot: relative container with the dashed
    average line (z 1) under the bar row (z 2). Bar row: flex, `align-items:flex-end`, gap 18, `height:236px`,
    `overflow-x:auto` (L1386–1388).
  - Yarbis insight card: `#E3F6FA`, `1px solid #A8E6EC`, radius 12, padding 18 (L1403–1406).
  - "Trazabilidad del dato" card: grid `repeat(4,1fr)` gap 14 with only 3 cells filled (L1409–1413). Expandable history
    below, `border-top:1px solid #F5F6F7` (L1415–1421).
  - "Comentarios" card: thread (grid gap 14) + composer (textarea `min-height:60px`, button right-aligned) (L1423–1461).
  - Responsive: ≥1280 fits all 9 ROACE columns (9 × 76 px + 8 × 18 px gaps = 828 px); at 1024 and 768 the bar row
    scrolls horizontally and the KPI grid stays at 3 columns (P1-03 renders) [inference: stack the KPIs at <768 per OQ-16].
- Tabs: n/a (no tab bar; the history is a disclosure, not a tab).
- Sections: top to bottom.
  1. Back link "‹ Volver a Resultados" (L1352).
  2. Title `{label} | {context}`. For ROACE: `ROACE (%)` (L3297) and "Ecopetrol supera el desempeño promedio de las empresas
     pares." (L3947). Below peers: "Ecopetrol se ubica por debajo del desempeño promedio de las empresas pares." (L3947).
  3. Subtitle "Comparativo 2024 vs 2025 frente a compañías pares seleccionadas." (L3946) + delta `+34.5% frente a pares`
     (string L3952, computed L3943 from the catalogue values 7.4 vs 5.5).
  4. KPI cards "Ecopetrol" (L1361) `+7.4%`; "Promedio de pares (general)" (L1365) `+5.5%`; "GE vs. promedio de pares"
     (L1369) `+34.5%` (values L3949–3950, computed L3940 and L3944).
  5. Chart card: legend "2024" / "2025" (L1377–1378), info "i", info copy "El % sobre cada par muestra la variación
     2024→2025. La línea punteada marca el promedio de pares en 2025. Clic en el nombre de una compañía abre su perfil."
     (L1383), grouped bars per company, average line label "Promedio pares: {{ detalle.paresAvgV25 }}" (L1387) → `Promedio
     pares: 5.5`.
  6. Insight "✦ YARBIS INSIGHT" (L1404). Above peers: "Ecopetrol supera el promedio de pares en este indicador, sosteniendo
     una posición competitiva incluso con presión en el entorno de mercado." (L3962). Below peers: "Ecopetrol se ubica por
     debajo del promedio de pares en este indicador; la brecha está asociada a la dinámica de precios y producción del
     sector durante 2025." (L3961).
  7. "Trazabilidad del dato" (L1408): "FUENTE" (L1411) "Capital IQ · Estados financieros trimestrales" (L3297);
     "ACTUALIZACIÓN DE LA DATA" (L1412) "T4 2025 · actualizado hace 3 días" (L3954); "HISTORIAL" (L1413) link "Ver cambios ›"
     (L1413). The 4th grid cell is empty in V2. A `FÓRMULA` cell with `formula` ("(EBIT × (1-t)) / Capital Empleado
     Promedio", L3297), which V2 computes (L3953) but never renders, is the proposed filler [inference, see Open questions
     A3].
  8. History list (when open, L1415–1421): "Alejandra actualizó la fuente a Capital IQ." · "hace 3 días"; "Se corrigió un
     valor atípico reportado por Bloomberg." · "hace 9 días"; "Creación del indicador en el catálogo." · "hace 3 meses"
     (L3956–3958).
  9. "Comentarios" (L1424): thread, per-comment "Responder" (L1433), replies, reply composer, then the main composer
     "Escribe un comentario o solicita un ajuste al analista creador..." (L1457) + "Enviar comentario" (L1459).
- Components:
  - Shell (owned by SCR-04): `Cmp:AppShell`, `Cmp:SidebarNav`, `Cmp:AppHeader`, `Cmp:YarbisFab`, `Cmp:YarbisChatPanel`
    (OVL-14).
  - `Cmp:BackLink` (from SCR-03 / SCR-14).
  - `Cmp:PageTitle` (label + muted context after "|") [new; P1-17 may merge it with `Cmp:SectionTitle`].
  - `Cmp:KpiStatCard` ×3 (from SCR-05; variant: left-aligned label above value, value colour per KPI).
  - `Cmp:Card`, `Cmp:ChartLegend` (square swatches, from SCR-08), `Cmp:InfoToggleButton` + `Cmp:InfoPanel` (from SCR-05 /
    SCR-08; one open at a time, CF-61).
  - `Cmp:GroupedBarChart` (ECharts wrapper per P5-19; vertical grouped bars, delta pills, value captions, highlighted
    Ecopetrol column, dashed average mark line, horizontal scroll, accessible data table). Sub-parts: `Cmp:DeltaPill`
    (filled positive/negative variants), `Cmp:CompanyNameButton` (opens OVL-13).
  - `Cmp:YarbisInsightCard` (light cyan "✦ YARBIS INSIGHT" card) [new; the dark `Cmp:YarbisInsightBanner` of SCR-05 is a
    different variant].
  - `Cmp:TraceabilityGrid` (label/value cells + `Cmp:LinkButton` "Ver cambios ›") + `Cmp:HistoryList` (text + relative
    time rows) [new].
  - `Cmp:CommentThread` + `Cmp:CommentItem` + `Cmp:CommentComposer` (shared with SCR-09 / SCR-13 / SCR-14), extended per
    M-05 with `Cmp:CommentStatusChip` and `Cmp:ChangeRequestActions` (Aceptar / Rechazar), both [proposed] as on SCR-09, plus a
    `Cmp:Button` (secondary) for the request-change action (see Interactions).
  - `Cmp:CompanyProfileModal` (OVL-13, from SCR-07).
  - `Cmp:SectionSkeleton`, `Cmp:SectionError`, `Cmp:EmptyState` [inference: states required by the brief].
- Charts:
  - Grouped vertical bar chart: the indicator for 2024 vs 2025, one group per company (`Cmp:GroupedBarChart`; L1385–1400, data L3754–3772).
    - Categories (x): one 76 px column per company, in the order the BFF sends (V2 = `PEER_SETS` order, L3320–3322). No
      sorting UI. ROACE order: Ecopetrol, ConocoPhillips, PTTEP, Exxon, Shell, Total, Equinor, Oxy, BP.
    - Series: "2024" colour `#DFE2E6` and "2025" colour `#2C699A` (legend L1377–1378, bars L1394–1395). Every company
      uses the same two colours. `buildBars` also computes `color` (`#2C699A` Ecopetrol / `#83E377` others, L3767), but the
      template does not use it.
    - Scale: linear from 0, no visible axis or gridlines. Bar height = `value / max(all v2024, v2025) × 150 px` (L3756,
      L3763, L1393). Bars have top radius 4, gap 4 inside the pair, and `transition:height 900ms` (+80 ms for 2025) grow
      from 0 on mount (`mounted`, L3763). Reduced motion shows the final height [inference].
    - Per-column annotations (top to bottom): delta pill `{+/-}{x}%` = `(v2025 − v2024) / |v2024| × 100`, rounded to 1
      decimal (L3760, L3765). Colours: filled `#D1FAE5` / `#047857` / border `#A7E8CB` when ≥ 0, `#FEE2E2` / `#9A1616` /
      `#F9BDBD` when < 0 (L3766). Caption `{v24} → {v25}` `500 10px #98A1B0` (L1392). Company name `600 10px #424E63`,
      clickable (hover `#672DBD`) → OVL-13 (L1397, L3769).
    - Ecopetrol highlight: column box `border:1.5px solid #518CD1; background:#F0F7FC`, radius 8 (L3768, L1390).
    - Mark line: dashed `1.5px #672DBD` at the 2025 peer average (Ecopetrol excluded, rounded to 1 decimal, L3940), placed
      at `20 + avg/max × 150` px from the bottom (L3942; ROACE → 101 px). The label "Promedio pares: {{ detalle.paresAvgV25 }}"
      (L1387) is right-aligned, `600 10px #672DBD` on white.
    - ROACE data (L3320; `02-prototype-html.md` §9.3–9.4): Ecopetrol 10.2 → 7.4 (`-27.5%`); ConocoPhillips 9.0 → 7.2
      (`-20%`); PTTEP 8.5 → 6.7 (`-21.2%`); Exxon 7.5 → 6.7 (`-10.7%`); Shell 6.3 → 6.5 (`+3.2%`); Total 7.8 → 6.1
      (`-21.8%`); Equinor 8.7 → 5.4 (`-37.9%`); Oxy 6.4 → 3.8 (`-40.6%`); BP 0.9 → 1.3 (`+44.4%`). Range of deltas
      `-40.6%` … `+44.4%`; peer average 2025 = 5.5.
    - Tooltip: none in V2. Proposed: company, 2024, 2025, variation, unit [inference: ECharts default a11y tooltip].
    - Legend: static and non-interactive (series toggling is not in V2).
    - Accessibility: the wrapper renders a visually hidden data table with columns Compañía · 2024 · 2025 · Variación
      [inference: P5-19 `a11y container + data table`], and `data-series-count="2"`.
    - Negative values: none in the mock. `buildBars` would give a negative height [inference: a diverging axis per OQ-10
      if the BFF ever sends negatives].
- Tables:
  - No visible table in V2. The chart's accessible data table (see Charts) is the only tabular output [inference].
  - The history list (section 8) is a two-column list (text, relative time), not a table.
- Filters & controls:
  - Info "i" (L1380): toggles the chart note (`chartInfoOpen = 'detalle'`, L5344), one info panel open at a time.
  - "Ver cambios ›" (L1413): toggles the history list (`showHistorial`, L5504). The label does not change when it is
    open [inference: add `aria-expanded`].
  - No period, company or unit selector: the comparison years (2024 vs 2025) and the peer set come from the analysis
    (V-24) [inference].
  - Comment composer, reply toggles and reply inputs (see Interactions). There is no filter over comments.
- States:
  - Loading: back link and title skeleton, 3 KPI skeletons, chart skeleton (fixed 236 px), insight/traceability/comments
    skeletons [inference].
  - Empty:
    - Indicator without a peer set: in V2 the view model stays blank (empty title, no bars; `dInd.peers` guard L3936), and
      only the three indicators with `peers` link to this screen (L3914, L4774, L4809; others are no-ops). Proposed: 404
      from the BFF, or a `Cmp:EmptyState` `Sin datos de pares para este indicador.` [inference: copy missing in HTML].
    - No comments: the thread is empty and the composer stays visible (V2 seeds 2 comments) [inference].
  - Error: V-24 failure → full-page `Cmp:SectionError` with retry. V-26 failure → error only inside the "Comentarios"
    card [inference].
  - Forbidden: no report access, or executive_viewer arriving outside a presentation → `/403` (SCR-17). Composer hidden
    when `canComment = false`; request-change control hidden when `canRequestChange = false`.
  - Partial: V-24 (chart, KPIs, insight, traceability, history) and V-26 (comments) load independently; either may fail
    alone [inference: brief §4.1 rule 4].
  - Unit variants (CF-67): for `crec_produccion` the peer set is in KBOE (L3322: Chevron 3338 → 3723 … Ecopetrol 746 →
    745), but V2 formats the KPIs with the catalogue unit `%` (L3306, L3949), giving `+745%` and `+3020%`. With CF-67 the BFF
    sends `unit: "KBOE"` and the front formats `745 KBOE` / `3.020 KBOE` (es-CO, CF-70). The delta pills and "GE vs.
    promedio de pares" stay in % (relative variation).
  - Proactive Yarbis tip when the screen is first opened in the session: "Encontré una anomalía en este indicador frente
    al promedio histórico. ¿Quieres que te explique la fórmula y la fuente?" (L3229). Chat suggestions: "Explícame esta
    brecha", "Compárame con el histórico" (L5163). Only for `canUseAssistant` (CF-40).
- Interactions:
  - Entry: "Ver más ›" in Resultados "Comparativo GE vs. Promedio Pares" (L859; handler L4774) and "Comparativo GE
    vs. compañía" (L900; handler L4809); indicator rows at L3914 (category indicator list); only for indicators with a
    peer set. Each sets `detalleIndicator` and fires the proactive tip once (L3914).
  - "‹ Volver a Resultados" (L1352) → V2 always goes to Resultados (`goResultadosDetalle`, L5195). Proposed: back target
    from `origen` — Resultados (analyst), Visualización (explorers / executive_integral, label `‹ Volver a Visualización`), or the presentation
    (executive_viewer) [inference: copy of the other labels not in HTML].
  - Company name in the chart → `Cmp:CompanyProfileModal` (OVL-13, V-25). Ecopetrol opens "Ecopetrol" (L3769).
  - Info "i" and "Ver cambios ›" → disclosures (see Filters & controls).
  - Comment (F32, C-10): type in the composer → "Enviar comentario" (L1459). Empty text is ignored (L3652). The new
    comment is appended with author and role (V2 hard-codes "Tú", "Analista creador", "ahora", L3654).
  - Reply (C-10 with `parentId`): "Responder" (L1433) opens an inline input "Escribe una respuesta..." (L1449) + "Enviar"
    (L1450). One reply box open at a time (L3658).
  - Request change (F33, C-12) — M-05 / CF-58. V2 has a single composer whose placeholder already says "solicita un
    ajuste". Proposed: for executive_integral (`canRequestChange`), a second action `Solicitar ajuste` beside "Enviar
    comentario" that posts `C-12 {entityType:'indicator', entityId, text, kind}`. `kind` is picked from `Dato` / `Alcance`
    / `Recálculo` [inference: labels for `data|scope|recalculation`]. The item renders with the `Solicitud de cambio` tag
    used on SCR-09 [inference: copy not in HTML]. Only executive_integral sees this action.
  - Analyst side (M-05, C-11 / C-13): analyst_creator sees on every comment a `Cmp:CommentStatusChip` `Pendiente`
    / `En análisis` / `Resuelto` (C-11, `canResolve`), and on every change request `Cmp:ChangeRequestActions` `Aceptar` /
    `Rechazar` + note (C-13). Accepting may start a recalculation (F22, C-08 → the operation-progress state of SCR-08, M-06).
    Reviewers see the decision read-only [inference: copy not in HTML; enum from §4 C-11/C-13; same as SCR-09].
  - Click a number → see its formula and inputs (M-11 / CF-85): NOT built in v1. It is recorded as an open question (A3).
    The only formula surface proposed for v1 is the traceability `FÓRMULA` cell.
  - Yarbis FAB → OVL-14 with the suggestions above (`canUseAssistant`).
- Data fields: `V-24 GET /api/v1/views/indicator-detail/:analysisId/:indicatorId` and `V-26 GET
  /api/v1/views/comment-thread?entityType=indicator&entityId=:analysisId/:indicatorId`.
  - `indicator`: `id` (branded), `label` (string, e.g. `ROACE (%)`), `unit` (enum `percent | kboe | ratio_x | usd_b |
    points | …`; CF-67), `formula` (string | null), `contextKey` (`above_peers | below_peers`, i18n → title context and
    insight tone).
  - `kpis`: `ecopetrol` (number, raw, in `unit`), `peerAvg` (number, raw, in `unit`), `geVsAvgPct` (number, % — derived
    by the BFF), `deltaVsPeersPct` (number, % — the subtitle delta; see A2).
  - `series[]`: `companyId`, `companyName`, `isEcopetrol` (boolean), `v2024` (number | null), `v2025` (number | null),
    `deltaPct` (number | null, derived by the BFF, 1 decimal). Order = display order.
  - `peerAvg2025` (number, raw; the mark line), `periods` (`{previous:'2024', current:'2025'}`; legend labels)
    [inference].
  - `insight`: `{text, status:'suggestion', generatedBy}` (AI output, CF-40).
  - `traceability`: `source` (string), `updatedLabel` → V2 "T4 2025 · actualizado hace 3 días". Proposed as `{period:
    '2025-Q4', updatedAt: ISO}` with the front formatting "T4 2025" (CF-76) and the relative time.
  - `history[]`: `{text, occurredAt (ISO → relative "hace 3 días")}`.
  - `permissions`: `canComment`, `canRequestChange` (V-24); `canComment`, `canReply`, `canRequestChange`, `canResolve`
    (V-26).
  - V-26 `threads[]`: `id`, `kind` (`comment | change_request`) [inference: M-05], `author{name, roleLabel}`, `text`,
    `createdAt` (ISO → relative), `status?` (`pendiente | en_analisis | resuelto`), `decision?` (`accepted | rejected`, change
    requests only) [proposed, as SCR-09], `replies[]` (same shape without replies).
  - Formatting (front, CF-70 es-CO): values `7,4 %`, captions `10,2 → 7,4`, deltas `-27,5 %`, KBOE `3.020 KBOE`
    [inference: V2 shows JS dot decimals and drops trailing zeros, e.g. `9 → 7.2`]. Sign prefix `+` on KPI levels is kept
    for parity (V2 L3949) [inference: PO may drop it for levels].
- Role visibility: per §1.19 (CF-39, CF-40, CF-58).
  - analyst_creator: full read; replies to comments; sets comment status and accepts/rejects change requests (M-05); does
    not see `Solicitar ajuste`; Yarbis chat available. V2 shows this analyst view (new comments are authored as "Analista
    creador").
  - explorer_viewer / explorer_integral: read-only (chart, KPIs, insight, traceability, history, thread). No composer, no
    "Responder", no Yarbis chat (the published insight stays visible).
  - executive_integral: read; comment (F32) and reply; `Solicitar ajuste` (F33); Yarbis chat available.
  - executive_viewer: only when opened from a presentation (`origen=presentacion`); read-only; no composer; no Yarbis
    chat. The V2 seed has an "Ejecutivo visualizador" comment ("Solicito ampliar el histórico a 3 años para este
    indicador.", L3606), which contradicts §1.19. Keep it as seed text but do not grant executive_viewer the composer
    [inference; see A5].
  - `hasAdminAccess` does not change this screen.
- Open questions / assumptions:
  - A1 — CF-67: Producción is in KBOE, so the KPI and average labels must use the unit from V-24 (`745 KBOE`, not `+745%`).
    The indicator label "Crecimiento Producción (%)" (L3306) and the chart title "Crecimiento Producción · KBOE" (L3322)
    disagree on what is measured. Proposed: show levels in KBOE and keep the label from V-24 (PO to confirm).
  - A2 — The subtitle delta and the third KPI use different peer bases. The subtitle compares catalogue values
    (`ecopetrol` vs `pares`, L3943); the KPI compares against the peer-set 2025 average (L3944). For ROACE both give
    `+34.5%`; for Margen EBITDA they give `+21.9%` vs `+28.3%` (`02-prototype-html.md` §9.4); for Producción `-102%` vs
    `-75.3%`. Proposed: the BFF derives both from one peer set and both show the same number (PO to confirm).
  - A3 — M-11 / CF-85, open question pointer: `click a number → see the formula and inputs` (Capital-IQ-style drill; sticky `UP/C 2026-09-08 11.51.41`) is a
    requirement-level sticky with no V2 state. It is out of v1 until the PO decides and needs an OQ entry in
    `docs/design/open-questions.md` (P1-25 owner). The v1 proposal is to render `formula` in the empty 4th traceability
    cell (data already in V2, L3297/L3953).
  - A4 — M-05: the analyst-side controls (status chip, Aceptar / Rechazar) and the `Solicitar ajuste` action have no V2
    template. Copy and placement are [inference] and need PO copy. The same `Cmp:CommentThread` extension applies to
    SCR-09/11/14.
  - A5 — Seed inconsistencies: the reply author `Camilo Vega` with role `Analista creador` (seed L3605) vs the demo analyst "Camila
    Bravo" (CF-86); the executive_viewer comment above vs §1.19 (executive_viewer cannot comment). Fixtures keep the V2
    text for screen parity (D7).
  - A6 — The back link is always "‹ Volver a Resultados" in V2. Role-aware targets (Visualización, presentation) and their
    labels are [inference].
  - A7 — CF-23: iteration 1 of this screen (`8.13.38 a.m.` capture: outlined pills, teal context) is superseded by V2
    (iteration 2, `8.29.54 a.m.`).
  - A8 — Only three indicators have a peer set in the mock (ROACE, Margen EBITDA, Crecimiento Producción). In the real
    product every indicator with peer data should link here, and the BFF owns `hasDetail` per row (SCR-08 "Ver más ›")
    [inference].
