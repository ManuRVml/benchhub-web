// The only module that talks to ECharts directly (D3; the lint rule allows `echarts` imports only under
// src/shared/ui/charts). Modular build: register exactly what the wrappers use, render as SVG.
import { BarChart, HeatmapChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  PolarComponent,
  RadarComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';
import { init, registerTheme, use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

import { ECO_THEME, ECO_THEME_NAME } from './theme';

import type {
  BarSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts';
import type {
  GraphicComponentOption,
  GridComponentOption,
  LegendComponentOption,
  PolarComponentOption,
  RadarComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components';
import type { ComposeOption, EChartsType } from 'echarts/core';

use([BarChart, PieChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);
// P5-21: radar grid (3 / 20 axes) with its series drawn as polar lines (gaps for missing values), heatmap and quadrant
// scatter (mid lines + corner labels).
use([
  RadarComponent,
  LineChart,
  PolarComponent,
  HeatmapChart,
  ScatterChart,
  MarkLineComponent,
  GraphicComponent,
]);
// P5-21b: ECharts renders a heatmap only with a visualMap; HeatmapChart maps each cell to its token ramp colour.
use([VisualMapPiecewiseComponent]);
registerTheme(ECO_THEME_NAME, ECO_THEME);

/** Option type limited to the registered chart types and components. */
export type ChartOption = ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  // P5-21
  | LineSeriesOption
  | HeatmapSeriesOption
  | ScatterSeriesOption
  | RadarComponentOption
  | PolarComponentOption
  | GraphicComponentOption
  // P5-21b
  | VisualMapComponentOption
>;

export type ChartInstance = Pick<EChartsType, 'setOption' | 'resize' | 'dispose'>;

/** Creates an SVG chart with the token theme inside `element`. */
export function createChart(element: HTMLElement): ChartInstance {
  return init(element, ECO_THEME_NAME, { renderer: 'svg' });
}
