## SCR-12 — Sensibilidades

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (`Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. `{{ … }}` marks a template binding. Components are tagged
> `Cmp:PascalName` (reconciled by P1-17). Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and
> overlays (`OVL-nn`) refer to `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary (precedence 1): `HTML` template L1466–1683 (screen block `isSensibilidades`; strategic-plan modal L1651–1681);
    logic: `PROACTIVE.sensibilidades` L3231, `NAV` entry (role `analista`) L3272, initial state L3572–3575, `SCENARIOS` +
    `scenarioCards` L4019–4026, ROACE before/after L4027–4036, `DRILL_INDICATORS` + levers + suggestion L4038–4083,
    `SENS_INDICATORS` L4085–4102, `CAT_TARGETS` + weight groups + scores L4103–4131, Yarbis tips L4133–4139, `planRows`
    L4140–4146, header title `sensibilidades:'Sensibilidades'` L5156, `isSensibilidades` L5216, info toggles L5352,
    bindings L5491–5502. Entry point: Monitor de Valor button "Ir a Sensibilidades" L1704 (`goSensibilidades`, L5502).
  - Reference image (Paquete only; no V2 screenshot exists): `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\2_Sensibilidades_pantalla_completa.jpg"`
    (full page, default state; `03-reference-images.md` §3.4); repo copy
    `docs/design/screenshots/reference/pq-2-sensibilidades-pantalla-completa.png`.
  - Requirements boards (intent only): `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-08 a la(s) 11.52.53 a.m..png"`
    (discovery board: Tableros / Metas / Sensibilidades) and `…2026-09-08 a la(s) 11.53.16 a.m..png` (functional map:
    Vistas / Sensibilidades / Simulaciones) — `05-uploads-png-batch-1.md` §6.6, §6.8.
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador/README.md` §11 `Sensibilidades (reached only via
    Monitor de Valor)` (scenario presets — CF-10).
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.12 (L411–435), §1.18 (OVL-03), §1.19, §3 (F27, F28), §4 (V-37..V-39,
    C-21..C-26); `02-prototype-html.md` §3 `SCR-10 Sensibilidades` (the 02 file numbers screens differently), §4, §9.15.
- Proposed route: `/monitor-valor/sensibilidades?indicador=roace` — `indicador` in the URL (default `roace`; only ready
  indicators are accepted, others fall back to `roace` [inference]). Reachable only from Monitor de Valor "Ir a
  Sensibilidades" (HTML L1704) and by deep link; not in the sidebar, so **no nav item is active**
  [Paquete:2_Sensibilidades_pantalla_completa.jpg]. Header title "Sensibilidades" (L5156). Breadcrumb/back to
  `/monitor-valor` [inference: V2 has none; navigation-map P1-21 decides]. Guard: `canSimulate` (analyst_creator,
  executive_integral); others → `/403` (SCR-17) [inference: §1.19].
- Layout:
  - Inside `Cmp:AppShell` (SCR-04); no analysis tab bar (`showAnalysisTabs` excludes `sensibilidades`, L3796).
  - Content root: single column grid, `gap:16px`, `max-width:840px`, `fadeUp .3s ease` (L1467); the right part of the
    content area stays empty on wide screens [Paquete:2_Sensibilidades_pantalla_completa.jpg].
  - Cards: `#fff`, `1px solid #DFE2E6`, radius 12, padding 22 (L1469, L1547, L1564, L1587, L1631). Card titles `600 14px`
    + 16px info "i" (`#518CD1`, `700 10px`).
  - Inner strip pattern (Base → Simulado → gap): `#F5F6F7`, radius 10, padding `14px 16px`, flex gap 32 (L1506, L1572,
    L1599); labels `400 12px #98A1B0`, values `700 24px` (26px in ROACE Before/After), simulated value `#49BCD8`, arrow
    "→" `20px #B3B9C4` (L1508).
  - Sliders are native `input[type=range]` full width (L1498, L1557, L1561, L1621); themed with `brand.primary` in the
    product (OQ-11; P2 shows browser blue `#0075FF`).
  - Weight rows grid `1fr 160px 60px`, gap 14 (L1619). Strategic-plan modal: z 29, width 640 (`max-width:92vw`,
    `max-height:82vh`, scroll), radius 14, padding 26 (L1652–1653).
- Tabs: n/a (the indicator pills of section 1 act as a single-select switch, see Filters & controls).
- Sections: top to bottom, one column (max 840 px).
  1. Card "Sensibilidad por indicador · palancas reales de Ecopetrol" (L1472) + info toggle + amber chip "En construcción"
     (`#FEF3C7`/`#92400E`, L1475). Info text (L1478): "Elige un indicador y verás su fórmula descompuesta hasta las variables
     que realmente puedes mover. Cada indicador tiene un set predefinido de palancas (con topes mínimos y máximos) — no todas
     las variables posibles, para mantener la simulación manejable. Al mover una palanca, las variables relacionadas ("
     + "tríadas" + ") se recalculan automáticamente. Todo se sensibiliza sobre los datos propios de Ecopetrol; los pares solo
     definen la meta o referente contra la cual comparas." (the word tríadas is wrapped in straight double quotes in the copy)
     - Indicator pills (L1480–1484, data L4039–4051): "ROACE" (ready, selected: border `#672DBD`, bg `#EDE9FE`), "Margen
       EBITDA" and "Deuda Bruta / EBITDA" (not ready: text `#B3B9C4`, no click).
     - **Formula box** (`#F5F6F7`, L1486–1491): top line `600 12px #424E63` "ROACE = NOPAT / Capital empleado" (L4040);
       terms `400 12px #59667C` prefixed "·" (L1489): "NOPAT = Ingresos operacionales − Costos y gastos operativos −
       Depreciación y amortización − Impuesto de renta" (L4042) and "Capital empleado = Activos totales − Pasivos corrientes"
       (L4043).
     - "Palancas disponibles" (L1493) — **3 sensitivity levers** (L4046–4048), label `500 13px`, value `600 13px #672DBD`
       as `{{ lv.value }}{{ lv.unit }}` (L1497):
       1. "Costo de energía eléctrica" — unit `%`, range −10..5 step 1, default 0; linked line
          `↳ {{ lv.tiedLabel }}: {{ lv.tiedVal }}{{ lv.tiedUnit }}` (L1500) with label "Eficiencia energética (recalculada)",
          value = lever × −0.6, unit `%` (L4046).
       2. "Servicios contratados" — unit `MMCOP`, range −10000..5000 step 500, default 0; no linked variable (L4047).
       3. "Volumen de producción" — unit `%`, range −5..8 step 1, default 0; linked line label "Costo de levantamiento
          (recalculado)", value = lever × 0.4, unit `%` (L4048).
     - Result strip (L1506–1514): "Base" `{{ drillBase }}{{ drillUnit }}` → "Simulado" `{{ drillSim }}{{ drillUnit }}` ·
       right "Brecha vs. meta ({{ drillMeta }}{{ drillUnit }})" with "{{ drillGap }} pts" (`700 18px`, colour: ≤0 `#047857`,
       <2 `#92400E`, else `#9A1616`, L5494). V2 shows 74% → 74%, meta 79%, 5 pts (×10 scale defect); product shows
       `7,4 %` → `7,4 %`, meta `7,9 %`, `0,5 pts` [inference: CF-62 fix].
     - Yarbis suggestion box (`#EDE9FE`, border `#C4B5FD`, L1516–1531): title "✦ Sugerencia de combinación de Yarbis"
       (`600 12px #7002B0`, L1518) + toggle "Ver sugerencia ›" / "Ocultar ‹" (L5497; collapsed by default). Expanded body
       (L1522): "Basado en reportes históricos: bajar costo de energía −5% y servicios contratados −5.000 MMCOP, subir
       producción +3%. Resultado estimado: {{ drillSuggestionSim }}{{ drillUnit }}." Status (`600 11px`, L1524, L5499–5500):
       "Requiere validación humana" `#92400E` → "✓ Validada por analista" `#047857`. Buttons "Cargar en controles"
       (outline, L1526) and "Marcar como validada" (primary, L1527).
     - Disclaimer `400 11px #98A1B0` (L1532): "Yarbis calcula el impacto de cada combinación, pero la decisión de qué palanca
       mover para llegar a la meta requiere criterio humano — ninguna combinación es accionable sin validación de un analista."
  2. Eyebrow "Escenarios" (`600 12px #98A1B0` uppercase, L1536) + info toggle → "Elige un escenario predefinido (Base,
     Optimista, Conservador) para cargar valores de Productividad y Costos operativos, o ajusta los sliders abajo para crear
     uno personalizado." (L1540). Preset cards loop is empty (L1542–1546) → **no cards rendered** (CF-10). Proposed: keep
     the eyebrow and info as in V2 and render nothing else [inference: CF-10 default `Not rendered`].
  3. Card "Variables de simulación" (L1549) + info → "Simula cómo cambios en productividad y costos operativos moverían el
     ROACE de Ecopetrol, sin afectar los datos reales del análisis." (L1553). Sliders: "Productividad" −5..10 (L1556–1557)
     and "Costos operativos" −15..10 (L1560–1561), both default 0, value `{{ … }}%` `600 13px #672DBD`, step 1 (native default).
  4. Card "ROACE · Before / After" (L1566) + info (L1570; the copy itself wraps the words Base and Simulado in straight
     double quotes, so it is quoted here in three segments): opening word "Base" + " es el ROACE actual de Ecopetrol; " +
     "Simulado" + " aplica los ajustes de productividad y costos elegidos arriba. La barra de la derecha muestra cuánto de la
     brecha frente al promedio de pares se cerraría." Strip: "Base" `7.4%` → "Simulado" `{{ simRoace }}%` (`700 26px`, L1573–1575); right box
     "Brecha cerrada vs. pares ({{ paresRoace }}%)" (L1577) with an 8px progress bar `#10B981` on `#DFE2E6` (`transition:
     width 500ms`, L1578) and "{{ gapClosedPct }}%" `600 12px #047857` (L1579).
  5. Yarbis tip box (`#E3F6FA`, border `#A8E6EC`, text `#0E7490`, "✦", L1583–1585): "Aún queda una brecha importante —
     prueba subir productividad o bajar costos para acercarte más al promedio de pares." (L4036) or, when ≥ 50 % of the gap
     is closed, "Con estos ajustes cierras el " + n + "% de la brecha frente al promedio de pares en ROACE." (L4035).
  6. Card "Simulador de pesos por indicador · Ecopetrol" (L1591) + info toggle (no info body is bound in the template)
     + subtitle "Ajusta el peso (%) de cada indicador y observa el impacto en el puntaje ponderado frente a la meta, con base
     en datos reales e históricos." (L1594) + outline button "Restablecer pesos" (L1596).
     - Score strip (L1599–1607): "Puntaje base" `{{ sensBaseScore }}%` → "Puntaje simulado" `{{ sensSimScore }}%` ·
       "Variación" "{{ sensDelta }} pts" (colour >0 `#047857`, <0 `#9A1616`, 0 `#59667C`, L4130). Mock: 91.8% → 91.8%, 0 pts.
     - **4 simulator categories** (`CAT_TARGETS`, L4103), each with header `600 12px #424E63` + right label "{{ g.total }}% /
       {{ g.target }}% meta · {{ g.statusTxt }}" (L1614), a 6px bar (L1616) and weight rows:
       1. "Financiero" — target 60 %: "Flujo de Caja Libre" 12, "Deuda Bruta / EBITDA" 6, "Cobertura de Intereses" 6,
          "Eficiencias" 18, "ROACE" 18 (L4086–4090).
       2. "Mercado" — target 15 %: "TRR (renta variable)" 5, "Bond Spread (renta fija)" 5, "Precio Objetivo Analistas" 5
          (L4091–4093).
       3. "Estratégico" — target 20 %: "Dividendos Recibidos" 2, "CT+i" 2, "Dividendos / intereses pagados" 2, "Margen
          EBITDA ISA" 2, "Costo Energía GE" 2, "IRR" 8, "Estrategia Diversificación" 2 (L4094–4100).
       4. "Grupos de Interés" — target 5 %: "Aporte al PIB" 5 (L4101).
       Status text (L4119): "En línea" (|diff| ≤ 2, `#10B981`), "Excede la meta de categoría" (diff > 2, `#EF4444`), "Por
       debajo de la meta de categoría" (diff < −2, `#FBBF24`). Row: label `400 13px`, slider 0..30, weight "{{ r.weight }}%"
       `600 12px Roboto Mono` coloured by the KVI's Monitor compliance (≥90 `#047857`, ≥70 `#92400E`, else `#9A1616`, L4110).
  7. Card "Recomendaciones de Yarbis para el plan estratégico" (L1633) + info → "Yarbis ordena los indicadores por brecha
     frente a la meta y por su peso simulado — a mayor peso y brecha, mayor prioridad de acción." (L1637); subtitle
     "Priorizadas por brecha frente a la meta y peso relativo del indicador" (L1639); 3 tips (`#F5F6F7` rows, cyan "✦",
     bold "{{ tip.label }}." + text, L1642–1644), watch variant "A " + n + " pts de la meta. Un ajuste moderado cerraría gran
     parte de la brecha dado su peso (" + w + "%)." and critical variant "Brecha crítica de " + n + " pts frente a la meta.
     Con su peso actual (" + w + "%) prioriza un plan de acción inmediato." (L4137–4138). Default tips: Deuda Bruta / EBITDA
     28 pts (6%), Cobertura de Intereses 25 pts (6%), Precio Objetivo Analistas 11 pts (5%)
     [Paquete:2_Sensibilidades_pantalla_completa.jpg]. Primary button "Generar plan estratégico" (L1648) → OVL-03.
  - OVL-03 "Plan estratégico sugerido" (modal, L1651–1681): "✦" `#0E7490` + title `700 17px` (L1655), "✕" (L1656),
    subtitle "Basado en los indicadores con mayor brecha y peso en la simulación actual — listo para usar en seguimiento del
    análisis." (L1658); plan list (see Tables); footer buttons "Descargar" (outline, L1676) and "Guardar en el análisis"
    (primary, L1677).
- Components:
  - Shell (SCR-04): `Cmp:AppShell`, `Cmp:AppHeader`, `Cmp:Sidebar` (no active item), `Cmp:YarbisFab`, `Cmp:YarbisChatPanel`.
  - `Cmp:Card`, `Cmp:SectionHeader` (card title + `Cmp:InfoToggleButton` + right slot), `Cmp:InfoPanel`, `Cmp:StatusChip`
    ("En construcción" variant), `Cmp:Badge`.
  - `Cmp:IndicatorPillSelector` (single-select pills with disabled items).
  - `Cmp:FormulaBox` (expression + term list).
  - `Cmp:LeverSlider` (label, formatted value + unit, range with min/max/step, optional linked-variable line) — also used
    for the two scenario variables and the weight rows (compact variant `Cmp:WeightSliderRow`).
  - `Cmp:BeforeAfterStrip` (Base → Simulado + right slot for gap value or progress).
  - `Cmp:ProgressBar` (gap closed 8px; category total 6px).
  - `Cmp:AiSuggestionCard` (Yarbis suggestion: collapsible, validation status, actions) and `Cmp:AiTipBanner` (cyan ✦ box).
  - `Cmp:WeightCategoryGroup` (category header with total/target/status + bar + rows).
  - `Cmp:AiRecommendationList` (✦ rows with bold label).
  - `Cmp:Button` (primary / outline), `Cmp:LinkButton` (suggestion toggle).
  - `Cmp:Modal` (OVL-03) with `Cmp:StrategicPlanItem` (card row: indicator, urgency `Cmp:StatusChip`, action, meta line).
  - `Cmp:SectionSkeleton`, `Cmp:SectionError`, `Cmp:Toast` [inference: states and save feedback; no prototype counterpart].
- Charts: progress bars only (no chart library): gap-closed bar (8px, `#10B981` on `#DFE2E6`, width = `gapClosedPct`,
  500 ms, L1578) and category-total bars (6px, colour by status, width = min(100, total/target·100), 300 ms, L1616, L4117).
  No axes, legend or tooltips.
- Tables:
  - Strategic plan (OVL-03, L1660–1673) is a card list rather than a grid; each row's fields and their visible labels
    (**plan column headers**): indicator name (`600 13px`, no label, `{{ p.indicador }}`), "Urgencia {{ p.urgTxt }}" chip
    ("Alta" `#FEE2E2`/`#9A1616`, "Media" `#FEF3C7`/`#92400E`, L4144), action text (`{{ p.accion }}`, no label), "Brecha:"
    (L1668), "Peso:" (L1669), "Plazo sugerido:" (L1670). Rows = every KVI with Monitor < 90 %, sorted by `weight − monitor/20`
    descending (L4133, L4140). Action copy: "Plan de choque: revisar drivers operativos y de costo del indicador" (monitor
    < 70, plazo "30 días") or "Ajuste incremental: reforzar seguimiento mensual y metas parciales" (plazo "90 días")
    (L4142–4143). Default rows: Deuda Bruta / EBITDA · 28 pts · 6% · Media; Cobertura de Intereses · 25 pts · 6% · Media;
    Precio Objetivo Analistas · 11 pts · 5% · Media; Dividendos / intereses pagados · 66 pts · 2% · Alta; Estrategia
    Diversificación · 39 pts · 2% · Alta; Margen EBITDA ISA · 25 pts · 2% · Media (`02-prototype-html.md` §9.15). No
    sorting UI, paging or totals.
  - Weight simulator rows (section 6) are a grouped list, not a table (16 rows in 4 groups, total 100 %).
- Filters & controls:
  - Indicator pills (`indicador` in the URL, default `roace`); switching resets levers and the suggestion state (L4055).
  - 3 lever sliders (ranges above); values are ephemeral (not in the URL) until saved with `C-23` [inference]; evaluation
    via `C-21`, debounced 250 ms (synthesis §1.12).
  - Suggestion toggle "Ver sugerencia ›" / "Ocultar ‹" (default collapsed); "Cargar en controles" sets levers to −5 / −5000 /
    +3 and resets validation (L4075, L4081); "Marcar como validada" (L4082) → `C-22`.
  - Scenario variables "Productividad" (−5..10) and "Costos operativos" (−15..10), default 0; moving either sets scenario
    `personalizado` (L4032–4033). Not in the URL [inference].
  - Weight sliders 0..30 per KVI (16), default = base weight; "Restablecer pesos" clears overrides (L4106). Evaluated via
    `C-24` [inference: debounced like C-21].
  - Info toggles × 6 (Sensibilidad por indicador, Escenarios, Variables de simulación, ROACE · Before / After, Simulador de
    pesos, Recomendaciones), one open at a time (click, CF-61).
- States:
  - Loading: each card (V-37 drivers, V-38 scenario variables, V-39 weight simulator) shows its own skeleton; slider moves
    keep the last value and show a subtle pending state on the result strip while `C-21`/`C-24` is in flight [inference].
  - Empty: indicator without levers (not ready) → pill disabled, never selectable; recommendations empty when every KVI is
    ≥ 90 % → hide the list and the "Generar plan estratégico" button [inference; V2 would render an empty list].
  - Error: per-card `Cmp:SectionError` with retry; an evaluation error keeps the previous simulated value and shows an inline
    error [inference].
  - Forbidden: roles without `canSimulate` → `/403`; executive_integral sees "Marcar como validada" and "Guardar en el
    análisis" hidden (`canValidateSuggestion` / `canSaveSimulation` false) [inference: §1.19].
  - Partial: cards are independent `SectionResult`s.
  - Above-peers state (CF-68, OQ-09): when Ecopetrol's ROACE is already above the peer average the BFF returns
    `status: above_peers`; the UI hides the gap-closed bar and the Yarbis tip [inference: CF-68 resolution].
  - Header chip "En construcción" is part of the design (not a state) and stays.
  - Proactive tip on first visit: "Si aumentas productividad en 5% podrías cerrar el 60% de la brecha con el promedio de
    pares." (L3231), only with `canUseAssistant`.
- Interactions:
  - Monitor de Valor "Ir a Sensibilidades" → this route (L1704).
  - Pill click (ready only) → change `indicador`, reset levers and suggestion.
  - Lever / variable / weight slider drag → server evaluation (C-21 / C-24) → result strips, linked lines, bars and status
    labels update; every calculation is server-side (BFF rule 6), the front only formats.
  - "Ver sugerencia ›" → expands the suggestion; "Cargar en controles" → loads the combination into the levers (status
    stays "Requiere validación humana"); "Marcar como validada" → `C-22`, status "✓ Validada por analista".
  - "Restablecer pesos" → base weights; score back to 91.8 %.
  - "Generar plan estratégico" → `C-25` → OVL-03 with plan rows; "✕", scrim click or Esc closes; "Descargar" → export of the
    plan [inference: no handler in V2, CF-81 maps generic Descargar to C-14]; "Guardar en el análisis" → `C-26` + toast
    [inference: CF-81 maps Guardar en el análisis to `C-26`].
  - Save of a lever simulation to the analysis (`C-23`, never overwrites real values) — no trigger in V2 [inference: contract
    exists; UI placement to be decided].
- Data fields:
  - `V-37 GET /api/v1/views/sensitivity-drivers?indicator=roace`: `indicators[]{id, label, isReady}`, `formula{expression,
    terms[]}` (strings), `levers[]{id, label, unit (% | MMCOP), min, max, step, linked?{labelKey, factor}}`, `base` and
    `target` (number, unit %; 7,4 / 7,9 — CF-62), `suggestion{id, levers{energia:-5, servicios:-5000, produccion:3},
    estimatedResult (number %), status (requires_validation | validated), validatedBy?, validatedAt?}`; permissions
    `canSimulate`, `canValidateSuggestion`, `canSaveSimulation`.
  - `C-21` response: `{base, simulated, target, gap (pts, 1 decimal), linked[]{leverId, value, unit}}`.
  - `V-38 GET /api/v1/views/sensitivity-scenarios`: `variables[]{id (productivity | operating_costs), min, max, default}`,
    `baseRoace` (7,4 %), `peerAvg` (5,5 %); simulated ROACE + `gapClosedPct` (0–100) or `status: above_peers` via `C-24`.
  - `V-39 GET /api/v1/views/weight-simulator`: `baseScore` (91,8 %), `categories[]{id, label, targetPct, kvis[{kviId,
    label, weightPct (0–30), monitorPct, band (ok | watch | critical)}]}`, `recommendations[]{kviId, label, gapPts,
    weightPct, tone (watch | action)}`; `C-24` returns `{score, variationPts, categories[{id, totalPct, status (on_target |
    above | below)}]}`; permission `canGeneratePlan`.
  - `C-25` → plan `{planId, rows[{kviId, indicator, urgency (high | medium), action, gapPts, weightPct, suggestedTerm
    (days)}]}`.
  - Formats (es-CO, CF-70): percentages `7,4 %`, points `0,5 pts`, MMCOP `−5.000 MMCOP`, score `91,8 %` [inference:
    formatter output; V2 shows JS dot decimals].
- Role visibility: per §1.19.
  - analyst_creator: everything — simulate, validate suggestion, generate plan, save to the analysis.
  - executive_integral: simulate levers, variables and weights, see suggestion and plan; no validate / save [inference:
    §1.19 `simulate / –`].
  - explorer_viewer, explorer_integral, executive_viewer: no access (Monitor button "Ir a Sensibilidades" hidden, route →
    `/403`) [inference: §1.19; V2 `NAV` gives `sensibilidades` to `analista` only, L3272].
  - Yarbis chat / proactive tip only with `canUseAssistant` (CF-40).
- Open questions / assumptions:
  - A1 — CF-62 / OQ-09: V2 uses a ×10 ROACE scale in the lever block (74 / 79) and 7.4 in Before / After; product uses
    7,4 % / 7,9 % everywhere; lever coefficients (`per`) are rescaled by the BFF engine, so the suggestion's estimate becomes
    ≈ 7,65 % [inference: 76.5 / 10].
  - A2 — CF-68: V2 "Brecha cerrada vs. pares" is always 0 % because Ecopetrol (7,4 %) is already above the peer average
    (5,5 %); resolution: `above_peers` state hides the bar and tip. PO to confirm the wording shown instead.
  - A3 — CF-10: scenario presets (Base / Optimista / Conservador) are not rendered; the "Escenarios" eyebrow and its info
    text still mention them — PO to decide whether to drop the eyebrow or render presets (data exists, L4019–4021).
  - A4 — The task asked for the strategic-plan table's column headers; V2 renders a card list whose only visible labels are
    "Urgencia", "Brecha:", "Peso:" and "Plazo sugerido:" (indicator and action have no label). If a real table is wanted, the
    header copy is not in `HTML` and needs PO copy.
  - A5 — "Margen EBITDA" and "Deuda Bruta / EBITDA" pills are disabled (`ready:false`, no levers) — keep as disabled
    placeholders in v1.
  - A6 — Weight row colour is the KVI's Monitor compliance, not the weight; the "Simulador de pesos" info toggle has no bound
    text in `HTML` (only a subtitle) → the toggle is kept but the copy is missing [inference].
  - A7 — Which analysis / period the simulation belongs to (save target of C-23 / C-26) is implicit in V2; assume the
    Monitor de Valor context (`corte`) passed from SCR-11 [inference].
  - A8 — P2 shows a wrapping bug in the category status label ("En / línea") — not reproduced (single-line, ellipsis)
    [Paquete:2_Sensibilidades_pantalla_completa.jpg].
