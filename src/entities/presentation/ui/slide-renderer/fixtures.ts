// Prototype data for the slide renderer's stories and tests (docs/design/slide-renderer.md; BencHUD.dc.html
// CATEGORIES indicators, HOM_POOL L4334–4347, hallazgosIA L4837–4843, ECOPETROL_PESO L4607, pesosCompania L3608–3615,
// default deck L3551–3553). Company values of `pvc` are seeded as in V2 (CF-66). Not UI copy: data of V-42.
import type { Slide, SlideDeckTemplate } from './types';

export const DIRECTORIO: SlideDeckTemplate = {
  templateId: 'directorio',
  templateName: 'Directorio Ejecutivo',
};

const MODULE = {
  comp: 'Comparativo GE vs. Promedio Pares',
  pvc: 'Comparativo GE vs. compañía',
  hom: 'Detalle y edición de datos por compañía',
  resumen: 'Resumen del informe',
  panorama: 'Panorama comparativo de promedios',
  peso: 'Composición de peso por línea de indicador',
  hallazgos: 'Hallazgos de IA',
} as const;

const NOTE = 'Destacar que GE supera al promedio en margen EBITDA pese a la caída del Brent.';

const SUMMARY_TEXT =
  'El grupo Ecopetrol mantiene margen EBITDA superior al promedio de pares a pesar de la caída general del sector.';

