# Component catalog

> Brief §4 Fase 1 item 1.3 (P1-17). Atomic catalogue of the web SPA: **primitives → composites → charts → layout →
> page-level widgets**. Every canonical component has English name, variants, sizes, states, typed minimal props (ISP),
> tokens (paths in `docs/design/design-tokens.json`), accessibility notes (Radix UI primitive where one applies — brief
> §2 "Primitivas accesibles: Radix UI + Tailwind"), the screens where it appears and the `Cmp:` tags of the screen
> inventories (`docs/design/screen-inventory/*.md`) that it unifies ("Aliases"). The mapping table at the end covers every
> tag and is verified by `node tools/check-component-catalog.mjs`.
>
> Conventions: props are TypeScript shapes (`RouteHref`, `IconName`, `ColorToken`, `UnitCode`, `AnalysisStatus`,
> `SectionResult<T>` come from `src/shared`); visible copy is never a prop default — it arrives through i18n keys; numbers
> arrive raw and are formatted es-CO by the shared formatters (ADR-0008). Components live in `src/shared/ui/*` (primitives,
> composites, layout) and `src/widgets/*` (page-level widgets); **charts** follow ADR-0003: ECharts wrappers only under
> `src/shared/ui/charts/` (`Heatmap`, `RadarChart`, `DonutChart`, `GroupedBarChart`) and plain `<div>` primitives for bar
> lists (`HorizontalBarList`, `PairedBarRow`, `StackedBar`, `ProgressBar`); every chart exposes `role="img"`, an
> `aria-label`, `data-testid`, `data-series-count` and an alternate data table. Icons follow ADR-0006.
> States legend: hover / focus / active / disabled / loading / empty / error; `n/a` when the component has none.

Canonical components: **92** (Primitives: 23 · Composites: 29 · Charts (ADR-0003): 8 · Layout: 5 · Page-level widgets: 27). Inventory tags mapped: **210** (209 components + 1 placeholder).

## 1. Primitives

### Button

Action trigger; every filled / outline / icon-only button in the app.

- Variants: `primary` (brand fill) · `secondary` (outline, white) · `success` ("Generar vista de reporte") · `danger` (destructive confirm) · `ghost` (text-only) · `icon` (36px round icon-only: header bell / help, slide nav) · `gradient` (login "Ingresar")
- Sizes: `sm` (8px 12px, 12px text) · `md` (9–10px 16px, 13px) · `lg` (11px 20px, 13px; footer / login full width)
- States: hover (darken / `border.default` → `text.secondary`), focus (2px ring `focus.color`), active, disabled (opacity .5, no pointer), loading (spinner + `aria-busy`, label kept), empty n/a, error n/a
- Props: `{ variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "icon" | "gradient"; size?: "sm" | "md" | "lg"; icon?: IconName; iconPosition?: "start" | "end"; loading?: boolean; disabled?: boolean; fullWidth?: boolean; type?: "button" | "submit"; onClick?: () => void; children?: ReactNode; "aria-label"?: string }`
- Tokens: `brand.primary`, `status.success.base`, `status.danger.base`, `surface.card`, `border.default`, `text.secondary`, `radius.control`, `radius.pill`, `gradient.loginCta`, `focus.color`, `focus.width`, `font.role.label`
- Accessibility: Native `<button>`; icon-only requires `aria-label`; loading sets `aria-busy="true"` and keeps focus. No Radix primitive needed (Radix `Slot` for `asChild` links).
- Screens: SCR-01, SCR-04, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14
- Aliases: `Cmp:Button`, `Cmp:IconButton`
- Implemented: `src/shared/ui/primitives/button/Button.tsx`

### TextLink

Inline or standalone navigation / action text ("Ver todos ›", "‹ Volver", "Limpiar filtros", company names that open a profile).

- Variants: `default` (brand) · `back` (leading "‹") · `forward` (trailing "›") · `danger` ("Eliminar este perfil") · `muted` · `onDark` (login / gate)
- Sizes: `sm` (11–12px) · `md` (13px)
- States: hover (`text.linkHover` / underline), focus ring, active, disabled (muted, no pointer), loading n/a, empty n/a, error n/a
- Props: `{ variant?: "default" | "back" | "forward" | "danger" | "muted" | "onDark"; size?: "sm" | "md"; to?: RouteHref; onClick?: () => void; disabled?: boolean; children: ReactNode }`
- Tokens: `text.link`, `text.linkHover`, `status.danger.text`, `text.muted`, `brand.indigo`, `font.role.smallMedium`, `focus.color`
- Accessibility: Renders `<a>` (react-router `Link`) when `to` is set, `<button>` otherwise; back links announce the destination ("Volver a Resultados").
- Screens: SCR-02, SCR-03, SCR-05, SCR-06, SCR-08, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14, SCR-17
- Aliases: `Cmp:TextLink`, `Cmp:LinkButton`, `Cmp:BackLink`, `Cmp:BackButton`, `Cmp:CompanyNameButton`

### Chip

Small pill used as a static tag or as a selectable / toggleable option.

- Variants: `static` (read-only: sources, selected companies) · `choice` (single-select member) · `toggle` (multi-select member, check mark) · `segment` (on/off filter toggle, radius 8, brand fill when on, no check mark; size `toggle` = 5px 11px; SCR-15 severity) · `soft` (light toggle: `brand.primarySubtle` fill + `brand.primary` text when on, `surface.page` when off; SCR-13 chart options, Portada / Cierre) · `option` (SCR-07 wizard option: 8px radius, lilac `brand.primarySubtle` fill + `brand.primaryBorder` outline when selected, no check mark; ChipGroup `appearance="option"`) · `filter` (removable "✕") · `suggestion` (AI chat suggestion) · `estimate` ("Real" / "Estimado" toggle) · `indicator` (label + code) · `dashed` ("+ Nuevo perfil")
- Sizes: `sm` (2–4px 8–10px, 10–11px) · `md` (6–7px 12–14px, 12px) · `toggle` (5px 11px, 12px / 500) · `option` (9px 14px, 12px / 500)
- States: hover (`border.default` → `brand.primaryBorder`), focus ring, active/selected (`brand.primary` fill + inverse text), disabled (`text.muted`, no pointer), loading n/a, empty n/a, error n/a
- Props: `{ variant?: "static" | "choice" | "toggle" | "option" | "filter" | "suggestion" | "estimate" | "indicator" | "dashed"; size?: "sm" | "md" | "option"; selected?: boolean; disabled?: boolean; leadingDot?: ColorToken; code?: string; onToggle?: () => void; onRemove?: () => void; children: ReactNode }`
- Tokens: `brand.primary`, `brand.primarySubtle`, `brand.primaryBorder`, `surface.page`, `text.secondary`, `text.inverse`, `status.success.bg`, `status.success.text`, `status.warning.bg`, `status.warning.text`, `radius.control`, `radius.pill`, `font.role.smallMedium`
- Accessibility: Selectable chips are Radix `Toggle` (`aria-pressed`) or members of a `ToggleGroup` / `RadioGroup` (see ChipGroup); static chips are plain text.
- Screens: SCR-04, SCR-07, SCR-08, SCR-11, SCR-13
- Aliases: `Cmp:StaticChip`, `Cmp:ChoiceChip`, `Cmp:ToggleChip`, `Cmp:FilterChip`, `Cmp:SuggestionChip`, `Cmp:EstimateToggleChip`, `Cmp:IndicatorPill`

### Badge

Non-interactive status / count / code pill. Unifies every status chip of the prototype.

- Variants: `status` (Publicado · En revisión · Borrador · En construcción · Completa · Requiere revisión · Incompleta · Faltante · lifecycle) · `tier` (Líder · Estratégico · Seguimiento · Prioritario) · `severity` (Info · OK · Atención · Crítico) · `urgency` (Alta · Media) · `commentStatus` (Pendiente · En análisis · Resuelto) · `horizon` (TBG · ILP) · `count` (red notification count; `countTone: "brand"` brand-light "{n} diapositivas" pill, `countTone: "neutral"` grey count pill) · `code` (mono `IND-…`, `LIN-01`) · `delta` (signed variation pill) · `highlight` (Ecopetrol chip `#EAFBE4`) · `soon` ("Próximamente")
- Sizes: `xs` (2px 8px, 10px) · `sm` (3–4px 9–10px, 11px) · `count` (min 18×18, 10px bold) · `dot` (8px collapsed-sidebar dot)
- States: hover n/a, focus n/a, active n/a, disabled n/a, loading n/a, empty (hidden when count = 0), error n/a
- Props: `{ kind: "status" | "tier" | "severity" | "urgency" | "commentStatus" | "horizon" | "count" | "code" | "delta" | "highlight" | "soon"; tone?: "success" | "warning" | "danger" | "info" | "neutral" | "brand"; value: string | number; size?: "xs" | "sm" | "count" | "dot" }`
- Tokens: `status.success.bg`, `status.success.text`, `status.warning.bg`, `status.warning.text`, `status.danger.bg`, `status.danger.text`, `status.danger.base`, `tier.1.base`, `tier.2.base`, `tier.3.base`, `tier.4.base`, `severity.info.base`, `urgency.high.bg`, `urgency.medium.bg`, `chart.ecoChip.bg`, `chart.ecoChip.text`, `surface.page`, `text.muted`, `font.family.mono`, `radius.pill`
- Accessibility: Plain `<span>`; colour is never the only signal (text always present); `count` has `aria-label="{n} sin leer"`.
- Screens: SCR-03, SCR-04, SCR-05, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-15
- Aliases: `Cmp:Badge`, `Cmp:StatusChip`, `Cmp:StatusBadge`, `Cmp:TierChip`, `Cmp:SeverityTag`, `Cmp:CommentStatusChip`, `Cmp:HorizonBadge`, `Cmp:CountBadge`, `Cmp:NotificationBadge`, `Cmp:CodeTag`, `Cmp:DeltaPill`, `Cmp:EcopetrolChip`

### StatusDot

Small filled circle carrying a tier / status colour next to a label.

- Variants: `tier` (1–4) · `status` · `legend` (square 8–9px, radius 2)
- Sizes: 6px · 7px · 8px · 9px
- States: n/a (static)
- Props: `{ tone: "tier1" | "tier2" | "tier3" | "tier4" | "success" | "warning" | "danger" | "neutral"; shape?: "circle" | "square"; size?: 6 | 7 | 8 | 9 }`
- Tokens: `tier.1.base`, `tier.2.base`, `tier.3.base`, `tier.4.base`, `radius.legend`
- Accessibility: `aria-hidden="true"`; the adjacent text carries the meaning.
- Screens: SCR-08
- Aliases: `Cmp:TierDot`

### Icon

Inline 20×20 stroke SVG (ADR-0006); includes semantic icons (trend arrows, notification types, 403 / 404).

- Variants: `stroke` (default, 1.6–1.8) · `trendUp` / `trendDown` · `notification` (Dato · Comentario · Publicación · Yarbis · Noticia · Cola) · `error` (lock 403, exclamation 404) · `sparkle` (✦ AI mark)
- Sizes: 14 · 16 · 20 (default) · 64 (error page circle)
- States: n/a (inherits colour); disabled via parent opacity
- Props: `{ name: IconName; size?: 14 | 16 | 20 | 64; color?: ColorToken; title?: string }`
- Tokens: `size.icon.default`, `size.stroke.icon`, `size.stroke.iconStrong`, `variation.positive`, `variation.negative`, `ai.accent`
- Accessibility: Decorative icons `aria-hidden`; meaningful icons get `role="img"` + `<title>`.
- Screens: SCR-05, SCR-15, SCR-17
- Aliases: `Cmp:ErrorIcon`, `Cmp:NotificationIcon`, `Cmp:TrendArrow`

### IconTile

Rounded square holding an icon (login features, gate cards, admin cards).

- Variants: `brand` (`brand.primary`) · `dark` (`dark.adminTile`) · `glass` (login feature)
- Sizes: 32 · 40 · 44
- States: n/a (static)
- Props: `{ icon: IconName; tone?: "brand" | "dark" | "glass"; size?: 32 | 40 | 44 }`
- Tokens: `brand.primary`, `dark.adminTile`, `dark.glassCard`, `radius.md`
- Accessibility: `aria-hidden`; the card title names the action.
- Screens: SCR-01, SCR-02
- Aliases: `Cmp:IconTile`

### Avatar

Person photo or company initials on a colour; optional label (header user chip).

