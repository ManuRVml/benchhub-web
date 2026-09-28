# ADR-0002: Styling — Tailwind CSS v4, CSS-first tokens

## Status

Accepted.

## Context

The Eco-Comparador web prototype uses a CSS-first design system with custom tokens (HSL, opacity) rather than arbitrary hex values. The decision must balance maintainability (CSS-in-JS or vanilla CSS), tooling support (IntelliSense, linting), and integration with the design token workflow.

Constraints:
- The prototype uses inline styles in the HTML export, but these are not maintainable for a full codebase.
- The design system is defined in `docs/design/design-tokens.json` (DTCG format) with `@extensions.eco.source` citations linking to `.plan/source-map/10-synthesis.md`.
- No Sass/SCSS should be used; vanilla CSS or CSS-in-JS only.
- Arbitrary values or hex colors outside the token set are forbidden.

Sources: `PLAN.md` D2, `.plan/source-map/10-synthesis.md` §6.3 (lines 1042-1059), `prompt_Start_Eco.md` L186.

## Decision

1. **Tailwind CSS v4** as the utility-first framework. It supports CSS-first configuration via `@theme` directive, integrates with PostCSS, and has built-in support for custom theme values.

2. **CSS-first tokens** via `@theme` in `src/styles/theme.css`:
   ```css
   @theme {
     --color-brand-primary: 120 100% 50%;
     --color-brand-secondary: 240 100% 60%;
     /* ... all design tokens from docs/design/design-tokens.json ... */
   }
   ```
   The `@theme` block is generated from `docs/design/design-tokens.json` (see P1-05).

3. **Component classes** using `cva()` (Class Variance Authority) for variant-based styling and `tailwind-merge` for safe class merging:
   ```ts
   import { cva } from 'class-variance-authority';
   import { twMerge } from 'tailwind-merge';

   const buttonVariant = cva('px-4 py-2 rounded', {
     variants: {
       variant: {
         primary: 'bg-brand-primary text-white',
         secondary: 'bg-brand-secondary text-black',
       },
     },
   });

   const Button = ({ variant, className, ...props }) => (
     <button className={twMerge(buttonVariant({ variant }), className)} {...props} />
   );
   ```

4. **No arbitrary values** (`bg-[#abcdef]`) outside the token set. Use `theme()` function or CSS variables:
   ```css
   .custom-bg { background-color: theme('colors.brand.primary'); }
   ```

5. **No Sass/SCSS**. All styles are vanilla CSS or Tailwind utilities.

## Alternatives considered

- **CSS Modules** (`*.module.css`): Type-safe but no automatic utility class support; would require duplicating token values in JS/TS.
- **Vanilla CSS with custom properties**: More verbose; no utility class convenience.
- **CSS-in-JS (styled-components, Emotion)**: Runtime overhead; no Tailwind utility support; harder to audit for arbitrary values.
- **Linaria**: Compile-time CSS-in-JS, but no `cva()` equivalent and no Tailwind integration.

## Consequences

- Positive: Single source of truth for colors, spacing, typography via `docs/design/design-tokens.json`.
- Positive: Type-safe variants via `cva()` with TypeScript inference.
- Positive: Safe class merging via `tailwind-merge` prevents conflicting utility classes.
- Negative: Initial setup requires generating `@theme` from the JSON (P1-05).
- Negative: Team must adhere to the "no arbitrary values" rule; linting (see P2-W08 CI) enforces this.
