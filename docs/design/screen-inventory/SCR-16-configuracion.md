## SCR-16 — Configuración (header title "Configuración")

> Conventions: `HTML` = `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` (quote the path in shell; `Lnnn` = line number).
> Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not literally in `HTML`
> carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (reconciled by P1-17).
> Conflict ids (`CF-nn`), open questions (`OQ-nn`), endpoints (`V-nn`, `C-nn`) and overlays (`OVL-nn`) refer to
> `.plan/source-map/10-synthesis.md` §5, §8, §4 and §1.18.

- Source files:
  - Primary (precedence 1): `V2 _CUAN_ECO_Comparador 2/BencHUD.dc.html` template L2992–3014 (screen block `isConfig`; no image).
    Logic: user preferences stored in `StreamableLogic` state (`fontScale`, `highContrast`, `emailNotifications`).
  - Intent only (lose against `HTML`): README §13 `Configuración`; BACKEND Configuración contract.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.16 (L490–495), §1.18, §1.19; `02-prototype-html.md` §2 `SCR-16 Config`.
- Proposed route: `/configuracion`. Guard: authenticated (all 5 roles). No URL params. Sidebar active item: none —
  "Configuración" is not one of the 7 V2 sidebar items (SCR-04); the screen is reached from the header avatar / name (HTML
  L229, `goConfig` L5193; CF-88). Header title: "Configuración" (title map HTML L5156; CF-94).
- Layout:
  - Inside `Cmp:AppShell` (SCR-04: sidebar 220/68 px, 4px gradient strip + 64px header, content `padding:28px 32px 100px`,
    `overflow:auto`). No analysis tab bar on this screen (`showAnalysisTabs` only for definicion/resultados/presentaciones,
    HTML L3796).
  - Content root: single column, `gap:28px`, entry animation `fadeUp .3s ease` (HTML L2992; keyframes L29).
  - Profile card: `max-width:560px`, centered, `padding:24px`, `background:#fff`, `border:1px solid #DFE2E6`,
    `border-radius:12px`, `display:flex`, `align-items:center`, `gap:16px`. Avatar circle 52px `#672DBD` with "👤" SVG white
    center, role label "Analista creador" `600 14px`, "VP Tecnología e Innovación" `400 13px #98A1B0`.
  - Accessibility section: "Accesibilidad" eyebrow `600 11px #808A9B`, uppercase, `letter-spacing:.04em`, `margin-bottom:12px`.
    Font size controls: A- / **A** / A+ buttons (`500 14px`), selected `#672DBD`/white, unselected `#F5F6F7`/`#424E63`.
    High contrast switch: toggle with label "Alto contraste", active `#672DBD`, inactive `#DFE2E6`.
    Email notifications switch: toggle with label "Notificaciones por correo", active `#672DBD`, inactive `#DFE2E6`.
- Tabs: n/a
- Sections: top to bottom, one column.
  1. Profile card — centered, avatar circle with "👤", role label, department label.
  2. Accessibility section — "Accesibilidad" eyebrow + font size controls (A-/A/A+) + high contrast toggle + email notifications toggle.
- Components:
  - Shell (owned by SCR-04): `Cmp:AppShell`, `Cmp:SidebarNav`, `Cmp:AppHeader`.
  - `Cmp:ProfileCard` (avatar circle, role label, department label).
  - `Cmp:SectionHeader` (eyebrow title).
  - `Cmp:FontSizeControls` (A- / A / A+ buttons, selected state, font scale token multiplier).
  - `Cmp:ToggleSwitch` (high contrast, email notifications).
  - `Cmp:PreferenceLabel` (label text for toggles).
  - `Cmp:PreferenceError`, `Cmp:PreferenceSkeleton` [inference: required by the brief "States" field].
- Charts: n/a
- Tables: n/a
- Filters & controls:
  - Font size buttons: click to set `fontScale` (e.g., 0.875, 1, 1.125), persist to user preference. Selected button
    `#672DBD`/white (CF-15).
  - High contrast toggle: click to set `highContrast` boolean, apply OQ-20 theme switch. Save to user preference.
  - Email notifications toggle: click to set `emailNotifications` boolean, persist to user preference.
  - All controls are functional preferences (update token multiplier, apply theme, enable/disable email alerts).
- States:
  - Loading: skeleton profile card and controls [inference: `V-45` returns user preferences; no loading state in V2].
  - Empty: not applicable (profile and controls always visible).
  - Error: preference save fails → `Cmp:PreferenceError` with retry [inference: brief §5 preference independence].
  - Forbidden: not applicable at page level (all roles); individual controls returned as `forbidden` are disabled [inference].
  - Partial: any subset of preferences loaded successfully renders; failed fetch shows error state [inference].
- Interactions:
  - Font size button click → set `fontScale`, update root `--font-scale` token, persist to user preference.
  - High contrast toggle click → toggle `highContrast`, apply OQ-20 theme (dark/light inversion), persist to user preference.
  - Email notifications toggle click → toggle `emailNotifications`, enable/disable email alerts, persist to user preference.
  - Keyboard: focusable buttons/toggles with visible focus [inference: brief accessibility rules].
- Data fields: `V-45 GET /api/v1/views/user-settings`, `C-37 PATCH /api/v1/user-settings` (preferences). The V-45 contract
  groups them as `accessibility{fontScale, fontScaleOptions, highContrast}` + `emailNotifications`; font scale options follow
  OQ-20 (0.9 / 1 / 1.1).
  - `preferences`: `fontScale` (number, 0.875, 1, 1.125, ...), `highContrast` (boolean), `emailNotifications` (boolean).
- Role visibility: per §1.19 (CF-39/40).
  - analyst_creator: whole screen; all controls functional.
  - explorer_viewer / explorer_integral: whole screen; all controls functional.
  - executive_viewer: whole screen; all controls functional.
  - executive_integral: whole screen; all controls functional.
  - `hasAdminAccess` does not change this screen.
- Open questions / assumptions:
  - A1 — The profile card shows "Analista creador" and "VP Tecnología e Innovación" in the prototype. These are static
    examples; the BFF returns actual user role and department.
  - A2 — Font size tokens map to CSS `--font-scale` multiplier. Confirm with designer the exact scale values (0.875, 1, 1.125
    or more granular).
  - A3 — High contrast theme = OQ-20 (dark/light inversion). Confirm with designer the exact theme definition.
  - A4 — Email notifications toggle affects backend email service. Confirm with PO if opt-in/opt-out is per user or global.
  - A5 — Changes persist to user preference immediately (no "Save" button). Confirm with PO if undo functionality is needed
    (per spec, undo toast: bottom-center, 5 s, "Deshacer" `#83E377`).
  - A6 — Font size controls are mutually exclusive (one selected at a time). Confirm with PO if multiple selections should
    be prevented.
