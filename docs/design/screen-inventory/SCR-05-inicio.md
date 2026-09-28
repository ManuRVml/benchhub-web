## SCR-05 — Inicio (header title "Dashboard")

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary (precedence 1): `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` template L246–381 (screen block `isInicio`); logic:
    `MARKET_INDICATORS` L3248–3254, `NOTICIAS_DESTACADAS` L3458–3468, default peer set `homCompanies` L3576,
    `PROACTIVE.inicio` L3225, `resumenEjecutivo` L4309–4315, `marketIndicators` L4316, `yarbisDashboardInsight` L4319,
    `analisisCards` L4321–4326, `NEWS_COMPANY_COLORS` + `noticiasPares` + `noticiasParesEmpty` L4414–4417, carousel
    L4540–4549, `toggleChartInfo` L4710, title map `inicio:'Dashboard'` L5156, chat suggestion chips L5159,
    `isInicio` L5214, render bindings L5206–5249.
  - Reference image: `Paquete_de_Pantallas_24_08_2026/5_dashboar_inicial.png` (full page, Yarbis chat panel open; P6 in
    `.plan/source-map/03-reference-images.md` §3.2); repo copy `docs/design/screenshots/reference/pq-5-dashboar-inicial.png`.
  - V2 screenshots (fade-in frames, 916×540): `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/02-01-login.png`,
    `02-dashboard.png`, and the mislabelled duplicates `03-analisis.png`, `04-definicion.png`, `05-analisis-list.png`,
    `06-resultados.png` (all show this screen); repo copies `docs/design/screenshots/reference/ho-02-01-login.png`,
    `ho-02-dashboard.png`, `ho-03-analisis.png`, `ho-04-definicion.png`, `ho-05-analisis-list.png`, `ho-06-resultados.png`.
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador/README.md` §5 `Inicio (Dashboard)` and §Interactions
    (carousel, info toggles); PDF HU-001 (feature F06/F07).
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.5 (L165–193), §1.18, §1.19; `02-prototype-html.md` §3 `SCR-04 Inicio`
    (the 02 file numbers screens differently); `03-reference-images.md` §3.2.
- Proposed route: `/inicio` (default landing after login and after the access gate "Ingresar a la herramienta"); `/`
  redirects to `/inicio`. Guard: authenticated (all 5 roles). No URL params. Sidebar active item: "Inicio" (HTML L3808–3820,
  active bg `#7C35EA`, CF-28). Header title: "Dashboard" (HTML L5156; nav label and header title differ on purpose — CF-32).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04: sidebar 220/68 px, 4px gradient strip + 64px header, content `padding:28px 32px 100px`,
    `overflow:auto`). No analysis tab bar on this screen (`showAnalysisTabs` only for definicion/resultados/presentaciones,
    HTML L3796).
  - Content root: single column CSS grid, `gap:28px`, entry animation `fadeUp .3s ease` (HTML L247; keyframes L29).
  - Section widths: full content width. KPI row = `repeat(5,1fr)` gap 12 (L262). Analysis cards = `repeat(auto-fill,minmax(280px,1fr))`
    gap 16 (L283; P6 shows 4 in one row at 1528 CSS px, V2 captures show 2 per row at 916 px). News cards =
    `repeat(auto-fill,minmax(220px,1fr))` gap 14 (L339; 5 in a row on P6). Market indicators = one white card, `repeat(5,1fr)`
    gap 10 (L361–369).
  - Section header pattern: eyebrow `600 11px #808A9B`, uppercase, `letter-spacing:.04em` + 14px info "i" circle `#518CD1`
    (`700 9px` white), gap 6, `margin-bottom:12px` (L255–257).
  - Cards: `#fff`, `1px solid #DFE2E6`, radius 12 (KPI padding 16, analysis padding 20, news padding 16).
  - Floating: Yarbis FAB (bottom 26, right 28) and chat panel (OVL-14) from the shell; on P6 the panel covers the 5th market
    column [Paquete:5_dashboar_inicial.png].
