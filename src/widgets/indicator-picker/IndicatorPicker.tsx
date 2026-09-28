import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { PillTabs } from '@/shared/ui/composites/tabs';
import { Badge } from '@/shared/ui/primitives/badge';
import { Chip, ChipGroup } from '@/shared/ui/primitives/chip';
import {
  groupSelectionState,
  GroupSelectToggle,
  toggleGroupSelection,
} from '@/shared/ui/primitives/group-select-toggle';

import { indicatorPickerTestIds } from './test-ids';

import type { V07Response } from '@/shared/api';
import type { Horizon } from '@/shared/ui/primitives/badge';

export type IndicatorSource = V07Response['source'];
type IndicatorGroup = V07Response['groups'][number];
type IndicatorItem = IndicatorGroup['items'][number];

export interface IndicatorPickerProps {
  source: IndicatorSource;
  onSourceChange: (source: IndicatorSource) => void;
  /** V-07 catalog of the current `source` (its own field must match). */
  catalog: V07Response;
  selectedIds: readonly string[];
  onChange: (ids: string[]) => void;
  canEdit: boolean;
  /** C-02 field error of `indicatorIds`, already translated. */
  error?: string;
}

const CONCEPT_LABEL_KEY = {
  rentabilidad: 'analysis-definition.step3.conceptOptions.profitability',
  liquidez: 'analysis-definition.step3.conceptOptions.liquidity',
  operacional: 'analysis-definition.step3.conceptOptions.operational',
  solvencia: 'analysis-definition.step3.conceptOptions.solvency',
  opex: 'analysis-definition.step3.conceptOptions.opex',
} as const satisfies Record<string, string>;

const HORIZON_LABEL_KEY = {
  tbg: 'analysis-definition.step3.horizonOptions.tbg',
  ilp: 'analysis-definition.step3.horizonOptions.ilp',
} as const satisfies Record<Horizon, string>;

/** Whether `item` passes the active concept / horizon filters; no filter selected shows every item (SCR-07). */
function matchesFilters(
  item: IndicatorItem,
  concepts: readonly string[],
  horizons: readonly string[],
) {
  if (concepts.length > 0 && (item.concept === undefined || !concepts.includes(item.concept))) {
    return false;
  }
  if (horizons.length > 0 && (item.horizon === null || !horizons.includes(item.horizon))) {
    return false;
  }
  return true;
}

/**
 * SCR-07 step 3 "Selección de indicadores" (`Cmp:SourceTabs`, `Cmp:IndicatorGroup`, HTML L586–649): the V-07
 * indicator catalog of the active source (`Referenciamiento de pares` / `TBG e ILP`, PillTabs), filterable by concept
 * (pares) or horizon (TBG e ILP) — view-only filters, they only hide items, never the selection. Each indicator is a
 * toggle chip with its display code; TBG/ILP items also carry a horizon badge. Groups left empty by a filter are
 * hidden; each visible group has a bulk select-all toggle (BR-13). Selection is fully controlled, like
 * `CompetitorPicker`.
 */
export function IndicatorPicker({
  source,
  onSourceChange,
  catalog,
  selectedIds,
  onChange,
  canEdit,
  error,
}: IndicatorPickerProps) {
  const t = useT();
  const [concepts, setConcepts] = useState<string[]>([]);
  const [horizons, setHorizons] = useState<string[]>([]);

  const toggleItem = (itemId: string, selected: boolean) => {
    onChange(selected ? [...selectedIds, itemId] : selectedIds.filter((id) => id !== itemId));
  };

  const visibleGroups = catalog.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => matchesFilters(item, concepts, horizons)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-16">
      <p className="text-small text-text-secondary" data-testid="indicator-picker-totals">
        {t('analysis-definition.step3.subTitle', {
          categories: catalog.totals.groups,
          indicators: catalog.totals.indicators,
        })}
      </p>
      <PillTabs
        items={[
          { id: 'pares', label: t('analysis-definition.step3.sourceTabs.pares') },
          { id: 'tbg_ilp', label: t('analysis-definition.step3.sourceTabs.tbgIlp') },
        ]}
        value={source}
        onChange={(id) => {
          onSourceChange(id as IndicatorSource);
        }}
        aria-label={t('analysis-definition.step3.sourceTabs.pares')}
        testIds={{ scope: 'indicator-picker', component: 'source' }}
      />
      {source === 'pares' ? (
        <ChipGroup
          mode="multi"
          aria-label={t('analysis-definition.step3.conceptFilterLabel')}
          items={catalog.filterOptions.concepts.map((concept) => ({
            id: concept,
            label: t(CONCEPT_LABEL_KEY[concept]),
          }))}
          value={concepts}
          onChange={setConcepts}
          testIds={{ scope: 'indicator-picker', component: 'concept' }}
        />
      ) : (
        <ChipGroup
          mode="multi"
          aria-label={t('analysis-definition.step3.horizonFilterLabel')}
          items={catalog.filterOptions.horizons.map((horizon) => ({
            id: horizon,
            label: t(HORIZON_LABEL_KEY[horizon]),
          }))}
          value={horizons}
          onChange={setHorizons}
          testIds={{ scope: 'indicator-picker', component: 'horizon' }}
        />
      )}
      {visibleGroups.map((group) => {
        const memberIds = group.items.map((item) => item.id);
        const state = groupSelectionState(memberIds, selectedIds);
        return (
          <div key={group.id} className="grid gap-8">
            <div className="flex items-center gap-8">
              <GroupSelectToggle
                state={state}
                disabled={!canEdit}
                onToggle={() => {
                  onChange(toggleGroupSelection(memberIds, selectedIds));
                }}
                aria-label={t('common.draftWizard.selectAllGroup', { group: group.label })}
                testId={indicatorPickerTestIds.groupToggle(group.id)}
              />
              <p className="text-small-strong text-text-heading">{group.label}</p>
            </div>
            <div className="flex flex-wrap gap-8">
              {group.items.map((item) => (
                <Chip
                  key={item.id}
                  variant="toggle"
                  selected={selectedIds.includes(item.id)}
                  disabled={!canEdit}
                  code={item.code}
                  onPressedChange={(pressed) => {
                    toggleItem(item.id, pressed);
                  }}
                  data-testid={indicatorPickerTestIds.item(item.id)}
                >
                  {item.label}
                  {item.horizon !== null ? (
                    <Badge kind="horizon" horizon={item.horizon} size="sm">
                      {t(HORIZON_LABEL_KEY[item.horizon])}
                    </Badge>
                  ) : null}
                </Chip>
              ))}
            </div>
          </div>
        );
      })}
      {error ? (
        <p
          role="alert"
          data-testid={indicatorPickerTestIds.error}
          className="text-small text-status-danger-text"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