/** One slide of every kind (page labels as in a 14-slide deck). */
export const SLIDES_BY_KIND = {
  title: {
    key: 'title',
    kind: 'title',
    label: 'Portada',
    moduleLabel: 'Portada',
    pageLabel: '1 / 14',
    subtitle: 'Referenciamiento competitivo · T4 2025',
  },
  bars: {
    key: 'comp|barras',
    kind: 'bars',
    label: 'Barras GE vs. pares',
    moduleLabel: MODULE.comp,
    pageLabel: '2 / 14',
    title: 'GE vs. Promedio Pares',
    maxAbs: 130.7,
    rows: [
      { indicatorLabel: 'ROACE (%)', ecopetrolValue: 7.4, peerAverageValue: 5.5, unit: 'percent' },
      {
        indicatorLabel: 'Margen EBITDA (%)',
        ecopetrolValue: 39,
        peerAverageValue: 32,
        unit: 'percent',
      },
      {
        indicatorLabel: 'Crecimiento EBITDA (%)',
        ecopetrolValue: -13.8,
        peerAverageValue: -2.2,
        unit: 'percent',
      },
      {
        indicatorLabel: 'Prueba ácida (x)',
        ecopetrolValue: 1.3,
        peerAverageValue: 0.8,
        unit: 'ratio_x',
      },
      {
        indicatorLabel: 'Razón corriente (x)',
        ecopetrolValue: 1.5,
        peerAverageValue: 1.2,
        unit: 'ratio_x',
      },
      {
        indicatorLabel: 'Costo de ventas/BI (USD/B)',
        ecopetrolValue: 66.1,
        peerAverageValue: 130.7,
        unit: 'usd_b',
      },
    ],
  },
  table: {
    key: 'resumen|tabla',
    kind: 'table',
    label: 'Tabla resumen',
    moduleLabel: MODULE.resumen,
    pageLabel: '3 / 14',
    title: 'Tabla resumen',
    rows: [
      {
        categoryLabel: 'Rentabilidad',
        indicatorLabel: 'ROACE (%)',
        ecopetrolValue: 7.4,
        peerAverageValue: 5.5,
        unit: 'percent',
      },
      {
        categoryLabel: 'Rentabilidad',
        indicatorLabel: 'Margen EBITDA (%)',
        ecopetrolValue: 39,
        peerAverageValue: 32,
        unit: 'percent',
      },
      {
        categoryLabel: 'Rentabilidad',
        indicatorLabel: 'Crecimiento EBITDA (%)',
        ecopetrolValue: -13.8,
        peerAverageValue: -2.2,
        unit: 'percent',
      },
      {
        categoryLabel: 'Liquidez',
        indicatorLabel: 'Prueba ácida (x)',
        ecopetrolValue: 1.3,
        peerAverageValue: 0.8,
        unit: 'ratio_x',
      },
      {
        categoryLabel: 'Liquidez',
        indicatorLabel: 'Razón corriente (x)',
        ecopetrolValue: 1.5,
        peerAverageValue: 1.2,
        unit: 'ratio_x',
      },
      {
        categoryLabel: 'Operacional',
        indicatorLabel: 'Crecimiento Producción (%)',
        ecopetrolValue: -0.1,
        peerAverageValue: 5.1,
        unit: 'percent',
      },
      {
        categoryLabel: 'Operacional',
        indicatorLabel: 'Costo de Levantamiento (USD/B)',
        ecopetrolValue: 12.2,
        peerAverageValue: 6.7,
        unit: 'usd_b',
      },
    ],
  },
  pvc: {
    key: 'pvc|chevron',
    kind: 'pvc',
    label: 'Chevron',
    moduleLabel: MODULE.pvc,
    pageLabel: '4 / 14',
    companyName: 'Chevron',
    companyColorKey: 'chevron',
    title: 'GE vs. Chevron',
    rows: [
      {
        indicatorLabel: 'ROACE (%)',
        ecopetrolValue: 7.4,
        companyValue: 6.1,
        unit: 'percent',
        maxAbs: 7.4,
      },
      {
        indicatorLabel: 'Margen EBITDA (%)',
        ecopetrolValue: 39,
        companyValue: 29.4,
        unit: 'percent',
        maxAbs: 39,
      },
      {
        indicatorLabel: 'Crecimiento EBITDA (%)',
        ecopetrolValue: -13.8,
        companyValue: -2.9,
        unit: 'percent',
        maxAbs: 13.8,
      },
      {
        indicatorLabel: 'Prueba ácida (x)',
        ecopetrolValue: 1.3,
        companyValue: 0.9,
        unit: 'ratio_x',
        maxAbs: 1.3,
      },
      {
        indicatorLabel: 'Razón corriente (x)',
        ecopetrolValue: 1.5,
        companyValue: 1.4,
        unit: 'ratio_x',
        maxAbs: 1.5,
      },
      {
        indicatorLabel: 'Crecimiento Producción (%)',
        ecopetrolValue: -0.1,
        companyValue: 4.2,
        unit: 'percent',
        maxAbs: 4.2,
      },
    ],
  },
  hom: {
    key: 'hom|cards',
    kind: 'hom',
    label: 'Tarjetas de cobertura',
    moduleLabel: MODULE.hom,
    pageLabel: '5 / 14',
    cards: [
      { companyName: 'Chevron', coveragePct: 96, tone: 'complete', missingCount: 0 },
      { companyName: 'Shell', coveragePct: 88, tone: 'review', missingCount: 1 },
      { companyName: 'Equinor', coveragePct: 74, tone: 'review', missingCount: 2 },
      { companyName: 'BP', coveragePct: 91, tone: 'complete', missingCount: 1 },
      { companyName: 'ISA', coveragePct: 52, tone: 'incomplete', missingCount: 3 },
    ],
  },
  homMissing: {
    key: 'hom|missing',
    kind: 'homMissing',
    label: 'Indicadores faltantes',
    moduleLabel: MODULE.hom,
    pageLabel: '6 / 14',
    rows: [
      { companyName: 'Shell', missingCount: 1, coveragePct: 88 },
      { companyName: 'Equinor', missingCount: 2, coveragePct: 74 },
      { companyName: 'BP', missingCount: 1, coveragePct: 91 },
      { companyName: 'ISA', missingCount: 3, coveragePct: 52 },
    ],
  },
  radar: {
    key: 'panorama|radar',
    kind: 'radar',
    label: 'Radar GE vs. sector',
    moduleLabel: MODULE.panorama,
    pageLabel: '7 / 14',
    rows: [
      { dimensionLabel: 'Financiera', ecopetrolWeightPct: 45, peerAverageWeightPct: 43 },
      { dimensionLabel: 'Operativa', ecopetrolWeightPct: 30, peerAverageWeightPct: 30 },
      { dimensionLabel: 'Transversal', ecopetrolWeightPct: 25, peerAverageWeightPct: 28 },
    ],
  },
  hallazgos: {
    key: 'hallazgos|lista',
    kind: 'hallazgos',
    label: 'Lista de hallazgos',
    moduleLabel: MODULE.hallazgos,
    pageLabel: '8 / 14',
    // One status for the whole slide (V-42), next to `findings`; the findings themselves carry only their text.
    status: 'suggestion',
    findings: [
      { text: SUMMARY_TEXT },
      {
        text: 'La brecha en crecimiento de producción es el mayor rezago identificado frente a Super Majors.',
      },
      {
        text: '3 indicadores dependen de la actualización manual de ISA — riesgo para el cierre del informe.',
      },
      {
        text: '6 de 7 compañías reportan ROACE de forma homologada — es el indicador con mayor cobertura para benchmarking directo.',
      },
      {
        text: 'Solo 2 de 7 compañías reportan Flujo de Caja Libre — limita la comparabilidad de este indicador y debería priorizarse en la próxima ronda de homologación.',
      },
    ],
  },
  summary: {
    key: 'panorama|kpis',
    kind: 'summary',
    label: 'KPIs resumen',
    moduleLabel: MODULE.panorama,
    pageLabel: '9 / 14',
    ecopetrolWeightPct: { financiera: 45, operativa: 30, transversal: 25 },
    summaryText: SUMMARY_TEXT,
  },
  ranking: {
    key: 'panorama|ranking',
    kind: 'ranking',
    label: 'Ranking por categoría',
    moduleLabel: MODULE.panorama,
    pageLabel: '10 / 14',
    rows: [
      {
        rank: 1,
        companyName: 'TotalEnergies',
        totalWeightPct: 106,
        isEcopetrol: false,
        barPct: 100,
      },
      { rank: 2, companyName: 'Ecopetrol', totalWeightPct: 100, isEcopetrol: true, barPct: 94.3 },
      { rank: 3, companyName: 'BP', totalWeightPct: 100, isEcopetrol: false, barPct: 94.3 },
      { rank: 4, companyName: 'Equinor', totalWeightPct: 100, isEcopetrol: false, barPct: 94.3 },
    ],
  },
  categories: {
    key: 'panorama|heatmap',
    kind: 'categories',
    label: 'Heatmap',
    moduleLabel: MODULE.panorama,
    pageLabel: '11 / 14',
    rows: [
      {
        companyName: 'Ecopetrol',
        financieraPct: 45,
        operativaPct: 30,
        transversalPct: 25,
        isEcopetrol: true,
      },
      {
        companyName: 'TotalEnergies',
        financieraPct: 62,
        operativaPct: 20,
        transversalPct: 24,
        isEcopetrol: false,
      },
      {
        companyName: 'BP',
        financieraPct: 55,
        operativaPct: 15,
        transversalPct: 30,
        isEcopetrol: false,
      },
    ],
  },
  findings: {
    key: 'peso|apiladas',
    kind: 'findings',
    label: 'Barras apiladas',
    moduleLabel: MODULE.peso,
    pageLabel: '12 / 14',
    rows: [
      {
        companyName: 'Ecopetrol',
        financieraPct: 45,
        operativaPct: 30,
        transversalPct: 25,
        totalPct: 100,
      },
      {
        companyName: 'TotalEnergies',
        financieraPct: 62,
        operativaPct: 20,
        transversalPct: 24,
        totalPct: 106,
      },
      { companyName: 'BP', financieraPct: 55, operativaPct: 15, transversalPct: 30, totalPct: 100 },
    ],
  },
  appendix: {
    key: 'appendix',
    kind: 'appendix',
    label: 'Cierre',
    moduleLabel: 'Cierre',
    pageLabel: '13 / 14',
    supportEmail: 'analisis.competitivo@ecopetrol.com.co',
  },
  empty: { kind: 'empty' },
} as const satisfies { [K in Slide['kind']]: Extract<Slide, { kind: K }> };

/** Default 7-slide deck of a new builder (slide-renderer.md "Default order"), `bars` with the seeded note. */
export const DEFAULT_DECK: readonly Slide[] = [
  { ...SLIDES_BY_KIND.title, pageLabel: '1 / 7' },
  {
    ...SLIDES_BY_KIND.bars,
    pageLabel: '2 / 7',
    note: NOTE,
    // A note reduces `bars` to 4 rows (HTML L4925).
    rows: SLIDES_BY_KIND.bars.rows.slice(0, 4),
  },
  { ...SLIDES_BY_KIND.summary, pageLabel: '3 / 7' },
  { ...SLIDES_BY_KIND.categories, pageLabel: '4 / 7' },
  { ...SLIDES_BY_KIND.findings, pageLabel: '5 / 7' },
  { ...SLIDES_BY_KIND.hallazgos, pageLabel: '6 / 7' },
  { ...SLIDES_BY_KIND.appendix, pageLabel: '7 / 7' },
];