- Tabs: n/a
- Sections: top to bottom, one column.
  1. Yarbis insight banner — `#1A1033`, radius 12, padding `14px 18px`, "✦" `#49BCD8` 16px (HTML L250), text `400 13px #EFE2F5`
     with bold white "Yarbis:" (L251) followed by the insight: "Detecté 3 cambios relevantes en el sector durante las últimas
     24 horas: caída de margen en Shell, alza de producción en Chevron y una noticia crítica de ISA que bloquea 3 indicadores."
     (L4319).
  2. "Resumen ejecutivo" (HTML L256, rendered uppercase) + info toggle → panel "KPIs clave del último análisis publicado:
     posición general, cobertura de datos y hallazgos más relevantes frente a pares." (L260). Five centred KPI cards
     (value `700 22px` in the KPI colour, label `400 11px #59667C`, L265–266), values from L4310–4314:
     "8" "Total análisis" `#1C2535` · "6" "Activos" `#47A4D5` · "3" "Publicados" `#10B981` · "2" "En construcción" `#FBBF24`
     · "82%" "Cobertura prom." `#49BCD8`.
  3. "Análisis habilitados" (L275) + info toggle → "Análisis a los que tienes acceso según tu rol. Clic en una tarjeta abre
     su resultado." (L281); right-aligned link "Ver todos ›" (`500 12px #672DBD`, L278). Card = title `600 15px` + status chip
     (`600 10px`, padding `4px 9px`, pill, L288) / description `400 13px #59667C` (L290) / meta "Actualizado {{ a.updated }} ·
     {{ a.owner }}" `400 12px #98A1B0` (L291). Mock cards (L4322–4325):
     - "Informe de referenciamiento de pares" · "Publicado" · "Seguimiento trimestral de Ecopetrol vs. 14 compañías del
       sector." · "hace 3 días" · "Alejandra" → Visualización.
     - "Referentes estratégicos" · "En revisión" · "TBG e ILP frente a pares del sector energético." · "hoy" · "Andrea" →
       Resultados.
     - "Monitor de Valor" · "Borrador" · "Drivers financieros y sensibilidades de generación de valor." · "hace 1 semana" ·
       "Mauricio" → Definición.
     - "Comparativo sectorial oil & gas" · "Publicado" · "Rentabilidad y solvencia frente a majors internacionales." ·
       "hace 5 días" · "Camila" → Visualización.
  4. Removed row — HTML L297–313 keeps a 3-column grid holding only hidden info texts (Pendientes L301, Actividad L308; the
     Presentaciones column is gone) and renders an empty 28px gap. **Not rendered** in the product (CF-33); the README §5
     Pendientes / Actividad reciente / Presentaciones widgets are not built.
  5. "Noticias de los pares" (L318) + info toggle → "Noticias recientes solo de las compañías configuradas como pares en el
     análisis." (L334); carousel pager at the right of the header, only when there is more than one page (L321–331). Card
     (L341–355): 24px initials chip (radius 6, `700 10px` white on company colour) + company name `600 13px` (ellipsis) + trend
     arrow at top-right (up `#10B981` L348, down `#EF4444` L351) / headline `400 12px #424E63` line-height 1.4 / source
     `400 11px #98A1B0`. Mock (5 cards = news whose company is in the default peer set Chevron, Shell, Equinor, BP, ISA, in
     `NOTICIAS_DESTACADAS` order, L3460–3467):
     - "SH" Shell ▲ "Reporta mejora de margen EBITDA sectorial." · "Bloomberg"
     - "CH" Chevron ▲ "Producción récord en el Pérmico impulsa el flujo de caja." · "Reuters"
     - "EQ" Equinor ▼ "Reduce reservas probadas tras revisión técnica en el Mar del Norte." · "Bloomberg"
     - "BP" BP ▲ "Anuncia recompra de acciones tras resultados sobre lo esperado." · "Platts"
     - "IS" ISA ▲ "Firma nuevos contratos de transmisión en Brasil por USD 400M." · "Valor Económico"
     (initials = first two letters upper-cased, L4416; the chips are confirmed by [Paquete:5_dashboar_inicial.png].)
  6. "Indicadores de mercado" card (L363) + info toggle → "Variables macro y de mercado relevantes para el sector, con su
     variación reciente." (L367). Five columns: label `400 11px #98A1B0`, value `700 15px 'Roboto Mono'`, delta `600 11px`
     green/red (L372–374). Mock (L3249–3253): "Brent" "71.4 USD/B" "+0.6%" · "WTI" "67.8 USD/B" "-0.3%" · "TRM" "$4,102"
     "+0.2%" · "Market Cap ECP" "$46.1 Bn" "+1.1%" · "Precio acción" "$1,935" "+0.9%".
