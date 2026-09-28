# Navigation map

> Aggregated from the 17 screen inventories in `docs/design/screen-inventory/` (their `- Proposed route:` and
> `- Role visibility:` bullets); nothing here is new behaviour. Role model: `.plan/source-map/10-synthesis.md` §1.19 (5 roles
> + `hasAdminAccess` flag) with the defaults of OQ-01, OQ-05 and OQ-06 in `docs/design/open-questions.md`; header titles:
> synthesis §1.20. Where two inventories disagree the difference is listed in section 5, not resolved.
> Checked by `node tools/check-navigation-map.mjs` (route cells = the first code span of each SCR `- Proposed route:` line;
> every matrix row has a Source).

## 1. Route table

The Route cell quotes the first code span of the SCR file's `- Proposed route:` line; screens with several routes get one
row per route (first row = that code span). "URL-persisted" = the query param is the state (deep link reproduces the view).

| Route | SCR | Params (path) | Query params (defaults; URL-persisted state) | Header title | Breadcrumb | Guard |
|---|---|---|---|---|---|---|
| `/login?returnTo=<relative path>` | SCR-01 | — | `returnTo` (relative in-app path, default `/inicio`); `error=<code>` after a failed callback [inference] | — (no app header) | — | public; authenticated sessions are redirected (section 2) |
| `/acceso` | SCR-02 | — | — (optional pass-through `returnTo` [inference]) | — (no app header) | — | authenticated **and** `session.hasAdminAccess`; others → `/inicio` (CF-30) |
| `/admin` | SCR-03 | — | — | "Administración · Back office" (own top bar, no shell) | "‹ Volver" → `/acceso` | authenticated **and** `session.hasAdminAccess`; others → `/403` |
| `/inicio` (layout route) | SCR-04 | — | — | per wrapped screen (§1.20; fallback "BencHUD") | — | authenticated (pathless layout route wrapping `/inicio`, `/analisis…`, `/monitor-valor…`, `/presentaciones…`, `/notificaciones`, `/configuracion`) |
| `/inicio` | SCR-05 | — | — | "Dashboard" (nav label "Inicio", CF-32) | — | authenticated (all 5 roles); `/` redirects here |
| `/analisis?q=&fecha=&creador=&estado=&ref=&page=` | SCR-06 | — | `q`, `fecha`, `creador`, `estado` (absent = "todos"), `ref=tbg-ilp` (set by sidebar "Ref. TBG I ILP", active-nav only, OQ-03), `page` (default 1) — all URL-persisted | "Análisis" | — | authenticated and role ≠ executive_viewer (→ `/403`) |
| `/analisis/:analysisId/definicion?paso=1..5` | SCR-07 | `analysisId` (draft id) | `paso` (default 1, clamped 1..5, invalid → 1) — URL-persisted | "Definición del análisis" | — (analysis tab bar "Configuración" active) | authenticated and `analyst_creator` (others → `/403`) |
| `/analisis/:analysisId/resultados?horizonte=tbg\|ilp\|tbg-ilp&compania=` | SCR-08 | `analysisId` | `horizonte` (default `tbg`), `compania` (default first company); part B: `categoria` (default `rentabilidad`), `pvc` (default first company), `resumen` — URL-persisted | "Resultados · {analysisName}" | — (analysis tab bar "Resultados" active) | analyst_creator only; other roles → `/403` or redirect to `/analisis/:analysisId/visualizacion` when published (open, section 5) |
| `/analisis/:analysisId/visualizacion?categoria=rentabilidad&ranking=fin&peso=fin` | SCR-09 | `analysisId` | `categoria` (default `rentabilidad`), `ranking` (default `fin`), `peso` (default `fin`) — URL-persisted | "Visualización · Dashboard" | — (no analysis tab bar, CF-21) | role can open the analysis in its current lifecycle state (matrix); otherwise `/403` |
| `/analisis/:analysisId/indicadores/:indicatorId?origen=resultados\|visualizacion\|presentacion` | SCR-10 | `analysisId`, `indicatorId` (catalogue id) | `origen` (default = the role's report screen) — picks the back target | "Detalle de indicador" | back link to `origen` (Resultados / Visualización / Presentación) | authenticated and `canViewReport(analysisId)`; executive_viewer only with `origen=presentacion` + a presentation that includes the indicator; else `/403`; unknown indicator → 404 |
| `/monitor-valor?corte=2026-04&historico=actual&categoria=&cumplimiento=` | SCR-11 | — | `corte` (snapshot, default latest `2026-04`), `historico` (`actual\|5y\|8y\|10y`, default `actual`), `categoria`, `cumplimiento` (comma lists, empty = all), `vista=<savedViewId>` [proposed, M-07] — URL-persisted | "Monitor de Valor" | — | every role reads (§1.19); unauthenticated → `/login` |
| `/monitor-valor/sensibilidades?indicador=roace` | SCR-12 | — | `indicador` (default `roace`; non-ready → `roace`) — URL-persisted | "Sensibilidades" | back to `/monitor-valor` [inference in SCR-12; V2 has none] | `canSimulate` (analyst_creator, executive_integral); others → `/403` |
| `/presentaciones` | SCR-13 | — | `page` [inference, V-40] | "Presentaciones" | — | authenticated and role ≠ explorer_viewer (→ `/403`) |
| `/presentaciones/nueva?analysisId=` | SCR-13 | — | `analysisId` (source analysis of the new draft) | "Presentaciones" | — | `analyst_creator` (creates a draft with `C-27`, then replaces the URL with `…/:presentationId/editar`) |
| `/presentaciones/:presentationId/editar` | SCR-13 | `presentationId` | — | "Presentaciones" | — | `analyst_creator` |
| `/analisis/:analysisId/presentaciones` | SCR-13 | `analysisId` | — | "Presentaciones" | — (analysis tab bar "Presentación" active) | as `/presentaciones`; opens SCR-14 when a presentation is linked to the analysis (section 5) |
| `/presentaciones/:presentationId?slide=n` | SCR-14 | `presentationId` | `slide` (1-based, default 1, clamped 1..N) — URL-persisted | "Presentaciones" | "‹ Volver a Presentaciones" → `/presentaciones` | authenticated, role ≠ explorer_viewer, presentation visible to the user (published, or own draft for the analyst); else `/403` / 404 |
| `/notificaciones?q=&severidad=` | SCR-15 | — | `q` (search), `severidad` (multi: `info`, `success`, `warn`, `error`) — URL-persisted | "Notificaciones" | — | authenticated (all 5 roles) |
| `/configuracion` | SCR-16 | — | — | "Configuración" | — | authenticated (all 5 roles) |
| `/403` | SCR-17 | — | — | "403" (i18n `error.403.title`; section 5) | — | none (public) |
| `*` | SCR-17 | — | — | "404" (i18n `error.404.title`; section 5) | — | none (catch-all) |

## 2. Redirects

| From | Condition | To | Source |
|---|---|---|---|
| `/` | always | `/inicio` | `SCR-05-inicio.md`, `SCR-04-app-shell.md` |
| OIDC callback (`A-02`) | `session.requiresGate` / `hasAdminAccess` | `/acceso` | `SCR-01-login.md`, `SCR-02-access-gate.md` |
| OIDC callback (`A-02`) | no admin access | `returnTo` or `/inicio` | `SCR-01-login.md` |
| `/login` | already authenticated | `/acceso` (admin) or `returnTo` / `/inicio` | `SCR-01-login.md` |
| `/acceso` | no `hasAdminAccess` | `/inicio` | `SCR-02-access-gate.md` |
| `/acceso` "Ingresar a la herramienta" | click | `/inicio` (or `returnTo`) | `SCR-02-access-gate.md` |
| any guarded route | no session / 401 | `/login?returnTo=<current>&error=session_expired` | `SCR-01-login.md`, `SCR-04-app-shell.md` |
| any guarded route | role or flag not allowed | `/403` | `SCR-17-error-pages.md` (+ each guard in section 1) |
| unknown path | no route matches | `*` → 404 | `SCR-17-error-pages.md` |
| `/presentaciones/nueva` | draft created (`C-27`) | `/presentaciones/:presentationId/editar` (replace) | `SCR-13-presentaciones.md` |
| `/analisis/:analysisId/presentaciones` | presentation linked to the analysis | SCR-14 `/presentaciones/:presentationId` | `SCR-13-presentaciones.md`, `SCR-14-presentacion-detalle.md` |
| `/monitor-valor/sensibilidades?indicador=<not ready>` | indicator not ready | `?indicador=roace` | `SCR-12-sensibilidades.md` |
| "Salir" / "Cerrar sesión" | `A-03` logout | `/login` | `SCR-02-access-gate.md`, `SCR-03-admin.md`, `SCR-04-app-shell.md` |

## 3. Role × screen matrix

Values: **full** = every action of the screen; **read** = the screen opens but with fewer or no write actions (the note says
which); **hidden** = never shown (the user is redirected instead); **403** = the route answers `/403`. The admin column is the
`hasAdminAccess` flag, orthogonal to the five roles (§1.19 "Admin — per flag"): "per role" means the flag changes nothing on that
screen. Each row restates the Role visibility bullet of its Source file.

| SCR | analyst_creator | explorer_viewer | explorer_integral | executive_viewer | executive_integral | admin | Notes | Source |
|---|---|---|---|---|---|---|---|---|
| SCR-01 | hidden | hidden | hidden | hidden | hidden | hidden | public for visitors; authenticated users are redirected | `SCR-01-login.md` |
| SCR-02 | hidden | hidden | hidden | hidden | hidden | full | only `hasAdminAccess`; everyone else → `/inicio` | `SCR-02-access-gate.md` |
| SCR-03 | 403 | 403 | 403 | 403 | 403 | full | admin only; everyone else 403 | `SCR-03-admin.md` |
| SCR-04 | full | full | full | full | full | per role | shell for every role; items and locks per section 4; Yarbis FAB only analyst_creator + executive_integral; analysis tab bar "Configuración"/"Resultados" analyst only | `SCR-04-app-shell.md` |
| SCR-05 | full | full | full | full | full | per role | content differs: explorers published only, no Yarbis chat; executive_viewer via presentations only, "Ver todos ›" hidden; executive_integral published + invited previews | `SCR-05-inicio.md` |
| SCR-06 | full | read | read | 403 | read | per role | analyst all analyses + create; explorers published only (OQ-05); executive_integral published + invited previews; no create for non-analysts | `SCR-06-analisis.md` |
| SCR-07 | full | 403 | 403 | 403 | 403 | per role | "Configuración" tab hidden for non-analysts | `SCR-07-definicion.md` |
| SCR-08 | full | 403 | 403 | 403 | 403 | — | preparation space exclusive to the analyst; others consume SCR-09 | `SCR-08-resultados.md` |
| SCR-09 | full | read | read | 403 | read | — | analyst every lifecycle state + Publicar; executive_integral `vista_previa` when invited + `publicado`, comment + request change; explorers `publicado` only, no comments | `SCR-09-visualizacion.md` |
| SCR-10 | full | read | read | read | read | per role | executive_viewer only from a presentation (`origen=presentacion`), no composer; executive_integral comment + "Solicitar ajuste"; explorers no composer | `SCR-10-detalle-indicador.md` |
| SCR-11 | full | read | read | read | read | — | executive_integral save views, export, comment, Yarbis, no target editing / config; explorers save views + export, no comments; executive_viewer read-only, no saved views (OQ-06) | `SCR-11-monitor-valor.md` |
| SCR-12 | full | 403 | 403 | 403 | read | — | executive_integral simulates, sees suggestion and plan, no validate / save | `SCR-12-sensibilidades.md` |
| SCR-13 | full | 403 | read | read | read | — | non-analysts: published list + "Ver detalle" only; executive_integral may comment | `SCR-13-presentaciones.md` |
| SCR-14 | full | 403 | read | read | read | — | executive_viewer and explorer_integral view + download, no composer; executive_integral comment | `SCR-14-presentacion-detalle.md` |
| SCR-15 | full | full | full | full | full | per role | explorers / executive_viewer see notifications about content they can access | `SCR-15-notificaciones.md` |
| SCR-16 | full | full | full | full | full | per role | all controls functional for every role | `SCR-16-configuracion.md` |
| SCR-17 | full | full | full | full | full | — | same error pages for all roles | `SCR-17-error-pages.md` |

"—" in the admin column: the Source bullet does not mention the flag.

## 4. Sidebar items (SCR-04, 7 V2 items)

Locked = shown with 🔒 at opacity .5 and not clickable (`navigation[].isLocked` from the BFF); not hidden. Source:
`SCR-04-app-shell.md` (Role visibility table and Sections §2).

| # | Item (verbatim) | Target | analyst_creator | explorer_viewer | explorer_integral | executive_viewer | executive_integral |
|---|---|---|---|---|---|---|---|
| 1 | "Inicio" | `/inicio` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2 | "Ref. TBG I ILP" | `/analisis?ref=tbg-ilp` | ✓ (all) | ✓ published | ✓ published | 🔒 | ✓ published + invited previews |
| 3 | "Ref. Competitivo" | role-resolved (A-04 `navigation[].to`) | ✓ → Resultados | ✓ → Visualización | ✓ → Visualización | 🔒 | ✓ → Visualización |
| 4 | "Monitor de Valor" | `/monitor-valor` | ✓ | ✓ | ✓ | ✓ (OQ-06) | ✓ |
| 5 | "Presentaciones" | `/presentaciones` | ✓ | 🔒 | ✓ | ✓ | ✓ |
| 6 | "Notificaciones" | `/notificaciones` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7 | "Salir" | logout (`A-03`) → `/login` | ✓ | ✓ | ✓ | ✓ | ✓ |

No sidebar item exists for Análisis (OQ-01 default: none), Configuración (reached from the header avatar), Sensibilidades,
Definición, Resultados, Visualización, Detalle or Presentación detalle.

## 5. Open conflicts between SCR files

Each conflict is tracked in `docs/design/conflicts.md` (CF, resolved by the ADR-0001 precedence rules) or in
`docs/design/open-questions.md` (OQ, PO decision with a default) — P1-26d.

| # | Tracked as | Conflict | Files | What each says |
|---|---|---|---|---|
| NC-01 | CF-88 | Configuración is claimed as a sidebar item | `SCR-16-configuracion.md` vs `SCR-04-app-shell.md` | SCR-16 route bullet: "Sidebar active item: "Configuración""; SCR-04 lists exactly 7 items (no Configuración) and reaches `/configuracion` from the header avatar / name. |
| NC-02 | OQ-40 | Error pages inside or outside the shell | `SCR-17-error-pages.md` vs `SCR-04-app-shell.md` | SCR-17: "No sidebar (error pages bypass shell)", standalone page; SCR-04: SCR-17 "renders inside the shell when authenticated [inference]". |
| NC-03 | OQ-41 | Header title of the error pages | `SCR-17-error-pages.md` vs `SCR-04-app-shell.md` | SCR-17: header title "403" / "404" (i18n); SCR-04 title map (synthesis §1.20): any other screen id → fallback "BencHUD". |
| NC-04 | OQ-42 | Resultados for non-analysts: 403 or redirect | `SCR-08-resultados.md` vs `SCR-09-visualizacion.md` | SCR-08: other roles → `/403` **or** redirect to `/analisis/:analysisId/visualizacion` when published ("P1-21 decides"); SCR-09 denies executive_viewer (`/403`), so a redirect would land executive_viewer on another 403 and would bypass the "invited preview" rule for executive_integral. |
| NC-05 | CF-89 | One URL, two screens | `SCR-13-presentaciones.md` vs `SCR-14-presentacion-detalle.md` | SCR-13 owns `/analisis/:analysisId/presentaciones` (opens SCR-14 "when a presentation is linked", else the list); SCR-14 lists the same analysis tab as one of its own entry points — the route renders either screen depending on data. |
| NC-06 | CF-90 | Static segment vs id parameter | `SCR-13-presentaciones.md` vs `SCR-14-presentacion-detalle.md` | SCR-13 `/presentaciones/nueva?analysisId=` and SCR-14 `/presentaciones/:presentationId` share a pattern; `nueva` must rank above `:presentationId` and can never be a presentation id. |
| NC-07 | CF-91 | executive_integral on Sensibilidades vs the Monitor button | `SCR-12-sensibilidades.md` vs `SCR-11-monitor-valor.md` | SCR-12 grants executive_integral simulate access via `canSimulate`; SCR-11's executive_integral bullet does not list "Ir a Sensibilidades" (it is gated by `canOpenSensitivities`), and SCR-12 says the button is hidden only for explorers and executive_viewer. |
| NC-08 | OQ-43 | executive_viewer on Monitor de Valor | `SCR-11-monitor-valor.md` vs `SCR-04-app-shell.md` | SCR-11: executive_viewer "read-only … access itself pending OQ-06"; SCR-04 sidebar: "Monitor de Valor" ✓ for executive_viewer (OQ-06) — both depend on OQ-06, neither says what happens if the PO denies it (hide vs lock). |
| NC-09 | CF-92 | executive_viewer detail access | `SCR-10-detalle-indicador.md` vs `SCR-09-visualizacion.md` | SCR-10 allows executive_viewer only with `origen=presentacion`; SCR-09 denies executive_viewer, while SCR-10's default back target for a role is its "report screen", which for executive_viewer is a 403 route. |
| NC-10 | CF-93 | Admin flag on analysis screens | `SCR-08-resultados.md`, `SCR-09-visualizacion.md`, `SCR-11..14` vs `SCR-05..07`, `SCR-10`, `SCR-15`, `SCR-16` | The second group states "`hasAdminAccess` does not change this screen"; the first group is silent about the flag (matrix "—"). |
| NC-11 | CF-94 | Header-title and sidebar line citations | `SCR-15-notificaciones.md`, `SCR-16-configuracion.md` vs `SCR-05-inicio.md`, `SCR-04-app-shell.md` | SCR-15 / SCR-16 cite the header titles at HTML L5157 / L5158 and the sidebar rows at L3822–3834 / L3836–3848; the title map is at L5156 and those lines are the Ref. rows / role options (SCR-04). |
