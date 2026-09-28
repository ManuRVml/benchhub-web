# ADR-0006: Icons — Inline 20x20 stroke SVGs, no icon font

## Status

Accepted.

## Context

The prototype uses inline SVG icons (grid, bars, funnel, etc.) for its UI. The decision must balance file size, maintainability, and accessibility.

Constraints:
- No icon fonts (Material Symbols) — rejected per brief L51.
- Icons are 20x20 with stroke 1.6-1.8.
- Round caps and joins for consistent rendering.
- No filled icons except status dots/badges.

Sources: `.plan/source-map/10-synthesis.md` §2.12 (lines 682-689), `prompt_Start_Eco.md` L51.

## Decision

1. **Inline SVGs** in `src/shared/ui/icons/`:
   - Each icon is a separate `.tsx` file exporting a component:
     ```tsx
     // src/shared/ui/icons/Grid.tsx
     export const Grid = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
       <svg
         width="20"
         height="20"
         viewBox="0 0 20 20"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         className={className}
         {...props}
       >
         <path
           d="M2 2h6v6H2V2zm10 0h6v6h-6V2zM2 12h6v6H2v-6zm10 0h6v6h-6v-6z"
           stroke="currentColor"
           strokeWidth="1.6"
           strokeLinecap="round"
           strokeLinejoin="round"
         />
       </svg>
     );
     ```
   - Uses `stroke` for outlines; no fills except status dots.

2. **Location**: `src/shared/ui/icons/` with one file per icon (Grid, Bars, Funnel, etc.).

3. **Props**: Accepts `className`, `stroke`, `fill`, and other SVG props for flexibility.

4. **Accessibility**: Icons intended for decoration get `aria-hidden`; icons with meaning get `role="img"` and `aria-label`.

5. **No icon font**: Material Symbols and similar fonts are rejected (brief L51, synthesis §2.12).

## Alternatives considered

- **Icon font (Material Symbols)**: Extra HTTP request; font loading delay; not accessible by default.
- **SVG sprite sheet**: Requires build step; harder to tree-shake.
- **React component library (react-icons)**: Bundle size includes all icons; not tree-shakable.

## Consequences

- Positive: No external dependencies; icons are pure React components.
- Positive: Easy to customize stroke color, size via props.
- Positive: Tree-shakable; only imported icons are bundled.
- Negative: More files to manage (one per icon).
- Negative: No auto-generated icon library; manual creation.
