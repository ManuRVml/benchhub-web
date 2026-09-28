## SCR-04 — App shell (sidebar + header + Yarbis; layout for SCR-05..SCR-16)

> Spec inputs: `.plan/source-map/10-synthesis.md` §1.4, §1.18 (OVL-12, OVL-14), §1.19, §1.20, §4 (`A-04`, `V-01`, `V-46`,
> `C-33`, `C-34`), §5 (CF-01, CF-09, CF-21, CF-27, CF-28, CF-31, CF-32, CF-40, CF-41, CF-46, CF-49, CF-78);
> `02-prototype-html.md` §2.2–2.9; `03-reference-images.md` §2.1; `06-uploads-png-batch-2.md` A7, E3, E11.
> `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"`. Visible copy is quoted verbatim (es-CO)
> with its `HTML Lnnn` pointer; it ships through i18n keys.

- Source files:
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"`: shell template L159–236; analysis tab bar L238–244; Help modal L3108–3126; Yarbis FAB L3176–3178 and panel L3180–3207; `PROACTIVE` tips L3224–3237; `NAV` L3266–3277; `ROLES` L3278; initial state L3545 (`role:'analista'`, `navExpanded:true`, `aiOpen:false`); `addProactive` L3622–3631; `ANALYSIS_TABS` L3779–3783, tab handlers L3784–3795, `showAnalysisTabs` L3796; `navState` L3808–3819; `navRefTbgIlp` L3823–3828; `navRefCompetitivo` L3829–3834; `roleOptions` (computed, not rendered) L3836; `titleMap` L5156; `suggestionsMap` L5158–5167; `chatMessages` L5168–5173; render values L5177–5192; `toggleHelp` L5288; `toggleAI` L5509.
  - V2 screenshots `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\design_handoff_benchud_comparador\screenshots\"` `02-01-login.png`, `02-dashboard.png`, `03-analisis.png`, `04-definicion.png`, `05-analisis-list.png`, `06-resultados.png` (all show the Dashboard), `07-monitor-valor.png`, `08-presentaciones.png`, `09-notificaciones.png`.
  - Paquete images (shell chrome visible; nav is older in the first two — CF-01): `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\1_Monitor_de_Valor_pantalla.jpg"`, `2_Sensibilidades_pantalla_completa.jpg`, `3_Tablero_Alejandra_Cuantitativo.png`, `3_1_Tablero_Andrea_Cualitativo.jpg`, `4_Presentaciones-Crear-presentacion.jpg`, `5_dashboar_inicial.png` (no header strip — CF-09; Yarbis panel open).
  - Uploads: `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-18 a la(s) 6.47.23 p.m..png"` (sidebar crop, matches final item list); `Captura de pantalla 2026-09-10 a la(s) 1.44.18 p.m..png` (tab bar with "Visualización", superseded — CF-21); `Captura de pantalla 2026-09-08 a la(s) 12.00.39 p.m..png` (Ecopetrol DS side-nav anatomy, reference only — CF-61).
  - Superseded: `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\screenshots\valor-donut.png"` (9-item nav, header role switcher — CF-27).
  - Assets: `V2 _CUAN_ECO_Comparador 2\assets\benchud-logo.png`, `benchud-logo-compact.png`, `user-avatar.png`.
  - Handoff docs: `design_handoff_benchud_comparador\README.md` (nav order with "Análisis", active `#672DBD` — both superseded, CF-01/CF-28).
