## SCR-09 — Visualización · Dashboard

> `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (`Lnnn` = line number). Double-quoted
> strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML` carries
> `[inference]` or `[Paquete:<file name>]`. Behaviour marked **[proposed]** comes from critic M-04 / M-05 (board 09) and is
> not shown by V2. Template bindings and strings resolved from mock data are written in code spans. Components are tagged
> `Cmp:PascalName` (names reused from SCR-04/05/08 where the component is the same; reconciled by P1-17). `CF-nn`, `OQ-nn`,
> `OVL-nn`, `V-nn`, `C-nn` refer to `docs/design/conflicts.md`, `docs/design/open-questions.md`, `docs/design/overlays.md`
> and `.plan/source-map/10-synthesis.md` §4. Render reference: `docs/design/screenshots/prototype/SCR-09@1440-full.png`.

- Source files:
  - Primary (precedence 1): `HTML` template L1080–1348 (screen block `isVisualizacion`): header card L1084–1099, "Panorama
    comparativo de promedios" L1101–1186 (KPI tiles L1111–1136, heatmap L1139–1147, ranking L1149–1178, radar info
    L1181–1183), "Categorías" L1186–1202, indicator panel L1204–1227, weight composition L1229–1303, recommendations modal
    (OVL-01) L1308–1323, comments rail L1325–1341 (empty news loop L1343–1345); publish modal OVL-10 L3019–3030. Logic:
    `TIER_NAMES` L3217, `TIERS` L3218–3223, `PROACTIVE.visualizacion` L3228, `CATEGORIES` L3295–3317, `fmt` L3537–3541,
    `selectedCategory:'rentabilidad'` L3546, `generalComments` seeds L3567–3570, `pesoRankTipo:'fin'` / `pesoDimTab:'fin'`
    L3581, `publishedAnalyses` L3599, `pesosCompania` L3608–3615, `confirmPublish` L3678, `sendGeneralComment` L3730–3736,
    `categories` L3893–3902, `selectedIndicators` L3905–3919, `overallTier` L3924–3925, segment tips L4561–4564,
    `pesoCompanias` L4565–4583, `LINEA_DEFS` L4584–4592, `anyOverweight` L4593, `pesoDimTabs` L4595–4600, `pesoPromedio`
    L4601–4605, `COMPANY_COLOR_MAP` L4606, `ECOPETROL_PESO` L4607, `kpiSummary` L4660–4664, `mixHex` + `heatmapRows`
    L4665–4677, `rankTipoOptions` + `rankingBars` L4678–4693, radar geometry L4694–4700, `gaps` + `pesoRecommendations`
    L4701–4706, `recoActionCount` L4764, title map `visualizacion:'Visualización · Dashboard'` L5156, bindings L5204–5205,
    L5296, L5335–5338, L5507–5508.
  - Uploads: `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-10 a la(s) 11.24.57 a.m..png"`
    (Categorías iteration, partially superseded — "Seguimiento" chip colour, CF-24).
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador/README.md` §9 (radar + heatmap + Publicar, CF-36);
    `BACKEND.md` rule 4 (Visualización read-only for everyone).
  - Requirements for the lifecycle (M-04 / M-05): board 09 `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\carpetas-1788888336424-euvv.jpg"`
    lanes A.4, B.8, F; FINTEKK `uploads\Captura de pantalla 2026-09-08 a la(s) 11.51.23 a.m..png` step 06.
  - No Paquete image covers this screen. Visual baseline: the P1-03a render above.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.9 (L329–352), §1.18, §1.19, critic M-04 (L1448), M-05 (L1449);
    `02-prototype-html.md` §3 `SCR-09 Visualización · Dashboard`.
