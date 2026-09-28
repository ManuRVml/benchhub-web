import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { colorOfToken, contrast, mixColor } from '@/shared/ui/charts/radar';

import { TEMPLATE_ACCENT, formatWholePct } from '../slide-theme';
import { SlideChrome } from '../SlideChrome';

import type { CategoriesSlide, FindingsSlide, RankingSlide } from '../types';
import type { ChromeKindProps } from './chrome-kind-props';

// Weight kinds (slide-renderer.md "ranking", "categories", "findings"). Dimension colours are `dimension.accent.*`.

const DIMENSIONS = ['financiera', 'operativa', 'transversal'] as const;
type Dimension = (typeof DIMENSIONS)[number];

const pctOf = (
  row: CategoriesSlide['rows'][number] | FindingsSlide['rows'][number],
  dim: Dimension,
) =>
  dim === 'financiera'
    ? row.financieraPct
    : dim === 'operativa'
      ? row.operativaPct
      : row.transversalPct;

/** Ranking por peso total (HTML L2243–2261): top 4, accent rank circle, Ecopetrol bar `chart.ecopetrol`. */
export function RankingSlideView({ slide, template, ...chrome }: ChromeKindProps<RankingSlide>) {
  const t = useT();
  const accent = TEMPLATE_ACCENT[template];
  return (
    <SlideChrome
      {...chrome}
      template={template}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.ranking.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <ol className="m-0 flex list-none flex-col gap-12 p-0">
        {slide.rows.map((row) => (
          <li key={row.companyName} className="flex items-center gap-12">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-24 shrink-0 items-center justify-center rounded-pill text-11 font-bold',
                accent.fill,
                accent.onFill,
              )}
            >
              {row.rank}
            </span>
            <span className="w-[84px] shrink-0 truncate text-13 font-bold text-text-heading">
              {row.companyName}
            </span>
            <span className="h-[22px] flex-1 overflow-hidden rounded-bar-lg bg-chart-track">
              <span
                aria-hidden="true"
                className={cn(
                  'block h-full rounded-bar-lg',
                  row.isEcopetrol ? 'bg-chart-ecopetrol' : 'bg-chart-peer',
                )}
                style={{ width: `${String(Math.min(100, Math.max(0, row.barPct)))}%` }}
              />
            </span>
            <span className="w-[52px] shrink-0 text-right font-mono text-13 font-bold text-text-heading">
              {formatWholePct(row.totalWeightPct)}
            </span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-14 text-12 text-text-secondary">
        {t('presentation-detail.slides.ranking.footnote')}
      </p>
    </SlideChrome>
  );
}

/**
 * Heatmap comparativo por compañía (HTML L2262–2283). V2 paints solid dimension colours although the footnote says
 * darker = heavier; per the spec each cell is graded within its column (35 % → 100 % of the dimension colour over the
 * card), so the footnote is true, and its ink is whichever of `dark.bg` / `text.inverse` contrasts more.
 */
export function CategoriesSlideView({ slide, ...chrome }: ChromeKindProps<CategoriesSlide>) {
  const t = useT();
  const base = colorOfToken('surface.card');
  const inks = [colorOfToken('dark.bg'), colorOfToken('text.inverse')] as const;
  const cellStyle = (dim: Dimension, value: number) => {
    const column = slide.rows.map((row) => pctOf(row, dim));
    const [min, max] = [Math.min(...column), Math.max(...column)];
    const intensity = max === min ? 1 : 0.35 + (0.65 * (value - min)) / (max - min);
    const fill = mixColor(base, colorOfToken(`dimension.accent.${dim}`), intensity);
    const ink = contrast(fill, inks[0]) >= contrast(fill, inks[1]) ? inks[0] : inks[1];
    return { backgroundColor: fill, color: ink };
  };
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.categories.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <table className="w-full border-separate border-spacing-6">
        <thead>
          <tr className="text-11 font-semibold tracking-[.04em] text-text-secondary uppercase">
            <td className="w-[120px]" />
            {DIMENSIONS.map((dim) => (
              <th key={dim} scope="col" className="text-center font-semibold">
                {t(`presentation-detail.slides.dimensions.${dim}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.rows.map((row) => (
            <tr key={row.companyName}>
              <th scope="row" className="text-left text-13 font-bold text-text-heading">
                {row.companyName}
              </th>
              {DIMENSIONS.map((dim) => (
                <td
                  key={dim}
                  className="rounded-sm p-10 text-center text-13 font-bold"
                  style={cellStyle(dim, pctOf(row, dim))}
                >
                  {formatWholePct(pctOf(row, dim))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 mt-12 text-12 text-text-secondary">
        {t('presentation-detail.slides.categories.footnote')}
      </p>
    </SlideChrome>
  );
}

/** Segment fill + AA ink per dimension accent (purple: white; cyan and amber: dark). */
const SEGMENT_CLASS: Readonly<Record<Dimension, string>> = {
  financiera: 'bg-dimension-accent-financiera text-text-inverse',
  operativa: 'bg-dimension-accent-operativa text-dark-bg',
  transversal: 'bg-dimension-accent-transversal text-dark-bg',
};

/**
 * Composición de peso por línea de indicador (HTML L2284–2308): a 24px 100 % stacked bar per company. Segment widths
 * are normalised to value / total so a 106 % total (CF-65) does not overflow; the labels keep the raw values.
 */
export function FindingsSlideView({ slide, ...chrome }: ChromeKindProps<FindingsSlide>) {
  const t = useT();
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.findings.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <ul className="m-0 flex list-none flex-col gap-14 p-0">
        {slide.rows.map((row) => {
          const total = row.totalPct > 0 ? row.totalPct : 1;
          return (
            <li key={row.companyName} className="flex flex-col gap-6">
              <span className="text-12 font-semibold text-text-heading">{row.companyName}</span>
              <span className="flex h-24 overflow-hidden rounded-sm">
                {DIMENSIONS.map((dim) => (
                  <span
                    key={dim}
                    className={cn(
                      'flex items-center justify-center text-11 font-semibold',
                      SEGMENT_CLASS[dim],
                    )}
                    style={{ width: `${String((pctOf(row, dim) / total) * 100)}%` }}
                  >
                    {formatWholePct(pctOf(row, dim))}
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="m-0 mt-12 flex gap-16 text-11 text-text-secondary">
        {DIMENSIONS.map((dim) => (
          <span key={dim} className="inline-flex items-center gap-6">
            <span
              aria-hidden="true"
              className={cn('size-[9px] rounded-legend', SEGMENT_CLASS[dim])}
            />
            {t(`presentation-detail.slides.dimensions.${dim}`)}
          </span>
        ))}
      </p>
    </SlideChrome>
  );
}
