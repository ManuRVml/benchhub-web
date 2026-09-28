## SCR-11 — Monitor de Valor

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (`Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]`, `[proposed]` or `[Paquete:<file name>]`. `{{ … }}` marks a template binding; values resolved from
> mock data are written in code spans with the line of the data. Components are tagged `Cmp:PascalName` (reconciled by
> P1-17). Conflict ids (`CF-nn`, `docs/design/conflicts.md`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`, `O-nn`),
> features (`Fnn`) and critic items (`M-nn`) refer to `.plan/source-map/10-synthesis.md` §5, §8, §4, §3 and the critic
> table; overlays (`OVL-nn`) to `docs/design/overlays.md`. Section numbers below follow the `HTML` order (CF-06).

- Source files:
  - Primary (precedence 1): `HTML` template L1685–2098 (screen block `isValor`), plus the Monitor overlays outside the
    block: OVL-09 "Narrativa ejecutiva" L3063–3081 and OVL-11 KVI traceability L3083–3099 (OVL-02 L1765–1780 and OVL-05
    L1880–1907 sit inside the block).
  - Logic: `PROACTIVE.valor` L3232; `NAV` entry `valor` L3273; `PEER_SETS.roace` L3320; initial state L3567–3570
    (`generalComments`), L3585–3593 (config, filters, snapshot, `valorHistView`, `valorTrazId`, `valorFechaVista`),
    L3594–3598 (`comentariosEjecutivos`), L3608–3615 (`pesosCompania`); `sendGeneralComment` L3730–3736; `CAT_TARGETS`
    L4103; `KVI_DATA_BASE` L4158–4181; KVI formatting, `calcPct`, bands, filters and rows L4182–4234; radar geometry
    (`kviRings` / `kviMonitorPoints` / `kviRetoPoints` / `kviLabels`, no template) L4235–4241; donut L4243–4263;
    `VALOR_SNAPSHOTS` + `kviOverallPct` L4264–4273; sources and indicator toggles L4275–4287; `ECOPETROL_PESO` L4607;
    `RADAR_AXES` + `pesoRecommendations` L4695–4706; history, save view, ranking, traceability L4712–4737;
    `ADD_INDICATOR_SOURCES` + tabs + candidates L4987–5016; header title `valor:'Monitor de Valor'` L5156; `isValor` L5216;
    bindings L5298, L5327–5335, L5356–5384, L5507–5508.
  - Renders (P1-03): `docs/design/screenshots/prototype/SCR-11@1440-full.png` (default state; also `@1280`, `@1024`,
    `@768`).
  - Reference images: `docs/design/screenshots/reference/pq-1-monitor-de-valor-pantalla.png`
    (= `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\1_Monitor_de_Valor_pantalla.jpg"`, full page, the only
    source of the Benchmark radial module) and `docs/design/screenshots/reference/ho-07-monitor-valor.png`
    (= `design_handoff_benchud_comparador/screenshots/07-monitor-valor.png`, top of the page, older header without action
    buttons).
  - Uploads: `"V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-10 a la(s) 7.07.40 p.m..png"` (crop of the
    configuration card's "Aplicar configuración" button, intermediate iteration; `06-uploads-png-batch-2.md` E5) and
    `uploads\Captura de pantalla 2026-09-10 a la(s) 6.09.52 p.m..png` (+ pixel-identical `-1603c24c` copy: Teams viewer of an
    older Monitor slide with an 18-axis KVI radar — the business origin of the gated Benchmark radial, section 10;
    `06-uploads-png-batch-2.md` D5).
  - Data: `docs/design/mock-data-catalog.md` Part B "KVIs" (partial, 9 rows — the table below uses `HTML` L4158–4181,
    which wins); KVI oracle `docs/design/oracles/kvi.json` + `tools/oracles/print-kvi.mjs` (P1-13b, Excel D4 methodology:
    global 96,15 · reto 78,56 · categories 94,69 / 98,91 / 97,51 / 100).
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.11 (L370–410), §1.18 (OVL-02, OVL-05, OVL-09, OVL-11), §1.19,
    §2.10 (KVI methodology), §3 (F18, F22–F26, F32, F36, F37), §4 (V-26..V-36, C-08, C-10, C-14..C-20), critic M-07
    (L1451); `02-prototype-html.md` §3 `SCR-11 Monitor de Valor`, §9.14 (L520–546).
- Proposed route: `/monitor-valor?corte=2026-04&historico=actual&categoria=&cumplimiento=` (synthesis §1.11). `corte` =
  snapshot id (default the latest, `2026-04`), `historico` = `actual|5y|8y|10y` (default `actual`), `categoria` and
  `cumplimiento` = comma lists of the table filters (empty = all). Optional `vista=<savedViewId>` reopens a saved view
  [proposed per M-07]. Sidebar item "Monitor de Valor" active (`NAV` L3273); header title "Monitor de Valor" (L5156); no
  analysis tab bar (`showAnalysisTabs` excludes `valor`, L3796). Guard: every role reads (§1.19); unauthenticated →
  `/login`.
- Layout:
  - Inside `Cmp:AppShell` (SCR-04). Content root: single column grid `gap:20px`, `max-width:840px`, `fadeUp .3s ease`
    (L1686); the right side of the content area stays empty on wide screens (render @1440).
  - Cards: `#fff`, `1px solid #DFE2E6`, radius 12; padding 22 (dimension weights, ranking, history, donut: L1740, L1782,
    L1803, L2008), 18/22 (header, L1688), 16 (tiles, L1724), 14 (comments, L2055); the configuration and KVI cards use
    `overflow:hidden` with 16/20 inner padding (L1837–1841, L1924–1925). Card titles `600 14px` + 16px info "i" (`#518CD1`,
    `700 10px`); subtitles `400 12px #98A1B0`.
  - KPI tiles: 4-column grid, gap 12 (L1723). Configuration dates row: grid `1fr 1fr 1fr 2fr`, gap 14 (L1845). KVI table:
    `min-width:1080px` inside `overflow-x:auto` (L1953–1954), so at 840 px the last columns (Real 2025, Resultado Monitor,
    Resultado Reto) are only reachable by horizontal scroll (render @1440). Donut block: flex, gap 32, donut 180×180 +
    table `min-width:280px` (L2017–2030).
  - Overlays: OVL-02 / OVL-05 / OVL-09 width 520 (`max-width:90vw`, `max-height:80vh`, scroll), OVL-11 width 420; all
    z 29, radius 14, padding 26, scrim `rgba(28,37,53,.5)` (L1766–1767, L1881–1882, L3064–3065, L3084–3085).
  - Responsive: no breakpoints in `HTML`; at 1024 / 768 the tile grid and config grid keep their columns (render
    `SCR-11@768-full.png`); proposal: tiles 2×2 and config dates stacked below 1024 [inference: synthesis §2.10].
- Tabs: n/a. The "Comparación con serie histórica" range chips (section 5) and the OVL-05 source tabs are single-select
  segmented controls, described under Filters & controls.
- Sections: top to bottom, one column (max 840 px), in `HTML` order (CF-06). PQ puts "Comentarios" right after the header
  (CF-05, `HTML` bottom placement wins) and has no "Generar narrativa ejecutiva" pill (CF-07).
  1. **Header card** (L1688–1719):
     - Meta row (L1690–1694): label `400 11px #98A1B0` + value `600 13px`: "Analista responsable" "Camila Bravo" (L1691),
       "Actualizado" "Abril 2026" (L1692), "Estado" + chip "En construcción" (`600 11px`, `#FEF3C7`/`#92400E`, L1693).
     - Inline save confirmation "✓ Vista guardada" (`500 12px #047857`, L1696) shown for 2.5 s after "Guardar vista"
       (L4723–4727). It is inline text in the header, not a floating toast (overlays.md lists it as a toast).
     - Actions (L1698–1708), left to right:
       - AI pill "✦" + "Generar narrativa ejecutiva" (`#E3F6FA`, border `#A8E6EC`, text `#0E7490`, radius 999, L1700–1703)
         → OVL-09.
       - "Ir a Sensibilidades" (outline, text `#672DBD`, L1704) → SCR-12.
       - "Guardar vista" (outline, text `#59667C`, L1705) → `C-19`.
       - "Descargar" (L1706) and "Compartir" (L1707): outline, no handler in V2 (CF-81 → `C-14`; OQ-18).
       - "✦ Recomendaciones estratégicas IA" (filled `#672DBD`, first in the row) exists only in
         [Paquete:1_Monitor_de_Valor_pantalla.jpg]; its modal exists in `HTML` (OVL-02, L1765) but nothing opens it.
         CF-07 resolution: render both AI actions; the PQ button opens OVL-02 [inference: CF-07 "Both"].
     - Snapshot row (border-top `#F5F6F7`, L1710–1718): eyebrow "Ver tablero a fecha" (`600 11px #98A1B0`, uppercase →
       displays `VER TABLERO A FECHA`, L1711), native select (L1712–1716) with options from `VALOR_SNAPSHOTS`
       (L4264–4269): "Abril 2026" (default), "Enero 2026", "Octubre 2025", "Julio 2025"; note "· {{ valorSnapNote }}"
       (`400 12px #98A1B0`, L1717) = "Corte vigente" / "Cierre T4 2025" / "Cierre T3 2025" / "Cierre T2 2025".
     - "Mis vistas" select [proposed per M-07]: a second select in the snapshot row (after the note), label "Mis vistas"
       [proposed copy], options = the user's saved views of this screen (V-47) + "Vista actual" [proposed copy]; choosing
       one applies its stored state (snapshot, history range, filters) and sets `vista=` in the URL; a "✕" per option
       deletes it (`C-20`). Hidden when the user has no saved views and for roles without saved views (§1.19).
  2. **KPI tiles** (L1723–1734): four tiles, label `400 11px #98A1B0`, value `700 22px`:
     - "Cumplimiento global" + 14px info "i" (L1726–1727) · "96%" `#047857` (L1729).
     - "Cumplimiento Reto" · "78,6%" `#92400E` (L1731).
     - "KVIs en riesgo" · "1" `#9A1616` (L1732).
     - "KVIs pendientes (TBD)" · "3" `#59667C` (L1733).
     - Info panel (L1737), below the tiles: "Cumplimiento global y Reto se calculan como el promedio ponderado de todos los
       KVIs de la tabla. "KVIs en riesgo" cuenta indicadores <70% de cumplimiento; "TBD" son los que aún no tienen fórmula
       o dato definido." (the copy wraps "KVIs en riesgo" and "TBD" in straight double quotes).
     - Values are static in V2 (CF-74). Product: the BFF engine computes them with the Excel D4 methodology of synthesis
       §2.10 (oracle `docs/design/oracles/kvi.json`): global = Σ category-weight × min(result,100)-weighted category
       average = 96,15 → tile "96 %"; reto = 78,56 → tile "78,6 %"; at-risk and TBD counts per OQ-07 (see Open questions
       A2). Tile colours follow the band of the value (≥90 `#047857`, 70–89 `#92400E`, <70 `#9A1616`) [inference: V2
       colours match the bands of 96 and 78,6].
  3. **"Peso por dimensión · Financiera / Operativa / Transversal"** (L1740–1763) + info toggle; subtitle "Composición de
     peso propia de Ecopetrol · solo lectura" (L1745); info (L1747): "Este peso corresponde únicamente a Ecopetrol — el
     Monitor de Valor se sensibiliza sobre datos propios, no sobre los pares. Los pares se comparan en Resultados y
     Visualización."
     - Highlight box (`#EDE9FE`, border `2px #672DBD`, radius 10, L1750): eyebrow "★ Grupo Ecopetrol" (`700 12px
       #7002B0`, uppercase, ls .03em → `★ GRUPO ECOPETROL`, L1751); 30px stacked bar (radius 6, inset white ring, L1752)
       with segments `{{ ecopetrolPeso.fin }}%` `#2C699A`, `.op` `#0DB39E`, `.trans` `#F1C453` (white `700 12px` labels,
       L1753–1755) = 45 / 30 / 25 (`ECOPETROL_PESO` L4607); legend squares "Financiera", "Operativa", "Transversal"
       (L1758–1760). Read-only.
  4. **"Ranking de pares · ROACE"** (L1782–1801) + info toggle; subtitle "Clic en una compañía abre su perfil" (L1787);
     info (L1789): "Compara a Ecopetrol (resaltado) contra el top 6 de pares en ROACE del último corte disponible."
     - Rows (L1793–1798): rank `700 12px #98A1B0` (20 px), name `500 13px #424E63` (100 px), 16px track `#F5F6F7` with bar
       `#672DBD` (width = value / max, min 6 %, L4732), value `600 12px Roboto Mono` "{{ vr.val }}%"; Ecopetrol row
       background `#E9FBF8` (L4733). Top 6 sorted descending.
     - V2 values (2024 column of `PEER_SETS.roace`, L3320): 1 Ecopetrol 10.2% · 2 ConocoPhillips 9% · 3 Equinor 8.7% ·
       4 PTTEP 8.5% · 5 Total 7.8% · 6 Exxon 7.5%. CF-69: the product uses the latest period (2025 column): 1 Ecopetrol
       7,4 % · 2 ConocoPhillips 7,2 % · 3 PTTEP 6,7 % · 4 Exxon 6,7 % · 5 Shell 6,5 % · 6 TotalEnergies 6,1 % [inference:
       CF-69 applied to L3320; display names from the company catalogue, "Total" → "TotalEnergies"].
  5. **"Comparación con serie histórica"** (L1803–1827) + info toggle; range chips (right, L1809–1813): "Actual", "5 años",
     "8 años", "10 años" (L4713; selected `#672DBD`/`#fff`, others `#F5F6F7`/`#59667C`); info (L1816): "Muestra la
     evolución de ROACE en el rango de años seleccionado, para detectar tendencias frente al comportamiento reciente."
     - Vertical bars (120 px area, gap 10, L1818–1826): value label "{{ hb.val }}%" `600 11px #59667C` above, bar
       `#672DBD` radius `4px 4px 0 0`, height = value / 12 (min 8 %), year `400 10px #98A1B0` below. Years per range
       (L4716): Actual 2024–2025 · 5 años 2021–2025 · 8 años 2018–2025 · 10 años 2016–2025.
     - V2 values are illustrative (`6.2 + sin(i·0.9)·1.8 + i·0.15`, L4718–4721): Actual → 2024 6.2%, 2025 7.8%; the value
       depends on the bar index, not the year, so the same year changes with the range (2024 = 6.2 / 7.4 / 5.7 / 8.8).
       Product: real ROACE series from V-29 [inference].
  6. **Orphan comments card** (L1829–1835): an empty card that only holds the info panel `infoComentariosValor` (L1832,
     "Solicitudes de ejecutivos sobre este análisis, organizadas por estado: Pendientes (sin atender), En análisis (en
     curso) y Resueltos."), with no header and no trigger. It renders as a 2 px strip above the configuration card
     (render @1440). **Not built** (CF-83 dead-block list) [inference].
  7. **"Configuración del Monitor de Valor"** (L1837–1922), always visible (CF-19):
     - Sub-heading "Fechas, rango y fuentes" (`600 12px #424E63`, L1844), grid of four fields (labels `400 11px #98A1B0`):
       "Fecha de corte" (native date input, value `2025-12-31`, L1847–1848; shows as 31/12/2025 in the render), "Rango
       desde" (text input `2023`, L1851–1852), "Rango hasta" (text input `2025`, L1855–1856), "Fuentes (sin periodicidad
       fija)" (L1859) with toggle chips (L1861–1863) from `KVI_FUENTES_LIST` (L4276): "Capital IQ" on, "Bloomberg" on,
       "Platts" off, "Fuentes internas Ecopetrol" on (L3586; on `#EDE9FE`/`#672DBD`, off `#F5F6F7`/`#59667C`, L4279).
     - "Indicadores y métricas incluidos" (L1870): 22 toggle chips, one per KVI in table order (labels = the Indicador
       column below; L4282–4287), all on by default (on `#EDE9FE`/`#672DBD`, off `#F5F6F7`/`#98A1B0`); outline button
       "+ Añadir indicador" (L1877) → OVL-05; helper `400 11px #98A1B0` (L1908): "Real, meta y referente de cada indicador se
       configuran directamente en la tabla — junto con variables y sensibilidades cuando aplique." In V2 the chips change
       nothing else on the screen (`kviEnabled` is read only by the chips); product: excluded KVIs leave the table, tiles
       and donut after "Aplicar configuración" [inference].
     - "Excepciones, reglas variables y contexto" (L1912) textarea (min-height 70, L1913), placeholder "Registra
       excepciones o reglas variables — ej. palabras clave, sinónimos o nombres que usa cada compañía para un mismo
       indicador (Ecopetrol: 'Deuda Bruta/EBITDA' = Shell: 'Net Debt/EBITDA')..."
     - "Contexto abierto para Yarbis (asociaciones, amplitud de datos, prompt)" (`400 11px #98A1B0`, L1914) textarea
       (min-height 60, L1915), placeholder "Ej: considera también fuentes en inglés y agrupa por segmento de negocio..."
     - Primary button "Aplicar configuración" (right, L1920) → `C-17` (+ recalculation F22 when the result set changes;
       CF-81). In V2 it only flips an unused `kviConfigOpen` flag (L4275, L5373).
  8. **"Monitor de Valor Grupo Ecopetrol · KVIs"** (L1924–2004) + info toggle:
     - Header note (right, `400 12px #98A1B0`, L1930): V2 copy "Meta, Meta Reto y Real son editables · el % de
       cumplimiento se recalcula automáticamente"; product copy "Meta y Meta Reto son editables · el % de cumplimiento se
       recalcula automáticamente" [proposed: CF-38 resolution copy; Real is read-only].
     - Warning band (`#FEF3C7`, `500 12px #92400E`, L1932–1935): "⚠ Resultados 2025 en revisión" (L1933) · "⚠ Metas y
       seguimiento resultados 2026 en construcción" (L1934); product: `warnings[]` from V-30 [inference].
     - Info (L1937): "Resultado Monitor y Resultado Reto se calculan como Real/Meta (o Meta/Real cuando menor es mejor, ej.
       deuda). Verde ≥90%, ámbar 70–89%, rojo <70%. Filtra por categoría o rango de cumplimiento para acotar la
       consulta."
     - Filter row (L1939–1951), see Filters & controls; table (L1954–2002), see Tables. All 22 KVIs are listed there.
  9. **"Composición del Monitor por categoría"** (L2008–2053) + info toggle; subtitle "Peso, número de KVIs y cumplimiento
     promedio por categoría" (L2013); info (L2015): "El anillo muestra cómo se reparte el peso del Monitor de Valor entre
     categorías; el centro es el cumplimiento global. La tabla detalla cuántos KVIs tiene cada categoría y su
     cumplimiento promedio frente a la meta."
     - Donut + category table (see Charts, Tables); centre label "Cumplimiento" (`400 11px #98A1B0`, L2026) + "{{
       kviOverallPct }}%" (`700 24px #1C2535`, L2027) = `96.1%` for Abril 2026.
  10. **"Análisis multidimensional · Benchmark radial"** **[gated]** (CF-08, F26; PQ only, no `HTML` template; V2 keeps the
      radar geometry in logic, L4235–4241), placed after the donut and before the comments [Paquete:1_Monitor_de_Valor_pantalla.jpg]:
      - Title + info "i"; subtitle "Cumplimiento normalizado 0–100% por KVI · hasta 5 compañías"; actions (right) "✦
        Analizar con IA" (filled `#672DBD`), "PNG", "PDF", "PPT" (outline) [Paquete:1_Monitor_de_Valor_pantalla.jpg].
      - Left rail: eyebrow "COMPAÑÍAS" + company toggles (colour square + name; on = white with coloured border, off =
        grey): "Ecopetrol" and "Shell" on, "BP", "Equinor", "Chevron", "TotalEnergies" off; max 5 selected; eyebrow "AÑO" +
        select "2023"; link "Comparar año anterior"; outline button "Ver brechas vs. líder"
        [Paquete:1_Monitor_de_Valor_pantalla.jpg].
      - Centre: category pills "Todas" (selected), "Financiero", "Mercado", "Estrategia", "Sostenibilidad"; 20-axis radar
        (the 20 non-TBD KVIs, labels truncated with "…"), legend "Ecopetrol 2025" / "Shell 2025"
        [Paquete:1_Monitor_de_Valor_pantalla.jpg].
      - Right rail: eyebrow "FORTALEZAS · TOP 3" with green rows "Flujo de Caja Libre" 100%, "Deuda Bruta / EBITDA" 100%,
        "Eficiencias" 100%; eyebrow "OPORTUNIDADES · BOTTOM 3" with red rows "Cobertura de Intereses" 75%, "EFI Activos
        Pareto Upstream" 80%, "TIR Activos Pareto Upstream" 83%; cyan AI note "✦ Ecopetrol muestra un desempeño sólido en
        Flujo de Caja Libre, Deuda Bruta / EBITDA, Eficiencias, con brechas relevantes frente al líder en Cobertura de
        Intereses, EFI Activos Pareto Upstream, TIR Activos Pareto Upstream." [Paquete:1_Monitor_de_Valor_pantalla.jpg].
        The percentages equal V2's capped Resultado Monitor of those KVIs (L4184–4197).
      - Rendered only when the scope flag `benchmarkRadar` is on [inference: CF-08 "scope-gated"; flag name to be fixed by
        P1-20].
  11. **"Comentarios"** (L2055–2070): eyebrow "Comentarios" (`600 11px #808A9B`, uppercase, ls .04em → `COMENTARIOS`,
      L2056); comment list (author `600 12px #1C2535` + `· {{ gc.role }}` `400 11px #98A1B0`, text `400 12px #424E63`,
      time `400 11px #98A1B0`, L2060–2062); seed (L3567–3570): Jorge Salas · Ejecutivo visualizador "Excelente que ahora se
      pueda ver el comparativo de pesos por compañía." hace 1 día; Alejandra Ríos · Ejecutivo integral "¿Podemos agregar
      exportación a PDF del dashboard completo?" hace 4 horas. Input placeholder "Escribe un comentario..." (L2067) +
      primary "Enviar" (L2068) → `C-10`.
  - Not built (dead blocks, CF-83): Tier info panel `infoValor` with no trigger (L2074–2076, "Cada tarjeta representa una
    categoría clasificada en un Tier:" …) and the empty `oportunidades` / `riesgos` loops (L2079–2096); the orphan
    comments card of section 6.
  - Overlays of this screen:
    - OVL-09 "Narrativa ejecutiva" (L3063–3081): "✦" `#0E7490` + title `700 17px` (L3067), "✕" (L3068), subtitle "Resumen
      generado por Yarbis de cada módulo del Monitor de Valor" (L3070); 4 sections (`#F5F6F7` boxes, title `600 12px
      #1C2535`, text `400 13px #424E63` lh 1.5, L3073–3076) from L5328–5332:
      1. "KVIs destacados" — "El Monitor de Valor registra un cumplimiento global de " + pct + "% sobre la meta 2025, con "
         + n + " KVI(s) en zona de riesgo (por debajo del 70%)." (V2 resolves 96.1 and 0).
      2. "Peso por dimensión" — resolved `Ecopetrol distribuye su peso en Financiera (45%), Operativa (30%) y Transversal
         (25%), frente al promedio de pares.`
      3. "Composición del Monitor por categoría" — resolved `La categoría con mayor peso es Financiero (60% del total), con
         un cumplimiento promedio de 90%.`
      4. "Comentarios ejecutivos" — resolved `1 comentario(s) pendiente(s), 1 en análisis y 1 resuelto(s).` (counts from
         `comentariosEjecutivos`, L3594–3598).
      No action buttons in V2 (unlike OVL-08). Product: texts from `C-15` `{scope: value-monitor}`, labelled as a Yarbis
      suggestion (F18) [inference].
    - OVL-02 "Recomendaciones estratégicas de Yarbis" (L1765–1780): "✦" + title (L1769), "✕" (L1770), subtitle "Basadas en
      la distribución de pesos de Ecopetrol frente al promedio sectorial y el cumplimiento del Monitor de Valor" (L1772);
      rows (`400 13px #424E63`, radius 8, L1775) `<strong>{{ rec.label }}.</strong> {{ rec.text }}`, colour by tone
      (L5334: ok `#047857`/`#D1FAE5`, watch `#92400E`/`#FEF3C7`, action `#EF4444`/`#FEE2E2`). Texts (L4702–4705) with the
      V2 peer average 43 / 30 / 28 (L3608–3615, L4601–4605), all tone ok, resolved: `Financiera: alineado con el
      sector (45% vs. 43% promedio). Mantener el peso actual.` · `Operativa: alineado con el sector (30% vs. 30% promedio).
      Mantener el peso actual.` · `Transversal: alineado con el sector (25% vs. 28% promedio). Mantener el peso actual.` Watch variant:
      label + ": Ecopetrol pondera " + d + " pts más que el sector (" … "). Validar que ese énfasis sea intencional; si
      no, redistribuir hacia las líneas rezagadas."; action variant: label + ": Ecopetrol pondera " + d + " pts menos que el
      sector (" … ", líder " + name + " con " + best + "%). Aumentar el peso de esta línea acercaría a Ecopetrol al estándar
      del sector." Data from V-35.
    - OVL-05 "Añadir indicador" (L1880–1907): title (L1884), "✕" (L1885), subtitle "Selecciona indicadores desde una de las
      tres fuentes disponibles" (L1887); source tabs (L1889–1891, labels L4988–5000): "Referenciamiento de pares"
      (default), "TBG", "ILP"; candidate rows with checkbox + label `500 13px` + category `400 11px #98A1B0`
      (L1895–1898): pares → "ROACE", "Margen EBITDA" (Financiero), "Crecimiento de producción", "Competitividad OPEX"
      (Operativo), "Score ESG" (Transversal); TBG → "Flujo de Caja Libre", "Deuda Bruta / EBITDA" (Financiero),
      "Dividendos Recibidos" (Estratégico); ILP → "IRR", "Estrategia Diversificación" (Estratégico), "Aporte al PIB"
      (Grupos de Interés) (L4988–5004); footer "{{ addIndicatorSelectedCount }} seleccionados" (L1902) + primary "Añadir al
      monitor" (L1903) → `C-18`. Selection is kept across tabs (L5011–5016); in V2 the button only closes and clears.
    - OVL-11 KVI traceability (L3083–3099): title = KVI name (`700 16px`, L3087), "✕" (L3088); five label/value pairs
      (labels `500 11px #98A1B0`, values `500 13px`, L3091–3095): "CATEGORÍA" (category), "FUENTE" (V2 static "Capital IQ ·
      fuentes internas Ecopetrol", L5360), "FECHA DE CAPTURA" (V2 "Corte " + cut-off date = `Corte 2025-12-31`, L5361;
      product formats the date es-CO), "RESPONSABLE", "UNIDAD". Data from V-33.
- Components:
  - Shell (SCR-04): `Cmp:AppShell`, `Cmp:AppHeader`, `Cmp:Sidebar` (item "Monitor de Valor" active), `Cmp:YarbisFab`,
    `Cmp:YarbisChatPanel`.
  - `Cmp:Card`, `Cmp:SectionHeader` (title + `Cmp:InfoToggleButton` + right slot), `Cmp:InfoPanel`, `Cmp:StatusChip`
    ("En construcción", result bands), `Cmp:Button` (primary / outline), `Cmp:AiPillButton` ("Generar narrativa
    ejecutiva"), `Cmp:LinkButton` ("Comparar año anterior" [Paquete:1_Monitor_de_Valor_pantalla.jpg]).
  - Header: `Cmp:MetaField` (label + value pair) [new name], `Cmp:InlineSaveConfirmation` ("✓ Vista guardada"),
    `Cmp:SelectFilter` (snapshot select; "Mis vistas" select [proposed]).
  - `Cmp:KpiStatCard` (4 tiles; the first with an info toggle).
  - `Cmp:StackedBar` + `Cmp:ChartLegend` (dimension weights, inside a highlighted box).
  - `Cmp:RankingBarRow` (rank, name, track + bar, mono value; highlighted row) [new name].
  - `Cmp:SegmentedTabs` (history ranges; OVL-05 sources), `Cmp:VerticalBarChart` (history) [new name].
  - Configuration: `Cmp:DateInput`, `Cmp:TextField`, `Cmp:ToggleChip` (sources, included KVIs) [new name],
    `Cmp:TextArea`.
  - KVI card: `Cmp:AlertBanner` (two warnings), `Cmp:CategoryChips` (multi-select variant, two groups), `Cmp:DataTable`
    (horizontal-scroll variant) with `Cmp:NumberInput` (Meta 2025, Meta Reto) and `Cmp:StatusChip` (result bands).
  - `Cmp:DonutChart` [new name] + `Cmp:DataTable` (compact variant with colour dot).
  - Gated radar: `Cmp:CompanyToggleList` [new name], `Cmp:SelectFilter` (Año), `Cmp:CategoryChips` (single-select),
    `Cmp:RadarChart` (ECharts, D3), `Cmp:RankedValueList` (Fortalezas / Oportunidades) [new name], `Cmp:AiTipBanner`
    (cyan ✦ note, as SCR-12), export `Cmp:Button`s.
  - `Cmp:CommentThread` (list + input + "Enviar") [new name; M-05 statuses later].
  - Overlays: `Cmp:Modal`; `Cmp:NarrativeModal` (OVL-09, sections only); `Cmp:AiRecommendationList` (OVL-02, as SCR-12);
    `Cmp:CheckboxList` (OVL-05 candidates) [new name]; `Cmp:KeyValueList` (OVL-11) [new name].
  - States: `Cmp:SectionSkeleton`, `Cmp:TableSkeleton`, `Cmp:SectionError`, `Cmp:EmptyState`, `Cmp:OperationProgressBanner`
    (M-06, after "Aplicar configuración"), `Cmp:Toast` (save, export).
- Charts:
  - Dimension weights: single 100 % stacked bar, 30 px, segments `#2C699A` / `#0DB39E` / `#F1C453` (`dimension.share.*`,
    CF-42) with centred white labels; legend below; no axis or tooltip (L1752–1761).
  - Peer ranking: horizontal bars (div primitives, D3), `#672DBD` on `#F5F6F7` track, 16 px, radius 4, width relative to
    the maximum (min 6 %), value labels at the right; Ecopetrol row tinted `#E9FBF8`; click row → OVL-13 company profile
    (L4733, `openProfile`). No axis, no tooltip.
  - History: vertical bars (div primitives), `#672DBD`, 120 px plot, value labels on top, year labels below; y scale fixed
    at 12 % = 100 % height (L4721). No axis, grid or tooltip. Product: scale from the series max [inference].
  - Composition donut (SVG, L2018–2028): 180 px, r 70, stroke 24, track `#F5F6F7`, starts at 12 o'clock (rotate −90°);
    segments sized by category weight (`CAT_TARGETS` L4103: Financiero 60 `#518CD1`, Mercado 15 `#49BCD8`, Estratégico 20
    `#7C35EA`, Grupos de Interés 5 `#0F9B8E`, `chart.category.*`, L4243); centre text; no tooltip in V2 (product: hover
    tooltip "Categoría · % peso" [inference]).
  - Benchmark radial **[gated]**: ECharts radar, 20 axes (one per KVI with data, labels truncated ~16 chars + "…",
    L4241), rings at 25/50/75/100 (L4238), one series per selected company (≤5; Ecopetrol `#83E377`, peers from the company
    colour map, CF-11/CF-47), values = min(result, 100); legend "{Company} {year}" below; category pills filter the axes
    [Paquete:1_Monitor_de_Valor_pantalla.jpg]. Exports PNG / PDF / PPT via `C-14` (`radar-png` …).
- Tables:
  - **KVI table** (L1954–2002), header `#F5F6F7`, `600 11px #808A9B` uppercase; columns: "Categoría" (L1957), "Indicador"
    (L1958), "Unidad" (L1959), "Peso" (right, L1960), "Responsable" (L1961), "Meta 2025" (right, L1962), "Meta Reto"
    (right, L1963), "Real 2025" (right, L1964), "Resultado Monitor" (right, L1965), "Resultado Reto" (right, L1966).
    - Cells: category `600 12px #59667C`; indicator name `400 13px` (click → OVL-11, hover underline `#672DBD`, L1974) +
      code `600 10px Roboto Mono #98A1B0` (`'KVI-' + id.toUpperCase()`, L4220); unit and owner `400 11px #98A1B0`; weight
      `400 12px #98A1B0` ("—" when null); Meta 2025 / Meta Reto `Cmp:NumberInput` (width 74, `step="0.01"`, Roboto Mono
      12px, L1981–1982); Real 2025 read-only `600 12px Roboto Mono #1C2535` (L1983); result chips `600 11px`, radius 999
      (L1997–1998).
    - Row kinds: **editable** (19 rows: inputs + real text), **TBD** (2 rows, `realNum === null`: "TBD" ×3 in `#98A1B0`, no
      inputs, chips "TBD" `#F5F6F7`/`#98A1B0`, L1985–1989, L4226), **text mode** (1 row: text values, fixed 100 %, no inputs,
      L1990–1994, L4190).
    - Bands (L4199–4201): ≥90 `#D1FAE5`/`#047857`, 70–89 `#FEF3C7`/`#92400E`, <70 `#FEE2E2`/`#9A1616`, TBD
      `#F5F6F7`/`#98A1B0`. Result = round(Real/Meta·100), or Meta/Real for lower-is-better, floor 0, not capped
      (`calcPct` L4184–4188).
    - Rows (22, `KVI_DATA_BASE` L4159–4180), as `Categoría | Indicador | code | Unidad | Peso | Responsable | Meta 2025 |
      Meta Reto | Real 2025 | Resultado Monitor | Resultado Reto` (V2 display):
      1. Financiero | "Flujo de Caja Libre" | KVI-FCL | BCOP | 10% | Diego Gómez | 7,19 | 10,53 | 10,69 | 149% | 102%
      2. Financiero | "Deuda Bruta / EBITDA" (lower is better) | KVI-DEUDA | Veces | 5% | Kellin Sánchez | 2,5 | 1,5 | 2,32 |
         108% | 65%
      3. Financiero | "Cobertura de Intereses" | KVI-COBERTURA | MUSD | 5% | Juan Carlos López | 8,14 | 26,5 | 6,1 | 75% |
         23%
      4. Financiero | "EFI Activos Pareto Upstream" | KVI-EFIPARETO | Veces | — | GMV | 0,35 | 0,35 | 0,28 | 80% | 80%
      5. Financiero | "TIR Activos Pareto Upstream" | KVI-TIRPARETO | % | — | GMV | 25,1 | 25,1 | 20.8% | 83% | 83%
      6. Financiero | "Eficiencias" | KVI-EFIC | mMCOP | 15% | Jimmy Morales | 4,56 | 6,63 | 6,64 | 146% | 100%
      7. Financiero | "ROACE" | KVI-ROACE | % | 15% | Liz Cardona | 7,9 | 12,3 | 7.4% | 94% | 60%
      8. Financiero | "ROACE menos WACC" | KVI-ROACEWACC | % | — | Liz Cardona | TBD | TBD | TBD | TBD | TBD
      9. Financiero | "KVI del portafolio" | KVI-KVIPORT | - | — | — | TBD | TBD | TBD | TBD | TBD
      10. Mercado | "TRR (renta variable)" | KVI-TRR | % | 5% | Bloomberg · JVD | 7 | 7 | 24% | 343% | 343%
      11. Mercado | "Bond Spread (renta fija)" | KVI-BOND | COP | 5% | Valentina Rodríguez | 87,4 | 87,4 | 90,4 | 103% | 103%
      12. Mercado | "Precio Objetivo Analistas" | KVI-PRECIO | COP | 5% | Bloomberg · JVD | 2104 | 2500 | 1.870 | 89% | 75%
      13. Mercado | "Calificación de Riesgo Crediticio" (text mode) | KVI-RIESGOCRED | Rating | — | GMV | BB | BB | BB | 100% |
          100%
      14. Estratégico | "Dividendos Recibidos" | KVI-DIVID | mMCOP | 2% | Diego Gómez | 5819 | 8730 | 8.480 | 146% | 97%
      15. Estratégico | "CT+i" | KVI-CTI | MUSD | 2% | M. Alejandra Rodríguez | 304,45 | 587,24 | 548,59 | 180% | 93%
      16. Estratégico | "EBITDA / Capex (ISA)" | KVI-EBITDACAPEX | Veces | — | Daniel González | 1,1 | 1,4 | 1,4 | 127% |
          100%
      17. Estratégico | "Dividendos recibidos / intereses pagados" | KVI-DIVINT | Veces | 2% | — | 0,6 | 3,2 | 1,1 | 183% | 34%
      18. Estratégico | "Margen EBITDA ISA" | KVI-MARGENEBITDA | % | 2% | — | 53,3 | 72,2 | 54.2% | 102% | 75%
      19. Estratégico | "Costo Energía GE" (lower is better) | KVI-COSTOENERGIA | $/kWh | 2% | Margarita García / Paola
          Molina | 441 | 424 | 425 | 104% | 100%
      20. Estratégico | "IRR" | KVI-IRR | % | 8% | Fidel Delgado | 80 | 100 | 121% | 151% | 121%
      21. Estratégico | "Estrategia Diversificación" | KVI-DIVERSIF | % | 2% | Carolina Vargas | 19 | 19 | 27% | 142% | 142%
      22. Grupos de Interés | "Aporte al PIB" | KVI-PIB | BCOP | 5% | Mauricio Orozco | 1,69 | 1,86 | 1,71 | 101% | 92%
    - Meta inputs show the browser's locale rendering of the raw number (render: `7,19`; Paquete: `7.19`); Real uses
      `toLocaleString('es-CO')` except `%` units, which print JS dots (`7.4%`, L4183) — CF-70: es-CO everywhere (`7,4 %`,
      `1.870`, `10,69`).
    - Weights as shown sum to Financiero 50 % + nulls (CF-63); aggregates use the Excel D4 weights of the oracle, the table
      keeps the V2 values (screen parity).
    - No sorting, paging or totals; row order fixed (category, then source order). Min-width 1080 → horizontal scroll.
  - **Category composition table** (L2031–2050), header `600 11px #808A9B` uppercase with bottom border: "Categoría"
    (colour dot + name `500 13px`), "# KVIs" (right, mono), "% Peso" (right, mono), "Cumplimiento" (right, `600 13px`,
    band colour). Rows (L4244–4263): Financiero 9 · 60% · 90% · Mercado 4 · 15% · 97% · Estratégico 8 · 20% · 100% · Grupos
    de Interés 1 · 5% · 100% (Cumplimiento = mean of min(result,100) over the category's KVIs with data; # KVIs counts TBD
    rows too).
- Filters & controls:
  - Snapshot select "Ver tablero a fecha" (`corte`, default latest; 4 options); in V2 it only scales the donut centre
    (factor 1 / .97 / .93 / .9 → 96.1 / 93.2 / 89.3 / 86.4, L4264–4273); product: reloads every widget for the snapshot
    [inference].
  - "Mis vistas" select + delete [proposed per M-07] (`vista`).
  - History range chips "Actual" / "5 años" / "8 años" / "10 años" (`historico`, default `actual`, single-select).
  - KVI filters (L1939–1951; `600 11px #98A1B0` uppercase group labels "Categoría" (L1941) and "Cumplimiento" (L1947)):
    - CATEGORÍA chips "Financiero", "Mercado", "Estratégico", "Grupos de Interés" (L4202–4207), multi-select toggles
      (on `#672DBD`/`#fff`, off `#F5F6F7`/`#59667C`), none selected = all; in the URL (`categoria`).
    - CUMPLIMIENTO chips "≥90%", "70–89%", "<70%", "TBD" (`KVI_STATUS_LABELS` L4208), multi-select on the **Resultado
      Monitor** band (L4217); in the URL (`cumplimiento`). Filters are ANDed across groups, ORed within a group.
    - Filters affect only the KVI table rows (tiles, donut and config chips ignore them, L4216–4219).
  - Meta 2025 / Meta Reto inputs (editable rows only, `canEditTargets`): number, step 0.01; V2 recomputes the row's
    result chips on change (`onChange`, L4232–4233; donut centre and category table follow because they read the same
    data). Product: on commit (blur / Enter) → `C-16 PATCH /kvis/:kviId/targets {meta, metaReto}` → recomputed row +
    aggregates (tiles, donut, category table) [inference: live recompute is server-side, BFF rule 6]; invalid or empty
    input keeps the previous value (V2 ignores `NaN`, L4232).
  - Configuration inputs: date, two year fields (free text in V2; product: 4-digit year inputs, desde ≤ hasta
    [inference]), 4 source toggles, 22 KVI toggles, two textareas; applied only by "Aplicar configuración".
  - Gated radar: company toggles (max 5; Ecopetrol always on [inference]), Año select, "Comparar año anterior" (adds the
    previous-year series [inference]), "Ver brechas vs. líder" (highlights gaps to the best company per axis [inference]),
    category pills (single-select).
  - Info toggles × 6 in V2 (tiles, dimension weights, ranking, history, KVI table, donut; the orphan comments info has no
    toggle), one open at a time (`chartInfoOpen`, L4710), click only (CF-61).
- States:
  - Loading: each widget is its own `SectionResult` (V-27 header+tiles+weights, V-28, V-29, V-30, V-31, V-32, V-36) with
    its own skeleton; the KVI table uses `Cmp:TableSkeleton` (10 rows) [inference].
  - Empty: filters leave no KVI → table body replaced by `Cmp:EmptyState` "No hay KVIs que coincidan con los filtros"
    [inference: copy not in `HTML`] + "Limpiar filtros" [inference]; no saved views → "Mis vistas" hidden; empty comment
    list → only the input [inference]; history with no data for the range → empty-state line [inference].
  - Error: per-widget `Cmp:SectionError` with retry; a failed `C-16` keeps the typed value, marks the input invalid and
    shows an inline error, the chips keep the previous result [inference].
  - Partial: tiles fail independently of the table (engine port down → tiles show "—" with an error hint) [inference].
  - Recalculating: after "Aplicar configuración" (`C-17` → optional `C-08` `202 {operationId}`) a
    `Cmp:OperationProgressBanner` above the tiles shows queued → running → done / failed (M-06); widgets reload on done
    [inference].
  - Snapshot not latest: header "Estado" chip and the warning band come from the snapshot; Meta inputs read-only for
    closed snapshots [inference: editing historic snapshots is not described].
  - Save view: "✓ Vista guardada" inline for 2.5 s (L1696, L4726); failure → error toast [inference].
  - Read-only: users without `canEditTargets` see Meta 2025 / Meta Reto as mono text like Real (text-mode cell style,
    L1991–1992) and no configuration card [inference: §1.19 "edit metas & config" analyst only].
  - Gated: radar module absent when the scope flag is off.
  - Proactive tip on first visit: "Detecté una oportunidad de valor en Rentabilidad y un riesgo creciente en Solvencia. Te
    muestro el detalle." (L3232), only with `canUseAssistant` (CF-40).
- Interactions:
  - Sidebar "Monitor de Valor" → this route; header "Ir a Sensibilidades" → `/monitor-valor/sensibilidades` (SCR-12,
    L5502).
  - ✦ "Generar narrativa ejecutiva" (L1702) → `C-15 {scope: value-monitor}` → OVL-09; "✦ Recomendaciones estratégicas IA"
    [Paquete:1_Monitor_de_Valor_pantalla.jpg] → V-35 → OVL-02. Both close with "✕", scrim click or Esc.
  - "Guardar vista" → `C-19 {screen: 'value-monitor', state: {corte, historico, categoria, cumplimiento}}` → inline
    confirmation; the new view appears in "Mis vistas" [proposed per M-07]. "Descargar" → `C-14 {kind:
    value-monitor-pdf}` → async export (O-01) + toast [inference: CF-81]. "Compartir" → copy the current deep link + toast
    (OQ-18 default).
  - Snapshot select → reload widgets for `corte` (URL updated). History chip → V-29 with `range`.
  - Ranking row click → OVL-13 company profile (L4733; Ecopetrol opens its own profile).
  - KVI name click → OVL-11 (V-33). Meta / Meta Reto edit → `C-16` → row chips + tiles + donut + category table update.
  - Filter chip toggle → table rows filter client-side over the loaded V-30 rows [inference] and the URL updates.
  - "+ Añadir indicador" → OVL-05 (V-34 per source tab); checkbox toggles; "Añadir al monitor" → `C-18 {source,
    indicatorIds[]}` → close + table/config reload [inference].
  - "Aplicar configuración" → `C-17` (+ F22 recalculation) → progress banner → reload.
  - Comments: type + "Enviar" (or Enter [inference]) → `C-10 {entityType: 'value-monitor', entityId: corte, text}`;
    empty text does nothing (L3731–3732); new comment appended with time "ahora" (L3734).
  - Gated radar: toggle companies (6th selection blocked with a hint [inference]), change year / category, "✦ Analizar
    con IA" (refreshes the insight via `C-15` [inference]), PNG / PDF / PPT → `C-14`.
- Data fields:
  - `V-27 GET /api/v1/views/value-monitor?snapshot=2026-04`: `meta{analystName, updatedLabel, status}` (strings),
    `snapshots[]{id, label, note}`, `kpis{globalPct, retoPct, atRiskCount, tbdCount}` (numbers, raw; engine), 
    `dimensionWeights{fin, op, trans}` (integers %), `permissions{canEditTargets, canConfigure, canSaveView, canExport,
    canComment, canUseAssistant}`; `savedViews[]{id, name, createdAt}` or a separate V-47 [proposed per M-07].
  - `V-28 …/value-monitor-peer-ranking?indicator=roace&snapshot=`: `rows[]{rank, companyId, displayName, value (number %),
    isEcopetrol}` (top 6, latest period, CF-69).
  - `V-29 …/value-monitor-history?indicator=roace&range=actual|5y|8y|10y`: `points[]{year (int), value (number %)}`.
  - `V-30 …/value-monitor-kvis?snapshot=&categories=&compliance=`: `warnings[]{code, text}`, `rows[]{kviId, code,
    category, label, unit, weightPct (number | null), owner (string | null), meta, metaReto, real (number | null, raw),
    metaText?, realText? (text mode), resultPct, retoPct (int | null, uncapped), resultBand, retoBand (ok | watch | risk |
    tbd), isTbd, isTextMode, lowerIsBetter, isEditable}`; bands are derived by the BFF (≥90 / 70–89 / <70 / TBD).
  - `C-16 PATCH /api/v1/kvis/:kviId/targets {meta, metaReto}` → `{row, kpis, composition}`.
  - `V-31 …/value-monitor-composition?snapshot=`: `centerPct` (number), `categories[]{id, label, weightPct, kviCount,
    compliancePct (int | null)}`.
  - `V-32 …/value-monitor-configuration`: `cutOffDate (ISO date), rangeFrom, rangeTo (years), sources[]{id, label,
    isEnabled}, kvis[]{id, label, isIncluded}, exceptionsText, assistantContext` → `C-17 PUT` same body → optional
    `recalculationOperationId` (O-01).
  - `V-33 …/kvi-traceability/:kviId`: `category, source, capturedAt (ISO date), owner, unit`.
  - `V-34 …/kvi-candidates?source=pares|tbg|ilp`: `items[]{indicatorId, label, category, isAlreadyIncluded}`
    [`isAlreadyIncluded` inference: TBG/ILP candidates duplicate existing KVIs]; `C-18 {source, indicatorIds[]}`.
  - `V-35 …/value-monitor-recommendations`: `items[]{label, text, tone (ok | watch | action)}` (Yarbis suggestion).
  - `C-15 {scope: 'value-monitor'}` → `{sections[{title, text}], status: 'suggestion', generatedBy}` (OVL-09).
  - `V-36 …/value-monitor-benchmark-radar?companies=&year=&category=` **[gated]**: `axes[]{kviId, label}`,
    `series[]{companyId, year, values[]}`, `strengths[3]{kviId, label, pct}`, `opportunities[3]{…}`, `insight` (text).
  - `V-26 …/comment-thread?entityType=value-monitor&entityId=<corte>`: `threads[]{id, author{name, roleLabel}, text,
    createdAt}`; `C-10` to post.
  - `V-47 GET /api/v1/views/saved-views?screen=value-monitor` [proposed per M-07]: `items[]{id, name, state, createdAt}`;
    `C-19` save, `C-20 DELETE /saved-views/:viewId`.
  - Formats (es-CO, CF-70): percentages `96 %` / `78,6 %` (tiles: global integer, reto one decimal, per the oracle
    display rule), result chips integer `149 %`, KVI values with their unit (`10,69`, `1.870`, `7,4 %`, `$/kWh 425`),
    history and ranking one decimal (`7,4 %`), donut centre one decimal, dates `31/12/2025`, relative times ("hace 1 día")
    formatted by the front from `createdAt` [inference].
- Role visibility: per §1.19.
  - analyst_creator: everything — edit Meta / Meta Reto, configuration, add indicators, save views, export, comment,
    Yarbis actions.
  - executive_integral: read, save views, export, comment, Yarbis actions; no target editing and no configuration card
    [inference: §1.19 "✓ / –"].
  - explorer_viewer, explorer_integral: read, save views, export data; no editing, no comments (§1.19 `Comment –`);
    no Yarbis (CF-40).
  - executive_viewer: read-only, no saved views (§1.19), no comments, no Yarbis; access itself pending OQ-06.
  - V2 `NAV` gives `valor` to all four prototype roles (L3273). Published AI texts (narrative) are visible to every role
    that can open them; generating them requires `canUseAssistant` [inference: CF-40].
- Open questions / assumptions:
  - A1 — CF-07: V2 has only ✦ "Generar narrativa ejecutiva" (L1702); PQ has only "✦ Recomendaciones estratégicas IA"
    [Paquete:1_Monitor_de_Valor_pantalla.jpg] (and OVL-02
    has no trigger in `HTML`). Both are rendered; PO to confirm order (assumed: Recomendaciones first, as in PQ).
  - A2 — OQ-07 / CF-74: the tiles are static in V2 and do not match the V2 rows: Resultado Monitor has **0** KVIs < 70 %
    (tile "1"; Resultado Reto has 4 < 70 %: Deuda Bruta / EBITDA, Cobertura de Intereses, ROACE, Dividendos recibidos /
    intereses pagados) and **2** TBD rows (tile "3"). The engine returns the counts; the rules (which result, which
    threshold, whether TIR/EFI Pareto count as TBD per the Excel) stay open.
  - A3 — CF-63 / CF-64: the table shows V2 values (Financiero weights 10+5+5+15+15 = 50 % + nulls, FCL 10 %, ROACE 15 %),
    while the oracle's Excel D4 rows use other weights and metas (FCL 15 %, meta 8,10; ROACE menos WACC with data). The
    tiles reproduce 96 % / 78,6 % only with the oracle rows, so the table and tiles come from different datasets until
    the PO picks one.
  - A4 — Donut centre "Cumplimiento" is a simple mean of capped results × snapshot factor (96.1 %), not the weighted global
    of the tiles (96,15 → 96 %); the category table (90 / 97 / 100 / 100) likewise differs from the oracle categories
    (94,69 / 98,91 / 97,51 / 100). Assumed product rule: one engine value per concept, centre = `globalPct` with one
    decimal (`96,2 %`), category column = engine category compliance [inference]; PO to confirm.
  - A5 — CF-38: Real is read-only (V2 renders text; `onRealChange` L4231 is unbound) and the note copy is changed
    accordingly.
  - A6 — CF-69: the ranking must use the latest period; V2 shows the 2024 column under "último corte disponible".
  - A7 — The history series is synthetic (index-based) in V2; real data and the unit (ROACE %) come from V-29.
  - A8 — M-07 "Mis vistas" [proposed] is a proposal: placement (snapshot row), copy ("Mis vistas", "Vista actual") and delete
    affordance need PO/UX confirmation; C-20 is kept.
  - A9 — CF-08: the Benchmark radial is gated and PQ-only [Paquete:1_Monitor_de_Valor_pantalla.jpg]; the behaviour of "Comparar año anterior", "Ver brechas vs.
    líder", the "Sostenibilidad" pill (no KVI category of that name, CF-48) and the Año default (2023 in PQ while the
    legend says 2025) is inferred; the radar needs peer KVI values that no V2 dataset has (OQ in P1-20).
  - A10 — OVL-05 candidates overlap KVIs already in the monitor (TBG "Flujo de Caja Libre", ILP "IRR" …); assumed the BFF
    marks them `isAlreadyIncluded` and the UI disables them [inference].
  - A11 — Snapshot semantics: V2 only rescales the donut centre; assumed every widget is snapshot-scoped and historic
    snapshots are read-only.
  - A12 — Configuration "Rango desde" / "Rango hasta" are free-text inputs in V2; assumed 4-digit years with desde ≤ hasta; the KVI
    toggles and sources have no visible effect in V2.
  - A13 — Comments are one flat thread per snapshot (`generalComments` is also the list of the unreachable OVL-04 drawer,
    L3159); statuses Pendientes / En análisis / Resueltos (OVL-09 section 4, orphan info L1832) are not shown in the list
    (M-05).
  - A14 — Dead blocks (Tier info, oportunidades / riesgos, orphan comments card) are not built (CF-83).
