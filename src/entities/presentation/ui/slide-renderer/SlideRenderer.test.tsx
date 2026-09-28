import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_DECK, DIRECTORIO, SLIDES_BY_KIND } from './fixtures';
import { SlideRenderer } from './SlideRenderer';
import { SLIDE_CANVAS } from './SlideStage';
import { SLIDE_KINDS } from './types';

import type { Slide, SlideDeckTemplate } from './types';

function renderSlide(slide: Slide, template: SlideDeckTemplate = DIRECTORIO, scale?: number) {
  return render(
    <SlideRenderer
      slide={slide}
      template={template}
      index={0}
      total={14}
      {...(scale === undefined ? {} : { scale })}
    />,
  );
}

const figure = () => screen.getByTestId('slide');

/** Key content every kind must show (texts from the fixtures and the verbatim slide copy). */
const KEY_CONTENT: Record<Slide['kind'], readonly string[]> = {
  title: [
    'Directorio Ejecutivo',
    'Referenciamiento competitivo · T4 2025',
    'ECOPETROL · COMPARADOR FINANCIERO',
  ],
  bars: [
    'GE vs. Promedio Pares',
    'ROACE (%)',
    '7,4%',
    '-13,8%',
    'Grupo Ecopetrol',
    'Promedio pares',
  ],
  table: [
    'Tabla resumen',
    'Valor GE',
    'Prom. pares',
    'Costo de Levantamiento (USD/B)',
    '12,2 USD/B',
  ],
  pvc: ['GE vs. Chevron', 'Crecimiento Producción (%)', '4,2%', 'Chevron'],
  hom: ['Cobertura de datos por compañía', 'ISA', '52%', '3 faltante(s)'],
  homMissing: ['Indicadores faltantes por compañía', '3 indicador(es) faltante(s)', '74%'],
  radar: ['Ecopetrol vs. promedio sectorial', 'Transversal', '45%', '28%'],
  hallazgos: [
    'Hallazgos de Yarbis',
    'La brecha en crecimiento de producción es el mayor rezago identificado frente a Super Majors.',
  ],
  summary: ['KPIs destacados', 'Financiera', 'peso Ecopetrol', '45%'],
  ranking: [
    'Ranking por peso total',
    'TotalEnergies',
    '106%',
    'Peso total = Financiera + Operativa + Transversal · Capital IQ',
  ],
  categories: [
    'Heatmap comparativo por compañía',
    '62%',
    'Entre más oscura la celda, mayor el peso asignado a esa línea de indicador.',
  ],
  findings: ['Composición de peso por línea de indicador', 'TotalEnergies', '24%'],
  appendix: ['Gracias', '¿Preguntas? Escríbenos a analisis.competitivo@ecopetrol.com.co'],
  empty: ['Selecciona al menos un módulo para generar diapositivas.'],
};