- Variants: `photo` (user avatar) · `initials` (company chip, 2 letters on `company.*` colour) · `rank` (ranking avatar: leader / Ecopetrol / other) · `withLabel` (avatar + display name button)
- Sizes: 24 (company, radius 6) · 36 (header) · 48 (profile) · 52 (`xl`, SCR-16 settings profile, `size.avatar.xl`)
- Tones (initials fill): `subtle` (default, lilac `brand.primarySubtle`) · `brand` (white on `brand.primary`, SCR-16)
- States: hover (withLabel: `brand.primary` text), focus ring (withLabel), active n/a, disabled n/a, loading (initials fallback), empty (initials fallback when no photo), error (initials fallback)
- Props: `{ kind: "photo" | "initials" | "rank"; src?: string; initials?: string; colorKey?: ColorToken; label?: string; size?: 24 | 36 | 48; onClick?: () => void }`
- Tokens: `company.fallback`, `text.inverse`, `text.body`, `chart.leader.avatar`, `chart.ecopetrol`, `brand.primarySubtle`, `radius.sm`, `radius.pill`
- Accessibility: Photo has `alt`; initials `aria-hidden` next to the visible name; `withLabel` is a Radix `DropdownMenu` / link trigger to /configuracion.
- Screens: SCR-04, SCR-05, SCR-08
- Aliases: `Cmp:Avatar`, `Cmp:CompanyInitialsChip`, `Cmp:UserChip`
- Implemented: `src/shared/ui/composites/avatar/Avatar.tsx`

### InfoButton

The blue "i" circle that toggles an inline InfoPanel or opens a profile.

- Variants: `toggle` (inline panel) · `popover` (legend formula) · `profile` (opens OVL-13) · `mid` (`info.mid` colour on the composition card)
- Sizes: 14 · 15 · 16
- States: hover (darker), focus ring, active/expanded (`aria-expanded="true"`), disabled n/a, loading n/a, empty n/a, error n/a
- Props: `{ expanded?: boolean; onToggle: () => void; controls?: string; size?: 14 | 15 | 16; tone?: "icon" | "mid"; "aria-label": string }`
- Tokens: `info.icon`, `info.mid`, `text.inverse`, `size.icon.info`, `radius.pill`, `focus.color`
- Accessibility: `<button aria-expanded aria-controls>`; click-toggle, not hover (CF-61); one open per group.
- Screens: SCR-05, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13
- Aliases: `Cmp:InfoToggleButton`, `Cmp:InfoToggle`, `Cmp:InfoIconButton`
- Implemented: `src/shared/ui/composites/section-card/InfoToggle.tsx`

### TextField

Single-line text input incl. search and date fields.

- Variants: `text` · `search` (leading icon, clear) · `date` (native date / ISO) · `onDark` (login) · `dashedEstimate` (estimate justification, amber dashed)
- Sizes: `sm` (5–6px 8–10px, 11–12px) · `md` (9px 12–14px, 13px) · `lg` (login, 44px)
- States: hover (`border.default` darker), focus (ring `focus.color`), active n/a, disabled (`surface.page` bg), loading n/a, empty (placeholder `text.muted`), error (`status.danger.base` border + message)
- Props: `{ type?: "text" | "password" | "search" | "date"; value: string; onChange: (v: string) => void; placeholder?: string; label?: string; error?: string; disabled?: boolean; variant?: "default" | "onDark" | "dashedEstimate" }`
- Tokens: `border.default`, `surface.card`, `surface.page`, `text.body`, `text.muted`, `status.danger.base`, `status.warning.base`, `status.warning.estimateInputBg`, `dark.inputBg`, `dark.inputBorder`, `radius.control`, `focus.color`
- Accessibility: Visible or `aria-label` label; error via `aria-describedby` + `aria-invalid`.
- Screens: SCR-01, SCR-06, SCR-07, SCR-08, SCR-09, SCR-11, SCR-13, SCR-15
- Aliases: `Cmp:TextField`, `Cmp:SearchInput`, `Cmp:DateField`, `Cmp:DateInput`

### NumberInput

Editable numeric value (mono) with optional unit suffix; used for every editable indicator / weight value.

- Variants: `default` · `highlight` (Ecopetrol value, amber / green border) · `missing` (empty = null)
- Sizes: `sm` (width 64) · `md` (width 72–78)
- States: hover, focus ring, active n/a, disabled/read-only (text only), loading (saving indicator in parent), empty (null → empty, never 0 — CF-37), error (out of range → danger border)
- Props: `{ value: number | null; onChange: (v: number | null) => void; step?: number; min?: number; max?: number; unit?: UnitCode; readOnly?: boolean; "aria-label": string }`
- Tokens: `font.role.monoInput`, `border.default`, `text.heading`, `text.secondary`, `status.danger.base`, `radius.sm`
- Accessibility: `<input type="number" inputMode="decimal">` with `aria-label` naming indicator + company; es-CO parsing of "7,4".
- Screens: SCR-08, SCR-11
- Aliases: `Cmp:NumberInput`
- Implemented: `src/shared/ui/primitives/inputs/NumberInput.tsx`

### TextArea

Multi-line input (objective / question, comments, slide notes, KVI notes).

- Variants: `default` · `compact` (comment composer, min-height 48)
- Sizes: `sm` · `md`
- States: hover, focus ring, active n/a, disabled, loading (AI drafting "✦ Yarbis está redactando…" overlay), empty (placeholder), error (danger border + message)
- Props: `{ value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number; disabled?: boolean; error?: string; "aria-label"?: string }`
- Tokens: `border.default`, `text.body`, `text.muted`, `radius.control`, `focus.color`
- Accessibility: Labelled; character limits announced via `aria-describedby`.
- Screens: SCR-07, SCR-11, SCR-13
- Aliases: `Cmp:TextArea`

### FieldLabel

Form label / eyebrow above a field or a preference toggle.

- Variants: `eyebrow` (uppercase 11px `text.eyebrow`) · `default` (13px) · `onDark`
- Sizes: 11px · 12px · 13px
- States: n/a; disabled (muted)
- Props: `{ htmlFor?: string; variant?: "eyebrow" | "default" | "onDark"; required?: boolean; children: ReactNode }`; on the input primitives the `labelVariant` prop (`"default"` | `"eyebrow"`, `FIELD_LABEL_CLASS` in `src/shared/ui/primitives/inputs/field.tsx`)
- Tokens: `text.eyebrow`, `text.body`, `text.onDark.caption`, `font.role.eyebrow`, `font.letterSpacing.eyebrow`
- Accessibility: Radix `Label` bound to the control.
- Screens: SCR-07, SCR-16
- Aliases: `Cmp:FieldLabel`, `Cmp:PreferenceLabel`

### Select

Dropdown single-select (quarter / year, list filters, comparator selects, add-company).

- Variants: `default` · `filter` (first option = "todos" label) · `compact` (add-company tile)
- Sizes: `sm` (5px 6px, 11px) · `md` (9px 12px, 13px)
- States: hover, focus ring, active/open, disabled, loading (options loading), empty (only the "all" option), error n/a
- Props: `{ value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; allLabel?: string; placeholder?: string; disabled?: boolean; "aria-label": string }`
- Tokens: `border.default`, `text.body`, `surface.card`, `radius.control`, `focus.color`
- Accessibility: Radix `Select` (keyboard, typeahead) or native `<select>` for simple filters.
- Screens: SCR-06, SCR-07, SCR-08, SCR-11
- Aliases: `Cmp:Select`, `Cmp:SelectFilter`

### Checkbox

Single checkbox row (presentation module selector, indicator selection).

- Variants: `default` · `withCount` ("{on}/{total} gráficas")
- Sizes: 16 · 18
- States: hover, focus ring, checked, indeterminate (group partially selected), disabled, loading n/a, empty n/a, error n/a
- Props: `{ checked: boolean | "indeterminate"; onCheckedChange: (v: boolean) => void; label: ReactNode; count?: string; disabled?: boolean }`
- Tokens: `brand.primary`, `border.default`, `text.body`, `radius.xs`
- Accessibility: Radix `Checkbox` + `Label`.
- Screens: SCR-13
- Aliases: `Cmp:Checkbox`, `Cmp:ModuleSelectorRow`

### CheckboxGroup

List of checkboxes with optional "select all" (KVI candidates, monitor companies, wizard indicator groups).

- Variants: `list` · `withSelectAll`
- Sizes: rows 32–36px
- States: hover row, focus, all / some / none selected, disabled rows, loading (skeleton rows), empty (muted note), error n/a
- Props: `{ items: Array<{ id: string; label: string; checked: boolean; disabled?: boolean }>; onChange: (ids: string[]) => void; selectAllLabel?: string }`
- Tokens: `brand.primary`, `border.subtle`, `text.body`
- Accessibility: `role="group"` with `aria-labelledby`; select-all uses indeterminate state.
- Screens: SCR-07, SCR-11
- Aliases: `Cmp:CheckboxList`, `Cmp:CompanyToggleList`, `Cmp:SelectAllToggle`

### Switch

On / off preference toggle (Configuración).

