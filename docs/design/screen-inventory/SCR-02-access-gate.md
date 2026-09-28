## SCR-02 — ¿A dónde quieres ir? (Access gate)

> Spec inputs: `.plan/source-map/10-synthesis.md` §1.2, §1.19, §5 (CF-30, CF-41); `02-prototype-html.md` §2.1, §3 SCR-02;
> `06-uploads-png-batch-2.md` E8. `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"`.
> Visible copy is quoted verbatim (es-CO) with its `HTML Lnnn` pointer; it ships through i18n keys.

- Source files:
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` L96–123 (template), L5177 (`isGate: false` — hard-coded, gate unreachable in the prototype), L5179–5181 (`enterApp`, `enterAdmin`, `backToGate`), L5190 (`logout()`).
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-17 a la(s) 7.41.26 p.m..png"` (matches final; card bg sampled `#1A1133` ≈ `#1A1033`, border ≈`#2D1E4B` vs HTML `#3D2A63`).
  - Assets: `V2 _CUAN_ECO_Comparador 2\assets\login-bg.png`, `benchud-logo.png`.
  - Handoff docs: `design_handoff_benchud_comparador\README.md` §Screens 2 ("shown once after login"); `BACKEND.md` `accesoAdmin` flag.
  - No Paquete image exists for this screen (`03-reference-images.md` §1 "Screens with NO image").
- Proposed route: `/acceso` — guard: authenticated **and** `session.hasAdminAccess` (A-04); users without admin access are redirected to `/inicio` (CF-30). Reached automatically once after the OIDC callback when `session.requiresGate` is true.
- Layout:
  - Full-bleed `min-height:100vh`, `login-bg.png` cover + overlay `linear-gradient(160deg,rgba(20,10,48,.82) 40%,rgba(28,15,64,.7))` (HTML L97–99). No app shell, no Yarbis FAB.
  - Single centred column (`flex-direction:column; align-items:center; justify-content:center`), padding 40, gap 48 (HTML L97).
  - Cards row: `display:flex; gap:24px; flex-wrap:wrap; justify-content:center` (HTML L105) — wraps to a vertical stack on narrow viewports.
- Tabs: n/a
- Sections:
  1. Logo `benchud-logo.png` h36, alt "BencHUD" (HTML L100).
  2. Heading block (HTML L101–104): title "¿A dónde quieres ir?" (HTML L102; `700 22px #F8FAFC`) · subtitle "Elige un acceso para continuar" (HTML L103; `400 14px #C7BEDE`).
  3. Choice cards (HTML L105–120), each 280px, bg `dark.surface #1A1033`, border `dark.gateBorder #3D2A63`, radius 14, padding `32px 28px`, hover border `brand.indigo #5B5CC8`; 44px icon tile radius 10; title `700 16px #F8FAFC`; description `400 12px/1.5 #C7BEDE`:
     - Tile `brand.primary #672DBD` (grid icon) · "Ingresar a la herramienta" (HTML L110) / "Análisis, resultados, visualización y presentaciones de referenciamiento competitivo." (HTML L111).
     - Tile `dark.adminTile #334155` (gear icon) · "Administración" (HTML L117) / "Back office: usuarios, roles, fuentes de datos y parámetros del sistema." (HTML L118).
  4. Text link "Cerrar sesión" (HTML L121; `500 12px`, `brand.indigo #5B5CC8`).
- Components:
  - `Cmp:AuthLayout` (variant `gate`: 160° overlay; shared with SCR-01)
  - `Cmp:BrandLogo` (full variant, h36)
  - `Cmp:GateChoiceCard` ×2 (with `Cmp:IconTile`)
  - `Cmp:IconTile` (variants `primary` `#672DBD`, `slate` `#334155`, 44px)
  - `Cmp:TextLink` (variant `onDark`)
- Charts: n/a
- Tables: n/a
- Filters & controls: n/a (two navigation cards and one link; no URL params besides an optional pass-through `returnTo` from SCR-01 [inference]).
- States:
  - Default: both cards enabled, static copy (no data fetch beyond the already-loaded `A-04 session`).
  - Loading: while `A-04 session` resolves, a full-page neutral loader on the dark background [inference].
  - No permission: user without `hasAdminAccess` never sees it — route guard redirects to `/inicio`.
  - Logging out: "Cerrar sesión" disabled with `aria-busy` while `A-03` is in flight [inference].
  - Empty / error / partial: n/a (session errors are handled by the global 401 → SCR-01 redirect).
- Interactions:
  - Click / Enter / Space on "Ingresar a la herramienta" → `/inicio` (or `returnTo` if present) — prototype `enterApp` (HTML L106, L5179).
  - Click "Administración" → `/admin` (SCR-03) — prototype `enterAdmin` (HTML L113, L5180).
  - Click "Cerrar sesión" → `A-03 POST /api/v1/auth/logout` (CSRF) → `/login` — prototype `logout` (HTML L121, L5190).
  - Cards are `<button>`/link semantics with visible focus ring `:focus-visible 2px #47A4D5` (HTML L31) — the prototype uses `div onClick` (not keyboard accessible) [inference: a11y fix].
  - Shown once after login (README §Screens 2); later visits are reachable only by typing `/acceso` or via SCR-03 "‹ Volver" [inference].
- Data fields:
  - From `A-04 session`: `hasAdminAccess` (boolean), `requiresGate` (boolean), `user.displayName` (not displayed here).
  - No dedicated view-data contract.
- Role visibility:
  - Visible only to authenticated users whose `hasAdminAccess` flag is true ("Administración funcional", Entra group) — independent of the functional role (`analyst_creator`, `explorer_viewer`, `explorer_integral`, `executive_viewer`, `executive_integral`) per §1.19.
  - All other users: redirected to `/inicio`; they never see the gate.
- Open questions / assumptions:
  - CF-30: README shows the gate after every login; the V2 prototype hard-codes `isGate:false` (unreachable). Resolution: gate only when `hasAdminAccess` — no PO needed.
  - OQ-06: Entra group name for the admin flag is not defined (gk2 `VTI_VFV_*` is mock).
  - CF-41 / OQ-12: logo artwork reads "BenchHub"; alt text/product name "BencHUD".
  - [inference] Whether the gate should reappear on each new session or only on first login is unspecified; default = every new session for admin users (`requiresGate` decided by the BFF).
  - Border colour: capture samples ≈`#2D1E4B`; implement HTML `#3D2A63` (source precedence, synthesis §0.2).