- Components:
  - Shell (owned by SCR-04): `Cmp:AppShell`, `Cmp:SidebarNav`, `Cmp:AppHeader`, `Cmp:YarbisFab`, `Cmp:YarbisChatPanel` (OVL-14),
    `Cmp:HelpModal` (OVL-12).
  - `Cmp:YarbisInsightBanner` (dark AI banner: sparkle icon + bold lead + text).
  - `Cmp:SectionHeader` (eyebrow title + optional `Cmp:InfoToggleButton` + optional right slot for a link or pager).
  - `Cmp:InfoToggleButton` + `Cmp:InfoPanel` (inline `#F5F6F7` note, one open at a time per screen — CF-61).
  - `Cmp:KpiStatCard` (value + label, colour variant per KPI).
  - `Cmp:AnalysisCard` (clickable card: title, `Cmp:StatusChip`, description, meta line).
  - `Cmp:StatusChip` (analysis status variants: Publicado, En revisión, Borrador, En construcción).
  - `Cmp:LinkButton` ("Ver todos ›").
  - `Cmp:NewsCard` (with `Cmp:CompanyInitialsChip` and `Cmp:TrendArrow` up/down).
  - `Cmp:CarouselPager` (prev/next 26px round buttons + 7px dots).
  - `Cmp:MarketIndicatorsCard` containing `Cmp:MarketIndicatorStat` (label / mono value / signed delta).
  - `Cmp:EmptyState` (inline muted text variant), `Cmp:SectionSkeleton`, `Cmp:SectionError` [inference: required by the
    brief "States" field; no prototype counterpart].
- Charts: n/a (no chart on this screen; KPI and market values are plain numbers).
- Tables: n/a
- Filters & controls:
  - Info toggles × 4 (Resumen ejecutivo, Análisis habilitados, Noticias de los pares, Indicadores de mercado): click-toggle,
    default closed, one open at a time (shared `chartInfoOpen` key, L4710). Not in the URL (ephemeral UI state).
  - News carousel: page size 5 (`NEWS_PAGE_SIZE`, L4540); default page 0; prev/next clamp at the bounds and dim to
    opacity .3 (L4546–4547); dots jump to a page, active `#672DBD`, inactive `#DFE2E6` (L4548). Controls hidden when
    page count ≤ 1 (L4549; CF-13). Not in the URL [inference: ephemeral, resets on revisit].
  - No filters on this screen; the peer set that filters news is configured in the analysis (Resultados company set), not here.
- States:
  - Loading: each section (`banner`, `executiveSummary`, `enabledAnalyses`, `peerNews`, `marketIndicators`) shows its own
    skeleton sized like the final block [inference: `V-03` returns each section as `SectionResult`; the prototype has no
    loading state, only the mount fade].
  - Empty:
    - `noticiasParesEmpty` (L336–338, L4417) → "Sin noticias recientes para los pares configurados." (`400 13px #98A1B0`);
      header and info toggle stay, pager hidden.
    - Enabled analyses empty: no copy in `HTML` → section header + short muted note [inference: copy to be defined in i18n
      and logged as an open question]; "Ver todos ›" stays visible.
    - Executive summary: counts render as `0` (never hidden) [inference].
  - Error: a failed section shows `Cmp:SectionError` with retry inside that section only; the rest of the page keeps
    rendering [inference: brief §5 SectionResult independence].
  - Forbidden: not applicable at page level (all roles); a section returned as `forbidden` is hidden [inference].
  - Partial: any mix of the above per section (page never fails as a whole unless the session call fails → shell error).
  - Proactive tip: on the first visit per session the chat history receives "Hola, soy Yarbis. Detecté 3 cambios relevantes
    en el sector durante las últimas 24 horas — pregúntame por cualquier cifra, indicador o compañía." (L3225, fired on mount
    L3620) — only for roles with `canUseAssistant` (CF-40).
- Interactions:
  - "Ver todos ›" → `/analisis` (V2 `goAnalisis` = `setScreen('analisis')`, L5189); no `ref` param, so no sidebar item is
    active on arrival [inference: V2 keeps a stale `sidebarRefTab`, L3578/L3824 — prototype defect not reproduced].
  - Analysis card click → the card's `targetRoute`, resolved per role by the BFF (`V-03 enabledAnalyses[].targetRoute`).
    V2 defaults: Publicado → `/analisis/:analysisId/visualizacion`; En revisión → `/analisis/:analysisId/resultados`;
    Borrador → `/analisis/:analysisId/definicion?paso=1` (L4322–4325). Consumers always land on Visualización [inference: §1.19].
  - Info "i" → toggles the inline note under the section header (click, not hover — CF-61).
  - Carousel prev / next / dot → change page (only with more than 5 news items).
  - News cards, KPI cards and market indicators are not clickable in V2 (no `onClick` at L264, L341, L371).
  - Yarbis FAB → chat panel with context title "✦ Yarbis · Dashboard" [Paquete:5_dashboar_inicial.png] and suggestion chips
    "¿Qué análisis tengo pendiente?" and "¿Cómo está Ecopetrol vs. pares?" (L5159).
  - Keyboard: cards and toggles are focusable buttons / links with visible focus [inference: brief accessibility rules].