- Variants: `default` (tone `brand`), tone `success` (SCR-16 prototype on-colour #10B981)
- Sizes: 36×20
- States: hover, focus ring, checked (`brand.primary`, or `status.success.base` with tone `success`), disabled, loading (saving), empty n/a, error (revert + toast)
- Props: `{ checked: boolean; onCheckedChange: (v: boolean) => void; label: string; disabled?: boolean; tone?: 'brand' | 'success' }`
- Tokens: `brand.primary`, `status.success.base`, `border.default`, `surface.card`
- Accessibility: Radix `Switch` (`role="switch"`, `aria-checked`).
- Screens: SCR-16
- Aliases: `Cmp:ToggleSwitch`
- Implemented: `src/shared/ui/primitives/inputs/Switch.tsx`

### SliderField

Labelled range slider with formatted value, optional number box and linked-variable line.

- Variants: `lever` (label + value + unit + linked "↳" line) · `weightRow` (label | 160px slider | value) · `withNumberBox` (profiles weights)
- Sizes: full width · 160px
- States: hover, focus (thumb ring), active drag, disabled, loading (pending server evaluation), empty n/a, error (out-of-range revert)
- Props: `{ label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: UnitCode; linked?: { label: string; value: number; unit?: UnitCode }; showNumberBox?: boolean; valueTone?: "brand" | "success" | "warning" | "danger" }`
- Tokens: `brand.primary`, `chart.track`, `text.body`, `status.success.text`, `status.warning.text`, `status.danger.text`, `font.role.monoInput`
- Accessibility: Radix `Slider` (`aria-valuenow/min/max`, `aria-valuetext` with unit); themed thumb (OQ-11).
- Screens: SCR-08, SCR-12
- Aliases: `Cmp:LeverSlider`, `Cmp:WeightSliderRow`

### ProgressBar

Thin horizontal progress / coverage bar (div primitive, ADR-0003).

- Variants: `coverage` (tone from thresholds 90 / 70) · `gapClosed` · `categoryTotal` · `winRatio` (80×6) · `operation` (determinate %)
- Sizes: 5px · 6px · 8px
- States: n/a interactive; loading (indeterminate for operations), empty (0 width), error (danger tone)
- Props: `{ value: number; max?: number; tone?: "success" | "warning" | "danger" | "brand" | "highlight"; height?: 5 | 6 | 8; "aria-label": string }`
- Tokens: `status.success.base`, `status.warning.base`, `status.danger.base`, `chart.highlight`, `chart.track`, `radius.pill`, `motion.duration.progress`
- Accessibility: Radix `Progress` (`role="progressbar"`, `aria-valuenow`).
- Screens: SCR-08, SCR-12
- Aliases: `Cmp:ProgressBar`

### Skeleton

Loading placeholder shaped like the final content (block, table rows, cards, error page).

- Variants: `block` · `table` (header + n rows) · `card` · `list` (notification rows) · `form` (preferences) · `page` (error page)
- Sizes: matches the replaced content
- States: loading only (pulse disabled with `prefers-reduced-motion`)
- Props: `{ shape: "block" | "table" | "card" | "list" | "form" | "page"; rows?: number; height?: number }`
- Tokens: `surface.page`, `border.subtle`, `radius.card`
- Accessibility: Container `aria-busy="true"` + visually-hidden "Cargando…".
- Screens: SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-15, SCR-16, SCR-17
- Aliases: `Cmp:SectionSkeleton`, `Cmp:TableSkeleton`, `Cmp:NotificationSkeleton`, `Cmp:PreferenceSkeleton`, `Cmp:ErrorSkeleton`
- Implemented: `src/shared/ui/composites/skeleton/Skeleton.tsx`

### InfoPopover

Small floating explanation anchored to an InfoButton (legend formulas).

- Variants: `formula`
- Sizes: max-width 220
- States: open / closed, focus trap n/a (non-modal), loading n/a, empty n/a, error n/a
- Props: `{ trigger: ReactNode; content: ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }`
- Tokens: `surface.page`, `text.body`, `radius.sm`, `font.role.micro`
- Accessibility: Radix `Popover` (Esc closes, returns focus).
- Screens: SCR-09
- Aliases: `Cmp:InfoPopover`

### Footnote

Muted small-print note under a module (source, illustrative figures).

- Variants: `default` · `boxed` (`surface.page` strip, e.g. "Promedio del grupo")
- Sizes: 11px · 12px
- States: n/a
- Props: `{ variant?: "default" | "boxed"; children: ReactNode }`
- Tokens: `text.muted`, `text.body`, `surface.page`, `radius.control`, `font.role.micro`
- Accessibility: Plain text; referenced with `aria-describedby` from its chart when relevant.
- Screens: SCR-08, SCR-09
- Aliases: `Cmp:Footnote`

### BrandLogo

BencHUD logo (full / compact) and the login logo row with the Ecopetrol mark.

- Variants: `full` · `compact` (collapsed sidebar) · `row` (BencHUD | divider | Ecopetrol)
- Sizes: h22 (sidebar) · h36 (gate) · login row
- States: n/a (static); error (alt text "BencHUD" when the asset fails)
- Props: `{ variant?: "full" | "compact" | "row"; height?: number }`
- Tokens: `brand.logoYellow`, `dark.divider`
- Accessibility: `<img alt="BencHUD">`; Ecopetrol mark `alt="Ecopetrol"`.
- Screens: SCR-01, SCR-02, SCR-04
- Aliases: `Cmp:BrandLogo`, `Cmp:BrandLogoRow`

## 2. Composites

### Card

Surface container for every module card (white, bordered, radius 12).

- Variants: `default` · `glass` (login card on dark) · `tinted` (`surface.page`) · `dashed` (add tile) · `selectable` (2px border, selected `brand.primary`) · `flush` (overflow hidden, banded sections)
- Sizes: padding 14 · 16 · 20 · 22
- States: hover (selectable: border `brand.primaryBorder`), focus ring (selectable), active/selected, disabled (opacity .5), loading (Skeleton inside), empty (EmptyState inside), error (ErrorState inside)
- Props: `{ variant?: "default" | "glass" | "tinted" | "dashed" | "selectable" | "flush"; selected?: boolean; padding?: 14 | 16 | 20 | 22; as?: "section" | "article" | "button"; onClick?: () => void; children: ReactNode }`
- Tokens: `surface.card`, `surface.page`, `border.default`, `brand.primary`, `dark.glassCard`, `dark.glassBorder`, `radius.card`, `radius.loginCard`, `shadow.loginCard`
- Accessibility: Interactive cards render `<button>` / `<a>` with an accessible name; static cards `<section aria-labelledby>`.
- Screens: SCR-01, SCR-03, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14
- Aliases: `Cmp:Card`, `Cmp:GlassCard`

### ChoiceCard

Large navigation card: icon tile + title + description (gate choices, admin modules).

- Variants: `dark` (gate, `dark.surface`) · `light` (admin back office) · `unavailable` (badge "Próximamente")
- Sizes: 280px wide (gate) · auto-fill min 260 (admin)
- States: hover (border `brand.indigo`), focus ring, active, disabled/unavailable (opacity + badge), loading n/a, empty n/a, error n/a
- Props: `{ icon: IconName; title: string; description: string; to?: RouteHref; tone?: "dark" | "light"; available?: boolean }`
- Tokens: `dark.surface`, `dark.gateBorder`, `brand.indigo`, `brand.primary`, `dark.adminTile`, `surface.card`, `text.onDark.heading`, `text.onDark.lead`, `radius.card`
- Accessibility: Rendered as a link with the title as name and the description via `aria-describedby`.
- Screens: SCR-02, SCR-03
- Aliases: `Cmp:GateChoiceCard`, `Cmp:AdminModuleCard`

### SectionHeader

Module / group header: eyebrow or title + optional InfoButton + optional right slot (link, pill, pager, button).

- Variants: `eyebrow` (uppercase 11–12px) · `title` (600 13–14px) · `group` (wizard company group label)
- Sizes: —
- States: n/a (children carry states)
- Props: `{ title: string; variant?: "eyebrow" | "title" | "group"; subtitle?: string; info?: { expanded: boolean; onToggle: () => void; panelId: string }; right?: ReactNode }`
- Tokens: `text.eyebrow`, `text.heading`, `text.muted`, `font.role.eyebrow`, `font.role.titleCard`, `font.letterSpacing.eyebrow`
- Accessibility: Renders a heading (`h2`/`h3`) at the level given by the page outline.
- Screens: SCR-05, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-16
- Aliases: `Cmp:SectionHeader`, `Cmp:SectionTitle`, `Cmp:GroupEyebrow`
- Implemented: `src/shared/ui/composites/section-card/Eyebrow.tsx`; the `eyebrow` header of a module is `SectionCard`
  `titleVariant="eyebrow"`, with `surface="none"` for the page-level groups of SCR-05 (no card around them)

### PageHeader

In-content page title row: title (+ muted context after "|") and actions.

- Variants: `toolbar` (title left, actions right — Análisis list) · `detail` (title + context — Detalle, presentation viewer)
- Sizes: title 14–20px
- States: n/a; loading (Skeleton title)
- Props: `{ title: string; context?: string; actions?: ReactNode; back?: { label: string; to: RouteHref } }`
- Tokens: `text.heading`, `text.secondary`, `font.role.titleDetail`, `space.20`
- Accessibility: Single `h1` per page (the header bar title is not a heading duplicate).
- Screens: SCR-06, SCR-10, SCR-14
- Aliases: `Cmp:PageToolbar`, `Cmp:PageTitle`

### InfoPanel

Inline explanatory panel opened by an InfoButton; also tinted inline notes (segment tips, row descriptions, callouts).

- Variants: `neutral` (`surface.page`) · `tip` (dimension-tinted with left border: Financiera / Operativa / Transversal) · `rowDetail` (expandable table row) · `callout` (Ecopetrol green / amber bordered callout; login info callout on dark)
- Sizes: padding 7–10px 10–20px; 11–12px text
- States: open / closed (animated height, reduced-motion aware), loading n/a, empty n/a, error n/a
- Props: `{ id: string; variant?: "neutral" | "tip" | "rowDetail" | "callout"; tone?: "fin" | "op" | "trans" | "success" | "warning" | "onDark"; open: boolean; children: ReactNode }`
- Tokens: `surface.page`, `text.body`, `dimension.tip.financiera.bg`, `dimension.tip.operativa.bg`, `dimension.tip.transversal.bg`, `chart.ecoChip.bg`, `chart.ecoChip.border`, `status.warning.bg`, `radius.control`
- Accessibility: Region controlled by the InfoButton (`id` = `aria-controls`); Radix `Collapsible` for row details.
- Screens: SCR-01, SCR-05, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13
- Aliases: `Cmp:InfoPanel`, `Cmp:SegmentTip`, `Cmp:ExpandableRowDetail`, `Cmp:InfoCallout`, `Cmp:EcopetrolCallout`

### AlertBanner

Full-width message band: success / warning / danger / info, lifecycle banner, export feedback band.

- Variants: `success` · `warning` · `danger` · `info` · `lifecycle` ("Vista previa" [proposed]) · `band` (flush band inside a card, e.g. export feedback)
- Sizes: padding 10–12px 14–16px; 12px text
- States: n/a interactive (optional dismiss / action link); loading n/a, empty (hidden), error n/a
- Props: `{ tone: "success" | "warning" | "danger" | "info"; variant?: "default" | "lifecycle" | "band"; icon?: IconName; action?: { label: string; onClick: () => void }; children: ReactNode }`
- Tokens: `status.success.bg`, `status.success.text`, `status.warning.bg`, `status.warning.text`, `status.danger.bg`, `status.danger.textLegacy`, `info.bg`, `radius.control`
- Accessibility: `role="status"` (info / success) or `role="alert"` (danger); not focus-stealing.
- Screens: SCR-01, SCR-07, SCR-08, SCR-09, SCR-11, SCR-13
- Aliases: `Cmp:AlertBanner`, `Cmp:LifecycleBanner`, `Cmp:InlineStatusBand`

### InlineFeedback

Short inline confirmation next to the action that caused it ("✓ Cambios guardados").

- Variants: `success` · `danger`
- Sizes: 12px
- States: visible for a fixed time (2.2 s), then hidden
- Props: `{ tone?: "success" | "danger"; message: string; durationMs?: number }`
- Tokens: `status.success.text`, `status.danger.text`, `font.role.smallMedium`
- Accessibility: `role="status"` `aria-live="polite"`.
- Screens: SCR-08, SCR-11
- Aliases: `Cmp:InlineSaveConfirmation`

### Toast

Floating transient message: autosave (bottom-right), undo (bottom-center, "Deshacer"), saved / published / copied.

- Variants: `autosave` · `undo` (dark, action `#83E377`) · `success` · `danger`
- Sizes: padding 12px 16px
- States: enter / exit animation, paused on hover / focus, action focusable, auto-dismiss (1.6–5 s)
- Props: `{ variant: "autosave" | "undo" | "success" | "danger"; message: ReactNode; action?: { label: string; onClick: () => void }; durationMs?: number }`
- Tokens: `surface.card`, `text.heading`, `chart.highlight`, `status.success.bg`, `shadow.toast`, `shadow.toastUndo`, `z.toast`, `radius.md`
- Accessibility: Radix `Toast` (`aria-live="polite"`, swipe / Esc dismiss, F8 hotkey region).
- Screens: SCR-07, SCR-08, SCR-09, SCR-11, SCR-12, SCR-13
- Aliases: `Cmp:Toast`, `Cmp:AutosaveToast`

### EmptyState

Muted message when a section has no data ("Sin noticias…", "No se encontraron análisis…").

- Variants: `inline` (muted text) · `tableRow` (centred row) · `block` (icon + text)
- Sizes: 12–13px; padding 32px 20px (table row)
- States: static; optional action (e.g. "Limpiar filtros")
- Props: `{ message: string; variant?: "inline" | "tableRow" | "block"; action?: { label: string; onClick: () => void } }`
- Tokens: `text.muted`, `font.role.body`
- Accessibility: Plain text inside the section; table variant spans all columns (`colSpan`).
- Screens: SCR-05, SCR-06, SCR-10, SCR-11, SCR-15
- Aliases: `Cmp:EmptyState`
- Implemented: `src/shared/ui/composites/empty-state/EmptyState.tsx`

### ErrorState

Per-section error with retry (SectionResult error / forbidden).

- Variants: `section` · `inline` (list / preferences) · `forbidden` (no permission copy)
- Sizes: fits the section
- States: retrying (button loading)
- Props: `{ kind?: "error" | "forbidden"; message?: string; onRetry?: () => void; correlationId?: string }`
- Tokens: `status.danger.bg`, `status.danger.text`, `text.body`, `radius.card`
- Accessibility: `role="alert"`; retry button focusable; correlation id copyable for support.
- Screens: SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-15, SCR-16
- Aliases: `Cmp:SectionError`, `Cmp:NotificationError`, `Cmp:PreferenceError`

### SectionBoundary

Renders a `SectionResult<T>`: Skeleton while loading, ErrorState on error / forbidden, children on ok.

- Variants: `default`
- Sizes: —
- States: loading → Skeleton · ok → children · error → ErrorState · forbidden → ErrorState(forbidden) or hidden · empty → EmptyState
- Props: `{ result: SectionResult<T> | undefined; skeleton: SkeletonShape; empty?: (data: T) => boolean; emptyMessage?: string; children: (data: T) => ReactNode }`
- Tokens: none (logic-only wrapper)
- Accessibility: Wraps the section in `aria-busy` while loading.
- Screens: SCR-03, SCR-04, SCR-07, SCR-13, SCR-14
- Aliases: `Cmp:SectionResult`

### SegmentedTabs

Pill tab bar / segmented control (analysis tabs, horizon, dimension tabs, source tabs, view tabs, font-size control).

- Variants: `brand` (active `brand.primary`) · `dark` (horizon, active `text.heading`) · `dimension` (active = dimension colour) · `buttons` (A- / A / A+: separate 28px squares `size.control.square`, radius 6, muted `surface.page` off, lilac selected, per-item type size via the item `className`) · `withDot` (company colour dot)
- Sizes: `sm` (5–7px 12–14px) · `md` (8px 16px)
- States: hover, focus (roving), active/selected, disabled tab, loading n/a, empty n/a, error n/a
- Props: `{ items: Array<{ id: string; label: string; dotColor?: ColorToken; disabled?: boolean }>; value: string; onChange: (id: string) => void; variant?: "brand" | "dark" | "dimension" | "buttons" | "withDot"; "aria-label": string }`
- Tokens: `brand.primary`, `text.heading`, `surface.page`, `text.secondary`, `text.inverse`, `dimension.share.financiera`, `dimension.share.operativa`, `dimension.share.transversal`, `radius.control`, `radius.md`
- Accessibility: Radix `Tabs` when it switches panels; Radix `ToggleGroup` (single) when it only filters; arrow-key roving focus.
- Screens: SCR-04, SCR-07, SCR-08, SCR-09, SCR-11, SCR-13, SCR-14, SCR-16
- Aliases: `Cmp:SegmentedTabs`, `Cmp:SourceTabs`, `Cmp:FontSizeControls`
- Implemented: `src/shared/ui/composites/tabs/SegmentedTabs.tsx`

### ChipGroup

Group of Chips with single- or multi-select semantics (category chips, severity filters, business type, membership).

- Variants: `single` · `multi` (`multiVariant`: `toggle` default, or `segment` for on/off filter toggles) · `static` (membership lists)
- Sizes: gap 6–10
- States: none selected (= all) · some · all; disabled members; loading (skeleton chips); empty (hidden)
- Props: `{ items: Array<{ id: string; label: string; disabled?: boolean; dotColor?: ColorToken }>; mode: "single" | "multi" | "static"; value: string[]; onChange?: (ids: string[]) => void; "aria-label": string; appearance?: "pill" | "option" }` (`option`: SCR-07 wizard options in either mode)
- Tokens: `brand.primary`, `surface.page`, `text.secondary`
- Accessibility: Radix `ToggleGroup` (`type="single" | "multiple"`); static groups are lists.
- Screens: SCR-08, SCR-09, SCR-11, SCR-12, SCR-15
- Aliases: `Cmp:ChipGroup`, `Cmp:CategoryChips`, `Cmp:SeverityFilterChips`, `Cmp:IndicatorPillSelector`

### Accordion

Collapsible grouped section (company comparison categories).

- Variants: `default` (header `surface.page` + chevron)
- Sizes: header padding 12px 16px
- States: open / closed, hover header, focus, disabled n/a, loading n/a, empty (no rows → hidden), error n/a
- Props: `{ items: Array<{ id: string; title: ReactNode; summary?: ReactNode; content: ReactNode }>; defaultOpen?: string[] }`
- Tokens: `surface.page`, `border.default`, `text.heading`, `radius.md`
- Accessibility: Radix `Accordion` (`type="multiple"`).
- Screens: SCR-08
- Aliases: `Cmp:Accordion`
- Implemented: `src/shared/ui/composites/accordion/Accordion.tsx`

### Modal

Dialog frame shared by every overlay: scrim, white card radius 14, "✕", click-outside / Esc close.

- Variants: `default` (420–640) · `confirmation` (centred icon + title + body + full-width action — OVL-10) · `wide` (1180 preview)
- Sizes: 420 · 440 · 480 · 520 · 560 · 640 · 1180
- States: open / closed, focus trapped, loading (content Skeleton), error (ErrorState inside)
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; title: string; icon?: IconName; subtitle?: string; width?: 420 | 440 | 480 | 520 | 560 | 640 | 1180; footer?: ReactNode; children: ReactNode }`
- Tokens: `overlay.scrim`, `surface.card`, `shadow.modal`, `radius.modal`, `z.modal`, `text.muted`, `font.role.titleModal`
- Accessibility: Radix `Dialog` (focus trap, `aria-labelledby`, Esc, return focus).
- Screens: SCR-04, SCR-08, SCR-09, SCR-11, SCR-12, SCR-13, SCR-14
- Aliases: `Cmp:Modal`, `Cmp:ConfirmationModal`

### Pager

Page / slide navigation: numbered pagination, dots, arrows + dots, slide counter.

- Variants: `numbered` (tables) · `dots` · `arrowsDots` (news carousel) · `slide` ("n / N" + arrows)
- Sizes: buttons 26px; dots 7px
- States: hover, focus, active page, disabled bound (opacity .3), hidden when a single page
- Props: `{ page: number; pageCount: number; onPageChange: (p: number) => void; variant?: "numbered" | "dots" | "arrowsDots" | "slide"; "aria-label": string }`
- Tokens: `brand.primary`, `border.default`, `surface.page`, `radius.pill`
- Accessibility: `<nav aria-label>`; current page `aria-current="page"`; dots are buttons with "Página n".
- Screens: SCR-05, SCR-06, SCR-14
- Aliases: `Cmp:Pagination`, `Cmp:PagerDots`, `Cmp:CarouselPager`, `Cmp:SlidePager`

### DataTable

Tabular data with header row (grid or table), optional expandable rows, empty row, sort (none in v1).

- Variants: `grid` (CSS grid columns) · `table` (semantic table, KVI) · `flex` (Resumen del informe) · `highlightRow` (active profile)
- Sizes: row padding 12–14px 20px; header 10px 20px
- States: hover row, focus row (when clickable), selected row, disabled n/a, loading (Skeleton table), empty (EmptyState tableRow), error (ErrorState)
- Props: `{ columns: Array<{ id: string; header: string; align?: "start" | "end" | "center"; width?: string }>; rows: T[]; rowKey: (r: T) => string; renderCell: (r: T, colId: string) => ReactNode; onRowClick?: (r: T) => void; highlightedRowKey?: string; emptyMessage?: string }`
- Tokens: `surface.card`, `surface.page`, `border.default`, `border.subtle`, `text.eyebrow`, `text.body`, `font.role.eyebrow`, `radius.card`
- Accessibility: Semantic `<table>` or grid with `role="table"` / `role="row"` / `role="cell"`; `aria-sort` reserved.
- Screens: SCR-06, SCR-08, SCR-11, SCR-13
- Implemented: `src/shared/ui/table/DataTable.tsx`; `expandToggle="inline"` drops the leading "›" column and a cell
  renders `DataTableRowInfoToggle` (the SCR-06 "(i)" after the analysis name)
- Aliases: `Cmp:DataTable`
- Implemented: `src/shared/ui/table/DataTable.tsx`

### KeyValueList

Label / value pairs as a list or grid (traceability, validation summary, KVI traceability, meta fields).

- Variants: `list` · `grid` (2–4 columns, eyebrow labels)
- Sizes: 11px labels · 12–13px values
- States: n/a; loading (Skeleton), empty (`—`)
- Props: `{ items: Array<{ label: string; value: ReactNode }>; variant?: "list" | "grid"; columns?: 2 | 3 | 4 }`
- Tokens: `text.eyebrow`, `text.body`, `font.role.eyebrow`
- Accessibility: `<dl>` with `<dt>` / `<dd>`.
- Screens: SCR-07, SCR-10, SCR-11
- Aliases: `Cmp:KeyValueList`, `Cmp:MetaField`, `Cmp:SummaryRow`, `Cmp:TraceabilityGrid`

### ActivityList

Chronological list of text + relative time (indicator history).

- Variants: `default`
- Sizes: 12px text · 11px time
- States: loading (Skeleton list), empty ("Sin cambios registrados" [inference]), error (ErrorState inline)
- Props: `{ items: Array<{ id: string; text: string; occurredAt: string }> }`
- Tokens: `text.body`, `text.muted`, `border.subtle`
- Accessibility: `<ol>`; times in `<time dateTime>`.
- Screens: SCR-10
- Aliases: `Cmp:HistoryList`

### Stepper

Wizard step indicator (Definición del análisis, 5 steps).

- Variants: `horizontal`
- Sizes: step circle 28–32
- States: step: upcoming / current / done / invalid; hover + focus on reachable steps; disabled unreachable steps
- Props: `{ steps: Array<{ id: number; label: string; status: "upcoming" | "current" | "done" | "invalid" }>; onStepClick?: (id: number) => void }`
- Tokens: `brand.primary`, `status.success.base`, `status.danger.base`, `border.default`, `text.secondary`
- Accessibility: `<ol aria-label="Pasos">`; current step `aria-current="step"`.
- Screens: SCR-07
- Aliases: `Cmp:WizardStepper`, `Cmp:WizardStep`
- Implemented: `src/shared/ui/composites/stepper/Stepper.tsx`

### FileDropzone

Upload area for .ppt / .pptx (≤ 50 MB) and the uploaded-file card that replaces it.

- Variants: `empty` (dashed) · `uploaded` ("PPT" tile + name + size + actions)
- Sizes: —
- States: hover / drag-over (brand border), focus, uploading (progress), uploaded, error (type / size message), disabled
- Props: `{ accept: string[]; maxBytes: number; file?: { name: string; sizeBytes: number; uploadedAt: string }; onSelect: (f: File) => void; onRemove?: () => void; onReplace?: () => void; progressPct?: number; error?: string }`
- Tokens: `border.default`, `brand.primary`, `file.pptTile`, `status.success.uploadedBg`, `status.success.uploadedBorder`, `status.danger.text`, `radius.md`
- Accessibility: Hidden `<input type="file">` behind a labelled button; drag-and-drop is optional enhancement.
- Screens: SCR-13
- Aliases: `Cmp:FileDropBox`, `Cmp:UploadedFileCard`

### KpiStat

Big number + label (+ optional chip / range / delta); groups of stats (market indicators, KPI bands, win ratio).

- Variants: `tile` (bordered card) · `centered` (home summary) · `compact` (left-aligned band) · `market` (label / mono value / signed delta) · `weight` (avg + Ecopetrol chip + range) · `ratio` ("6 de 10" + mini ProgressBar + %) · `group` (row of stats in one Card)
- Sizes: value 15 · 20 · 22 · 24 · 26px
- Label position: `labelPosition="below"` (default) or `"above"` (11px muted caption over the value; SCR-11 Monitor tiles, BencHUD.dc.html:1724)
- States: loading (Skeleton), empty (`—`), error (ErrorState in group); tone per value
- Props: `{ value: string | number; label: string; unit?: UnitCode; tone?: ColorToken; delta?: { value: number; trend: "up" | "down" | "flat" }; chip?: ReactNode; caption?: string; variant?: "tile" | "centered" | "compact" | "market" | "weight" | "ratio" | "group" }`
- Tokens: `text.heading`, `text.secondary`, `text.muted`, `font.role.kpi`, `font.role.kpiLg`, `font.role.monoMarket`, `variation.positive`, `variation.negative`, `surface.page`, `border.default`, `radius.md`
- Accessibility: Value and label in one `<p>` / `<dl>` so screen readers read "82 %, Cobertura prom.".
- Screens: SCR-05, SCR-08, SCR-09, SCR-10, SCR-11
- Aliases: `Cmp:KpiStatCard`, `Cmp:MarketIndicatorStat`, `Cmp:MarketIndicatorsCard`, `Cmp:WeightKpiTile`, `Cmp:WinRatioSummary`

### BeforeAfterStat

Base → Simulado strip with a right slot (gap value or progress) used by the sensitivity simulators.

- Variants: `gap` (right: gap pts with tone) · `progress` (right: gap-closed ProgressBar)
- Sizes: values 24–26px
- States: pending (evaluation in flight: muted value), loading (Skeleton), error (keeps last value + inline error)
- Props: `{ base: { label: string; value: number; unit?: UnitCode }; simulated: { label: string; value: number; unit?: UnitCode }; right?: ReactNode; pending?: boolean }`
- Tokens: `surface.page`, `text.muted`, `ai.accent`, `chart.peer`, `radius.md`
- Accessibility: `aria-live="polite"` on the simulated value.
- Screens: SCR-12
- Aliases: `Cmp:BeforeAfterStrip`

### GroupBox

Bordered group with a header (colour square + label + total / status) and rows (dimension groups, weight categories, indicator groups).

- Variants: `dimension` (colour square + total %) · `category` (total / target / status + bar) · `indicatorGroup` (wizard, select-all)
- Sizes: padding 12px 14px
- States: status tone (en línea / excede / por debajo), loading (Skeleton), empty (hidden)
- Props: `{ title: string; accentColor?: ColorToken; total?: { value: number; unit?: UnitCode; target?: number; status?: "ok" | "over" | "under" }; headerRight?: ReactNode; children: ReactNode }`
- Tokens: `border.default`, `text.body`, `dimension.accent.financiera`, `dimension.accent.operativa`, `dimension.accent.transversal`, `dimension.accent.finOp`, `status.success.base`, `status.danger.base`, `status.warning.base`, `radius.md`
- Accessibility: `<fieldset>` + `<legend>` when it groups inputs; `<section aria-labelledby>` otherwise.
- Screens: SCR-07, SCR-08, SCR-12
- Aliases: `Cmp:DimensionGroup`, `Cmp:WeightCategoryGroup`, `Cmp:IndicatorGroup`

### ValueInputRow

Form row: label (+ estimate chip) + NumberInput + unit (+ justification / remove); missing-value variant.

- Variants: `reported` (Real / Estimado chip) · `missing` (amber dashed row, "Faltante", ✕) · `weight` (label + input + %)
- Sizes: row gap 10
- States: hover, focus within, estimate (dashed justification field), dirty, saving, error (inline), read-only
- Props: `{ label: string; value: number | null; unit?: UnitCode; onChange: (v: number | null) => void; estimate?: { isEstimate: boolean; justification: string; onToggle: () => void; onJustification: (t: string) => void }; missing?: boolean; onRemove?: () => void; readOnly?: boolean }`
- Tokens: `text.body`, `status.warning.bg`, `status.warning.base`, `status.danger.bg`, `status.danger.text`, `status.danger.missingRowBg`, `radius.control`
- Accessibility: Input labelled by the row label; remove button `aria-label="Quitar {label}"`.
- Screens: SCR-08
- Aliases: `Cmp:EditableValueRow`, `Cmp:MissingValueRow`

### IndicatorRow

Indicator line: label + code (+ values / tier / chevron / checkbox); used in wizard catalogues and category panels.

- Variants: `catalog` (wizard: label + code + horizon badge, selectable) · `comparison` (Ecopetrol / Prom. pares mono values + tier Badge + "›")
- Sizes: padding 10–14px 20px
- States: hover, focus (clickable), selected (catalog), disabled (no detail), loading (Skeleton), empty n/a, error n/a
- Props: `{ label: string; code: string; values?: { ecopetrol: string; peerAvg: string }; tier?: 1 | 2 | 3 | 4; horizon?: "TBG" | "ILP"; selected?: boolean; onClick?: () => void }`
- Tokens: `text.heading`, `text.muted`, `text.secondary`, `font.family.mono`, `border.subtle`, `chart.peer`
- Accessibility: Clickable rows are buttons / links named by the indicator label.
- Screens: SCR-07, SCR-09
- Aliases: `Cmp:IndicatorRow`, `Cmp:IndicatorComparisonRow`

### OperationProgress

Shared state for 202 + operationId jobs (generation, recalculation, exports, uploads): queued → running → succeeded / failed (critic M-06).

- Variants: `banner` (top of the content column) · `inline` (inside a dialog / card)
- Sizes: full width
- States: queued, running (determinate %), succeeded, failed (retry), cancelled
- Props: `{ status: "queued" | "running" | "succeeded" | "failed"; progressPct?: number; messageKey: string; onRetry?: () => void; variant?: "banner" | "inline" }`
- Tokens: `info.bg`, `status.success.bg`, `status.danger.bg`, `brand.primary`, `motion.duration.progress`
- Accessibility: `aria-live="polite"` + Radix `Progress`; failure moves focus to the retry button only when triggered by the user.
- Screens: SCR-07, SCR-08, SCR-11, SCR-13, SCR-14
- Aliases: `Cmp:OperationProgress`, `Cmp:OperationProgressBanner`

### AiActionButton

Cyan "✦" pill that triggers an AI action (narrative, recommendations, drafting).

- Variants: `md` (action row) · `sm` (module "Narrativa") · `withCount` ("Recomendaciones de Yarbis (n)")
- Sizes: padding 6px 12px · 8px 14px
- States: hover, focus ring, active, disabled (no permission / running), loading ("✦ Yarbis está redactando…")
- Props: `{ label: string; count?: number; size?: "sm" | "md"; loading?: boolean; disabled?: boolean; onClick: () => void }`
- Tokens: `ai.bg`, `ai.border`, `ai.text`, `radius.pill`, `font.role.smallStrong`
- Accessibility: Button with visible label; `aria-busy` while drafting; AI output is labelled as suggestion.
- Screens: SCR-08, SCR-09, SCR-11, SCR-13
- Aliases: `Cmp:AiPillButton`, `Cmp:AiActionPill`

### AiInsight

Yarbis-generated text container: dark banner, cyan card, tip, finding card, bullet list, recommendation list, validated suggestion.

- Variants: `banner` (dark, bold lead "Yarbis:") · `card` ("✦ YARBIS INSIGHT") · `tip` (cyan box) · `finding` (rail card) · `list` (✦ bullets) · `recommendations` (label + text rows with tone) · `suggestion` (collapsible, validation status, actions)
- Sizes: 12–13px text
- States: collapsed / expanded (suggestion), validated / requires validation, loading (Skeleton), empty (hidden), error (ErrorState)
- Props: `{ variant: "banner" | "card" | "tip" | "finding" | "list" | "recommendations" | "suggestion"; items: Array<{ id: string; label?: string; text: string; tone?: "ok" | "info" | "watch" | "action" }>; suggestion?: { status: "requires_validation" | "validated"; onApply?: () => void; onValidate?: () => void } }`
- Tokens: `dark.surface`, `text.onDark.banner`, `ai.accent`, `ai.bg`, `ai.border`, `ai.text`, `brand.primarySubtle`, `brand.primaryBorder`, `status.warning.text`, `status.success.text`, `radius.md`, `radius.card`
- Accessibility: Region labelled "Sugerencia de Yarbis"; status text announced; AI content never the only source of a number.
- Screens: SCR-05, SCR-07, SCR-08, SCR-10, SCR-11, SCR-12
- Aliases: `Cmp:YarbisInsightBanner`, `Cmp:YarbisInsightCard`, `Cmp:AiTipBanner`, `Cmp:AiFindingCard`, `Cmp:AiInsightList`, `Cmp:AiRecommendationList`, `Cmp:AiSuggestionBox`, `Cmp:AiSuggestionCard`

## 3. Charts (ADR-0003)

### HorizontalBarList

Ranked horizontal bars (div primitive per ADR-0003): rank, avatar / name, bar, value; leader and Ecopetrol row variants; optional editable value and explanation row.

- Variants: `ranking` (rank + avatar) · `membership` (TBG member / other / Ecopetrol colours) · `valueList` (Fortalezas / Oportunidades) · `comparison` (Ecopetrol vs peer average, two bars)
- Sizes: bar height 16 · 18px
- States: hover row, focus (clickable rows), highlighted (leader `chart.leader.rowBg`, Ecopetrol `chart.ecoChip.bg`), expanded explanation, loading (Skeleton), empty (EmptyState), error (ErrorState)
- Props: `{ rows: Array<{ id: string; rank?: number; label: string; value: number; unit?: UnitCode; colorKey?: ColorToken; kind?: "leader" | "ecopetrol" | "member" | "other"; editable?: boolean; explanation?: string }>; max?: number; onRowClick?: (id: string) => void; onValueChange?: (id: string, v: number) => void; "aria-label": string }`
- Tokens: `chart.track`, `chart.peer`, `chart.highlight`, `chart.tbgGroup`, `chart.leader.rowBg`, `chart.leader.avatar`, `chart.ecoChip.bg`, `chart.average`, `radius.bar`, `motion.duration.bar`, `font.role.monoInput`
- Accessibility: Container `role="img"` + `aria-label` + visually-hidden data table (brief §accesibilidad); interactive rows are buttons.
- Screens: SCR-08, SCR-09, SCR-11
- Aliases: `Cmp:RankingBarList`, `Cmp:RankingBarRow`, `Cmp:RankedValueList`, `Cmp:ComparisonBars`

### PairedBarRow

One indicator with two horizontal bars (GE vs Pares, or GE vs a company), values / inputs, diff and status (div primitive).

- Variants: `peerAverage` (18px bars, GE `chart.highlight`, Pares `chart.peer`, inputs) · `company` (14px bars, company colour, code, polarity tag, signed diff, status Badge)
- Sizes: bar 14 · 18px
- States: hover, focus within inputs, editing, negative value (positive length + signed value, CF-72), loading (Skeleton), error (ErrorState)
- Props: `{ label: string; code?: string; lowerIsBetter?: boolean; primary: { label: string; value: number | null }; secondary: { label: string; value: number | null; colorKey?: ColorToken }; unit: UnitCode; diff?: { value: number; unit: UnitCode; outcome: "above" | "below" }; editable?: "primary" | "secondary" | "both"; onChange?: (which: "primary" | "secondary", v: number | null) => void; detailHref?: RouteHref }`
- Tokens: `chart.highlight`, `chart.peer`, `chart.track`, `status.success.bg`, `status.danger.bg`, `text.muted`, `radius.bar`, `radius.barLg`, `motion.duration.barLong`
- Accessibility: `role="group"` named by the indicator; bars `aria-hidden`, values read from the inputs / text.
- Screens: SCR-08
- Aliases: `Cmp:PairedBarRow`, `Cmp:BarLine`, `Cmp:ComparisonIndicatorRow`

### StackedBar

100 % / absolute stacked horizontal bars (div primitive): composition by dimension, ranked kbpe/d segments, Ecopetrol reference.

- Variants: `composition` (labels inside, active dimension full opacity, clickable segments, "Total:" label) · `reference` (Ecopetrol, 30px, framed with diffs) · `rankedSegments` (rank circle + total, aspiration) · `mini` (union panel)
- Sizes: height 26 · 30px
- States: hover segment, focus segment, active dimension (others .3 opacity), segment tip open, over / under 100 (Total tone), loading, empty, error
- Props: `{ segments: Array<{ id: string; label: string; value: number; colorKey: ColorToken }>; total?: { value: number; status: "ok" | "over" | "under" }; activeSegmentId?: string; onSegmentClick?: (id: string) => void; label?: string; variant?: "composition" | "reference" | "rankedSegments" | "mini" }`
- Tokens: `dimension.share.financiera`, `dimension.share.operativa`, `dimension.share.transversal`, `dimension.accent.financiera`, `dimension.accent.operativa`, `dimension.accent.transversal`, `chart.aspiration.crudo`, `chart.aspiration.gas`, `chart.aspiration.noConvencional`, `chart.aspiration.bajasEmisiones`, `status.danger.base`, `status.warning.base`, `status.success.text`, `shadow.insetRing`, `radius.sm`
- Accessibility: `role="img"` summary per bar ("TotalEnergies: Financiera 62 %, Operativa 20 %, Transversal 24 %, total 106 %"); segments are buttons when clickable.
- Screens: SCR-08, SCR-09, SCR-11
- Aliases: `Cmp:StackedBar`, `Cmp:StackedBarRow`, `Cmp:EcopetrolReferenceBox`, `Cmp:RankedStackedBarList`

### Heatmap

Company × dimension matrix with graded cell colour (ECharts `heatmap` wrapper, ADR-0003).

- Variants: `default`
- Sizes: row 32–36px
- States: hover cell (tooltip), focus row name (opens profile), Ecopetrol row highlighted, loading, empty, error
- Props: `{ rows: Array<{ id: string; label: string; isEcopetrol?: boolean; values: Record<"fin" | "op" | "trans", number> }>; onRowLabelClick?: (id: string) => void; "aria-label": string }`
- Tokens: `dimension.share.financiera`, `dimension.share.operativa`, `dimension.share.transversal`, `surface.page`, `chart.ecoChip.bg`, `chart.ecoChip.text`
- Accessibility: ECharts container `role="img"` + `aria-label` + alternate `<table>`.
- Screens: SCR-09
- Aliases: `Cmp:Heatmap`

### RadarChart

Radar with 2 polygons (Ecopetrol vs sector average; KVI Monitor vs Reto) (ECharts wrapper).

- Variants: `weights` (3 axes) · `kvi` (15–18 axes, capped / uncapped)
- Sizes: 300×280 · responsive
- States: hover axis tooltip, legend toggle, loading, empty, error
- Props: `{ axes: Array<{ id: string; label: string; max?: number }>; series: Array<{ id: string; label: string; values: number[]; colorKey: ColorToken }>; "aria-label": string }`
- Tokens: `chart.ecopetrol`, `chart.average`, `chart.monitor`, `border.default`
- Accessibility: ECharts `role="img"` + alternate table.
- Screens: SCR-09, SCR-11
- Aliases: `Cmp:RadarChart`

### DonutChart

Donut by category with centre % (Monitor de Valor) (ECharts wrapper).

- Variants: `default`
- Sizes: 160 · 200
- States: hover slice tooltip, loading, empty, error
- Props: `{ slices: Array<{ id: string; label: string; value: number; colorKey: ColorToken }>; centerLabel: string; "aria-label": string }`
- Tokens: `chart.category.financiero`, `chart.category.mercado`, `chart.category.estrategico`, `chart.category.gruposInteres`, `chart.track`
- Accessibility: ECharts `role="img"` + alternate table.
- Screens: SCR-11
- Aliases: `Cmp:DonutChart`

### GroupedBarChart

Vertical bars: grouped 2024 vs 2025 per company with delta pills and average line (Detalle); single-series history (Monitor) (ECharts wrapper).

- Variants: `grouped` (two series + markLine average + delta labels) · `single` (history)
- Sizes: plot 120 · 150px; 76px columns (horizontal scroll)
- States: hover tooltip, focus column label (opens profile), Ecopetrol column highlighted, animated mount (reduced-motion off), loading, empty, error
- Props: `{ categories: Array<{ id: string; label: string; isEcopetrol?: boolean }>; series: Array<{ id: string; label: string; values: Array<number | null>; colorKey: ColorToken }>; average?: { value: number; label: string }; deltas?: Array<number | null>; unit: UnitCode; onCategoryClick?: (id: string) => void; "aria-label": string }`
- Tokens: `chart.detail.2024`, `chart.detail.2025`, `chart.detail.ecoColumnBg`, `chart.average`, `chart.monitor`, `status.success.bg`, `status.success.pillBorder`, `status.danger.bg`, `status.danger.pillBorder`, `motion.duration.detailBar`, `motion.duration.detailBarStagger`, `size.stroke.average`
- Accessibility: ECharts `role="img"`, `data-series-count`, alternate table.
- Screens: SCR-10, SCR-11
- Aliases: `Cmp:GroupedBarChart`, `Cmp:VerticalBarChart`

### ChartLegend

Legend row: colour square + label (+ code + formula InfoButton).

- Variants: `default` · `withCode` (LIN-01..03 + popover)
- Sizes: square 9px; 10–11px text
- States: hover (series toggle when interactive), focus, inactive series (muted)
- Props: `{ items: Array<{ id: string; label: string; colorKey: ColorToken; code?: string; info?: string }>; onToggle?: (id: string) => void }`
- Tokens: `text.secondary`, `text.muted`, `radius.legend`, `font.family.mono`
- Accessibility: List; interactive items are toggle buttons (`aria-pressed`).
- Screens: SCR-08, SCR-09, SCR-10, SCR-11
- Aliases: `Cmp:ChartLegend`

## 4. Layout

### AppShell

Authenticated layout route: sidebar + header + content column + floating layer (FAB, chat, toasts).

- Variants: `default` · `withRail` (see StickyRail)
- Sizes: content padding 28 / 32 / 100; min width per OQ-16
- States: sidebar expanded / collapsed; loading (session → full-page skeleton); error (session failure → login)
- Props: `{ children: ReactNode }`
- Tokens: `surface.page`, `space.content.top`, `space.content.x`, `space.content.bottom`, `motion.transition.screenEnter`
- Accessibility: Landmarks `<nav>`, `<header>`, `<main>` with skip link to main.
- Screens: SCR-04, SCR-05, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14, SCR-15, SCR-16, SCR-17
- Aliases: `Cmp:AppShell`

### AuthLayout

Full-bleed dark layout with background image and overlay (login, access gate).

- Variants: `login` (two columns) · `gate` (centred)
- Sizes: 100vh
- States: n/a
- Props: `{ variant: "login" | "gate"; children: ReactNode }`
- Tokens: `dark.bg`, `gradient.loginOverlay`, `gradient.gateOverlay`
- Accessibility: `<main>` landmark; background image decorative.
- Screens: SCR-01, SCR-02
- Aliases: `Cmp:AuthLayout`

### Sidebar

Dark collapsible navigation (220 / 68px): logo, nav items with locks / badges, collapse toggle.

- Variants: `expanded` · `collapsed`
- Sizes: item row 11px 12px, icons 20
- States: item hover (`dark.hover`), focus, active (`brand.navActive`), locked (🔒, `text.onDark.locked`, opacity .5), badge (count / dot)
- Props: `{ items: Array<{ id: string; labelKey: string; to: RouteHref; icon: IconName; isLocked?: boolean; badge?: number }>; activeId?: string; collapsed: boolean; onToggleCollapsed: () => void }`
- Tokens: `dark.surface`, `dark.divider`, `dark.hover`, `brand.navActive`, `text.onDark.navIcon`, `text.onDark.navText`, `text.onDark.locked`, `text.onDark.navToggle`, `size.layout.sidebarExpanded`, `size.layout.sidebarCollapsed`, `radius.nav`, `motion.transition.nav`
- Accessibility: `<nav aria-label="Principal">`; active item `aria-current="page"`; locked items `aria-disabled` with reason.
- Screens: SCR-04, SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-15, SCR-16
- Aliases: `Cmp:Sidebar`, `Cmp:SidebarNav`, `Cmp:SidebarNavItem`, `Cmp:SidebarCollapseToggle`

### AppHeader

4px gradient strip + 64px white bar: title, bell, help, user; standalone variant for non-shell pages.

- Variants: `shell` · `standalone` (admin back office: back link + title + logout)
- Sizes: height 64 + strip 4
- States: unread dot on bell, focus on actions
- Props: `{ title: string; unreadCount?: number; user?: { name: string; avatarSrc?: string }; onHelp?: () => void; variant?: "shell" | "standalone"; back?: { label: string; to: RouteHref } }`
- Tokens: `surface.header`, `border.default`, `gradient.headerStrip`, `size.layout.header`, `size.layout.headerStrip`, `font.role.titleHeader`
- Accessibility: `<header>` landmark; bell link "Notificaciones ({n} sin leer)"; help opens OVL-12 dialog.
- Screens: SCR-03, SCR-04, SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-15, SCR-16
- Aliases: `Cmp:AppHeader`, `Cmp:HeaderGradientStrip`, `Cmp:PageTopBar`

### StickyRail

Right 300px column that sticks under the header (Hallazgos, comments).

- Variants: `default`
- Sizes: 300px; `max-height: calc(100vh - 112px)`
- States: scrolls internally; drops below the main column under the laptop breakpoint
- Props: `{ children: ReactNode; "aria-label": string }`
- Tokens: `size.layout.rightRail`, `breakpoint.laptop`
- Accessibility: `<aside aria-label>` complementary landmark.
- Screens: SCR-08, SCR-09
- Aliases: `Cmp:StickyRail`

## 5. Page-level widgets

### YarbisFab

Floating Yarbis button (56px, cyan, pulse).

- Variants: `default` · `open` (panel visible)
- Sizes: 56px
- States: hover, focus ring, pulse (off with reduced motion), hidden without `canUseAssistant`
- Props: `{ open: boolean; onToggle: () => void }`
- Tokens: `ai.accent`, `shadow.fab`, `z.fab`, `motion.duration.aiPulse`, `motion.distance.aiPulseRing`
- Accessibility: Button "Abrir asistente Yarbis" with `aria-expanded`.
- Screens: SCR-04, SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12
- Aliases: `Cmp:YarbisFab`, `Cmp:AssistantFab`

### YarbisChatPanel

Chat panel (OVL-14): header "✦ Yarbis · {screen}", bubbles, 👍 / 👎, suggestion chips, input + send.

- Variants: `default`
- Sizes: 320px wide
- States: streaming (token SSE), error (retry), empty history (proactive tip only), feedback selected
- Props: `{ screenTitle: string; messages: Array<{ id: string; from: "ai" | "user"; text: string; feedback?: "up" | "down" | null }>; suggestions: string[]; onSend: (t: string) => void; onFeedback: (id: string, r: "up" | "down") => void; streaming?: boolean }`
- Tokens: `surface.card`, `ai.accent`, `surface.page`, `brand.primarySubtle`, `status.success.bg`, `status.danger.bg`, `shadow.chat`, `z.chat`, `radius.modal`
- Accessibility: Non-modal dialog; message list `aria-live="polite"`; input labelled "Pregunta sobre este análisis".
- Screens: SCR-04, SCR-05, SCR-06, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12
- Aliases: `Cmp:YarbisChatPanel`, `Cmp:AssistantPanel`, `Cmp:ChatBubble`, `Cmp:ChatInput`, `Cmp:FeedbackThumbs`

### LoginHero

Login left column: eyebrow + H1 + body + three feature rows.

- Variants: `default`
- Sizes: display 34–44px
- States: n/a
- Props: `{ eyebrow: string; title: string; body: string; features: Array<{ icon: IconName; title: string; text: string }> }`
- Tokens: `text.onDark.heading`, `text.onDark.lead`, `font.role.displayLogin`
- Accessibility: H1 lives here; feature list is `<ul>`.
- Screens: SCR-01
- Aliases: `Cmp:LoginHero`, `Cmp:FeatureRow`

### OverallTierHeader

Visualización header card: "Posición global · T4 2025", tier name, context line, actions (Crear presentación, Publicar).

- Variants: `default` · `withLifecycle` (badge [proposed])
- Sizes: tier 30px
- States: publishing (button loading), loading (Skeleton), error (ErrorState)
- Props: `{ periodLabel: string; tier: 1 | 2 | 3 | 4; contextLine: string; lifecycle?: "preparacion" | "vista_previa" | "publicado"; actions: ReactNode }`
- Tokens: `text.muted`, `tier.2.text`, `font.role.displayTier`, `surface.card`, `radius.card`
- Accessibility: Tier name is the page H1 on SCR-09.
- Screens: SCR-09
- Aliases: `Cmp:OverallTierHeader`

### AnalysisCard

Clickable analysis summary card (Inicio "Análisis habilitados").

- Variants: `default`
- Sizes: auto-fill min 280; padding 20
- States: hover, focus, loading (Skeleton card), empty (section EmptyState)
- Props: `{ title: string; status: AnalysisStatus; description: string; updatedAt: string; ownerName: string; to: RouteHref }`
- Tokens: `surface.card`, `border.default`, `text.secondary`, `text.muted`, `radius.card`
- Accessibility: Whole card is a link named by the title.
- Screens: SCR-05
- Aliases: `Cmp:AnalysisCard`

### NewsCard

Peer news card: company avatar + name + trend arrow, headline, source.

- Variants: `default`
- Sizes: auto-fill min 220; padding 16
- States: loading (Skeleton card), empty (section EmptyState)
- Props: `{ company: { name: string; initials: string; colorKey: ColorToken }; impact: "up" | "down"; headline: string; source: string }`
- Tokens: `surface.card`, `border.default`, `text.body`, `text.muted`, `variation.positive`, `variation.negative`, `radius.card`
- Accessibility: Trend conveyed by text ("positivo" / "negativo") for screen readers.
- Screens: SCR-05
- Aliases: `Cmp:NewsCard`

### NotificationCard

Notification row: severity left border, type icon circle, type eyebrow, text, relative time, unread state.

- Variants: `unread` · `read`
- Sizes: icon 34px
- States: hover, focus, unread → read (click), loading (Skeleton list), empty (EmptyState), error (ErrorState inline)
- Props: `{ id: string; type: NotificationType; severity: "info" | "success" | "warn" | "error"; text: string; occurredAt: string; read: boolean; onOpen: () => void }`
- Tokens: `severity.info.base`, `severity.success.base`, `severity.warn.base`, `severity.error.base`, `severity.info.bg`, `surface.card`, `text.body`, `text.muted`
- Accessibility: List item with button; unread state announced; list `aria-live="polite"` for new items.
- Screens: SCR-15
- Aliases: `Cmp:NotificationCard`

### TierCard

Selectable category card with tier Badge (Visualización "Categorías").

- Variants: `default` · `selected` (tier card bg + border)
- Sizes: auto-fill min 150; padding 14
- States: hover, focus, selected, loading
- Props: `{ label: string; tier: 1 | 2 | 3 | 4; selected: boolean; onSelect: () => void }`
- Tokens: `tier.1.card`, `tier.3.card`, `tier.4.card`, `tier.1.base`, `tier.2.base`, `tier.3.base`, `tier.4.base`, `border.default`, `radius.md`
- Accessibility: Radio-like selection (`role="radio"` inside a `radiogroup`).
- Screens: SCR-09
- Aliases: `Cmp:TierCard`

### TemplateCard

Presentation template choice: 120px mini-slide in accent + name + description.

- Variants: `default` · `selected` (2px accent border — OQ-15)
- Sizes: preview 120px
- States: hover, focus, selected
- Props: `{ id: string; name: string; description: string; accent: ColorToken; selected: boolean; onSelect: () => void }`
- Tokens: `template.directorio`, `template.storytelling`, `template.detalleAnalitico`, `border.default`, `radius.md`
- Accessibility: `role="radio"` in a template radiogroup.
- Screens: SCR-13
- Aliases: `Cmp:TemplateCard`

### ProfileCard

Configuración profile block: avatar, name, role label, department.

- Variants: `default`
- Sizes: avatar 48
- States: loading (Skeleton), error (ErrorState)
- Props: `{ name: string; roleLabel: string; department?: string; avatarSrc?: string }`
- Tokens: `surface.card`, `text.heading`, `text.secondary`, `radius.card`
- Accessibility: Heading with the user name.
- Screens: SCR-16
- Aliases: `Cmp:ProfileCard`

### CompanyCard

Company tile: selectable competitor (wizard), coverage card (Resultados), add-company tile.

- Variants: `selectable` (wizard, check) · `coverage` (% + status Badge + ProgressBar + missing count + ✕) · `add` (dashed + Select)
- Sizes: auto-fill min 150
- States: hover, focus, selected, removing (undo toast), loading (Skeleton), empty (only add tile)
- Props: `{ variant: "selectable" | "coverage" | "add"; company?: { id: string; name: string; initials: string; colorKey: ColorToken }; coverage?: { pct: number; status: "complete" | "needs_review" | "incomplete"; missingCount: number }; selected?: boolean; onSelect?: () => void; onRemove?: () => void; addOptions?: Array<{ id: string; name: string }>; onAdd?: (id: string) => void }`
- Tokens: `surface.card`, `border.default`, `brand.primary`, `status.success.base`, `status.warning.base`, `status.danger.base`, `radius.md`
- Accessibility: Selectable cards `aria-pressed`; remove button `aria-label="Quitar {company}"`.
- Screens: SCR-07, SCR-08
- Aliases: `Cmp:CompanyTile`, `Cmp:CompanyCoverageCard`, `Cmp:AddCompanyTile`

### CommentThread

Review comments (F32) and change requests (F33): items, replies, composer, analyst status / decision controls [proposed M-05].

- Variants: `rail` (SCR-09) · `inline` (SCR-10 / 11 / 13 / 14); composer `composerLayout`: `stacked` (text area + counter) · `inline` (one-line field + "Enviar" beside it, SCR-13 / SCR-14)
- Sizes: 12px text
- States: loading, empty (composer only), posting, error, comment status (Pendiente / En análisis / Resuelto), request decision (Aceptar / Rechazar)
- Props: `{ threads: Thread[]; canComment: boolean; canReply: boolean; canRequestChange: boolean; canResolve: boolean; onPost: (text: string, kind: "comment" | "change_request", parentId?: string) => void; onStatusChange?: (id: string, s: CommentStatus) => void; onDecision?: (id: string, d: "accepted" | "rejected") => void }`
- Tokens: `surface.card`, `border.subtle`, `text.heading`, `text.body`, `text.muted`, `brand.primary`, `radius.card`
- Accessibility: Thread `<ul>` with nested lists; composer labelled; new comment announced `aria-live="polite"`.
- Screens: SCR-09, SCR-10, SCR-11, SCR-13, SCR-14
- Aliases: `Cmp:CommentThread`, `Cmp:CommentItem`, `Cmp:CommentComposer`, `Cmp:ChangeRequestActions`
- Implemented: `src/shared/ui/composites/comment-thread/CommentThread.tsx`

### HorizonUnionPanel

TBG | ILP side-by-side weights for one company with hito rows (S-UNION, critic M-01).

- Variants: `default`
- Sizes: two columns
- States: no ILP data for company (empty column), loading, error
- Props: `{ companyOptions: Array<{ id: string; name: string; hasIlp: boolean }>; companyId: string; onCompanyChange: (id: string) => void; tbg: HorizonColumn; ilp: HorizonColumn | null }`
- Tokens: `dimension.accent.financiera`, `dimension.accent.operativa`, `dimension.accent.transversal`, `border.default`, `text.body`
- Accessibility: Two labelled regions ("TBG", "ILP"); hito sub-items as nested list.
- Screens: SCR-08
- Aliases: `Cmp:HorizonUnionPanel`, `Cmp:HitoItem`

### FocusCard

Dimension card with focus groups, weight rows and an Ecopetrol callout (Horizonte TBG "Principales indicadores").

- Variants: `fin` · `op` · `trans`
- Sizes: 3-column grid
- States: Ecopetrol defined (green callout) / in definition (amber), loading
- Props: `{ dimension: "fin" | "op" | "trans"; foci: Array<{ title?: string; items: Array<{ company: string; label: string; weightPct: number }>; ecopetrolText?: string; ecopetrolStatus: "defined" | "in_definition" }> }`
- Tokens: `dimension.text.financiera`, `dimension.text.operativa`, `dimension.text.transversal`, `chart.ecoChip.bg`, `status.warning.bg`, `radius.card`
- Accessibility: Section per card; callout text read after the list.
- Screens: SCR-08
- Aliases: `Cmp:FocusCard`

### FormulaBox

Formula expression + decomposed terms (Sensibilidades).

- Variants: `default`
- Sizes: 12px
- States: loading, empty (indicator not ready)
- Props: `{ expression: string; terms: string[] }`
- Tokens: `surface.page`, `text.body`, `text.secondary`, `radius.md`
- Accessibility: Expression in `<p>`; terms as `<ul>`.
- Screens: SCR-12
- Aliases: `Cmp:FormulaBox`

### PlanItemCard

Strategic-plan row: indicator, urgency Badge, action, Brecha / Peso / Plazo sugerido (OVL-03).

- Variants: `default`
- Sizes: padding 14
- States: n/a (read-only)
- Props: `{ indicator: string; urgency: "high" | "medium"; action: string; gapPts: number; weightPct: number; termDays: number }`
- Tokens: `border.default`, `urgency.high.bg`, `urgency.medium.bg`, `text.body`, `text.muted`, `radius.md`
- Accessibility: List item; labels "Brecha:", "Peso:", "Plazo sugerido:" kept visible.
- Screens: SCR-12
- Aliases: `Cmp:StrategicPlanItem`

### SlideNote

Per-slide speaker note: amber pill / textarea editor with "✦ Redactar con Yarbis".

- Variants: `pill` · `editing`
- Sizes: —
- States: empty, drafting (AI), saved, error (AI draft failed)
- Props: `{ slideKey: string; text: string; editing: boolean; onEdit: () => void; onSave: (t: string) => void; onCancel: () => void; onDraft?: () => void; drafting?: boolean }`
- Tokens: `status.warning.noteBg`, `status.warning.noteBorder`, `status.warning.noteText`, `radius.control`
- Accessibility: Editable region labelled "Nota de la diapositiva n".
- Screens: SCR-13
- Aliases: `Cmp:NotePill`, `Cmp:SlideNoteEditor`

### SlideRenderer

16:9 slide stage rendering the 14 slide kinds with the template accent (see `docs/design/slide-renderer.md`).

- Variants: per slide kind (cover, closing, bars, pvc, table, heatmap, stacked, ranking, findings, …)
- Sizes: 16:9, scaled to container
- States: loading, empty module ("Selecciona al menos un módulo…"), error
- Props: `{ slide: SlideModel; template: TemplateId; scale?: number }`
- Tokens: `shadow.slideStage`, `shadow.previewSlide`, `gradient.slideCover`, `gradient.slideGlow`, `font.role.titleSlide`, `font.role.displayCover`
- Accessibility: `role="img"` with slide title + summary; data tables for chart slides.
- Screens: SCR-14
- Aliases: `Cmp:SlideRenderer`, `Cmp:SlideStage`

### ErrorPage

403 / 404 page: icon circle, title, description, back action.

- Variants: `forbidden` · `notFound`
- Sizes: centred
- States: n/a
- Props: `{ kind: "forbidden" | "notFound"; backTo?: RouteHref }`
- Tokens: `surface.page`, `text.heading`, `text.secondary`, `brand.primary`
- Accessibility: H1 with the error title; focus moves to it on render.
- Screens: SCR-17
- Aliases: `Cmp:ErrorPage`, `Cmp:ErrorMessage`

### HelpDialog

OVL-12 "Ayuda y documentación": Q&A list + support box.

- Variants: `default`
- Sizes: 440
- States: open / closed
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void }`
- Tokens: `surface.page`, `text.body`, `brand.primary`
- Accessibility: Modal (Radix Dialog); Q&A as description list.
- Screens: SCR-04, SCR-05
- Aliases: `Cmp:HelpModal`
- Implemented: `src/widgets/app-shell/HelpDialog.tsx`

