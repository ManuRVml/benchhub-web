import { Link } from 'react-router';

import { ExecutiveNarrativeButton } from '@/features/executive-narrative';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { formatNumber } from '@/shared/lib/format/number';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { ChipGroup } from '@/shared/ui/primitives/chip';

/** Category option for the chip group. */
export interface Category {
  id: string;
  label: string;
}

/** Row item for the paired bars. */
export interface PeerAverageRow {
  indicatorId: string;
  label: string;
  unit: string;
  geValue: number;
  peerAvg: number;
  hasDetail: boolean;
}

export interface PeerAverageComparisonProps {
  /** Category options for the chip group. */
  categories: readonly Category[];
  /** Rows of paired bars to render. */
  rows: readonly PeerAverageRow[];
  /** Currently selected category ID. */
  category: string;
  /** Called when the user selects a different category. */
  onCategoryChange: (id: string) => void;
  /** Analysis ID for the "Ver más" link. */
  analysisId: string;
}

/**
 * "Comparativo GE vs. Promedio Pares" widget (SCR-08 module 3, part A): read-only paired-bar list with category
 * chips. Editable values and autosave are still out of scope (P5-42b). The "Narrativa" AI pill opens OVL-08
 * (C-15) — `analysisId` is already required here (the "Ver más" link), so it is always the live button; C-15's
 * section enum has no literal `comp` value, so this uses `performance` (closest fit: comparing GE's indicator
 * performance against the peer average), flagged for PO confirmation like the other widgets wired in this task.
 */
export function PeerAverageComparison({
  categories,
  rows,
  category,
  onCategoryChange,
  analysisId,
}: PeerAverageComparisonProps) {
  const t = useT();

  // Filter rows for the selected category (the page supplies the category filter)
  const filteredRows = rows;

  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }));

  return (
    <SectionCard
      padding="prototype"
      title={t('analysis-results.peerAverageComparison.title')}
      subtitle={t('analysis-results.peerAverageComparison.subtitle')}
      actions={
        <ExecutiveNarrativeButton
          analysisId={analysisId}
          section="performance"
          title={t('analysis-results.peerAverageComparison.title')}
          testId="peer-average-comparison-ai-pill"
        />
      }
    >
      {/* Category chips - single select */}
      <div className="mb-16">
        <ChipGroup
          items={categoryItems}
          mode="single"
          value={category ? [category] : []}
          onChange={(ids) => {
            onCategoryChange(ids[0] ?? '');
          }}
          aria-label={t('analysis-results.peerAverageComparison.categoryLabel')}
          size="sm"
        />
      </div>

      {/* Paired bars per indicator */}
      <div className="flex flex-col gap-22">
        {filteredRows.map((row) => {
          // Compute max for width normalization: max(|ge|, |peer|, 0.01) * 1.15
          const maxAbs = Math.max(Math.abs(row.geValue), Math.abs(row.peerAvg), 0.01);
          const widthDenominator = maxAbs * 1.15;

          const geWidth = (Math.abs(row.geValue) / widthDenominator) * 100;
          const peerWidth = (Math.abs(row.peerAvg) / widthDenominator) * 100;

          return (
            <div key={row.indicatorId} className="flex flex-col gap-6">
              {/* Label with "Ver más" link */}
              <div className="flex items-center justify-between">
                <span className="text-13 font-semibold">{row.label}</span>
                {row.hasDetail && (
                  <Link
                    to={routes.indicatorDetail.build({ analysisId, indicatorId: row.indicatorId })}
                    className="text-12 font-medium text-brand-primary"
                    data-testid={`ver-mas-${row.indicatorId}`}
                  >
                    {t('analysis-results.peerAverageComparison.verMas')}
                  </Link>
                )}
              </div>

              {/* Two bar lines: GE and Pares */}
              <div className="flex items-center gap-6">
                {/* GE bar */}
                <div className="flex flex-1 items-center gap-6">
                  <span className="w-36 shrink-0 text-11 font-semibold text-text-secondary">
                    {t('analysis-results.peerAverageComparison.ge')}
                  </span>
                  <BarLine
                    value={row.geValue}
                    width={geWidth}
                    colorClass="bg-status-success-base"
                    textColor="text-text-heading"
                  />
                </div>

                {/* Pares bar */}
                <div className="flex flex-1 items-center gap-6">
                  <span className="w-36 shrink-0 text-11 font-semibold text-text-secondary">
                    {t('analysis-results.peerAverageComparison.peers')}
                  </span>
                  <BarLine
                    value={row.peerAvg}
                    width={peerWidth}
                    colorClass="bg-border-default"
                    textColor="text-text-secondary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/** Single bar line with track and fill. */
function BarLine({
  value,
  width,
  colorClass,
  textColor,
}: {
  value: number;
  width: number;
  colorClass: string;
  textColor: string;
}) {
  // Format the value using the shared formatter (handles es-CO locale)
  const formattedValue = formatNumber(value);

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="overflow-hidden rounded-full bg-surface-card">
        {/* Track */}
        <div className="h-18 w-full overflow-hidden rounded-full bg-surface-card">
          {/* Fill */}
          <div
            className={`h-full rounded-full ${colorClass} transition-[width] duration-500`}
            style={{ width: String(width) + '%' }}
            data-testid="bar-fill"
          />
        </div>
      </div>
      <span className={`text-12 font-semibold ${textColor}`}>{formattedValue}</span>
    </div>
  );
}