- Proposed route: n/a as a page — pathless **layout route** (guard: authenticated) that wraps every in-app route: `/inicio` (SCR-05; `/` redirects), `/analisis…`, `/monitor-valor…`, `/presentaciones…`, `/notificaciones`, `/configuracion` (SCR-05..SCR-16). Excluded: `/login` (SCR-01), `/acceso` (SCR-02), `/admin` (SCR-03), `/403` and `*` 404 (SCR-17 renders inside the shell when authenticated [inference]).
- Layout:
  - Root: `display:flex; min-height:100vh`, page bg `surface.page #F5F6F7` (HTML L35, L160).
  - Sidebar (HTML L162): bg `dark.surface #1A1033`, `position:sticky; top:0; height:100vh`, width **220px expanded / 68px collapsed**, `transition:width .2s`, `overflow:hidden`. Logo block padding `20px 16px`, bottom divider `rgba(255,255,255,.08)` (HTML L163); nav list padding `14px 8px`, gap 4 (HTML L167); footer toggle padding `14px 16px`, top divider `rgba(255,255,255,.08)` (HTML L213).
  - Main column: `flex:1; min-width:0; flex-direction:column` (HTML L216).
    - Header strip 4px `gradient.headerStrip linear-gradient(90deg,#47A4D5,#672DBD,#49BCD8)` on every app screen (HTML L218; CF-09).
    - Header bar 64px, white, bottom border `border.default #DFE2E6`, padding `0 24px`, gap 16, `justify-content:space-between` (HTML L219).
    - Content area `flex:1; overflow:auto; padding:28px 32px 100px` (HTML L236); each screen enters with `fadeUp .3s` (HTML L29; disabled under `prefers-reduced-motion` [inference]).
  - Floating layer: Yarbis FAB fixed `bottom:26px; right:28px`, z-index 20 (HTML L3176); panel fixed `bottom:94px; right:28px; width:320px`, z-index 20 (HTML L3181). Modal scrim z-index 29 (HTML L3109).
  - Breakpoints (OQ-16): ≥1280 full layout; 1024–1279 sidebar starts collapsed; 768 best-effort [proposal].
- Tabs:
  - Analysis tab bar (segmented control) rendered at the top of the content area only on Definición (SCR-07), Resultados (SCR-08) and Presentaciones (SCR-13) — `showAnalysisTabs` (HTML L3796). Order and labels (HTML L3779–3783): "Configuración" → Definición · "Resultados" → Resultados · "Presentación" → Presentaciones.
  - No default tab: the active tab is the current route. Container bg `#F5F6F7`, radius 10, padding 3, gap 2, margin-bottom 20; tab `padding:8px 16px; radius 8; 500 13px`; active bg `brand.primary #672DBD` / fg `#fff`; inactive transparent / `text.secondary #59667C` (HTML L239–241, L3793–3794).
  - "Presentación" opens the presentation whose name equals the current analysis name, else the list (HTML L3786–3791); in the SPA it resolves through `session.analysisContext` (CF-46, OQ-14).
  - "Visualización" is **not** a tab (CF-21; `Captura de pantalla 2026-09-10 a la(s) 1.44.18 p.m..png` superseded).
