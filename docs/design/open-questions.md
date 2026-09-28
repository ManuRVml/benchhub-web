# Open Questions & Decisions Log for the PO

This document consolidates all open questions (OQ-01..OQ-43) identified during Phase 1 planning and execution, along with the default answers applied so nothing blocks development. The PO can revisit these decisions at any time.

---

| OQ | Question | Default used by the plan | Owner | Blocks |
|---|---|---|---|---|
| OQ-01 | Add an "Análisis" sidebar item (README) to the V2 seven? | No (V2) | PO | P1-21, P5-30 |
| OQ-02 | Resultados composition per analysis type (Desempeño comparativo vs Referentes estratégicos); keep PQ-only modules? | All modules for both types, PQ modules gated | PO | P1-11, P4-22, P5-44..46 |
| OQ-03 | What should `Ref. TBG I ILP` (`ref=tbg-ilp`) change on the Análisis list? | Only active-nav highlight | PO | P5-35 |
| OQ-04 | Keep "Benchmark radial" in Monitor? | Gated, built last | PO | P4-32, P5-54 |
| OQ-05 | Can explorers see live coverage before publication (Doc A) or only published products (board 09)? | Published only | PO | P4-09 |
| OQ-06 | Confirm 5 roles + admin, executive_viewer access to Monitor, Entra group names (gk2 `VTI_VFV_*` is mock) | §1.19 | PO | P4-09, P1-21 |
| OQ-07 | KVI dataset/methodology: V2 table vs Excel D4 (BD 2026); "KVIs en riesgo" threshold (<70 gives 0, tile shows 1); TBD count; Real editable? | Engine aggregates as tiles; §2.10 formula; Real read-only | PO | P4-10, P4-29/30 |
| OQ-08 | TBG weights: source decimals (7,5) vs prototype rounded (8 → 101%); TotalEnergies 14 vs 20; averaging rule (include Ecopetrol? missing = 0?) | Screen parity with V2; decimals allowed | PO | P4-04, P4-21 |
| OQ-09 | Sensibilidades ROACE scale and "Brecha cerrada vs. pares" when Ecopetrol is above peers | 7,4% / 7,9%; `above_peers` state | PO | P4-12, P5-56 |
| OQ-10 | Negative values in paired bars: diverging axis? | Absolute length + signed value | PO | P5-18 |
| OQ-11 | Theme range sliders (captures show browser blue `#0075FF`) ? | Themed with `brand.primary` | PO | P5-15 |
| OQ-12 | Product name "BencHUD" vs logo "BenchHub" | Text BencHUD, logos unchanged | PO | P1-05 |
| OQ-13 | Colours for peers beyond the map; PTTEP magenta; Shell chip deviation | §2.7 | PO | P1-05, P4-03 |
| OQ-14 | Analysis context for the tab bar on sidebar-level Presentaciones | `session.analysisContext.defaultAnalysisId` | PO | P5-57 |
| OQ-15 | Selected state of presentation template cards | 2px accent border (HTML logic) | PO | P5-57 |
| OQ-16 | Minimum supported width | ≥1280 full, 1024 collapsed sidebar, 768 best-effort | PO | P2-W08, P5-73 |
| OQ-17 | Login without password field (CF-29); Entra tenant / app registration | Accepted; mock IdP until provided | PO | P4-08, P5-32 |
| OQ-18 | "Compartir" semantics (Monitor, builder, viewer) | Copy current deep link + toast (URL holds view state) | PO | P5-50, P5-60, P5-61 |
| OQ-19 | Which AI features are LLM-backed in v1 (prototype: only slide comments) and which model provider | Chat + slide comments via `LanguageModelProvider` (mock); narratives/findings/recommendations deterministic templates marked "sugerencia" | PO | P4-12, P4-38 |
| OQ-20 | "Alto contraste" and font-size semantics; email notifications backend | Font scale 0.9/1/1.1; high contrast = ADR token set; email pref stored only | PO | P5-33 |
| OQ-21 | ISA / business lines and per-indicator comparable sets (Doc A §4.4) in v1? | Companies carry `businessLine`; per-indicator peer set optional in contract | PO | P3-04, P4-04 |
| OQ-22 | Priority of backlog items B01–B12 (Market Intelligence, Explorador Libre, …) | Out of v1 | PO | — |
| OQ-23 | Step 3 selection model: V2 renders step-3 items as display-only and step 5 lists CATEGORIES (10 indicators), not the step-3 choice. Should step 3 selection be real state (bulk per group, BR-13) and step 5 list the selected indicators? | Step 3 selection is real state (bulk per group, BR-13) and step 5 lists the selected indicators; default selection = the 10 CATEGORIES indicators for "Desempeño de Pares" and all items of the chosen horizon for the strategic types. | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-24 | Controlled fields: Objetivo, Pregunta, periods and Fecha de corte are uncontrolled in V2 (no state) and Alcance chips are static; should all become controlled, saved draft fields? | Editable, prefilled from the analysis type template (BR-10 "habitual exercises come preloaded, with fields still adjustable"). | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-25 | Periodo comparado default: V2 Q3 2025 (QoQ) vs BR-13 "quarter vs same quarter of the prior year" (YoY, Q4 2024) | V2 (Q3 2025) | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-26 | Tipo de análisis vs BR-10 analysis types (Desempeño comparativo / Referentes estratégicos / Generación de valor) — labels differ; which labels to use? | V2 labels kept | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-27 | Homologation threshold for the step-5 exclusion alert: prototype ~60% (`01-handoff-docs.md` L738), configurable — where is it configured? | Prototype ~60%, configurable | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-28 | Step 2 "i" has no copy in V2 (HTML L554) — should the icon be removed or copy provided? | Hide the icon until the PO provides copy | PO | P1-18, P4-17, P5-36, P5-37 |
| OQ-29 | A4 — The strategic-plan table's column headers: V2 renders a card list whose only visible labels are "Urgencia", "Brecha:", "Peso:" and "Plazo sugerido:" (indicator and action have no label). If a real table is wanted, the header copy is not in HTML and needs PO copy. | Card list (current V2 implementation) | PO | P1-20, P4-33, P4-34, P5-55, P5-56 |
| OQ-30 | A6 — "Simulador de pesos" info toggle has no bound text in HTML (only a subtitle) — should the toggle be removed or copy provided? | Hide the toggle until the PO provides copy | PO | P1-20, P4-33, P4-34, P5-55, P5-56 |
| OQ-31 | A8 — P2 shows a wrapping bug in the category status label ("En / línea") — not reproduced (single-line, ellipsis). Which behavior to keep? | Single-line, ellipsis (V2 behavior) | PO | P1-20, P4-33, P4-34, P5-55, P5-56 |
| OQ-32 | A7 — Which analysis / period the simulation belongs to (save target of C-23 / C-26) is implicit in V2. What context should be assumed? | Monitor de Valor context (corte) from SCR-11 | PO | P1-20, P4-33, P4-34, P5-55, P5-56 |
| OQ-33 | M-11 / CF-85 (SCR-10 A3) — "Click a number → see the formula and inputs" (Capital-IQ-style drill, sticky UP/C 2026-09-08 11.51.41) has no V2 state. Build it in v1? | Out of v1 as a drill; v1 shows the indicator `formula` text in the empty 4th "Trazabilidad del dato" cell of SCR-10 (data already in V2 L3297/L3953) | PO | P1-12b, P4-24, P5-49 |
| OQ-34 | SCR-10 A2 — The subtitle delta and the third KPI ("GE vs. promedio de pares") use different peer bases in V2 (catalogue `pares` vs peer-set 2025 average): ROACE +34.5% both, Margen EBITDA +21.9% vs +28.3%, Producción −102% vs −75.3%. Which base? | One peer set derived by the BFF for both numbers (`deltaVsPeersPct` = `geVsAvgPct`) | PO | P4-24, P5-49 |
| OQ-35 | SCR-11 A2 (OQ-07, CF-74) — KPI tiles "KVIs en riesgo" 1 and "KVIs pendientes (TBD)" 3 do not match the V2 rows (0 Monitor results < 70%, 4 Reto results < 70%, 2 TBD rows). Which result, threshold and TBD rule define the counts? | Engine computes both counts from the same dataset as the table (Monitor result < 70; TBD = rows without real/meta); tiles show the engine values | PO | P4-10, P4-29, P5-50 |
| OQ-36 | SCR-11 A3 (CF-63/64) — The KVI table shows the V2 dataset (Financiero weights 10+5+5+15+15 = 50% + nulls) while the tiles reproduce 96% / 78,6% only with the Excel D4 oracle rows (`docs/design/oracles/kvi.json`). Which dataset is authoritative? | Two datasets until the PO decides: table = V2 screen-parity rows; aggregates (tiles, donut centre, category compliance) = Excel D4 methodology via the engine | PO | P4-10, P4-29, P4-30, P5-50, P5-51 |
| OQ-37 | SCR-11 A4 — Donut centre "Cumplimiento" is a simple mean of capped results × snapshot factor (96.1) while the tile shows the weighted global (96,15 → 96%); category table 90/97/100/100 vs oracle 94,69/98,91/97,51/100. One value per concept? | Yes: one engine value per concept; the donut centre shows the weighted global `globalPct` (96,2% with one decimal) and categories show the engine category compliance | PO | P4-10, P4-29, P5-53 |
| OQ-38 | SCR-09 A7 — The V2 formatter prefixes "+" to every positive percentage, also levels ("+39%" Margen EBITDA, "+7,4%" ROACE). Should the sign appear only on deltas / variations? | Yes: sign only for deltas and variations (`valueKind: growth`); levels unsigned | PO | P5-06, P5-47, P5-49 |
| OQ-39 | SCR-09 / OVL-16 (critic M-04, [proposed]) — "Seleccionar revisores" needs the list of users the analyst can invite to a preview, but no read endpoint provides it: SCR-09 cited a non-existent `V-48` "or a param of V-20" and V-20 left the source "to be defined". Should the preview flow exist in v1, and if so where do invitable reviewers come from? | Keep the preview flow gated (M-04). Invitable reviewers come from a field of V-20, `invitableReviewers[]{id, name, roleLabelKey}`, sent only when `permissions.canEnablePreview` is true; no new endpoint. If the PO drops previews, remove OVL-16, C-41 and `canEnablePreview`. | PO | P3-07, P4-28, P5-47 |
| OQ-40 | NC-02 (navigation-map §5) — Error pages 403 / 404 inside or outside the app shell? SCR-17-error-pages.md:14–16 says "No sidebar (error pages bypass shell)" / standalone; SCR-04-app-shell.md:17 says SCR-17 renders inside the shell when authenticated [inference]. No prototype exists (brief §5.4) | Inside the shell for authenticated users (sidebar + header keep navigation available); standalone only for unauthenticated visitors | PO | P2-W06, P5-33 |
| OQ-41 | NC-03 — Header title on the error pages: "403" / "404" (SCR-17-error-pages.md:14, i18n `error.403.title` / `error.404.title`) or the title-map fallback "BencHUD" (SCR-04-app-shell.md:65)? | "BencHUD" in the header (fallback) and "403" / "404" as the page heading inside the content | PO | P5-30, P5-33 |
| OQ-42 | NC-04 — Non-analyst opening `/analisis/:analysisId/resultados`: `/403`, or redirect to `/analisis/:analysisId/visualizacion` when the analysis is published? SCR-08-resultados.md:42–43 leaves it to P1-21; a redirect lands executive_viewer on another 403 (SCR-09-visualizacion.md:263) | Redirect (replace) to Visualización when the role may open the analysis there (published, or invited preview for executive_integral); otherwise `/403` | PO | P2-W06, P4-09, P5-40 |
| OQ-43 | NC-08 — If OQ-06 denies executive_viewer access to Monitor de Valor, is the sidebar item hidden or shown locked 🔒? SCR-04-app-shell.md:131 shows ✓ (OQ-06) and SCR-11-monitor-valor.md:428 says access is pending OQ-06; neither covers the denial case | Shown locked (🔒, `navigation[].isLocked`), like the other role-locked items (SCR-04 convention); direct URL → `/403` | PO | P4-08, P4-09, P5-30 |

---

## Summary

Total open questions: **43**

- OQ-01..OQ-22: From the Phase 1 synthesis plan (`10-synthesis.md` §8)
- OQ-23..OQ-28: From SCR-07-definicion.md executor notes
- OQ-29..OQ-32: From SCR-12-sensibilidades.md executor notes
- OQ-33..OQ-38: Gate-1 reconciliation (P1-26a) — SCR-10 A2/A3 (M-11), SCR-11 A2–A4, SCR-09 A7
- OQ-39: Gate-1 consistency review (P1-26c) — invitable reviewers for OVL-16 (SCR-09 / V-20)
- OQ-40..OQ-43: navigation-map.md §5 open conflicts NC-02, NC-03, NC-04, NC-08 (P1-26d)

Defaults were applied so development never blocks. The PO can revisit any decision at any time.