describe('SlideRenderer', () => {
  it('paints the cover photo (ppt-cover-bg, WebP) behind the Portada text, decorative only (HTML L2220)', () => {
    renderSlide(SLIDES_BY_KIND.title);
    const background = screen.getByTestId('slide-cover-background');
    expect(background.tagName).toBe('IMG');
    expect(background.getAttribute('src')).toMatch(/ppt-cover-bg\.webp$/);
    expect(background).toHaveAttribute('alt', '');
    expect(background).toHaveClass('object-cover', 'opacity-90');
  });

  it('covers the 14 kinds of V-42', () => {
    expect(SLIDE_KINDS).toHaveLength(14);
    expect(Object.keys(SLIDES_BY_KIND).sort()).toEqual([...SLIDE_KINDS].sort());
  });

  it.each(SLIDE_KINDS)('renders the %s kind with its key content', (kind) => {
    renderSlide(SLIDES_BY_KIND[kind]);
    expect(figure()).toHaveAttribute('data-kind', kind);
    for (const text of KEY_CONTENT[kind]) {
      expect(within(figure()).getAllByText(text, { exact: false }).length).toBeGreaterThan(0);
    }
  });

  it('is a figure named by the slide title', () => {
    renderSlide(SLIDES_BY_KIND.bars);
    expect(screen.getByRole('figure', { name: 'GE vs. Promedio Pares' })).toBe(figure());
  });

  it('renders a safe fallback for a kind it does not know', () => {
    renderSlide({ kind: 'waterfall', pageLabel: '3 / 9' } as unknown as Slide);
    expect(figure()).toHaveAttribute('data-kind', 'waterfall');
    expect(screen.getByRole('figure', { name: 'No hay datos para mostrar.' })).toBeInTheDocument();
  });

  it('adds the chrome (eyebrow, footer, page label, note) only to chrome kinds', () => {
    const [, bars] = DEFAULT_DECK;
    if (!bars) throw new Error('default deck has no bars slide');
    renderSlide(bars);
    const slide = within(figure());
    expect(slide.getByText('Comparativo GE vs. Promedio Pares')).toBeInTheDocument();
    expect(
      slide.getByText('ECOPETROL · COMPARADOR FINANCIERO · Directorio Ejecutivo'),
    ).toBeInTheDocument();
    expect(slide.getByText('2 / 7')).toBeInTheDocument();
    expect(slide.getByTestId('slide-footer')).toBeInTheDocument();
    expect(slide.queryByRole('contentinfo')).toBeNull();
    expect(slide.getByText('Comentario')).toBeInTheDocument();
    expect(slide.getAllByRole('listitem')).toHaveLength(4);
  });

  it.each(['title', 'appendix', 'empty'] as const)(
    'draws %s full-bleed, without footer or page label',
    (kind) => {
      renderSlide(SLIDES_BY_KIND[kind]);
      expect(within(figure()).queryByTestId('slide-footer')).toBeNull();
      expect(within(figure()).queryByText(/\d+ \/ \d+/)).toBeNull();
    },
  );

  it('keeps the stage at 16:9 with a 960 × 540 canvas', () => {
    renderSlide(SLIDES_BY_KIND.bars);
    expect(screen.getByTestId('slide-stage')).toHaveClass('aspect-video');
    expect(screen.getByTestId('slide-stage-canvas')).toHaveStyle({
      width: `${String(SLIDE_CANVAS.width)}px`,
      height: `${String(SLIDE_CANVAS.height)}px`,
    });
  });

  it('hallazgos: draws every finding text of the contract shape (one slide-level status, none per finding) with no status marker', () => {
    const hallazgos = SLIDES_BY_KIND.hallazgos;
    expect(hallazgos.status).toBe('suggestion');
    expect(hallazgos.findings.every((finding) => Object.keys(finding).join() === 'text')).toBe(
      true,
    );
    renderSlide(hallazgos);
    const boxes = figure().querySelectorAll('li');
    expect(boxes).toHaveLength(hallazgos.findings.length);
    hallazgos.findings.forEach((finding, position) => {
      expect(boxes[position]).toHaveTextContent(finding.text);
    });
    expect(within(figure()).queryByText(/suggestion/i)).toBeNull();
  });

  it('scales the canvas uniformly for a fixed scale', () => {
    renderSlide(SLIDES_BY_KIND.bars, DIRECTORIO, 0.5);
    const stage = screen.getByTestId('slide-stage');
    expect(stage).toHaveStyle({ width: '480px', height: '270px' });
    expect(screen.getByTestId('slide-stage-canvas')).toHaveStyle({ transform: 'scale(0.5)' });
  });

  it.each([
    ['directorio', 'bg-template-directorio', 'text-template-directorio'],
    ['storytelling', 'bg-template-storytelling', 'text-ai-text'],
    ['analitico', 'bg-template-detalle-analitico', 'text-text-heading'],
  ] as const)('uses the %s accent tokens', (templateId, fill, eyebrowText) => {
    renderSlide(SLIDES_BY_KIND.bars, { templateId, templateName: 'Plantilla' });
    expect(figure()).toHaveAttribute('data-template', templateId);
    expect(figure().querySelectorAll(`.${fill}`).length).toBeGreaterThanOrEqual(2);
    expect(within(figure()).getByText('Comparativo GE vs. Promedio Pares')).toHaveClass(
      eyebrowText,
    );
  });

  it('draws bar lengths as |value| / maxAbs × 82 % with signed labels', () => {
    renderSlide(SLIDES_BY_KIND.bars);
    const bars = figure().querySelectorAll<HTMLElement>('.bg-chart-peer[style]');
    const widths = [...bars].map((bar) => bar.style.width);
    expect(widths).toContain('82%');
    expect(within(figure()).getByText('-13,8%')).toBeInTheDocument();
  });

  it('normalises stacked segments to their total (106 % does not overflow)', () => {
    renderSlide(SLIDES_BY_KIND.findings);
    const total = within(figure()).getByText('TotalEnergies').nextElementSibling;
    const widths = [...(total?.children ?? [])].map((segment) =>
      Number.parseFloat((segment as HTMLElement).style.width),
    );
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(100);
  });
});
