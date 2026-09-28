# Slide renderer (shared by SCR-14 viewer and OVL-06 preview)

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (quote the path in shell;
> `Lnnn` = line number). Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not
> literally in `HTML` carries `[inference]`. Components are tagged `Cmp:PascalName`; tokens are paths in
> `docs/design/design-tokens.json`. `CF-nn` → `docs/design/conflicts.md`; `OVL-nn` → `docs/design/overlays.md`; `V-nn`, `C-nn`,
> `OQ-nn` → `.plan/source-map/10-synthesis.md` §4 / §8. Screens: SCR-13 builder and SCR-14 viewer
> (`docs/design/screen-inventory/SCR-13-presentaciones.md`, `SCR-14-presentacion-detalle.md`, P1-15a).
>
> Data rule for every kind: **raw** = value copied from the analysis data as stored (a source number or label); **derived** = the
> BFF computes it (aggregates, rankings, top-N, status/tone, counts, titles with parameters, page labels). The front only formats
> numbers by locale (es-CO, CF-70) and turns values into bar widths (presentation, not business logic). All slide data comes from
> `V-42 GET /api/v1/views/presentation-slides/:presentationId` as a discriminated union on `kind`.

## Sources

- `HTML` has the renderer twice, with identical markup: inside the SCR-14 viewer stage (L2113–2331) and inside OVL-06 "Vista previa"
  (L2628–2846). Per-kind ranges below list both (viewer / preview).
- Logic: `PRES_MODULES` (chart → kind) L4859–4867; slide list, order and reset L4892–4900; `pptCurrent` L4915; slide data L4920–4937
  (bars, table, pvc, hom, homMissing, radar), ranking/heatmap/findings/summary L4607–4631, `slideSummaryText` and `hallazgosIA`
  L4836–4843, `ECOPETROL_PESO` L4607, `pesosCompania` seed L3608–3615, `pesoPromedio` L4601–4605, `kpiSummary` L4660–4664,
  `homCardsAll` L4370–4384, `reportViewRows` L4824–4834, `PVC_COLORS` L4780; kind flags L5404–5406, L5410–5413.
- Renders (baseline): `docs/design/screenshots/prototype/SCR-14@1440-full.png` (viewer; stage shows the default slide 1 =
  Portada), `docs/design/screenshots/prototype/SCR-13@1440-full.png` (builder that feeds it) and
  `docs/design/screenshots/prototype/OVL-06@1440.png` (+ `@1280`; P1-03b): preview "Vista previa · Portada · diapositiva 1/7" with the
  "Orden de diapositivas" list showing the default 7-slide order (Portada, Barras GE vs. pares "● Con comentario", KPIs resumen,
  Heatmap, Barras apiladas, Lista de hallazgos, Cierre) and the cover in the Directorio fallback ("Directorio Ejecutivo",
  "Referenciamiento competitivo · T4 2025").
- Spec digests: `.plan/source-map/10-synthesis.md` §1.13–1.14 (L436–477); `.plan/source-map/02-prototype-html.md` L326–342.
- CF-84: the handoff HTML's viewer-only states (`isDSlideTitle` / `Summary` / `Ranking` / `Categories` / `Findings` / `Appendix`,
  static `DETAIL_SLIDES`) are superseded by this 14-kind renderer; CF-17/CF-18 (V2 preview and viewer both render the builder's
  slide list).

## Shared chrome

- Frame (`Cmp:SlideStage`): 16:9 (`aspect-ratio:16/9`), `#fff`, radius 10, `overflow:hidden`, column flex (HTML L2113); shadow
  `shadow.slideStage` (`0 12px 30px rgba(28,37,53,.15)`) in SCR-14, `shadow.previewSlide` (`0 30px 70px rgba(0,0,0,.4)`) in OVL-06
  (HTML L2628).