### NarrativeDialog

OVL-08 / OVL-09 executive narrative: sections, "Copiar texto", "Usar en presentación".

- Variants: `results` (560) · `valueMonitor` (520)
- Sizes: 520 · 560
- States: loading (drafting), error, copied ("✓ Copiado")
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; title: string; sections: Array<{ title: string; text: string }>; onCopy: () => void; onUseInPresentation?: () => void; loading?: boolean }`
- Tokens: `ai.text`, `text.body`, `surface.page`
- Accessibility: Modal; generated text labelled as suggestion.
- Screens: SCR-08, SCR-11
- Aliases: `Cmp:NarrativeModal`

### RecommendationsDialog

OVL-01 / OVL-02 "✦ Recomendaciones de Yarbis": tone cards.

- Variants: `weights` · `valueMonitor`
- Sizes: 520
- States: loading, empty, error
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; subtitle: string; items: Array<{ label: string; text: string; tone: "ok" | "info" | "watch" | "action" }> }`
- Tokens: `ai.text`, `status.success.bg`, `status.warning.bg`, `status.danger.bg`
- Accessibility: Modal; tone conveyed by label text.
- Screens: SCR-09
- Aliases: `Cmp:RecommendationsModal`

### CompanyProfileDialog

OVL-13 company profile: PAÍS, CATEGORÍA, NEGOCIO, SEGMENTOS, recent news.