- Proposed route: `/analisis/:analysisId/visualizacion?categoria=rentabilidad&ranking=fin&peso=fin` — URL params:
  `categoria` (selected category card, default `rentabilidad`, L3546), `ranking` (ranking dimension, default `fin`,
  L3581), `peso` (composition dimension tab, default `fin`, L3581). Guard: role can open the analysis in its current
  lifecycle state (see Role visibility); otherwise `/403`. Entry points: Resultados "Generar vista de reporte" (SCR-08),
  Inicio cards for published analyses (SCR-05), Análisis "Ver detalle" for consumers (SCR-06), sidebar "Ref.
  Competitivo" for consumers (synthesis §1.9), OVL-10 notification links. Header title "Visualización · Dashboard"
  (L5156). No analysis tab bar (`showAnalysisTabs` excludes `visualizacion`, L3796; CF-21).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04). Root grid `grid-template-columns:1fr 300px; gap:20px`, `fadeUp .3s ease` (L1081).
  - Left column `display:grid; gap:20px; min-width:0` (L1082): header card → Panorama card → Categorías → indicator panel
    → weight composition card.
  - Right rail (300 px): `position:sticky; top:20px; max-height:calc(100vh - 112px); overflow:auto`, `gap:12px`
    (L1325), comments card only.
  - Cards: `#fff`, `1px solid #DFE2E6`, radius 12, padding 22 (indicator panel `overflow:hidden`, bands `16px 20px`).
  - Lifecycle banner [proposed] sits above the header card, full left-column width (see States).
- Tabs: n/a as a page tab bar. In-card single-select tabs: ranking dimension ("Financiera" / "Operativa" / "Transversal",
  L4678) and composition dimension (same labels, L4596); category cards act as a selector (see Filters & controls).
