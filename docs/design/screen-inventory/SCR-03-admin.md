## SCR-03 — Administración · Back office (placeholder)

> Spec inputs: `.plan/source-map/10-synthesis.md` §1.3, §1.19, §4 (`V-02`), §5 (CF-30, CF-39); `02-prototype-html.md` §2.1,
> §3 SCR-03. `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"`.
> Visible copy is quoted verbatim (es-CO) with its `HTML Lnnn` pointer; it ships through i18n keys.

- Source files:
  - `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` L125–157 (template), L5177 (`isAdmin: s.adminMode`), L5180–5181 (`enterAdmin`, `backToGate`), L5190 (`logout()`).
  - Handoff docs: `design_handoff_benchud_comparador\README.md` §3 (back office as future scope).
  - IA board `V2 _CUAN_ECO_Comparador 2\uploads\carpetas-1788888336424-euvv.jpg` ("board 09") lane G (administration).
  - No image of this screen exists in any folder, Paquete included (`03-reference-images.md` §1).
- Proposed route: `/admin` — guard: authenticated **and** `session.hasAdminAccess`; otherwise `/403` (SCR-17) [inference: 403 rather than silent redirect, because the URL is deep-linkable].
- Layout:
  - Standalone page (no app sidebar, no 4px header strip, no Yarbis FAB): `min-height:100vh`, bg `surface.page #F5F6F7` (HTML L126).
  - Top bar: white, bottom border `border.default #DFE2E6`, padding `18px 32px`, `justify-content:space-between` (HTML L127).
  - Body: `max-width:960px`, centred, padding 32, grid `repeat(auto-fill,minmax(260px,1fr))`, gap 16 (HTML L134) → 3 columns at 960px, reflows to 2/1.
- Tabs: n/a
- Sections:
  1. Top bar left (HTML L128–131): back link "‹ Volver" (HTML L129; `500 13px`, `brand.primary #672DBD`) + title "Administración · Back office" (HTML L130; `700 16px`, `text.heading #1C2535`).
  2. Top bar right: "Cerrar sesión" (HTML L132; `500 12px`, `text.secondary #59667C`).
  3. Module grid — 5 static cards (white, border `#DFE2E6`, radius 12, padding 20; title `600 14px`, description `400 12px text.muted #98A1B0`), in this order:
     - "Usuarios y roles" / "Gestiona analistas, ejecutivos y permisos de acceso por rol." (HTML L136–137)
     - "Fuentes de datos" / "Capital IQ, Bloomberg, Platts y fuentes internas — conexión y cobertura." (HTML L140–141)
     - "Compañías y pares" / "Catálogo de competidores disponibles por línea de negocio." (HTML L144–145)
     - "Parámetros del sistema" / "Plantillas de presentación, umbrales de homologación y alertas." (HTML L148–149)
     - "Auditoría" / "Historial de cambios, publicaciones y accesos a la herramienta." (HTML L152–153)
- Components:
  - `Cmp:PageTopBar` (standalone header for non-shell pages)
  - `Cmp:BackLink`
  - `Cmp:TextLink` (variant `secondary`, "Cerrar sesión")
  - `Cmp:AdminModuleCard` ×5 (variant `unavailable` in v1 — renders as `Cmp:Card` with a non-interactive body)
  - `Cmp:Badge` ("Próximamente") [inference: only if PO wants unavailability made explicit]
  - `Cmp:SectionResult` (loading / error wrapper for `V-02`)
- Charts: n/a
- Tables: n/a
- Filters & controls: n/a (no filters; no URL params).
- States:
  - Default (v1): 5 cards, all `isAvailable:false` → not clickable, no hover affordance (prototype cards have no handler — HTML L135–154).
  - Loading: 5 skeleton cards in the same grid while `V-02 admin-home` loads [inference].
  - Error: `Cmp:SectionResult` error with retry replacing the grid [inference].
  - No permission: `/403` (SCR-17) for users without `hasAdminAccess`.
  - Available card (future): hover border `brand.primary`, navigates to its sub-route [inference: out of v1 scope].
  - Empty / partial: n/a (fixed list of 5).
- Interactions:
  - "‹ Volver" → `/acceso` (SCR-02) — prototype `backToGate` resets `appEntered`/`adminMode` (HTML L129, L5181).
  - "Cerrar sesión" → `A-03 POST /api/v1/auth/logout` → `/login` (HTML L132, L5190).
  - Cards: no action in v1 (static placeholders). No modals, drawers or exports.
- Data fields:
  - `V-02 GET /api/v1/views/admin-home` → `cards[]{ id: 'users-roles' | 'data-sources' | 'companies-peers' | 'system-parameters' | 'audit', isAvailable: boolean }`; titles/descriptions come from i18n keyed by `id` [inference: ids are English slugs of the five titles].
  - Permissions from `A-04 session`: `hasAdminAccess`, `canManage*` flags (synthesis §4 `V-02`).
- Role visibility:
  - Admin only (`hasAdminAccess`), orthogonal to the five functional roles (§1.19 row "Admin (`hasAdminAccess`) — per flag").
  - Everyone else: 403.
- Open questions / assumptions:
  - Placeholder by design: the back-office modules are future scope (README §3, board 09 lane G); v1 ships only this landing page with every card unavailable.
  - CF-30: the prototype reaches this page only from the unreachable gate (`isGate:false`), so no user can open it there; here it is reachable from SCR-02 for admins.
  - CF-39 / OQ-06: admin flag source (Entra group name) and whether admins also need a functional role are pending PO confirmation.
  - [inference] Whether unavailable cards show a "Próximamente" badge or stay visually identical to the prototype — default: identical to the prototype (no badge).
  - [inference] Direct URL access by non-admins returns `/403` instead of redirecting to `/inicio` (differs from SCR-02, which redirects because it is an automatic post-login step).