- Data fields: `V-03 GET /api/v1/views/home`, one `SectionResult` per section.
  - `banner.text`: string (es-CO, AI-generated suggestion; rendered after the bold lead "Yarbis:").
  - `executiveSummary.total` / `active` / `published` / `inProgress`: integer counts, rendered as plain integers.
    `avgCoveragePct`: number 0–100, one display format `82 %` style per es-CO formatter [inference: CF-70; mock shows "82%"].
  - `enabledAnalyses[]`: `id` (branded id), `title` (string), `status` (enum `draft | in_progress | in_review | published`,
    label from i18n: "Borrador" / "En construcción" / "En revisión" / "Publicado"), `description` (string), `updatedAt`
    (ISO datetime → relative es-CO text like "hace 3 días", "hoy", "hace 1 semana" [inference: relative formatter]),
    `ownerName` (string, first name in mock), `targetRoute` (string built by the BFF per role).
  - `peerNews[]`: `companyId`, `companyName`, `colorKey` (company colour map §2.7, CF-47; V2 chip colours L4414: Shell
    `#83E377`, Chevron `#7C35EA`, Equinor `#16DB93`, BP `#048BA8`, ISA `#F1C453`, fallback `#59667C`), `initials` (2 chars),
    `impact` (`up | down`; V2 draws neutral as down, L4415), `headline` (string), `source` (string). Max 5 per page.
  - `marketIndicators[]`: `id`, `label` (string), `value` (number), `unit` (`USD/bbl`, `COP`, `USD bn`, `COP/share`),
    `deltaPct` (signed number), `trend` (`up | down` derived from the sign — CF-71: TRM "+0.2%" must be green, not red as in
    V2). Display es-CO (CF-70): e.g. `71,4 USD/B`, `$ 4.102`, `+0,6 %` [inference: formatter output; V2 shows US format].
- Role visibility: per §1.19 (CF-39/40).
  - analyst_creator: whole screen; enabled analyses include own drafts and analyses in review; Yarbis banner + chat.
  - explorer_viewer / explorer_integral: whole screen; enabled analyses = published only; no Yarbis chat (FAB hidden);
    banner text still shown (published AI text visible to all — CF-40).
  - executive_viewer: whole screen; enabled analyses = published analyses reachable through presentations only; cards route
    to what the role can open (BFF); the "Ver todos ›" link is hidden because the Análisis list is locked for this role
    [inference: derived from §1.19, no prototype evidence].
  - executive_integral: whole screen; enabled analyses = published + invited previews; Yarbis chat on.
  - `hasAdminAccess` does not change this screen.
- Open questions / assumptions:
  - A1 — The KPI values (8 / 6 / 3 / 2 / 82%) are static in V2; they become BFF-computed counts over the analyses visible to
    the user (fixtures reproduce the V2 values — screen-parity policy). Coverage average source = latest published analysis
    per the info copy (L260) [inference].
  - A2 — The removed Pendientes / Actividad reciente / Presentaciones row is not rendered (CF-33); its info texts (L301,
    L308) and mock data (`pendientesInicio` L4328, `ACTIVIDAD_RECIENTE` L3256) are not migrated.
  - A3 — The peer set for news = the peers of the user's default analysis context [inference]; V2 uses the Resultados
    company set (`homCompanies`, L3576). Confirm with PO which analysis defines "pares configurados".
  - A4 — Market indicator values in V2 are US-formatted strings; the contract carries numbers + units and the front formats
    es-CO (CF-70); TRM trend colour follows the sign (CF-71).
  - A5 — News carousel controls exist only when there are more than 5 items (CF-13); the V2 default shows exactly 5, so the
    pager is not visible in the parity baseline [Paquete:5_dashboar_inicial.png].
  - A6 — Empty copy for "Análisis habilitados" is missing in `HTML`; needs PO copy (track in the open-questions log).
  - A7 — Nav "Inicio" vs header "Dashboard" is kept (CF-32). Sidebar per CF-01 (7 items, no "Análisis" item — OQ-01).