- Variants: `default`
- Sizes: 420
- States: loading, error, no news
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; companyId: string }`
- Tokens: `text.eyebrow`, `text.body`, `surface.page`
- Accessibility: Modal titled by the company name.
- Screens: SCR-07, SCR-10
- Aliases: `Cmp:CompanyProfileModal`

### WeightDetailDialog

OVL-15 "Detalle por compañía (TBG e ILP)": company tabs, dimension blocks with items, ILP column (critic M-03).

- Variants: `default`
- Sizes: 640
- States: loading, no ILP data, error
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; companyId: string; onCompanyChange: (id: string) => void }`
- Tokens: `dimension.accent.financiera`, `dimension.accent.operativa`, `dimension.accent.transversal`, `border.default`, `text.body`
- Accessibility: Modal with Tabs (Radix).
- Screens: SCR-08
- Aliases: `Cmp:CompanyWeightDetailModal`

### ReviewerPickerDialog

OVL-16 "Seleccionar revisores" [proposed, critic M-04]: pick invited reviewers for the preview.

- Variants: `default`
- Sizes: 480
- States: loading users, none selected (confirm disabled), sending, error
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; candidates: Array<{ id: string; name: string; roleLabel: string }>; onConfirm: (ids: string[]) => void }`
- Tokens: `brand.primary`, `border.default`
- Accessibility: Modal with a labelled CheckboxGroup.
- Screens: SCR-09
- Aliases: `Cmp:ReviewerPickerModal`

### FileTransferDialog

OVL-07a upload PPT and OVL-07b download presentation: select / confirm / loading / done steps.

- Variants: `upload` · `download` (format PowerPoint / PDF)
- Sizes: 480
- States: select, confirm, loading (OperationProgress inline), done, error
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; mode: "upload" | "download"; presentationId: string }`
- Tokens: `z.upload`, `file.pptTile`, `status.success.bg`
- Accessibility: Modal; progress announced; file input labelled.
- Screens: SCR-13, SCR-14
- Aliases: `Cmp:UploadPptModal`, `Cmp:DownloadModal`