- Sections:
  1. Sidebar · logo: `benchud-logo.png` h22 expanded / `benchud-logo-compact.png` h22 collapsed, alt "BencHUD" (HTML L164–165; CF-41).
  2. Sidebar · navigation (HTML L169–210), exactly 7 rows in this order (CF-01, CF-78); row `display:flex; gap:12px; padding:11px 12px; radius 9px`; icon 20×20 outline SVG stroke 1.6; label `500 13px` (hidden when collapsed):
     1. "Inicio" (house icon; HTML L171) → `/inicio`
     2. "Ref. TBG I ILP" (document icon; HTML L176) → `/analisis?ref=tbg-ilp` (active only when on Análisis via this entry — HTML L3823–3828; OQ-03)
     3. "Ref. Competitivo" (same document icon; HTML L179) → role-resolved Resultados / Visualización of the default competitive analysis (A-04 `navigation[].to`; HTML L3829–3834)
     4. "Monitor de Valor" (node-tree icon; HTML L186) → `/monitor-valor`
     5. "Presentaciones" (monitor icon; HTML L191) → `/presentaciones`; locked state shows "🔒" (11px) and opacity .5 (HTML L189–191)
     6. "Notificaciones" (bell icon; HTML L199) → `/notificaciones`; badge = unread count (HTML L201–203)
     7. "Salir" (logout arrow, fixed colour `#DDD1EE`, hover bg `rgba(255,255,255,.06)`; HTML L207–210) → logout
     - Row colours (HTML L3808–3819): active bg `brand.navActive #7C35EA` + icon/text `#fff` (CF-28); allowed icon `#C9B3DE`, text `#E4D8F0`; locked icon/text `#5C3E78`, opacity .5, not clickable.
  3. Sidebar · footer toggle "‹ Colapsar" (expanded) / "›" (collapsed) (HTML L213, L5185; `400 12px #B394CE`).
  4. Header · left: screen title (HTML L220; `title.header 600 16px text.heading #1C2535`, single line, ellipsis) — see title map below.
  5. Header · right (gap 10; HTML L221–233): bell button 36px circle `#F5F6F7` with 7px `#EF4444` dot at `top:6px; right:7px` (HTML L222–225) · help "?" button 36px (HTML L226–228) · user block: avatar `user-avatar.png` 36px circle (alt = user display name) + full name (HTML L229–231; `500 13px text.body #424E63`; mock "Camila Bravo", HTML L5192; CF-31).
  6. Content area: analysis tab bar (conditional) + routed screen outlet (HTML L236–244).
  7. Yarbis FAB (HTML L3176–3178): 56px circle `ai.accent #49BCD8`, white robot icon 28px, shadow `0 8px 20px rgba(73,188,216,.4)`, `aiPulse 2.4s infinite` (HTML L30).
  8. Yarbis panel OVL-14 (HTML L3180–3207): white, border `#DFE2E6`, radius 14, shadow `0 12px 32px rgba(28,37,53,.18)`; header bg `#49BCD8`, `600 13px` white, "✦ Yarbis · {screenTitle}" (HTML L3182); message list max-height 300, padding `14px 16px`, gap 10 (HTML L3183–3195); suggestion chips row (HTML L3196–3202); input row with top border `#F5F6F7` (HTML L3203–3206).
  - **Header title map (exact, HTML L5156 + fallback L5182):**

    | Screen id (prototype) | SCR | Proposed route | Header title |
    |---|---|---|---|
    | `inicio` | SCR-05 | `/inicio` | "Dashboard" (nav label stays "Inicio" — CF-32) |
    | `analisis` | SCR-06 | `/analisis` | "Análisis" |
    | `definicion` | SCR-07 | `/analisis/:analysisId/definicion` | "Definición del análisis" |
    | `resultados` | SCR-08 | `/analisis/:analysisId/resultados` | "Resultados · {analysisName}" (default "Resultados · Desempeño comparativo — 4T 2025") |
    | `visualizacion` | SCR-09 | `/analisis/:analysisId/visualizacion` | "Visualización · Dashboard" |
    | `detalle` | SCR-10 | `/analisis/:analysisId/indicadores/:indicatorId` | "Detalle de indicador" |
    | `sensibilidades` | SCR-12 | `/monitor-valor/sensibilidades` | "Sensibilidades" |
    | `valor` | SCR-11 | `/monitor-valor` | "Monitor de Valor" |
    | `presentaciones` | SCR-13, SCR-14 | `/presentaciones`, `/presentaciones/nueva`, `/presentaciones/:presentationId` | "Presentaciones" |
    | `alertas` | SCR-15 | `/notificaciones` | "Notificaciones" |
    | `config` | SCR-16 | `/configuracion` | "Configuración" |
    | `mercado`, `explorador` | — | not routed (backlog B01) | "Inteligencia de Mercado", "Explorador Libre" (titles exist, no template) |
    | any other | — | — | "BencHUD" (fallback) |

    SCR numbers and routes other than the titles are [inference] from synthesis §1.5–1.16 and are reconciled in P1-21 (`navigation-map.md`). The title is also used as `document.title` suffix and in the Yarbis panel header [inference for `document.title`].