- Sections: top to bottom (left column), then the right rail.
  1. **Header card** (L1084–1099): eyebrow "Posición global · T4 2025" (`400 12px #98A1B0`, L1086); overall tier name
     `{{ overallTier.name }}` `700 30px` in the tier fg (mock "Estratégico" `#047857` = round(mean of category tiers 14/6) =
     2, L3924–3925); "promedio de 34 indicadores vs. 14 pares" (`400 13px #59667C`, L1089 — static in V2, BFF-computed
     counts per CF-73). Actions (right): primary "Crear presentación" with a monitor icon (L1094–1097) →
     `/presentaciones/nueva?analysisId=` (V2 `goPresentacionesCreate`, L5196); **"Publicar"** for the analyst (CF-36: V2
     has the modal but no trigger; label `Publicar` [inference: README §9]) → `C-09` → OVL-10.
  2. **"Panorama comparativo de promedios"** card (L1101–1186): title `600 14px` (L1103) + right AI pill "✦"
     `Recomendaciones de Yarbis ({{ recoActionCount }})` (L1104–1106) → OVL-01; subtitle "KPIs, heatmap, ranking y radar
     Ecopetrol vs. sector" (L1109).
     - "KPIs resumen" (i) (L1112–1113) → "Promedio de peso asignado por cada compañía del set de pares, comparado con el
       rango (mín–máx) y con el peso actual de Ecopetrol." (L1122). Three tiles (grid 3 cols gap 12, L1124–1136; tile
       `#F5F6F7`, `2px solid #DFE2E6`, radius 10, padding 14): label `{{ k.label }}` uppercase `600 11px #808A9B`;
       `{{ k.avg }}%` `700 24px` + "prom. sector" (L1128); chip `#EAFBE4` / border `#83E377` / dot + text `#2E7D1E`
       `Ecopetrol {{ k.ecopetrol }}%` (L1129–1132); `Rango {{ k.min }}–{{ k.max }}%` (L1133). Mock (L4660–4664 over
       `pesosCompania` + `ECOPETROL_PESO`): FINANCIERA 43 % / Ecopetrol 45 % / Rango 33–62 % · OPERATIVA 30 % / 30 % /
       15–40 % · TRANSVERSAL 28 % / 25 % / 24–33 % (matches the render). V2 has a duplicated empty tile loop (L1114–1118)
       → not built.
     - Heatmap (L1139–1147): info "Entre más oscura la celda, mayor el peso asignado a esa línea de indicador para esa
       compañía. Clic en el nombre abre su perfil." (L1140); V2 renders an empty bordered box (loop body empty, L1144–1146)
       → **rendered in the product** from `heatmapRows` (CF-36) [inference: layout].
     - "Ranking por categoría" (i) (L1151–1152) + dimension chips (L1154–1158; padding `5px 12px`, active
       `#672DBD`/white); info "Compañías ordenadas de mayor a menor peso en la línea seleccionada, para identificar quién
       pondera más esa categoría." (L1161); rows (L1164–1177) — see Charts.
     - Radar: V2 has only the info text "Cada eje es una línea de peso (Financiera/Operativa/Transversal). Entre más se
       separan los dos polígonos en un eje, mayor la diferencia entre cómo Ecopetrol distribuye su peso y cómo lo hace el
       sector en promedio." (L1182) and the computed geometry (L4694–4700) → **rendered in the product** (CF-36)
       [inference: placement after the ranking; the info toggle has no visible trigger in V2].
  3. **"Categorías"** (i) (L1188–1189; eyebrow `600 12px #424E63` uppercase): info (L1192, rendered with bold tier names)
     "El Tier resume la posición de Ecopetrol frente a pares en esa categoría: " + tier names + " Clic en una tarjeta filtra
     los indicadores debajo." — full text in `HTML` L1192 (tier words wrapped in `<strong>`). Six cards (grid
     `repeat(auto-fill,minmax(150px,1fr))` gap 10, L1194–1200; `2px` border, radius 10, padding 14): tier chip
     (`600 10px`, tier bg/fg) + category label `600 13px #1C2535`; selected card bg = tier card bg and border = tier bg
     (L3899). Mock: Rentabilidad "Estratégico", Liquidez "Líder", Operacional "Seguimiento", Competitividad OPEX "Líder",
     Solvencia "Prioritario", ESG "Estratégico" (L3296–3316 + `TIER_NAMES` L3217).
  4. **Indicator panel** (L1204–1227): header `{{ selectedCategoryLabel }}` `600 14px` + info → "Cada fila compara el valor
     de Ecopetrol contra el promedio de pares para ese indicador. Clic en una fila abre el detalle con histórico, fórmula y
     fuente." (L1213); right `{{ selectedCategoryMsg }}` `400 12px #98A1B0` (mock "Ecopetrol mantiene margen sólido pese a
     la contracción.", L3296). Rows (padding `14px 20px`, L1216–1225): label `500 13px` + code `IND-…` `600 10px Roboto
     Mono #98A1B0`; Ecopetrol value `700 15px Roboto Mono #1C2535` + caption "Ecopetrol"; peer average `600 15px Roboto Mono
     #59667C` + caption "Prom. pares"; tier chip (width 84, `600 11px`); chevron "›" `#B3B9C4`. Mock Rentabilidad: ROACE (%)
     `+7,4%` / `+5,5%` Estratégico · Margen EBITDA (%) `+39%` / `+32%` Líder · Crecimiento EBITDA (%) `-13,8%` / `-2,2%`
     Prioritario (render).
  5. **"Composición de peso por línea de indicador"** (L1229–1303): title + info "i" (bg `#47A4D5`, L1232) → "Cómo pondera
     cada compañía par sus tres líneas de indicador para el análisis (no incluye a Ecopetrol, que no pondera contra sí
     misma). Para editar estos valores, ve a Resultados · Espacio de trabajo." (L1236); subtitle "% de peso Financiera /
     Operativa / Transversal por compañía · solo lectura · Horizonte TBG" (L1234).
     - Overweight banner (`#FEE2E2`/`#991B1B`, `500 12px`, L1238–1240): "⚠ Una o más compañías superan el 100% en la
       sumatoria de pesos." when any company total > 100 (L4593; mock TotalEnergies 62 + 20 + 24 = 106 %).
     - Ecopetrol reference box (`#EDE9FE`, `2px solid #672DBD`, radius 10, L1242–1256): "★ Grupo Ecopetrol · referencia"
       (`700 12px #7002B0` uppercase, L1244); 30px stacked bar 45 % `#2C699A` / 30 % `#0DB39E` / 25 % `#F1C453` with white
       labels (L1246–1250); diffs `Financiera vs. pares: {n} pts`, `Operativa vs. pares: {n} pts`, `Transversal vs.
       pares: {n} pts` (L1252–1254; mock +2 / +0 / -3, L5336–5338).
     - Dimension tabs (L1258–1262; active bg = dimension colour `#2C699A` / `#0DB39E` / `#F1C453`, white text; inactive
       `#F5F6F7`/`#59667C`, L4598).
     - Per-company rows (L1264–1285): name `600 12px` (click → company profile OVL-13, hover `#672DBD`) + `Total:
       {{ pc.total }}%` `600 11px` (red `#EF4444` > 100, amber `#FBBF24` < 100, green `#047857` = 100, L4579); 26px stacked
       bar with segment labels; non-active dimensions at opacity 0.3 (L4568); clicking a segment toggles a tip below the
       bar (Financiera `#EDE9FE` + left border `#672DBD`, Operativa `#E3F6FA` / `#49BCD8`, Transversal `#FEF3C7` /
       `#FBBF24`, L1275–1283) with text `{pct}% — ` + dimension tip (L4561–4564, e.g. "Financiera: " + categories of type
       financiero + ". Incluye indicadores como ROACE, Margen EBITDA y Deuda Neta/EBITDA."). Mock order in the render
       (sorted by the active dimension, L4594): TotalEnergies 62/20/24 (106 %), BP 55/15/30, Oxy 40/35/25, Shell 35/40/25,
       Equinor 33/34/33, Petrobras 33/35/32.
     - Legend (L1287–1301): per line a 9px colour square, code `LIN-01` / `LIN-02` / `LIN-03` (`600 10px Roboto Mono
       #98A1B0`), label, 14px info "i" → formula popover (`#F5F6F7`, max-width 220): "Promedio ponderado de ROACE, Margen
       EBITDA y Deuda Neta/EBITDA" / "Promedio ponderado de crecimiento de producción y competitividad en OPEX" / "Promedio
       ponderado de gobernanza corporativa y factores ESG" (L4585–4587).
     - Footer strip (`#F5F6F7`, L1302): `Promedio del grupo: {{ fin }}% Financiera · {{ op }}% Operativa · {{ trans }}%
       Transversal` (mock 43 / 30 / 28).
  6. **Right rail — "Comentarios"** (L1326–1341): eyebrow `600 11px #808A9B` uppercase; thread items: author `600 12px
     #1C2535` + `· {{ gc.role }}` `400 11px #98A1B0`, text `400 12px #424E63`, time `400 11px #98A1B0` (L1331–1333);
     textarea placeholder "Escribe un comentario..." (L1338); primary button "Enviar" (L1339). Seeds (L3568–3569): Jorge
     Salas · Ejecutivo visualizador — "Excelente que ahora se pueda ver el comparativo de pesos por compañía." (hace 1 día);
     Alejandra Ríos · Ejecutivo integral — "¿Podemos agregar exportación a PDF del dashboard completo?" (hace 4 horas).
     M-05 additions [proposed]: see States / Interactions.
  7. OVL-01 recommendations modal (L1308–1323): scrim, card 520 px radius 14 padding 26; "✦" + "Recomendaciones de Yarbis"
     `700 17px` (L1312), "✕" (L1313); subtitle "Basadas en la distribución de pesos de Ecopetrol vs. el promedio sectorial"
     (L1315); one card per dimension `{{ rec.label }}.` bold + text (L1318), tone rules (L4703–4705): |diff| < 6 → ok
     `{dim}: alineado con el sector (…). Mantener el peso actual.`; diff > 0 → watch; diff < 0 → action with leader name.
  8. OVL-10 "Análisis publicado" (L3019–3030): 420 px, centred; green check circle `#D1FAE5`; title "Análisis publicado"
     `700 17px` (L3025); body `"{{ analysisName }}" fue publicado con éxito. Los usuarios con acceso serán notificados, y el
     análisis ya está disponible en la sección Análisis.` (L3026, "Análisis" bold); full-width primary "Entendido" (L3027).
