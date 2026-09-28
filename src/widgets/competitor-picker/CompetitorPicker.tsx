import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Eyebrow } from '@/shared/ui/composites/section-card';
import { Chip } from '@/shared/ui/primitives/chip';
import {
  groupSelectionState,
  GroupSelectToggle,
  toggleGroupSelection,
} from '@/shared/ui/primitives/group-select-toggle';

import { competitorPickerTestIds } from './test-ids';

import type { V06Response } from '@/shared/api';

export type CompetitorGroup = V06Response['groups'][number];
export type CompetitorSuggestion = V06Response['suggestion'];
type BusinessLine = CompetitorGroup['businessLine'];
type BusinessLineFilter = BusinessLine | 'all';

export interface CompetitorPickerProps {
  groups: readonly CompetitorGroup[];
  suggestion: CompetitorSuggestion;
  selectedIds: readonly string[];
  onChange: (ids: string[]) => void;
  canEdit: boolean;
  /** C-02 field error of `competitorIds`, already translated. */
  error?: string;
}

// SCR-07 step 2 default selection (HTML L3547): the 7 companies a brand-new draft starts with.
export const DEFAULT_COMPETITOR_IDS: readonly string[] = [
  'cmp_chevron',
  'cmp_exxon',
  'cmp_shell',
  'cmp_equinor',
  'cmp_total',
  'cmp_bp',
  'cmp_pttep',
];

/** Step-2 initial selection from the draft: its own `competitorIds`, or the 7 V2 defaults for a brand-new draft. */
export function resolveInitialCompetitorIds(competitorIds: readonly string[]): string[] {
  return competitorIds.length > 0 ? [...competitorIds] : [...DEFAULT_COMPETITOR_IDS];
}

const BUSINESS_LINE_LABEL_KEY = {
  all: 'analysis-definition.step2.businessLineOptions.all',
  oil_gas: 'analysis-definition.step2.businessLineOptions.oilAndGas',
  energeticos: 'analysis-definition.step2.businessLineOptions.energeticos',
} as const satisfies Record<BusinessLineFilter, string>;

const BUSINESS_LINE_FILTERS: readonly BusinessLineFilter[] = ['all', 'oil_gas', 'energeticos'];

/** Selected look of a company tile / feedback chip: `brand.primary.subtle` fill, `brand.primary` text and border. */
const SELECTED_TILE_CLASS =
  'border-brand-primary-border bg-brand-primary-subtle text-brand-primary';

/**
 * SCR-07 step 2 "Competidores" (`Cmp:CompanyTile` grid, `Cmp:SelectAllToggle`, HTML L553–585): the V-06 company
 * catalog grouped by strategic category, filterable by business line (view-only, not saved), each company a toggle
 * tile and each group bulk-selectable. Selection is fully controlled: the caller (the autosave-wired step feature)
 * owns `selectedIds` and persists it through C-02; the line filter only hides groups, it never drops a selection.
 */
export function CompetitorPicker({
  groups,
  suggestion,
  selectedIds,
  onChange,
  canEdit,
  error,
}: CompetitorPickerProps) {
  const t = useT();
  const [businessLine, setBusinessLine] = useState<BusinessLineFilter>('all');
  const visibleGroups =
    businessLine === 'all' ? groups : groups.filter((group) => group.businessLine === businessLine);

  const toggleCompany = (companyId: string, selected: boolean) => {
    onChange(selected ? [...selectedIds, companyId] : selectedIds.filter((id) => id !== companyId));
  };

  return (
    <div className="grid gap-16">
      <div
        role="radiogroup"
        aria-label={t('analysis-definition.step2.businessLineFilterLabel')}
        className="flex flex-wrap gap-6"
      >
        {BUSINESS_LINE_FILTERS.map((option) => (
          <Chip
            key={option}
            variant="choice"
            role="radio"
            aria-checked={businessLine === option}
            selected={businessLine === option}
            onPressedChange={() => {
              setBusinessLine(option);
            }}
            data-testid={competitorPickerTestIds.businessLineFilter(option)}
          >
            {t(BUSINESS_LINE_LABEL_KEY[option])}
          </Chip>
        ))}
      </div>
      {visibleGroups.map((group) => {
        const memberIds = group.companies.map((company) => company.id);
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
                testId={competitorPickerTestIds.groupToggle(group.id)}
              />
              <Eyebrow as="span">{group.label}</Eyebrow>
            </div>
            <div className="flex flex-wrap gap-8">
              {group.companies.map((company) => {
                const selected = selectedIds.includes(company.id);
                const meta =
                  company.country !== null && company.category !== null
                    ? `${company.country} · ${company.category}`
                    : t('analysis-definition.step2.unknownProfile');
                return (
                  <Chip
                    key={company.id}
                    variant="toggle"
                    selected={selected}
                    disabled={!canEdit}
                    onPressedChange={(pressed) => {
                      toggleCompany(company.id, pressed);
                    }}
                    className={cn(
                      'flex-col items-start gap-2 text-left',
                      selected && SELECTED_TILE_CLASS,
                    )}
                    data-testid={competitorPickerTestIds.company(company.id)}
                  >
                    <span className="text-small-medium">{company.name}</span>
                    <span className="text-micro text-text-muted">{meta}</span>
                  </Chip>
                );
              })}
            </div>
          </div>
        );
      })}
      {error ? (
        <p
          role="alert"
          data-testid={competitorPickerTestIds.error}
          className="text-small text-status-danger-text"
        >
          {error}
        </p>
      ) : null}
      {suggestion ? (
        <p
          data-testid={competitorPickerTestIds.suggestion}
          className="rounded-control border border-ai-border bg-ai-bg px-12 py-10 text-small text-ai-text"
        >
          {'✦ '}
          {t('analysis-definition.step2.yarbisBox.prefix')} {suggestion.text}
        </p>
      ) : null}
    </div>
  );
}