- Components:
  - `Cmp:AppShell` (layout route: sidebar + main column + floating layer)
  - `Cmp:Sidebar` (expanded / collapsed)
  - `Cmp:BrandLogo` (variants `full`, `compact`)
  - `Cmp:SidebarNavItem` (states `default`, `active`, `locked`, `hover`; variants `expanded`, `collapsed`)
  - `Cmp:NotificationBadge` (variants `count` pill, `dot` 8px with `2px solid #240F40` border for collapsed sidebar, `dot` 7px for header bell)
  - `Cmp:SidebarCollapseToggle`
  - `Cmp:HeaderGradientStrip`
  - `Cmp:AppHeader`
  - `Cmp:IconButton` (36px round, `#F5F6F7`; bell, help)
  - `Cmp:UserChip` (with `Cmp:Avatar` 36px + display name)
  - `Cmp:Avatar`
  - `Cmp:SegmentedTabs` (analysis tab bar; variant `primary`)
  - `Cmp:AssistantFab`
  - `Cmp:AssistantPanel`
  - `Cmp:ChatBubble` (variants `ai` `#F5F6F7`, `user` `brand.primarySubtle #EDE9FE`)
  - `Cmp:FeedbackThumbs` (👍 selected `#D1FAE5`, 👎 selected `#FEE2E2`)
  - `Cmp:SuggestionChip` (bg `#EDE9FE`, text `#672DBD`, `500 11px`)
  - `Cmp:ChatInput` (input + "›" send button `#49BCD8`, hover `#0E7490`)
  - `Cmp:Modal` (Help OVL-12: 440px, radius 14, padding 26)
  - `Cmp:HelpModal` (OVL-12 content: 4 Q&A + support box)
  - `Cmp:Button` (variant `primary`, "Contactar soporte")
  - `Cmp:SectionResult` (loading / error wrapper used by the routed screens)
- Charts: n/a
- Tables: n/a
- Filters & controls:
  - Sidebar collapse toggle: boolean, default expanded (HTML L3545 `navExpanded:true`) at ≥1280px, collapsed at 1024–1279 (OQ-16); persisted per user in `localStorage` [inference]; **not** in the URL.
  - Analysis tab bar: selection = current route (URL is the state); no extra param.
  - Yarbis panel open/closed: boolean, default closed (HTML L3546 `aiOpen:false`); not in the URL [inference].
  - Help modal open/closed: default closed (HTML L3599 `helpOpen:false`); not in the URL.
  - Yarbis input: free text, Enter or "›" sends (HTML L3204–3205); empty/whitespace is ignored (HTML L3632–3633).
- States:
  - Loading: while `A-04 session` resolves → full-page shell skeleton (sidebar rail + header bar placeholders) [inference]; unread badge hidden until `V-01` resolves [inference].
  - Error: `A-04` 401 → redirect `/login?returnTo=<current>&error=session_expired`; `V-01` failure → badge hidden, shell keeps working (non-blocking) [inference]; `V-46`/`C-33` failure → error bubble in the panel with retry [inference].
  - No permission: locked nav item (🔒, opacity .5, `aria-disabled`, no navigation — HTML L3812–3818); direct URL to a forbidden route → SCR-17 403 inside the shell.
  - Empty: unread = 0 → no count badge, no collapsed dot (HTML L5188 `hasNotifCount`, `navCollapsedNotif`); header bell dot is permanent in the prototype (HTML L224) — tie it to unread > 0 [inference]. No suggestions for a screen → chip row hidden (HTML L3196 `hasSuggestions`).
  - Partial: n/a at shell level (each routed module owns its `Cmp:SectionResult`).
  - Collapsed sidebar: labels, 🔒 and count badge hidden; icons only; Notificaciones shows the 8px red dot at `top:6px; left:26px` (HTML L196–198).
  - Assistant streaming: AI bubble fills progressively from `C-33` SSE `token` events; input disabled until `done`/`error` [inference: prototype answers synchronously via `aiRespond`].