- Components:
  - Shell (SCR-04): `Cmp:AppShell`, `Cmp:Sidebar`, `Cmp:AppHeader`, `Cmp:YarbisFab`, `Cmp:YarbisChatPanel`.
  - Frame: `Cmp:Card`, `Cmp:SectionHeader`, `Cmp:InfoToggleButton`, `Cmp:InfoPanel`, `Cmp:AiPillButton`, `Cmp:Button`
    (primary with icon; publish), `Cmp:StickyRail`, `Cmp:LifecycleBanner` [proposed], `Cmp:StatusChip` (lifecycle badge)
    [proposed].
  - Header: `Cmp:OverallTierHeader` (eyebrow + tier name + context line + actions).
  - Panorama: `Cmp:WeightKpiTile` (avg + Ecopetrol chip + range), `Cmp:EcopetrolChip`, `Cmp:Heatmap` (company × dimension
    graded cells), `Cmp:CategoryChips` (single-select dimension chips), `Cmp:RankingBarList` (rank, avatar, name, bar, %,
    leader / Ecopetrol variants, explanation row — reused from SCR-08 module 5), `Cmp:RadarChart` (2 polygons, 3 axes).
  - Categories: `Cmp:TierCard` (selectable), `Cmp:TierChip`.
  - Indicator panel: `Cmp:IndicatorComparisonRow` (label + code, two mono values with captions, tier chip, chevron).
  - Composition: `Cmp:AlertBanner` (danger), `Cmp:EcopetrolReferenceBox` (stacked bar + diffs), `Cmp:SegmentedTabs`
    (dimension, coloured active), `Cmp:StackedBarRow` (company + Total label + clickable segments — reused from SCR-08
    module 7), `Cmp:SegmentTip`, `Cmp:ChartLegend` (with code + formula popover `Cmp:InfoPopover`), `Cmp:Footnote`.
  - Rail: `Cmp:CommentThread` (items, `Cmp:TextField` multiline, `Cmp:Button`), `Cmp:CommentStatusChip` [proposed],
    `Cmp:ChangeRequestActions` (Aceptar / Rechazar) [proposed].
  - Overlays: `Cmp:Modal` (OVL-01 `Cmp:RecommendationsModal`, OVL-10 `Cmp:ConfirmationModal`, OVL-13 company profile,
    OVL-16 `Cmp:ReviewerPickerModal` [proposed]), `Cmp:Toast`, `Cmp:SectionSkeleton`, `Cmp:SectionError`.