- Scaling: V2 draws the body at 100% of the stage with `scale(pptBodyScale)` = 1 (HTML L2119, L5409), so text does not scale with
  the stage. Spec: lay each slide out on a fixed **960 × 540** design canvas and scale it uniformly (`transform: scale(stageWidth /
  960)`, `transform-origin: top center`) so SCR-14 (max 900px wide) and OVL-06 (≈900px) show identical slides and the PPTX/PDF export
  uses the same geometry [inference: canvas size chosen so V2's paddings and 22px titles keep their proportions].
- "Chrome" kinds = all except `title`, `appendix`, `empty` (`pptIsChrome`, HTML L5406). They get:
  - Accent bar: 6px, full height, left edge, `z-index:2`, colour = template accent (HTML L2115).
  - Glow: 220×220 top-right, `radial-gradient(circle at 100% 0%, {accent}22 0%, rgba(255,255,255,0) 70%)` (HTML L2116, `{accent}` +
    `22` alpha, HTML L5410) — token `gradient.slideGlow`.
  - Eyebrow: module label, `700 10px Roboto`, letter-spacing .08em, uppercase, accent colour, at `top:14px; left:60px` (HTML L2121).
  - Content box: `height:100%; padding:34px 60px 6px; display:flex|grid; gap:12–18px` (e.g. HTML L2127).
  - Title row: title `700 22px #1C2535` (token `font.role.titleSlide`) + 36×4 accent bar radius 2, space-between (e.g. HTML L2128).
  - Comment band (only when the slide has a note, `pptHasNote`, HTML L2319–2324): margin `0 60px 8px`, `#FFFBEB` bg, `1px solid
    #FDE68A`, radius 8, padding `8px 12px`; label "Comentario" (HTML L2321; `700 10px #92400E`, uppercase, ls .06em) + note text
    `400 12px/1.45 #78350F` (HTML L2322) — tokens `status.warning.noteBg` / `.noteBorder` / `.noteText`. A note reduces the row count
    of `bars`, `table` and `pvc` (6→4, 7→5, 6→4; HTML L4925, L4926, L4928).
  - Footer (HTML L2325–2330): 26px, margin `0 60px`, top border `1px solid #EEF0F2` (`border.subtle`), `500 10px #98A1B0`, ls .04em;
    left "ECOPETROL · COMPARADOR FINANCIERO · {templateName}" (HTML L2327); right page number "{n} / {total}" `600 10px 'Roboto Mono'`
    (HTML L2328) — BFF `pageLabel`.
- Template accents (`templateId` → token): `directorio` `#672DBD` (`template.directorio`), `storytelling` `#49BCD8`
  (`template.storytelling`), `analitico` `#47A4D5` (`template.detalleAnalitico`) (HTML L3500–3502). No template selected → Directorio
  (HTML L4858).
- Fixed palette used inside slides (never the accent): Ecopetrol `#83E377` (`chart.ecopetrol`, CF-11), peers `#B3B9C4`
  (`chart.peer`), track `#F5F6F7` (`chart.track`), dimension accents Financiera `#672DBD` / Operativa `#49BCD8` / Transversal
  `#FBBF24` (`dimension.accent.financiera|operativa|transversal`, CF-42), company colours from the canonical map (`company.*`,
  CF-47).
- Cover asset: `assets/ppt-cover-bg.png` (2400×1792, 5.9 MB; ship as AVIF/WebP ≤ 1600w per the tokens asset registry) + gradient
  `gradient.slideCover` (`linear-gradient(180deg,rgba(18,8,35,0) 35%,rgba(18,8,35,.92) 100%)`). Closing slide uses
  `assets/benchud-logo.png`.
- Language: slide copy follows the presentation `language` (`es`|`en`, SCR-13 "Idioma"); strings below are the es-CO source keys.
- Components: `Cmp:SlideStage`, `Cmp:SlideRenderer` (switch on `kind`), `Cmp:SlideChrome` (accent bar, glow, eyebrow, footer),
  `Cmp:SlideTitle`, `Cmp:SlideNoteBand`, `Cmp:PairedBarRow`, `Cmp:StackedBar`, `Cmp:HeatCell`, `Cmp:RankRow`, `Cmp:KpiTile`,
  `Cmp:AiFindingBox`, `Cmp:LegendItem`.

## Kind catalogue (chart → kind, HTML L4859–4867)

| Module (eyebrow) | Chart (builder label) | kind |
|---|---|---|
| — | "Portada" | `title` |
| "Detalle y edición de datos por compañía" | "Tarjetas de cobertura" / "Indicadores faltantes" | `hom` / `homMissing` |
| "Comparativo GE vs. Promedio Pares" | "Barras GE vs. pares", "Por indicador · {categoría}" ×6 / "Tabla de indicadores" | `bars` / `table` |
| "Comparativo GE vs. compañía" | one per company in the Resultados set (Chevron, Shell, Equinor, BP, ISA) | `pvc` |
| "Resumen del informe" | "Tabla resumen" | `table` |
| "Panorama comparativo de promedios" | "KPIs resumen" / "Heatmap" / "Ranking por categoría" / "Radar GE vs. sector" | `summary` / `categories` / `ranking` / `radar` |
| "Composición de peso por línea de indicador" | "Barras apiladas" | `findings` |
| "Hallazgos de IA" | "Lista de hallazgos" | `hallazgos` |
| — | "Cierre" | `appendix` |
| — | (no slide selected) | `empty` |

## Kinds

### title — Portada
- HTML: L2218–2228 / L2733–2743.
- Fields: `templateName` (string, derived from `templateId`); `subtitle` (string, derived: analysis type + period, V2 static
  "Referenciamiento competitivo · T4 2025", HTML L2225); brand line fixed copy "ECOPETROL · COMPARADOR FINANCIERO" (HTML L2223, i18n).
- Layout: full-bleed, no chrome, no footer, no page number; bg `#1A1033` (`dark.surface`) + `ppt-cover-bg.png` cover at opacity .9 +
  `gradient.slideCover` (HTML L2219–2221); text block bottom-left, padding `40px 48px` (HTML L2222): brand line `600 12px`, opacity
  .85, ls .08em; template name `700 34px` white with `text-shadow:0 2px 12px rgba(0,0,0,.4)` (`font.role.displayCover`, HTML L2224);
  subtitle `400 15px`, opacity .9.
- Charts: n/a.

### bars — GE vs. Promedio Pares
- HTML: L2126–2142 / L2641–2657.
- Fields: `title` (string, derived: "GE vs. Promedio Pares" or "GE vs. Promedio Pares · {categoría}" for a per-category chart, HTML
  L4924); `rows[]` { `indicatorLabel` (string, raw, e.g. "ROACE (%)"), `ecopetrolValue` (number, raw, unit per indicator %|x|USD/B|pts),
  `peerAverageValue` (number, derived: peer average), `unit` (string, raw) }; `maxAbs` (number, derived: max |value| over the rows,
  scale reference); row count derived by the BFF: 6, or 4 when the slide has a note (HTML L4925); source = all report indicators, or
  the indicators of one category (HTML L4921–4922).
- Layout: chrome + title row; rows grid `170px 1fr`, gap 12 (HTML L2131): label `500 12px #424E63` ellipsis; two stacked 7px bars
  radius 3, gap 3, each followed by its value (Ecopetrol `700 10px 'Roboto Mono' #1C2535`, peers `500 10px 'Roboto Mono' #59667C`);
  legend row "Grupo Ecopetrol" / "Promedio pares" with 9px swatches (HTML L2140).
- Charts: paired horizontal bars per indicator; series Ecopetrol `chart.ecopetrol` / peer average `chart.peer`; bar length =
  |value| / maxAbs × 82% of the track (HTML L4925); negative values keep a positive length and show the signed value (CF-72, OQ-10);
  no axis, no gridlines, no tooltip.

### table — Tabla de indicadores / Tabla resumen
- HTML: L2143–2153 / L2658–2668.
- Fields: `title` (string, raw: the chart label, "Tabla de indicadores" or "Tabla resumen", HTML L2145); `rows[]` { `categoryLabel`
  (string, raw), `indicatorLabel` (string, raw), `ecopetrolValue` (number, raw), `peerAverageValue` (number, derived), `unit` (string,
  raw) }; row count derived: 7, or 5 with a note (HTML L4926).
- Layout: chrome + title row; bordered box radius 8 (HTML L2146); header row `#F5F6F7`, `600 10px #808A9B` uppercase, columns
  "Categoría" | "KPI" | "Valor GE" | "Prom. pares" with grid `1fr 1.6fr 80px 80px` (HTML L2147); body rows `400 11px #424E63`, values
  right-aligned `'Roboto Mono'` (GE bold `#1C2535`) (HTML L2149).
- Charts: n/a (table).

### pvc — GE vs. {compañía}
- HTML: L2154–2170 / L2669–2685.
- Fields: `companyName` (string, raw); `companyColorKey` (string, derived: canonical company colour key, fallback
  `company.fallback`, HTML L4934); `title` (string, derived "GE vs. {companyName}", HTML L2156); `rows[]` { `indicatorLabel` (string,
  raw), `ecopetrolValue` (number, raw), `companyValue` (number, raw from the company's reported data; V2 seeded/hash-generated,
  CF-66), `unit` (string, raw) }; per-row `maxAbs` (number, derived: max(|GE|,|company|), HTML L4931); row count derived: 6, or 4 with
  a note (HTML L4928).
- Layout: as `bars` (HTML L2159–2163); legend "Grupo Ecopetrol" / "{companyName}" (HTML L2168).
- Charts: paired horizontal bars per indicator; series Ecopetrol `chart.ecopetrol` / company colour (`company.*`, CF-47); length =
  |value| / row maxAbs × 82%.

### hom — Cobertura de datos por compañía
- HTML: L2171–2185 / L2686–2700.
- Fields: `cards[]` { `companyName` (string, raw), `coveragePct` (integer %, derived: homologated share of indicators), `tone`
  ('complete'|'review'|'incomplete', derived: ≥ 90 / 70–89 / < 70, HTML L4372), `missingCount` (integer, derived) } for the companies
  of the analysis (default Chevron, Shell, Equinor, BP, ISA, HTML L3576).
- Layout: chrome + title "Cobertura de datos por compañía" (HTML L2173); grid `repeat(auto-fill,minmax(140px,1fr))`, gap 10 (HTML
  L2174); card border `#DFE2E6` radius 8 padding 10: name `600 12px`, percentage `700 20px` in tone text colour, 5px progress track
  `#F5F6F7` with tone bar, "{n} faltante(s)" `400 10px #98A1B0` (HTML L2177–2180).
- Charts: per-card progress bar; tones `status.success` (`#047857` / `#10B981`), `status.warning` (`#92400E` / `#FBBF24`),
  `status.danger` (`#991B1B` → `#9A1616` alias, CF-43 / `#EF4444`).

### homMissing — Indicadores faltantes por compañía
- HTML: L2186–2195 / L2701–2710.
- Fields: `rows[]` { `companyName` (string, raw), `missingCount` (integer ≥ 1, derived), `coveragePct` (integer %, derived) } — only
  companies with missing indicators (HTML L4936).
- Layout: chrome + title "Indicadores faltantes por compañía" (HTML L2188); vertical list gap 8; row `#FEF2F2`
  (`status.danger.missingRowBg`), radius 8, padding `10px 14px`: name `600 13px #1C2535` (flex 1), "{n} indicador(es) faltante(s)"
  `500 12px #991B1B`, "{pct}%" `700 12px 'Roboto Mono' #59667C` (HTML L2191).
- Charts: n/a (list).

### radar — Ecopetrol vs. promedio sectorial
- HTML: L2196–2209 / L2711–2724.
- Fields: `rows[]` { `dimensionLabel` ('Financiera'|'Operativa'|'Transversal', raw enum label), `ecopetrolWeightPct` (number %, raw:
  Ecopetrol declared weight, 45 / 30 / 25, HTML L4607), `peerAverageWeightPct` (number %, derived: rounded mean of peer weights —
  43 / 30 / 28 with the seed, HTML L4601–4605) } (HTML L4937).
- Layout: chrome + title "Ecopetrol vs. promedio sectorial" (HTML L2198); three blocks gap 16: label `600 12px #424E63`, then two 12px
  bars radius 3 with values "{v}%" (`700 11px` / `500 11px 'Roboto Mono'`) (HTML L2202–2204).
- Charts: rendered as paired horizontal bars, **not** a radar polygon (V2); length = value × 2% of the track, capped at 100% (HTML
  L4937); series `chart.ecopetrol` / `chart.peer`. A true radar is not introduced here [inference: slide parity with V2; the
  Visualización radar, CF-36, is a different widget].

### hallazgos — Hallazgos de Yarbis
- HTML: L2210–2217 / L2725–2732.
- Fields: `findings[]` { `text` (string, derived: AI/template-generated finding, flagged `status:'suggestion'` until the analyst
  accepts it, OQ-19) } — V2 shows 5 static texts (HTML L4837–4843), e.g. "El grupo Ecopetrol mantiene margen EBITDA superior al promedio
  de pares a pesar de la caída general del sector."; max 5 [inference: fits the canvas].
- Layout: chrome + title "Hallazgos de Yarbis" (HTML L2212); stacked boxes gap 12, `#E3F6FA` (`ai.bg`), radius 8, padding `11px 14px`,
  text `500 12px #0E7490` (`ai.text`) prefixed "✦ " (HTML L2214).
- Charts: n/a (list).

### summary — KPIs destacados
- HTML: L2229–2242 / L2744–2757.
- Fields: `ecopetrolWeightPct` { `financiera`, `operativa`, `transversal` } (numbers %, raw: 45 / 30 / 25, HTML L4631); `summaryText`
  (string, derived narrative; V2 static "El grupo Ecopetrol mantiene margen EBITDA superior al promedio de pares a pesar de la caída
  general del sector.", HTML L4836).
- Layout: chrome + title "KPIs destacados" (HTML L2232); 3 tiles grid `1fr 1fr 1fr`, gap 14, radius 10, padding 16 (HTML
  L2235–2238): label uppercase `400 11px` ("Financiera" / "Operativa" / "Transversal"), value `700 24px` "{v}%", caption "peso
  Ecopetrol"; tile colours: Financiera = template accent bg + white text, Operativa `#D1FAE5`/`#047857`, Transversal
  `#FEF3C7`/`#92400E`; text box `#F5F6F7`, radius 10, padding 16, `400 14px/1.65 #424E63` (HTML L2240).
- Charts: n/a (KPI tiles).

### ranking — Ranking por peso total
- HTML: L2243–2261 / L2758–2776.
- Fields: `rows[]` (top 4, derived by the BFF: companies incl. Ecopetrol ordered by total weight desc, HTML L4617–4627) { `rank`
  (integer 1–4, derived), `companyName` (string, raw), `totalWeightPct` (number %, derived: Financiera + Operativa + Transversal, may
  exceed 100 — TotalEnergies 106, CF-65), `isEcopetrol` (boolean, derived), `barPct` (number %, derived: total / max total × 100) };
  footnote fixed copy "Peso total = Financiera + Operativa + Transversal · Capital IQ" (HTML L2259).
- Layout: chrome + title "Ranking por peso total" (HTML L2246); rows gap 12 (HTML L2251–2255): 24px accent circle with rank `700
  11px` white, name 84px `700 13px`, flex track 22px `#F5F6F7` radius 5 with bar, value 52px right `700 13px 'Roboto Mono'`; footnote
  `400 12px #98A1B0`.
- Charts: horizontal bar ranking; Ecopetrol bar `chart.ecopetrol`, others `chart.peer`; seed result 1 TotalEnergies 106%, 2 Ecopetrol
  100%, 3 BP 100%, 4 Equinor 100% (ties keep seed order).

### categories — Heatmap comparativo por compañía
- HTML: L2262–2283 / L2777–2798.
- Fields: `rows[]` (derived: Ecopetrol first + the two peers with the highest total weight, HTML L4628–4629) { `companyName` (string,
  raw), `financieraPct`, `operativaPct`, `transversalPct` (numbers %, raw declared weights), `isEcopetrol` (boolean, derived) }; seed
  rows Ecopetrol 45/30/25, TotalEnergies 62/20/24, BP 55/15/30; footnote fixed copy "Entre más oscura la celda, mayor el peso asignado
  a esa línea de indicador." (HTML L2281).
- Layout: chrome + title "Heatmap comparativo por compañía" (HTML L2265); header grid `120px 1fr 1fr 1fr` gap 6, `600 11px #98A1B0`
  uppercase "Financiera" / "Operativa" / "Transversal" (HTML L2268–2269); rows same grid: name `700 13px`, three cells radius 6, padding
  10, centred `700 13px` "{v}%" (HTML L2274–2277); footnote `400 12px #98A1B0`.
- Charts: category cells in solid dimension colours — Financiera `#672DBD` / Operativa `#49BCD8` (white text) / Transversal `#FBBF24`
  (`#1C2535` text) (`dimension.accent.*`). V2 does **not** grade the cells by value although the footnote says darker = heavier; spec:
  grade each cell's opacity by value within its column (min 0.35 → max 1) so the footnote is true [inference; alternative = drop the
  footnote — PO].

### findings — Composición de peso por línea de indicador
- HTML: L2284–2308 / L2799–2823.
- Fields: `rows[]` — the same three companies as `categories` (HTML L4630) { `companyName` (string, raw), `financieraPct`,
  `operativaPct`, `transversalPct` (numbers %, raw), `totalPct` (number %, derived; > 100 means the segments overflow, CF-65) }.
- Layout: chrome + title "Composición de peso por línea de indicador" (HTML L2287); per row gap 14: name `600 12px`, then a 24px bar
  radius 6 split into three segments with centred "{v}%" `600 11px` (HTML L2293–2297); legend "Financiera" / "Operativa" /
  "Transversal" with 9px swatches (HTML L2302–2305).
- Charts: 100% stacked horizontal bar per company; segment width = value% (V2 uses the raw value as width, so a 106% total overflows —
  spec: normalise widths to value / total and keep the raw labels [inference]); colours `dimension.accent.*`.

### appendix — Gracias (Cierre)
- HTML: L2309–2316 / L2824–2831.
- Fields: `templateName` (string, derived); `supportEmail` (string, config, V2 "analisis.competitivo@ecopetrol.com.co", HTML L2314);
  fixed copy "Gracias" (HTML L2312), "Comparador financiero de Ecopetrol frente al sector energético · {templateName}" (HTML L2313),
  "¿Preguntas? Escríbenos a analisis.competitivo@ecopetrol.com.co" (HTML L2314).
- Layout: full-bleed, no chrome, no footer, no page number; bg `#1A1033` (`dark.surface`), centred column, padding 44 (HTML L2310):
  `benchud-logo.png` h28 (alt "BencHUD", HTML L2311), "Gracias" `700 30px`, line `400 15px/1.6 #C7BEDE` max 440, contact `500 13px
  #83E377`.
- Charts: n/a.

### empty — Sin diapositivas
- HTML: L2123–2125 / L2638–2640.
- Fields: none beyond `kind` (the BFF returns `[{ kind:'empty' }]` when no slide is selected, HTML L4900); copy "Selecciona al menos
  un módulo para generar diapositivas." (HTML L2124).
- Layout: no chrome, no footer; message centred `500 15px #98A1B0` (HTML L2124); pager hidden [inference].
- Charts: n/a.

## Default order and selection behaviour

- Slide list = Portada (if on) → one slide per selected chart in module order, charts in catalogue order → Cierre (if on) (HTML
  L4892–4895); a saved custom order (OVL-06 ▲/▼, "Restablecer") overrides it, new slides append at the end (HTML L4896–4899).
- Default (new builder, HTML L3551–3552): **7 slides** — 1 `title` "Portada", 2 `bars` "Barras GE vs. pares" (with the seeded note
  "Destacar que GE supera al promedio en margen EBITDA pese a la caída del Brent.", HTML L3553), 3 `summary` "KPIs resumen", 4
  `categories` "Heatmap", 5 `findings` "Barras apiladas", 6 `hallazgos` "Lista de hallazgos", 7 `appendix` "Cierre".
- "Seleccionar todo" (HTML L5420) selects every chart of every module → **24 slides** = 22 chart slides (hom 2 + comp 8 + pvc 5 +
  resumen 1 + panorama 4 + peso 1 + hallazgos 1) + Portada + Cierre (Portada/Cierre toggles are not touched; with both off it is 22).
  The `pvc` count follows the analysis company set (5 by default), so the total changes if companies are added or removed in
  Resultados [inference from HTML L4862 + L3576].
- "Limpiar" (HTML L5421) removes all chart slides; with Portada and Cierre on the deck is 2 slides; with both off it is `empty`.
- Page label "{n} / {total}" counts every slide including Portada and Cierre, although those two do not display it (HTML L4915).

## Open questions / assumptions

- CF-84 / CF-17 / CF-18: only this 14-kind renderer is built; the handoff's viewer-only states are not.
- CF-72 / OQ-10: negative values in `bars` / `pvc` keep absolute length + signed label.
- CF-65: weight totals above 100% (TotalEnergies 106%) are shown as data; `findings` normalises segment widths only.
- CF-66: `pvc` company values are seeded in the mock.
- OQ-19: `hallazgos` and `summary` texts are template/AI suggestions until accepted; slide notes are drafted by `C-32`.
- [inference] 960×540 design canvas with uniform scaling (V2 does not scale); graded heatmap cells; 5-finding cap; pager hidden on
  `empty`.