- Interactions:
  - Sidebar rows → navigate (routes above); active row = current route; locked rows do nothing (HTML L3812).
  - "Salir" → `A-03 POST /api/v1/auth/logout` (CSRF) → `/login` (HTML L207, L5190).
  - "‹ Colapsar" / "›" toggles width 220 ↔ 68 with a .2s width transition (HTML L162, L213, L5186).
  - Header bell → `/notificaciones` (HTML L222, `goAlertas` L5193).
  - Header "?" → opens OVL-12 "Ayuda y documentación" (HTML L3112): four Q&A — "¿Cómo creo un nuevo análisis?" (HTML L3116), "¿Qué significan los Tiers (1-4)?" (HTML L3117), "¿Por qué una compañía queda fuera de la muestra?" (HTML L3118), "¿Dónde veo mis presentaciones publicadas?" (HTML L3119) — plus "¿No encontraste tu respuesta? Pregúntale a Yarbis o escribe a soporte." (HTML L3122) and button "Contactar soporte" (HTML L3123). Closes on ✕, scrim click, the button (prototype only toggles), and Esc [inference]. Answer 1 says "los 4 pasos de Definición" — shipped as "5 pasos" with the fifth step named (CF-49, Dev). Answers as shipped: "Desde Análisis, usa "+ Crear nuevo análisis" y completa los 5 pasos de Definición (información general, competidores, indicadores, fuentes y validación)." (HTML L3116, CF-49), "Resumen la posición de Ecopetrol frente a pares en cada categoría: Tier 1 es la mejor posición relativa y Tier 4 el mayor rezago." (HTML L3117), "Yarbis excluye compañías cuya homologación de datos cae por debajo del umbral mínimo, para no distorsionar los promedios." (HTML L3118), "En Presentaciones Inteligentes, en la tabla "Presentaciones creadas" — puedes editar, ver detalle, descargar y compartir cada una." (HTML L3119). Sidebar logo alt "BencHUD" (HTML L164).
  - Avatar / name → `/configuracion` (HTML L229, `goConfig` L5193).
  - Analysis tabs → Definición / Resultados / Presentación of the current analysis (HTML L3784–3795).
  - Yarbis FAB → toggles OVL-14 (HTML L3176, L5509). Panel: suggestion chip click sends its text (HTML L5174); 👍/👎 records feedback via `C-34` (HTML L3189–3190); first visit to each screen per session appends that screen's proactive tip once (HTML L3622–3631, texts L3224–3237 — e.g. inicio: "Hola, soy Yarbis. Detecté 3 cambios relevantes en el sector durante las últimas 24 horas — pregúntame por cualquier cifra, indicador o compañía." HTML L3225). Suggestion chips per screen (HTML L5158–5167), e.g. inicio "¿Qué análisis tengo pendiente?", "¿Cómo está Ecopetrol vs. pares?" (HTML L5159). Input placeholder "Pregunta sobre este análisis..." (HTML L3204).
  - Keyboard: all nav rows, header buttons and FAB are focusable buttons/links with `:focus-visible 2px #47A4D5` (HTML L31); prototype uses `div onClick` [inference: a11y fix].
  - No drawers or exports at shell level.
- Data fields:
  - `A-04 GET /api/v1/session`: `user{ id, displayName: string, avatarFileId: string, roleLabel: string }`, `role: 'analyst_creator'|'explorer_viewer'|'explorer_integral'|'executive_viewer'|'executive_integral'`, `hasAdminAccess: boolean`, `requiresGate: boolean`, `permissions` (incl. `canUseAssistant: boolean`), `navigation[]{ id, labelKey, to, isLocked: boolean, badge? }`, `analysisContext{ defaultAnalysisId }` (synthesis §4).
  - `V-01 GET /api/v1/views/shell-status`: `unreadNotifications: integer` ≥ 0 (mock 11 = `ALERTS.length`, HTML L3486, L5188); display as integer, "99+" above 99 [inference].
  - `V-46 GET /api/v1/views/assistant-context?screen=&analysisId=`: `proactiveTip{ id, text }`, `suggestions[]: string` (independent per screen).
  - `C-33 POST /api/v1/assistant/messages` → SSE `token`, `citation`, `done`, `error`; `C-34 POST /api/v1/assistant/feedback` `{ messageId, rating: 'up'|'down' }` (F04).
  - `screenTitle`: string from the title map; `analysisName` (string, data — e.g. "Desempeño comparativo — 4T 2025", CF-76) for the Resultados title.