- Charts:
  - **KPI tiles** — numeric summary per dimension (sector average, Ecopetrol, min–max range); no plot.
  - **Heatmap** — rows: Ecopetrol first + the 6 peers (L4670); columns Financiera / Operativa / Transversal; cell colour
    `mixHex('#F5F6F7', dimColor, v/100)` with dimColor `#2C699A` / `#0DB39E` / `#F1C453` (L4672–4674); cell text white
    above 55 % (fin, op) / 65 % (trans), else `#1C2535`; Ecopetrol row bg `#EAFBE4`, name `#2E7D1E`; peer name click →
    OVL-13 (L4676). Legend: the three dimension colours [inference]. No tooltip (value printed in the cell) [inference].
  - **Ranking bars** — one row per company incl. Ecopetrol, sorted by the selected dimension (L4679–4680): rank number,
    24px avatar with 2-letter initials (leader `#FBBF24`/white, Ecopetrol `#83E377`/white, others `#EDE9FE`/`#672DBD`),
    name (width 90; leader `#92400E` 700, Ecopetrol `#2E7D1E` 700), 18px bar on `#F5F6F7` (width = pct %, colour from
    `COMPANY_COLOR_MAP` L4606, Ecopetrol `#83E377`, `transition:width 400ms`), value `{pct}%` mono; row bg leader
    `#FEF3C7`, Ecopetrol `#EAFBE4`. Click → explanation row (`#F5F6F7`) with rule text (L4690–4692), e.g. `{name} lidera
    en {dim} con {pct}%, el peso más alto del set analizado.` Mock Financiera: TotalEnergies 62 · BP 55 · Ecopetrol 45 · Oxy
    40 · Shell 35 · Equinor 33 · Petrobras 33 (render).
  - **Radar** — 3 axes Financiera / Operativa / Transversal (L4695), rings at 25 / 50 / 75 / 100 %, polygons Ecopetrol
    (`ECOPETROL_PESO`) and sector average (`pesoPromedio`) (L4696–4700); series colours Ecopetrol `#83E377`, sector
    `#672DBD` [inference: CF-11 Ecopetrol highlight + average colour of SCR-08 module 8]; legend "Ecopetrol" / sector
    average [inference]; no tooltip.
  - **Stacked composition bars** — Ecopetrol reference (30 px) and one per peer (26 px), segments Financiera `#2C699A`,
    Operativa `#0DB39E`, Transversal `#F1C453` (V2 second dimension palette, CF-42), labels inside segments, active
    dimension full opacity / others 0.3, `Total:` label coloured by sum rule; click segment → tip. Legend LIN-01..03 with
    formula popovers.
