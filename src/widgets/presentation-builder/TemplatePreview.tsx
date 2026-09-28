import type { PresentationTemplateId } from '@/entities/presentation';

/** Accent fill of each template (`template.*` tokens), as SVG `fill-*` classes. */
const ACCENT_FILL: Record<PresentationTemplateId, string> = {
  directorio: 'fill-template-directorio',
  storytelling: 'fill-template-storytelling',
  analitico: 'fill-template-detalle-analitico',
};

// Geometry of the prototype's mini slide (HTML L2426-2437), in a 220 × 120 box: a 16px inset white card with a
// title bar (60 %), two text lines (90 %, 75 %) and four bars (40 / 70 / 55 / 85 % of the chart area).
const CARD = { x: 16, y: 16, width: 188, height: 88 };
const INNER = { x: CARD.x + 10, width: CARD.width - 20 };
const CHART = { top: 62, bottom: CARD.y + CARD.height - 10 };
const BARS = [0.4, 0.7, 0.55, 0.85];

/**
 * Mini slide illustration of a presentation type card (SCR-13 "Tipo de presentación"): drawn as SVG from tokens, not a
 * raster, tinted with the template accent. Decorative (`aria-hidden`): the card's name and description carry the
 * meaning.
 */
export function TemplatePreview({ templateId }: { templateId: PresentationTemplateId }) {
  const accent = ACCENT_FILL[templateId];
  const chartHeight = CHART.bottom - CHART.top;
  return (
    <svg
      viewBox="0 0 220 120"
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-full"
      data-testid={`template-preview-${templateId}`}
    >
      <rect width="220" height="120" className={accent} fillOpacity={0.13} />
      <rect {...CARD} rx="6" className="fill-surface-card" />
      <rect
        x={INNER.x}
        y={CARD.y + 10}
        width={INNER.width * 0.6}
        height="8"
        rx="3"
        className={accent}
      />
      <rect
        x={INNER.x}
        y={CARD.y + 24}
        width={INNER.width * 0.9}
        height="5"
        rx="3"
        className="fill-border-default"
      />
      <rect
        x={INNER.x}
        y={CARD.y + 35}
        width={INNER.width * 0.75}
        height="5"
        rx="3"
        className="fill-border-default"
      />
      {BARS.map((ratio, index) => (
        <rect
          key={ratio}
          x={INNER.x + index * 12}
          y={CHART.bottom - chartHeight * ratio}
          width="8"
          height={chartHeight * ratio}
          rx="2"
          className={accent}
          data-part="bar"
        />
      ))}
    </svg>
  );
}