### SlidePreviewDialog

OVL-06 preview + slide order two-pane dialog (1180).

- Variants: `default`
- Sizes: 1180
- States: loading, empty (no modules), reordering, error
- Props: `{ open: boolean; onOpenChange: (v: boolean) => void; presentationId: string; initialSlide?: number }`
- Tokens: `overlay.previewScrim`, `z.pptPreview`, `shadow.previewSlide`
- Accessibility: Modal; reorder via keyboard (move up / down buttons), not drag only.
- Screens: SCR-13, SCR-14
- Aliases: `Cmp:SlidePreviewModal`

## Tag mapping

Every `Cmp:` tag found in `docs/design/screen-inventory/*.md` → its canonical component. `—` marks a documented
placeholder (not a component). Checked by `node tools/check-component-catalog.mjs`.

| Cmp tag | Canonical component |
|---|---|
| `Cmp:Accordion` | Accordion |
| `Cmp:AddCompanyTile` | CompanyCard |
| `Cmp:AdminModuleCard` | ChoiceCard |
| `Cmp:AiActionPill` | AiActionButton |
| `Cmp:AiFindingCard` | AiInsight |
| `Cmp:AiInsightList` | AiInsight |
| `Cmp:AiPillButton` | AiActionButton |
| `Cmp:AiRecommendationList` | AiInsight |
| `Cmp:AiSuggestionBox` | AiInsight |
| `Cmp:AiSuggestionCard` | AiInsight |
| `Cmp:AiTipBanner` | AiInsight |
| `Cmp:AlertBanner` | AlertBanner |
| `Cmp:AnalysisCard` | AnalysisCard |
| `Cmp:AppHeader` | AppHeader |
| `Cmp:AppShell` | AppShell |
| `Cmp:AssistantFab` | YarbisFab |
| `Cmp:AssistantPanel` | YarbisChatPanel |
| `Cmp:AuthLayout` | AuthLayout |
| `Cmp:AutosaveToast` | Toast |
| `Cmp:Avatar` | Avatar |
| `Cmp:BackButton` | TextLink |
| `Cmp:BackLink` | TextLink |
| `Cmp:Badge` | Badge |
| `Cmp:BarLine` | PairedBarRow |
| `Cmp:BeforeAfterStrip` | BeforeAfterStat |
| `Cmp:BrandLogo` | BrandLogo |
| `Cmp:BrandLogoRow` | BrandLogo |
| `Cmp:Button` | Button |
| `Cmp:Card` | Card |
| `Cmp:CarouselPager` | Pager |
| `Cmp:CategoryChips` | ChipGroup |
| `Cmp:ChangeRequestActions` | CommentThread |
| `Cmp:ChartLegend` | ChartLegend |
| `Cmp:ChatBubble` | YarbisChatPanel |
| `Cmp:ChatInput` | YarbisChatPanel |
| `Cmp:Checkbox` | Checkbox |
| `Cmp:CheckboxList` | CheckboxGroup |
| `Cmp:ChipGroup` | ChipGroup |
| `Cmp:ChoiceChip` | Chip |
| `Cmp:CodeTag` | Badge |
| `Cmp:CommentComposer` | CommentThread |
| `Cmp:CommentItem` | CommentThread |
| `Cmp:CommentStatusChip` | Badge |
| `Cmp:CommentThread` | CommentThread |
| `Cmp:CompanyCoverageCard` | CompanyCard |
| `Cmp:CompanyInitialsChip` | Avatar |
| `Cmp:CompanyNameButton` | TextLink |
| `Cmp:CompanyProfileModal` | CompanyProfileDialog |
| `Cmp:CompanyTile` | CompanyCard |
| `Cmp:CompanyToggleList` | CheckboxGroup |
| `Cmp:CompanyWeightDetailModal` | WeightDetailDialog |
| `Cmp:ComparisonBars` | HorizontalBarList |
| `Cmp:ComparisonIndicatorRow` | PairedBarRow |
| `Cmp:ConfirmationModal` | Modal |
| `Cmp:CountBadge` | Badge |
| `Cmp:DataTable` | DataTable |
| `Cmp:DateField` | TextField |
| `Cmp:DateInput` | TextField |
| `Cmp:DeltaPill` | Badge |
| `Cmp:DimensionGroup` | GroupBox |
| `Cmp:DonutChart` | DonutChart |
| `Cmp:DownloadModal` | FileTransferDialog |
| `Cmp:EcopetrolCallout` | InfoPanel |
| `Cmp:EcopetrolChip` | Badge |
| `Cmp:EcopetrolReferenceBox` | StackedBar |
| `Cmp:EditableValueRow` | ValueInputRow |
| `Cmp:EmptyState` | EmptyState |
| `Cmp:ErrorIcon` | Icon |
| `Cmp:ErrorMessage` | ErrorPage |
| `Cmp:ErrorPage` | ErrorPage |
| `Cmp:ErrorSkeleton` | Skeleton |
| `Cmp:EstimateToggleChip` | Chip |
| `Cmp:ExpandableRowDetail` | InfoPanel |
| `Cmp:FeatureRow` | LoginHero |
| `Cmp:FeedbackThumbs` | YarbisChatPanel |
| `Cmp:FieldLabel` | FieldLabel |
| `Cmp:FileDropBox` | FileDropzone |
| `Cmp:FilterChip` | Chip |
| `Cmp:FocusCard` | FocusCard |
| `Cmp:FontSizeControls` | SegmentedTabs |
| `Cmp:Footnote` | Footnote |
| `Cmp:FormulaBox` | FormulaBox |
| `Cmp:GateChoiceCard` | ChoiceCard |
| `Cmp:GlassCard` | Card |
| `Cmp:GroupedBarChart` | GroupedBarChart |
| `Cmp:GroupEyebrow` | SectionHeader |
| `Cmp:HeaderGradientStrip` | AppHeader |
| `Cmp:Heatmap` | Heatmap |
| `Cmp:HelpModal` | HelpDialog |
| `Cmp:HistoryList` | ActivityList |
| `Cmp:HitoItem` | HorizonUnionPanel |
| `Cmp:HorizonBadge` | Badge |
| `Cmp:HorizonUnionPanel` | HorizonUnionPanel |
| `Cmp:IconButton` | Button |
| `Cmp:IconTile` | IconTile |
| `Cmp:IndicatorComparisonRow` | IndicatorRow |
| `Cmp:IndicatorGroup` | GroupBox |
| `Cmp:IndicatorPill` | Chip |
| `Cmp:IndicatorPillSelector` | ChipGroup |
| `Cmp:IndicatorRow` | IndicatorRow |
| `Cmp:InfoCallout` | InfoPanel |
| `Cmp:InfoIconButton` | InfoButton |
| `Cmp:InfoPanel` | InfoPanel |
| `Cmp:InfoPopover` | InfoPopover |
| `Cmp:InfoToggle` | InfoButton |
| `Cmp:InfoToggleButton` | InfoButton |
| `Cmp:InlineSaveConfirmation` | InlineFeedback |
| `Cmp:InlineStatusBand` | AlertBanner |
| `Cmp:KeyValueList` | KeyValueList |
| `Cmp:KpiStatCard` | KpiStat |
| `Cmp:LeverSlider` | SliderField |
| `Cmp:LifecycleBanner` | AlertBanner |
| `Cmp:LinkButton` | TextLink |
| `Cmp:LoginHero` | LoginHero |
| `Cmp:MarketIndicatorsCard` | KpiStat |
| `Cmp:MarketIndicatorStat` | KpiStat |
| `Cmp:MetaField` | KeyValueList |
| `Cmp:MissingValueRow` | ValueInputRow |
| `Cmp:Modal` | Modal |
| `Cmp:ModuleSelectorRow` | Checkbox |
| `Cmp:NarrativeModal` | NarrativeDialog |
| `Cmp:NewsCard` | NewsCard |
| `Cmp:NotePill` | SlideNote |
| `Cmp:NotificationBadge` | Badge |
| `Cmp:NotificationCard` | NotificationCard |
| `Cmp:NotificationError` | ErrorState |
| `Cmp:NotificationIcon` | Icon |
| `Cmp:NotificationSkeleton` | Skeleton |
| `Cmp:NumberInput` | NumberInput |
| `Cmp:OperationProgress` | OperationProgress |
| `Cmp:OperationProgressBanner` | OperationProgress |
| `Cmp:OverallTierHeader` | OverallTierHeader |
| `Cmp:PagerDots` | Pager |
| `Cmp:PageTitle` | PageHeader |
| `Cmp:PageToolbar` | PageHeader |
| `Cmp:PageTopBar` | AppHeader |
| `Cmp:Pagination` | Pager |
| `Cmp:PairedBarRow` | PairedBarRow |
| `Cmp:PascalName` | — (placeholder in the inventories' conventions note — not a component) |
| `Cmp:PreferenceError` | ErrorState |
| `Cmp:PreferenceLabel` | FieldLabel |
| `Cmp:PreferenceSkeleton` | Skeleton |
| `Cmp:ProfileCard` | ProfileCard |
| `Cmp:ProgressBar` | ProgressBar |
| `Cmp:RadarChart` | RadarChart |
| `Cmp:RankedStackedBarList` | StackedBar |
| `Cmp:RankedValueList` | HorizontalBarList |
| `Cmp:RankingBarList` | HorizontalBarList |
| `Cmp:RankingBarRow` | HorizontalBarList |
| `Cmp:RecommendationsModal` | RecommendationsDialog |
| `Cmp:ReviewerPickerModal` | ReviewerPickerDialog |
| `Cmp:SearchInput` | TextField |
| `Cmp:SectionError` | ErrorState |
| `Cmp:SectionHeader` | SectionHeader |
| `Cmp:SectionResult` | SectionBoundary |
| `Cmp:SectionSkeleton` | Skeleton |
| `Cmp:SectionTitle` | SectionHeader |
| `Cmp:SegmentedTabs` | SegmentedTabs |
| `Cmp:SegmentTip` | InfoPanel |
| `Cmp:Select` | Select |
| `Cmp:SelectAllToggle` | CheckboxGroup |
| `Cmp:SelectFilter` | Select |
| `Cmp:SeverityFilterChips` | ChipGroup |
| `Cmp:SeverityTag` | Badge |
| `Cmp:Sidebar` | Sidebar |
| `Cmp:SidebarCollapseToggle` | Sidebar |
| `Cmp:SidebarNav` | Sidebar |
| `Cmp:SidebarNavItem` | Sidebar |
| `Cmp:SlideNoteEditor` | SlideNote |
| `Cmp:SlidePager` | Pager |
| `Cmp:SlidePreviewModal` | SlidePreviewDialog |
| `Cmp:SlideRenderer` | SlideRenderer |
| `Cmp:SlideStage` | SlideRenderer |
| `Cmp:SourceTabs` | SegmentedTabs |
| `Cmp:StackedBar` | StackedBar |
| `Cmp:StackedBarRow` | StackedBar |
| `Cmp:StaticChip` | Chip |
| `Cmp:StatusBadge` | Badge |
| `Cmp:StatusChip` | Badge |
| `Cmp:StickyRail` | StickyRail |
| `Cmp:StrategicPlanItem` | PlanItemCard |
| `Cmp:SuggestionChip` | Chip |
| `Cmp:SummaryRow` | KeyValueList |
| `Cmp:TableSkeleton` | Skeleton |
| `Cmp:TemplateCard` | TemplateCard |
| `Cmp:TextArea` | TextArea |
| `Cmp:TextField` | TextField |
| `Cmp:TextLink` | TextLink |
| `Cmp:TierCard` | TierCard |
| `Cmp:TierChip` | Badge |
| `Cmp:TierDot` | StatusDot |
| `Cmp:Toast` | Toast |
| `Cmp:ToggleChip` | Chip |
| `Cmp:ToggleSwitch` | Switch |
| `Cmp:TraceabilityGrid` | KeyValueList |
| `Cmp:TrendArrow` | Icon |
| `Cmp:UploadedFileCard` | FileDropzone |
| `Cmp:UploadPptModal` | FileTransferDialog |
| `Cmp:UserChip` | Avatar |
| `Cmp:VerticalBarChart` | GroupedBarChart |
| `Cmp:WeightCategoryGroup` | GroupBox |
| `Cmp:WeightKpiTile` | KpiStat |
| `Cmp:WeightSliderRow` | SliderField |
| `Cmp:WinRatioSummary` | KpiStat |
| `Cmp:WizardStep` | Stepper |
| `Cmp:WizardStepper` | Stepper |
| `Cmp:YarbisChatPanel` | YarbisChatPanel |
| `Cmp:YarbisFab` | YarbisFab |
| `Cmp:YarbisInsightBanner` | AiInsight |
| `Cmp:YarbisInsightCard` | AiInsight |