- Tables:
  - Indicator panel rows act as a read-only table: columns indicator (label + code) · "Ecopetrol" · "Prom. pares" · tier ·
    chevron (captions under the values instead of a header row). One row per indicator of the selected category, catalog
    order; no sorting, paging or totals; values formatted by `fmt` (L3537–3541: es-CO, 1 decimal, units). V2 prefixes
    positive percentage values with `+` (`+7,4%`, `+39%`) even for levels, not deltas → product shows the sign only for
    growth / delta indicators [inference: formatter by indicator kind; CF-70].
  - Heatmap is a matrix (see Charts).
- Filters & controls:
  - Category card selection (`categoria` in URL, default `rentabilidad`): single-select, filters the indicator panel.
  - Ranking dimension chips (`ranking` in URL, default `fin`).
  - Composition dimension tabs (`peso` in URL, default `fin`): re-sorts peer rows and dims other segments.
  - Info toggles × 7 (KPIs, heatmap, ranking, radar, categorías, indicadores, peso) + 3 legend popovers: click toggle, one
    open at a time per group (CF-61); not in the URL.
  - Ranking explanation row and segment tips: one open at a time; not in the URL.
  - Everything else is read-only (BACKEND rule 4): no value inputs on this screen (V2 defines `onEcoInput` /
    `onParesInput` on indicator rows, L3915–3916, but renders no inputs).
- States:
  - Loading: header, Panorama sub-blocks, categories + indicator panel, composition and rail load as independent
    `SectionResult` skeletons [inference].
  - Empty: category with no indicators → muted row (copy missing) [inference]; no comments → only the input (copy for an
    empty thread missing) [inference]; no peers → KPI tiles, heatmap, ranking and composition show a muted note [inference].
  - Error: per-section `Cmp:SectionError` with retry [inference].
  - Overweight: banner visible when any peer sums > 100 % (L1238); rows keep the red `Total:` (L4579).
  - Recommendations count 0 (all dimensions within ±6 pts, as in the mock: +2 / 0 / −3) → pill shows `(0)` and the modal
    lists three ok cards (render shows `Recomendaciones de Yarbis (0)`).
  - **Lifecycle (critic M-04) [proposed]** — `V-20.lifecycleState`:
    - `preparacion` (preparation): only the analyst creator sees the screen; lifecycle badge `Preparación` next to the
      tier eyebrow; header actions "Crear presentación", `Habilitar vista previa` → OVL-16 "Seleccionar revisores"
      (overlays.md, [proposed]) → `C-41 POST /api/v1/analyses/:analysisId/preview-invitations`, and `Publicar` (`C-09`);
      comments rail visible only to the analyst [inference].
    - `vista_previa` (preview): full-width banner above the header card (`#FEF3C7` / `#92400E` [inference: warning
      tokens]) with copy `Vista previa · visible solo para los revisores invitados` [proposed copy]; invited reviewers
      (executive_integral) can comment (F32 `C-10`) and request changes (F33 `C-12`); the analyst still sees
      `Publicar`; the list SCR-06 shows the same badge [inference].
    - `publicado` (published): no banner; badge `Publicado` (`#D1FAE5`/`#047857`, analysis status chip); visible to
      analyst, explorers and executive_integral; `Publicar` and `Habilitar vista previa` hidden; OVL-10 shown once right
      after `C-09` succeeds; V2 flips the list status via `publishedAnalyses` (L3599, L3678).
  - **Comments rail, analyst side of F32 / F33 (critic M-05) [proposed]**: each comment shows a status chip `Pendiente` /
    `En análisis` / `Resuelto` (BACKEND enum `pendiente | en_analisis | resuelto`) that the analyst changes (`C-11`);
    change requests (F33) carry a `Solicitud de cambio` tag and, for the analyst, `Aceptar` / `Rechazar` buttons (`C-13`;
    accepting may trigger `C-08` recalculation with the operation-progress state of SCR-08, M-06); reviewers see the
    decision read-only; a notification is created for the author [inference: notification type to be added].
  - Publishing: "Publicar" busy while `C-09` runs; success → OVL-10; error → danger toast [inference].
  - Proactive tip on first visit: "Detecté una caída del 8% en el margen EBITDA promedio del sector. Ecopetrol se mantiene
    en Tier 2 general." (L3228), only with `canUseAssistant`.
