import { useT } from '@/shared/i18n';
import { Chip } from '@/shared/ui/primitives/chip';

import type { V05Response } from '@/shared/api';

export interface SourcesStepProps {
  /** The draft's own `sources[]` (V-05), already resolved by the BFF from the selected indicators (CF-56/BR-14). */
  sources: V05Response['draft']['sources'];
}

const SOURCE_LABEL_KEY = {
  capital_iq: 'analysis-definition.step4.sources.capitalIq',
  bloomberg: 'analysis-definition.step4.sources.bloomberg',
  platts: 'analysis-definition.step4.sources.platts',
  interna_ecp: 'analysis-definition.step4.sources.internaEcp',
} as const;

function isKnownSourceId(id: string): id is keyof typeof SOURCE_LABEL_KEY {
  return id in SOURCE_LABEL_KEY;
}

/** Selected look of the primary source chip: `brand.primary.subtle` fill, `brand.primary` text (HTML L658). */
const PRIMARY_CHIP_CLASS = 'border-brand-primary-border bg-brand-primary-subtle text-brand-primary';

/**
 * SCR-07 step 4 "Fuentes" (HTML L650–660): the sources behind the selected indicators, read-only, always valid — no
 * autosave, no user source selection in v1 (CF-56/BR-14). The draft itself already carries the resolved list
 * (`V-05 draft.sources`); Capital IQ is always the primary source ("Capital IQ · principal").
 */
export function SourcesStep({ sources }: SourcesStepProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-8" data-testid="sources-step-list">
      {sources.map((source) => (
        <Chip
          key={source.id}
          variant="static"
          className={source.isPrimary ? PRIMARY_CHIP_CLASS : undefined}
          data-testid={`sources-step-chip-${source.id}`}
        >
          {isKnownSourceId(source.id) ? t(SOURCE_LABEL_KEY[source.id]) : source.id}
        </Chip>
      ))}
    </div>
  );
}
