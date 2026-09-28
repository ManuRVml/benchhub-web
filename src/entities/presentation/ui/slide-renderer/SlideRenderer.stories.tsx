import { DEFAULT_DECK, DIRECTORIO, SLIDES_BY_KIND } from './fixtures';
import { slideKey } from './slide-fields';
import { SlideRenderer } from './SlideRenderer';

import type { Slide } from './types';
import type { Meta, StoryObj } from '@storybook/react-vite';

// One story per kind with the prototype data of docs/design/slide-renderer.md, plus the default 7-slide deck. Slide
// texts are V-42 data (fixtures.ts); fixed slide copy comes from the presentation-detail namespace.
const meta = {
  title: 'Entities/Presentation/SlideRenderer',
  component: SlideRenderer,
  args: { slide: SLIDES_BY_KIND.bars, template: DIRECTORIO, index: 1, total: 14, variant: 'stage' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['stage', 'preview'] },
    slide: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[900px] bg-surface-page p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SlideRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const kind = (slide: Slide, name: string): Story => ({ name, args: { slide } });

export const Title = kind(SLIDES_BY_KIND.title, 'title · Portada');
export const Bars = kind(SLIDES_BY_KIND.bars, 'bars · GE vs. Promedio Pares');
export const Table = kind(SLIDES_BY_KIND.table, 'table · Tabla resumen');
export const Pvc = kind(SLIDES_BY_KIND.pvc, 'pvc · GE vs. compañía');
export const Hom = kind(SLIDES_BY_KIND.hom, 'hom · Cobertura de datos');
export const HomMissing = kind(SLIDES_BY_KIND.homMissing, 'homMissing · Indicadores faltantes');
export const Radar = kind(SLIDES_BY_KIND.radar, 'radar · Ecopetrol vs. promedio sectorial');
export const Hallazgos = kind(SLIDES_BY_KIND.hallazgos, 'hallazgos · Hallazgos de Yarbis');
export const Summary = kind(SLIDES_BY_KIND.summary, 'summary · KPIs destacados');
export const Ranking = kind(SLIDES_BY_KIND.ranking, 'ranking · Ranking por peso total');
export const Categories = kind(SLIDES_BY_KIND.categories, 'categories · Heatmap comparativo');
export const Findings = kind(SLIDES_BY_KIND.findings, 'findings · Composición de peso');
export const Appendix = kind(SLIDES_BY_KIND.appendix, 'appendix · Cierre');
export const Empty = kind(SLIDES_BY_KIND.empty, 'empty · Sin diapositivas');

/** Storytelling accent (cyan): eyebrow in `ai.text`, dark text on accent fills. */
export const StorytellingTemplate: Story = {
  name: 'summary · plantilla Storytelling',
  args: {
    slide: SLIDES_BY_KIND.summary,
    template: { templateId: 'storytelling', templateName: 'Storytelling' },
  },
};

/** Detalle Analítico accent (blue). */
export const AnaliticoTemplate: Story = {
  name: 'ranking · plantilla Detalle Analítico',
  args: {
    slide: SLIDES_BY_KIND.ranking,
    template: { templateId: 'analitico', templateName: 'Detalle Analítico' },
  },
};

/** The default 7-slide deck (Portada … Cierre) as OVL-06 thumbnails at a fixed scale. */
export const DefaultDeck: Story = {
  name: 'Mazo por defecto (7 diapositivas)',
  render: () => (
    <ol className="m-0 grid list-none grid-cols-2 gap-16 p-0">
      {DEFAULT_DECK.map((slide, index) => (
        <li key={slideKey(slide) ?? slide.kind}>
          <SlideRenderer
            slide={slide}
            template={DIRECTORIO}
            index={index}
            total={DEFAULT_DECK.length}
            scale={0.42}
            variant="preview"
            testId={`deck-slide-${String(index + 1)}`}
          />
        </li>
      ))}
    </ol>
  ),
};