- Interactions:
  - "Crear presentación" → `/presentaciones/nueva?analysisId=:analysisId` (builder open, V2 `goPresentacionesCreate`
    L5196).
  - `Publicar` (analyst, CF-36) → `C-09 POST /api/v1/publications {analysisId, products:[report]}` → OVL-10 → "Entendido"
    closes and keeps the user on the screen (V2 `confirmPublish` flips the status, L3678).
  - AI pill → OVL-01 (`V-23 scope=visualization`); "✕" / scrim / Esc close.
  - Ranking row click → toggles its explanation; dimension chip → `ranking` param.
  - Heatmap / composition company name click → OVL-13 company profile (L4581, L4676; V2 maps Oxy → Chevron and
    TotalEnergies → Total because the profile pool lacks them — prototype defect, not reproduced).
  - Category card → `categoria` param; indicator row → `/analisis/:analysisId/indicadores/:indicatorId` (SCR-10) when the
    indicator has detail (V2 no-op otherwise, L3914).
  - Composition tab → `peso` param; segment click → tip; legend "i" → formula popover.
  - Comments: type + "Enviar" → `C-10` (V2 appends as `Camila Bravo · Analista creador`, L3734); [proposed] status chip
    and Aceptar / Rechazar as above.
- Data fields:
  - `V-20 GET /api/v1/views/visualization/:analysisId`: `lifecycleState` (`preparacion | vista_previa | publicado`)
    [proposed, M-04]; `position{tierId (1–4, derived = round(mean of category tiers)), periodLabel ("T4 2025", display
    formatter), indicatorCount (integer, derived — CF-73), peerCount (integer, derived)}`; `kpiTiles[dimension]{sectorAvg
    (%, derived mean of peer weights, integer), ecopetrol (%, raw), min (%, derived), max (%, derived)}`; `heatmap[]{companyId,
    name, isEcopetrol, fin, op, trans (%, raw)}`; `radar{axes[3], ecopetrol[3] (%), sector[3] (%, derived)}`;
    `categories[]{id, label, tierId (derived), message (string)}`; `weightComposition{ecopetrol{fin, op, trans} (%, raw),
    diffs{fin, op, trans} (pts, derived, signed), companies[]{companyId, name, fin, op, trans (%, raw), totalPct (derived),
    sumStatus (ok | over | under, derived)}, groupAvg{fin, op, trans} (%, derived), hasOverweight (boolean, derived)}`;
    `lineLegend[]{code (LIN-01..03), label, colorKey, formula (string)}`; permissions `canPublish`, `canEnablePreview`
    [proposed], `canCreatePresentation`, `canComment`.
  - `V-21 GET /views/peer-weight-ranking/:analysisId?dimension=fin`: `rows[]{rank (derived), companyId, pct (%, raw),
    isLeader, isEcopetrol, explanationKey + params}`.
  - `V-22 GET /views/category-indicators/:analysisId?category=rentabilidad`: `rows[]{indicatorId, code, label, unit (`%`
    | `x` | `USD/B` | `pts`), ecopetrol (number, raw), peerAvg (number, derived), tierId (derived), hasDetail}`.
  - `V-23` (OVL-01): `items[]{dimension, tone: ok | watch | action (derived, |Δ| < 6 → ok), textKey + params}`,
    `countActionable` (integer, derived — the pill count).
  - `V-26 GET /views/comment-thread?entityType=analysis&entityId=`: `threads[]{id, author{name, roleLabel}, text,
    createdAt (ISO → relative es-CO "hace 1 día"), status? (pendiente | en_analisis | resuelto) [proposed display],
    kind (comment | change_request) [proposed], decision? (accepted | rejected) [proposed], replies[]}`; permissions
    `canComment`, `canReply`, `canRequestChange`, `canResolve`.
  - Commands: `C-09` publish, `C-10` comment, `C-11` comment status [proposed UI], `C-12` change request, `C-13` decision
    [proposed UI], `C-41` preview invitations [proposed]; OVL-16 reads the invitable users [proposed; the source is open, see OQ-39].
  - Formats: weights as integer `%`; diffs signed `+2 pts`, `+0 pts`, `-3 pts` (V2 shows `+0`); indicator values es-CO via
    `fmt` (CF-70).