- Role visibility: proposal from synthesis §1.19; the BFF computes `navigation[].isLocked`, the front never derives it.

  | Shell element | analyst_creator | explorer_viewer | explorer_integral | executive_viewer | executive_integral |
  |---|---|---|---|---|---|
  | Inicio, Notificaciones, Salir, header bell/help/avatar | ✓ | ✓ | ✓ | ✓ | ✓ |
  | Ref. TBG I ILP (Análisis list) | ✓ (all) | ✓ published | ✓ published | 🔒 | ✓ published + invited previews |
  | Ref. Competitivo | ✓ → Resultados | ✓ → Visualización | ✓ → Visualización | 🔒 [inference: detail only via presentation] | ✓ → Visualización |
  | Monitor de Valor | ✓ | ✓ | ✓ | ✓ (OQ-06) | ✓ |
  | Presentaciones | ✓ | 🔒 | ✓ | ✓ | ✓ |
  | Yarbis FAB + panel (`canUseAssistant`) | ✓ | hidden | hidden | hidden | ✓ |
  | Analysis tab bar "Configuración" / "Resultados" | ✓ | – | – | – | – |

  - `hasAdminAccess` adds nothing to the shell (admin lives in SCR-02/SCR-03) [inference].
  - Prototype for reference: hard-coded `role:'analista'` (HTML L3545); `NAV[].roles` (HTML L3266–3277) locks Presentaciones for `ejecutivo_visualizador`/`explorador`; Ref. rows ignore roles (HTML L3823–3834); the header role switcher (`roleOptions`, HTML L3836) is computed but not rendered — removed (CF-27).
- Open questions / assumptions:
  - CF-01 / OQ-01: 7 V2 nav items (no "Análisis" row) vs README 8 / Paquete `1_Monitor_de_Valor_pantalla.jpg` and `2_Sensibilidades_pantalla_completa.jpg` 6 with "Análisis" — default V2; Análisis list reached via "Ref. TBG I ILP" and Inicio "Ver todos ›".
  - OQ-03: what `ref=tbg-ilp` changes on the Análisis list — default: only the active-nav highlight.
  - CF-28: active nav colour `#7C35EA` (HTML, `5_dashboar_inicial.png`) over README `#672DBD` (also seen in `Captura de pantalla 2026-09-18 a la(s) 6.47.23 p.m..png`).
  - CF-09: header strip absent in `5_dashboar_inicial.png`; shown on every app screen.
  - CF-32: nav "Inicio" vs header "Dashboard" — both kept.
  - CF-40 (PO): Yarbis visible only with `canUseAssistant` (analyst_creator, executive_integral); the prototype shows it to everyone.
  - CF-39 / OQ-06 (PO): 5 roles + admin flag; executive_viewer access to Monitor and the Ref. Competitivo lock for executive_viewer are [inference] pending confirmation.
  - CF-46 / OQ-14: analysis context for the tab bar when Presentaciones is opened from the sidebar — default `session.analysisContext.defaultAnalysisId`.
  - CF-49 (Dev): Help answer "los 4 pasos de Definición" → "5 pasos" with the fifth step named.
  - CF-41 / OQ-12: logo artwork "BenchHub" vs product text "BencHUD".
  - OQ-16: minimum supported width and collapsed-by-default breakpoint.
  - OQ-19: which Yarbis replies are LLM-backed in v1 (default: chat via mock `LanguageModelProvider`).
  - [inference] Header bell dot bound to unread > 0 (prototype shows it permanently); badge cap "99+"; collapse state persisted in `localStorage`; Esc closes panel/modal; `document.title` uses the header title.
