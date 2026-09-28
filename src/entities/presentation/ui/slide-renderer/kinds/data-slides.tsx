import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui/charts/primitives';

import { TEMPLATE_ACCENT, formatSlideValue, formatWholePct } from '../slide-theme';
import { SlideChrome } from '../SlideChrome';

import type { HallazgosSlide, HomMissingSlide, HomSlide, SummarySlide, TableSlide } from '../types';
import type { ChromeKindProps } from './chrome-kind-props';

// Table, coverage and text kinds (slide-renderer.md "table", "hom", "homMissing", "hallazgos", "summary").

/** Tabla de indicadores / Tabla resumen (HTML L2143–2153): bordered table, values right-aligned in mono. */
export function TableSlideView({ slide, ...chrome }: ChromeKindProps<TableSlide>) {
  const t = useT();
  const cell = 'px-10 py-6 text-left';
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={slide.title}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <div className="overflow-hidden rounded-control border border-border-default">
        <table className="w-full border-collapse text-11 text-text-body">
          <thead className="bg-surface-page text-10 font-semibold tracking-[.04em] text-text-secondary uppercase">
            <tr>
              <th scope="col" className={cn(cell, 'w-1/4')}>
                {t('presentation-detail.slides.table.category')}
              </th>
              <th scope="col" className={cell}>
                {t('presentation-detail.slides.table.kpi')}
              </th>
              <th scope="col" className={cn(cell, 'w-[80px] text-right')}>
                {t('presentation-detail.slides.table.ecopetrol')}
              </th>
              <th scope="col" className={cn(cell, 'w-[80px] text-right')}>
                {t('presentation-detail.slides.table.peers')}
              </th>
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((row) => (
              <tr
                key={`${row.categoryLabel}|${row.indicatorLabel}`}
                className="border-t border-border-subtle"
              >
                <td className={cell}>{row.categoryLabel}</td>
                <th scope="row" className={cn(cell, 'font-normal')}>
                  {row.indicatorLabel}
                </th>
                <td className={cn(cell, 'text-right font-mono font-bold text-text-heading')}>
                  {formatSlideValue(row.ecopetrolValue, row.unit)}
                </td>
                <td className={cn(cell, 'text-right font-mono')}>
                  {formatSlideValue(row.peerAverageValue, row.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SlideChrome>
  );
}

const HOM_TONE = {
  complete: { text: 'text-status-success-text', bar: 'success' },
  review: { text: 'text-status-warning-text', bar: 'warning' },
  incomplete: { text: 'text-status-danger-text', bar: 'danger' },
} as const;

/** Cobertura de datos por compañía (HTML L2171–2185): one card per company with a tone progress bar. */
export function HomSlideView({ slide, ...chrome }: ChromeKindProps<HomSlide>) {
  const t = useT();
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.hom.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-10 p-0">
        {slide.cards.map((card) => {
          const tone = HOM_TONE[card.tone];
          return (
            <li
              key={card.companyName}
              className="flex flex-col gap-6 rounded-control border border-border-default p-10"
            >
              <span className="text-12 font-semibold text-text-heading">{card.companyName}</span>
              <span className={cn('text-20 font-bold', tone.text)}>
                {formatWholePct(card.coveragePct)}
              </span>
              <ProgressBar
                value={card.coveragePct}
                tone={tone.bar}
                aria-label={card.companyName}
                valueText={formatWholePct(card.coveragePct)}
              />
              <span className="text-10 text-text-secondary">
                {t('presentation-detail.slides.hom.missing', { count: card.missingCount })}
              </span>
            </li>
          );
        })}
      </ul>
    </SlideChrome>
  );
}

/** Indicadores faltantes por compañía (HTML L2186–2195): only companies with missing indicators. */
export function HomMissingSlideView({ slide, ...chrome }: ChromeKindProps<HomMissingSlide>) {
  const t = useT();
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.homMissing.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <ul className="m-0 flex list-none flex-col gap-8 p-0">
        {slide.rows.map((row) => (
          <li
            key={row.companyName}
            className="flex items-center gap-12 rounded-control bg-status-danger-missing-row-bg px-14 py-10"
          >
            <span className="flex-1 text-13 font-semibold text-text-heading">
              {row.companyName}
            </span>
            <span className="text-12 font-medium text-status-danger-text">
              {t('presentation-detail.slides.homMissing.missing', { count: row.missingCount })}
            </span>
            <span className="font-mono text-12 font-bold text-text-secondary">
              {formatWholePct(row.coveragePct)}
            </span>
          </li>
        ))}
      </ul>
    </SlideChrome>
  );
}

/** Hallazgos de Yarbis (HTML L2210–2217): up to 5 AI boxes prefixed "✦". */
export function HallazgosSlideView({ slide, ...chrome }: ChromeKindProps<HallazgosSlide>) {
  const t = useT();
  return (
    <SlideChrome
      {...chrome}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.hallazgos.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <ul className="m-0 flex list-none flex-col gap-12 p-0">
        {slide.findings.slice(0, 5).map((finding) => (
          <li
            key={finding.text}
            className="rounded-control bg-ai-bg px-14 py-[11px] text-12 font-medium text-ai-text"
          >
            <span aria-hidden="true">✦ </span>
            {finding.text}
          </li>
        ))}
      </ul>
    </SlideChrome>
  );
}

/** KPIs destacados (HTML L2229–2242): three weight tiles + the summary narrative. */
export function SummarySlideView({ slide, template, ...chrome }: ChromeKindProps<SummarySlide>) {
  const t = useT();
  const accent = TEMPLATE_ACCENT[template];
  const tiles = [
    {
      id: 'financiera',
      value: slide.ecopetrolWeightPct.financiera,
      className: cn(accent.fill, accent.onFill),
    },
    {
      id: 'operativa',
      value: slide.ecopetrolWeightPct.operativa,
      className: 'bg-status-success-bg text-status-success-text',
    },
    {
      id: 'transversal',
      value: slide.ecopetrolWeightPct.transversal,
      className: 'bg-status-warning-bg text-status-warning-text',
    },
  ] as const;
  return (
    <SlideChrome
      {...chrome}
      template={template}
      eyebrow={slide.moduleLabel}
      title={t('presentation-detail.slides.summary.title')}
      pageLabel={slide.pageLabel}
      note={slide.note}
    >
      <div className="flex flex-col gap-14">
        <ul className="m-0 grid list-none grid-cols-3 gap-14 p-0">
          {tiles.map((tile) => (
            <li key={tile.id} className={cn('flex flex-col gap-4 rounded-md p-16', tile.className)}>
              <span className="text-11 uppercase">
                {t(`presentation-detail.slides.dimensions.${tile.id}`)}
              </span>
              <span className="text-24 font-bold">{formatWholePct(tile.value)}</span>
              <span className="text-11">{t('presentation-detail.slides.summary.caption')}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 rounded-md bg-surface-page p-16 text-14 leading-[1.65] text-text-body">
          {slide.summaryText}
        </p>
      </div>
    </SlideChrome>
  );
}