- Role visibility:
  - analyst_creator: every lifecycle state; Publicar, Habilitar vista previa [proposed], Crear presentación; comments with
    status / decision controls [proposed].
  - executive_integral: `vista_previa` when invited (comment + request change) and `publicado` (comment + request change);
    Crear presentación hidden [inference: §1.19 "create-edit-publish" is analyst-only].
  - explorer_viewer / explorer_integral: `publicado` only; read-only; comments hidden (§1.19: no F32 / F33 for explorers).
  - executive_viewer: no access (§1.19; reaches content only via presentations) → `/403`. Note: the V2 comment seed is
    authored by an "Ejecutivo visualizador" (L3568) — kept as seed text only.
  - Yarbis chat only with `canUseAssistant` (CF-40); the OVL-01 recommendations are published AI text visible to every
    role that sees the screen [inference: CF-40 "published AI texts visible to all"].
- Open questions / assumptions:
  - A1 — CF-36: heatmap and radar are rendered from V2 logic although V2 shows an empty box / nothing; "Publicar" is added
    for analysts with the V2 OVL-10 copy. PO confirmation pending (CF-36 PO = Yes).
  - A2 — M-04 lifecycle, OVL-16 and C-41 are [proposed]; state names, banner copy and who can enable the preview need PO
    copy / confirmation. overlays.md lists OVL-16's trigger as `Monitor config`, which looks wrong: per board 09 B.8 the
    preview is enabled from the analysis (this screen or Resultados) — flag for the overlays owner.
  - A3 — M-05 status chip and Aceptar / Rechazar controls are [proposed]; the same `Cmp:CommentThread` is reused on SCR-10,
    SCR-11 and SCR-14.
  - A4 — Header counts "34 indicadores vs. 14 pares" are static in V2 while the categories hold 10 indicators and the
    composition shows 6 peers → BFF-computed (CF-73).
  - A5 — Two dimension palettes coexist: composition / heatmap `#2C699A` / `#0DB39E` / `#F1C453` vs SCR-08 `#672DBD` /
    `#49BCD8` / `#FBBF24` (CF-42); kept per module.
  - A6 — Peer weights here (`pesosCompania`: TotalEnergies op 20, Oxy 40/35/25) differ from SCR-08 module 7 `QUAL_DATA`
    (TotalEnergies op 14, Oxy 70/10/20) (CF-65, OQ-08); screen parity per module.
  - A7 — Sign prefix on level values (`+39%` for Margen EBITDA) is a `fmt` artefact; product formats by indicator kind.
  - A8 — "¿Podemos agregar exportación a PDF del dashboard completo?" (seed comment) hints at a dashboard export that no
    source specifies → not built (out of scope unless the PO adds it).
