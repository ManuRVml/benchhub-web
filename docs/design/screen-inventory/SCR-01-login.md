## SCR-01 — Iniciar sesión (Login)

> Spec inputs: `.plan/source-map/10-synthesis.md` §1.1, §1.19, §5 (CF-20, CF-29, CF-41); `02-prototype-html.md` §3 SCR-01;
> `03-reference-images.md` §3.1; `06-uploads-png-batch-2.md` E2. `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"`.
> Visible copy is quoted verbatim (es-CO) with its `HTML Lnnn` pointer; it ships through i18n keys, never hard-coded.

- Source files:
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` L37–94 (template), L5177–5178 (`isLogin`, `login()`), L5190 (`logout()`).
  - `"D:\Personal\Eco-Comparador\Paquete_de_Pantallas_24_08_2026\6_login.png"` (Display ICC profile: sample colours only after sRGB conversion; `03-reference-images.md` §3.1).
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\design_handoff_benchud_comparador\screenshots\01-01-login.png"` (V2 canonical, cropped below "Ingresar").
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\design_handoff_benchud_comparador\screenshots\01-login.png"` (degraded capture: broken images, fallback bg `#14082C`, alt texts "BencHUD" / "Ecopetrol").
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\uploads\Captura de pantalla 2026-09-09 a la(s) 7.09.42 p.m..png"` (superseded styling, copy retained — CF-20).
  - Assets: `V2 _CUAN_ECO_Comparador 2\assets\login-bg.png`, `benchud-logo.png`, `logo-ecopetrol.png` (byte-identical copies in `design_handoff_benchud_comparador\assets\`).
  - Handoff docs: `design_handoff_benchud_comparador\README.md` §Screens 1 (centred card, superseded — CF-29); `BACKEND.md` `POST /auth/login` (password flow, rejected — CF-29).
  - Master brief `prompt_Start_Eco.md` §4.1.9 (Entra ID OIDC via BFF token handler).
- Proposed route: `/login?returnTo=<relative path>` — public; an already-authenticated session is redirected to `/acceso` (if `hasAdminAccess`) or `returnTo` / `/inicio` [inference]. "Ingresar" navigates the browser to `A-01 GET /api/v1/auth/login?returnTo=&loginHint=` (full-page redirect to Entra ID, code + PKCE); the IdP returns to `A-02 GET /api/v1/auth/callback`.
- Layout:
  - Full-bleed page, `min-height:100vh`, bg `dark.bg #120823` + `login-bg.png` (`object-fit:cover`, `inset:0`) + overlay `linear-gradient(100deg,rgba(20,10,48,.72) 40%,rgba(28,15,64,.5))` (HTML L38–40). No app shell (no sidebar, no header strip, no Yarbis FAB).
  - Padding 64; centred grid `minmax(0,1fr) 420px`, gap 64, `align-items:center`, `max-width:1240px` (HTML L41).
  - Left column = marketing/hero; right column = 420px login card + footer line under it.
  - Below the minimum width (OQ-16: ≥1280 full, 1024 collapsed, 768 best-effort) the grid stacks to one column, card first [inference: no responsive rule in prototype].
- Tabs: n/a
- Sections:
  1. Left · brand row (HTML L44–47): `benchud-logo.png` (h33 × w212, alt "BencHUD") | 1px × 28px divider `rgba(255,255,255,.25)` | `logo-ecopetrol.png` (h36, alt "Ecopetrol"). Logo artwork reads "BenchHub"; product text stays "BencHUD" (CF-41, OQ-12).
  2. Left · eyebrow "Comparador financiero" (HTML L48; `600 13px`, ls .03em, `ai.accent #49BCD8`).
  3. Left · H1 "Inteligencia financiera para decisiones estratégicas" (HTML L49; `display.login 700 44px/1.18`, white).
  4. Left · body "Plataforma corporativa de análisis y comparación financiera. Evalúa el desempeño de Ecopetrol frente a referentes del sector, construye reportes ejecutivos y consolida hallazgos estratégicos en un solo entorno." (HTML L50; `400 16px/1.6 #C7BEDE`, max-width 480).
  5. Left · three feature rows (HTML L51–70; icon tile 36px radius 9, bg `rgba(73,188,216,.18)`, border `rgba(73,188,216,.35)`, cyan stroke icons; title `600 14px #fff`, subtitle `400 13px #B3A6CE`):
     - trend icon · "Desempeño comparativo" / "Benchmarking frente a pares del sector energético" (HTML L56)
     - bars icon · "Referentes estratégicos" / "Indicadores financieros y de sostenibilidad" (HTML L62)
     - clock icon · "Generación de valor" / "Análisis de creación de valor y retorno al accionista" (HTML L68)
  6. Right · glass card (HTML L74; bg `rgba(255,255,255,.03)`, `backdrop-filter:blur(10px)`, border `rgba(255,255,255,.12)`, radius 16, padding 36, shadow `0 24px 60px rgba(0,0,0,.35)`):
     - 52px user tile `brand.indigo #5B5CC8`, radius 12, centred (HTML L75–77).
     - Title "Iniciar sesión" (HTML L78; `700 22px`, centred) · subtitle "Acceso mediante Directorio Activo corporativo" (HTML L79; `400 13px #C7BEDE`).
     - Label "Usuario o correo corporativo" (HTML L80) + text input, placeholder "usuario@ecopetrol.com.co" (HTML L82).
     - Label "Contraseña" + password input, placeholder "••••••••" (HTML L82–83; `type=password`, `autocomplete=current-password`). Restored by the owner decision of 2026-09-28 (CF-29). Username field margin 16, password field margin 22 before the button.
     - Primary button "Ingresar" (HTML L84), full width, `gradient.loginCta linear-gradient(90deg,#5B5CC8,#49BCD8)`, `600 15px`, radius 9, hover opacity .9.
     - Info callout (HTML L85–88; bg `rgba(255,255,255,.06)`, border `rgba(255,255,255,.14)`, radius 10, cyan ⓘ): "El acceso se autentica mediante el **Directorio Activo** de Ecopetrol. El perfil y los permisos se asignan automáticamente según tu identidad corporativa." (HTML L87; "Directorio Activo" in `<strong>` white).
  7. Right · footer "Acceso corporativo · Ecopetrol S.A. · Uso interno" (HTML L90; `400 12px #B3A6CE`, centred, margin-top 18).
- Components:
  - `Cmp:AuthLayout` (full-bleed dark background + image + overlay; shared with SCR-02)
  - `Cmp:BrandLogoRow` (BencHUD logo | divider | Ecopetrol logo)
  - `Cmp:LoginHero` (eyebrow + H1 + body)
  - `Cmp:FeatureRow` ×3 (with `Cmp:IconTile`)
  - `Cmp:GlassCard`
  - `Cmp:IconTile` (variant `indigo`, 52px)
  - `Cmp:TextField` (variant `onDark`; label + input)
  - `Cmp:Button` (variant `gradient`, full width, with loading state)
  - `Cmp:InfoCallout` (variant `onDark`)
  - `Cmp:AlertBanner` (variant `danger`, onDark — error state only) [inference]
- Charts: n/a
- Tables: n/a
- Filters & controls:
  - Username / corporate email text input: free text, default empty; trimmed and sent with the password in the JSON body of A-05 `POST /api/v1/auth/password-login`; **not** kept in the URL of `/login` and never persisted client-side [inference].
  - `returnTo` query param (URL): relative in-app path only (open-redirect guard in BFF); default `/inicio`.
  - Password input (HTML L83): sent only in the A-05 request body, never in a URL, never persisted. No "remember me", no "forgot password" (none in any source).
- States:
  - Default: form idle, "Ingresar" enabled even with empty username (prototype has no validation — HTML L84, `02-prototype-html.md` SCR-01 "Behavior").
  - Submitting: button shows a spinner / `aria-busy` and is disabled while A-05 runs and while the browser leaves for the landing route [inference].
  - Wrong credentials: A-05 answers 401 `INVALID_CREDENTIALS` (or 400 for a malformed body) → inline `Cmp:AlertBanner` "Usuario o contraseña incorrectos." (never says which field was wrong) [inference].
  - Error after failed callback: `/login?error=<code>` → `Cmp:AlertBanner` above the username field with an i18n message per code (`access_denied`, `session_expired`, `idp_error`, generic) [inference: not in prototype; synthesis §1.1].
  - Session expired (401 anywhere in the app) → redirect here with `returnTo` of the current route and `error=session_expired` [inference].
  - Image failure: solid fallback bg (`#14082C` seen in `01-login.png`), logos degrade to alt text "BencHUD" / "Ecopetrol".
  - Loading / empty / partial: n/a (static screen, no data fetch).
- Interactions:
  - Click "Ingresar" (or Enter in a field) → A-05 `POST /api/v1/auth/password-login` `{ username, password }` (mock BFF, one hard-coded pair; owner decision 2026-09-28) → session cookie → full-page navigation to `/acceso` when the session has `hasAdminAccess`, else to `returnTo` or `/inicio`, where the app loads A-04. Production target (unchanged): A-01 → Entra ID → A-02 callback (synthesis §1.1; CF-30).
  - Prototype behaviour for reference only: any click logs in and jumps straight to Inicio (`login()` HTML L5178; `appEntered:true`).
  - No modals, drawers or exports.
- Data fields:
  - `username`: string (email), trimmed; `password`: string (1..128), both in the A-05 body [inference].
  - `returnTo`: string, relative path.
  - `error`: enum code (query param) → i18n message.
  - Contract: A-05 (docs/design/view-data-contracts/A-05-password-login.md); static copy via i18n.
- Role visibility: Public — every visitor sees the same screen; roles are resolved only after the callback (`A-04 GET /api/v1/session`). Authenticated users do not see it (redirect) [inference].
- Open questions / assumptions:
  - CF-29 (owner decision 2026-09-28): the prototype's "Contraseña" field (HTML L82–83) is rendered and posted to the mock-only A-05 with one hard-coded credential pair; production auth stays OIDC via the BFF token handler (A-01/A-02).
  - OQ-17: Entra tenant / app registration not provided — a mock IdP is used until then.
  - CF-20: earlier iteration (`Captura de pantalla 2026-09-09 a la(s) 7.09.42 p.m..png`: shield icon, fuchsia `#C027D3` button, uppercase labels) is superseded by HTML L37–94; copy identical.
  - CF-41 / OQ-12: logo artwork says "BenchHub"; text and alt say "BencHUD".
  - [inference] Error-state copy, submitting state, stacked narrow layout and authenticated-user redirect are not in any source.
  - Glass-card colours sampled from `6_login.png` (≈`#22163E` card, `#382B50` input, `#302448` info box) are the rendered result of the translucent HTML values; implement the HTML rgba values, not the samples.
