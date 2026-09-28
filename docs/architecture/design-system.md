# Design System

The design system is a token-driven, layer-based system that ensures visual consistency across the application.

## Token Pipeline

Design tokens are defined in `docs/design/design-tokens.json` and automatically generated into:

- `src/app/styles/theme.css` — Tailwind CSS variable definitions
- `src/shared/lib/tailwind-theme.generated.ts` — TypeScript types for the generated tokens

Generate and verify tokens with:

```bash
pnpm tokens:build      # Generate CSS and TypeScript tokens
pnpm tokens:check      # Verify tokens match design spec (exit 1 on mismatch)
```

The `pnpm tokens:check` script runs `pnpm tokens:build --check`, which fails if the generated files differ from the source-of-truth or if the design tokens JSON has invalid values.

## Component Layers

All UI components live under `src/shared/ui/`. Each layer may import only from layers below it (FSD boundaries enforced by `pnpm check:architecture`).

### Primitives (`src/shared/ui/primitives/`)

Base-level, low-level components that directly use design tokens:

- `button` — Button with variants (primary, outline, link, forward, dashed, gradient, cyan)
- `badge`, `ai-pill`, `chip` — Status and tag components
- `group-select-toggle` — Bulk selection toggle
- `icon-button` — Icon-only button variant
- `inputs` — Input field wrapper and variants

### Composites (`src/shared/ui/composites/`)

Higher-level components composed from primitives and tokens:

- `accordion`, `alert`, `avatar` — Structural and feedback components
- `comment-thread` — Nested comment display with status
- `company-logo-chip` — Company branding chip
- `empty-state` — No-data placeholder
- `kpi-stat-card` — KPI display with trend indicator
- `modal`, `popover` — Overlay containers
- `section-card` — Card with optional expandable details
- `skeleton` — Loading state placeholder
- `stepper` — Multi-step progress indicator
- `tabs`, `toast` — Navigation and notification components

### Layout (`src/shared/ui/layout/`)

Layout primitives that structure content sections:

- `section-boundary` — Loading/empty/error/forbidden state wrapper with skeleton and retry

### Charts (`src/shared/ui/charts/`)

Visualization components using ECharts (imported only here per ADR-0003):

- `donut`, `echarts`, `grouped-bar-chart`, `heatmap`, `legend`, `primitives`
- `quadrant`, `radar`, `stacked-ranked-bars`, `vertical-bars`

### Table (`src/shared/ui/table/`)

Table components built on TanStack Table:

- Column definitions, sorting, filtering, row expansion, pagination

### Icons (`src/shared/ui/icons/`)

SVG icons (e.g., ArrowUpIcon, ArrowDownIcon used in KpiStatCard)

## Storybook

Run Storybook for the design system (and all component stories):

```bash
pnpm storybook        # Dev server on http://localhost:6006
pnpm build-storybook  # Static build to storybook-static/
```

### Stories Smoke Test

All stories are verified by `src/test/stories.smoke.test.tsx`:

- No empty `export default` (Storybook index requires it)
- No Vitest code in stories (build-storybook fails)
- All stories render bare (no global decorators or MSW addon)
- Components using `useServices()` or query hooks need their own decorator (ServiceContext.Provider + QueryClientProvider)
- Components with `<Link>` or `useNavigate` need MemoryRouter

Pages and widgets must not import `@/app/providers` (FSD boundaries).

## Accessibility

### Automated Testing

The Storybook `@storybook/addon-a11y` addon and Playwright axe-core integration enforce accessibility rules:

- Storybook `preview.ts` configures `a11y: { test: 'error' }` — failures fail the story in tests
- E2E tests use `@axe-core/playwright` with the `settled-page` helper in `e2e/pages/accessibility.ts`

### Rules

- Zero serious/critical violations allowed
- No rule exclusions unless an ADR explicitly permits them
- Failing an accessibility check means fixing the token/theme, not excluding the rule (CF-143, CF-144)

### WCAGAA Compliance

Colors from `design-tokens.json` are validated for contrast ratios (e.g., KPI tones mapped to AA-safe text tokens when prototype colors fail).

## i18n Rule

All visible UI text goes through i18n keys:

- Use `const t = useT()` in components (imported from `@/shared/i18n`)
- Use `t` imported directly in non-React code
- Keys use dot notation with namespace prefix: `t('common.nav.home')`
- English segments describe location, not content: `<namespace>.<section>.<element>`
- Values are Spanish (es-CO), verbatim from screen inventory or marked `[inference]`

ESLint `react/jsx-no-literals` (in `eslint.config.js`) rejects literal JSX text in `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared/ui`. Only punctuation and glyphs are allowed.
