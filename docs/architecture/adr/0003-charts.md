# ADR-0003: Charts — Apache ECharts with CSS primitives

## Status

Accepted.

## Context

The prototype uses bar charts for the "Análisis" and "Sensibilidades" screens. The decision must balance interactivity (zoom, tooltip, legend), file size, and maintainability.

Constraints:
- The prototype's "bar rows" in screens 6-16 are simple horizontal bars (no interactive charts).
- The prototype's quadrant charts (screens 12-13) are scatter plots requiring zoom/tooltip support.
- Material Symbols and icon fonts are rejected (ADR-0006).
- File size matters; bundling a full chart library must be justified.

Sources: `PLAN.md` D3, `.plan/source-map/10-synthesis.md` §6.1-6.2 (lines 1006-1041), `prompt_Start_Eco.md` L188-196.

## Decision

1. **Apache ECharts** as the chart library:
   - Modular imports (`echarts/core`, `echarts/charts`, `echarts/components`) keep bundle size minimal.
   - SVG renderer ensures crisp rendering on high-DPI displays.
   - Built-in zoom, tooltip, legend, and data view features reduce custom implementation.

2. **Library location**: `src/shared/ui/charts/` only, enforced by ESLint:
   ```js
   // .eslintrc.cjs
   'rules': {
     'no-restricted-imports': ['error', {
       'patterns': ['echarts/*', '!echarts/core', '!echarts/charts', '!echarts/components'],
     }],
   }
   ```

3. **CSS primitives for simple bars**: Screens 6-16 use plain `<div>` elements with Tailwind utilities for horizontal bars:
   ```html
   <div class="flex items-center gap-4">
     <span class="w-32 truncate">Metric name</span>
     <div class="flex-1 h-8 bg-surface border rounded overflow-hidden">
       <div class="h-full bg-brand-primary" style="width: 75%" />
     </div>
     <span class="w-20 text-right">75%</span>
   </div>
   ```
   This avoids loading ECharts for simple progress bars.

4. **ECharts wrapper components** in `src/shared/ui/charts/`:
   ```ts
   // src/shared/ui/charts/QuadrantChart.tsx
   import { useEffect, useRef } from 'react';
   import * as echarts from 'echarts/core';
   import { ScatterChart } from 'echarts/charts';
   import { TooltipComponent, LegendComponent } from 'echarts/components';

   echarts.use([ScatterChart, TooltipComponent, LegendComponent]);

   export const QuadrantChart = ({ data }) => {
     const containerRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
       const chart = echarts.init(containerRef.current!);
       chart.setOption({ /* ... */ });
       return () => chart.dispose();
     }, [data]);
     return <div ref={containerRef} class="w-full h-96" />;
   };
   ```

5. **No hand-written SVG paths** for charts. All chart rendering goes through ECharts.

## Alternatives considered

- **D3.js**: More flexible but requires custom implementation of tooltips, zoom, legend; larger learning curve.
- **Chart.js**: Simpler API but less interactive features; no built-in zoom.
- **Recharts**: React-specific but limited to React; no scatter plot support out of the box.
- **Plain Canvas/SVG**: Custom implementation of all chart features; not justified for v1.

## Consequences

- Positive: Consistent chart behavior across all screens (tooltip, zoom, legend).
- Positive: Modular imports keep bundle size reasonable (~50KB gzipped for common charts).
- Positive: CSS primitives for simple bars avoid unnecessary library load.
- Negative: ECharts has a steeper learning curve than simpler libraries.
- Negative: Chart options are JavaScript objects, not CSS; testing visual parity requires snapshot testing.
