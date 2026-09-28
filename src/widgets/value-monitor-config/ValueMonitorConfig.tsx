import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Button } from '@/shared/ui/primitives/button';
import { Chip, ChipGroup } from '@/shared/ui/primitives/chip';
import { DateInput, NumberInput, Select, TextField, Textarea } from '@/shared/ui/primitives/inputs';

import { testIds } from './test-ids';

import type {
  ValueMonitorConfigIndicator,
  ValueMonitorConfigSource,
} from '@/entities/value-monitor';

export interface ValueMonitorConfigApply {
  visibleIndicators: string[];
  thresholds: { alert: number; warning: number };
  period: 'quarter' | 'year';
}

export interface ValueMonitorConfigProps {
  /** V-32 `cutOffDate` (ISO date). */
  cutOffDate: string;
  /** V-32 `rangeFrom` / `rangeTo` (4-digit years). */
  rangeFrom: number;
  rangeTo: number;
  /** V-32 `sources`, every one shown with its enabled state. */
  sources: readonly ValueMonitorConfigSource[];
  /** V-32 `kvis`: every KVI is a chip, included ones pressed. */
  indicators: readonly ValueMonitorConfigIndicator[];
  /** V-32 free texts. */
  exceptionsText: string;
  assistantContext: string;
  thresholds: { alert: number; warning: number };
  period: 'quarter' | 'year';
  /** Called with the edited config when "Aplicar configuración" is clicked. */
  onApply: (next: ValueMonitorConfigApply) => void;
  /** Called when "+ Añadir indicador" is clicked. */
  onAddIndicator: () => void;
  /** Shows a spinner on the apply button and disables it. */
  applying: boolean;
}

/**
 * "Configuración del Monitor de Valor" card (SCR-11 §7, BencHUD.dc.html:1837-1921): every V-32 field in the
 * prototype's order -- "Fechas, rango y fuentes" (cut-off date, range, the source chips), the KVI chips with
 * "+ Añadir indicador", then "Excepciones, reglas variables y contexto". Only the KVI inclusion, the thresholds and the
 * period are editable: they are what C-17 (`UpdateValueMonitorConfigurationBody`) persists. Dates, range, sources and
 * the two free texts are shown read-only from V-32 (C-17 has no field for them; flagged for Pia/Nilo), so the card
 * never offers an edit that "Aplicar configuración" would silently drop.
 */
export function ValueMonitorConfig({
  cutOffDate,
  rangeFrom,
  rangeTo,
  sources,
  exceptionsText,
  assistantContext,
  indicators,
  thresholds,
  period,
  onApply,
  onAddIndicator,
  applying,
}: ValueMonitorConfigProps) {
  const t = useT();
  const [included, setIncluded] = useState<readonly string[]>(
    indicators.filter((indicator) => indicator.isIncluded).map((indicator) => indicator.id),
  );
  const [alert, setAlert] = useState<number | null>(thresholds.alert);
  const [warning, setWarning] = useState<number | null>(thresholds.warning);
  const [editedPeriod, setEditedPeriod] = useState<'quarter' | 'year'>(period);

  const handleApply = () => {
    onApply({
      visibleIndicators: [...included],
      thresholds: { alert: alert ?? thresholds.alert, warning: warning ?? thresholds.warning },
      period: editedPeriod,
    });
  };

  return (
    <SectionCard title={t('value-monitor.configuration.title')} testId={testIds.root}>
      <h3 className="mb-10 text-small-strong text-text-body">
        {t('value-monitor.configuration.datesRangeSources')}
      </h3>
      <div className="grid grid-cols-1 gap-14 tablet:grid-cols-5">
        <DateInput
          label={t('value-monitor.configuration.cutOffDate')}
          value={cutOffDate}
          readOnly
          size="sm"
          testId={testIds.cutOffDateInput}
        />
        <TextField
          label={t('value-monitor.configuration.rangeFrom')}
          value={String(rangeFrom)}
          readOnly
          size="sm"
          testId={testIds.rangeFromInput}
        />
        <TextField
          label={t('value-monitor.configuration.rangeTo')}
          value={String(rangeTo)}
          readOnly
          size="sm"
          testId={testIds.rangeToInput}
        />
        <div className="flex flex-col gap-6 tablet:col-span-2">
          <span className="text-label text-text-muted">
            {t('value-monitor.configuration.sources')}
          </span>
          <ul
            aria-label={t('value-monitor.configuration.sources')}
            data-testid={testIds.sources}
            className="flex flex-wrap gap-6"
          >
            {sources.map((source) => (
              <li key={source.id}>
                <Chip
                  variant={source.isEnabled ? 'filter' : 'static'}
                  data-testid={testIds.source(source.id)}
                  data-enabled={source.isEnabled}
                >
                  {source.label}
                  <span className="sr-only">
                    {' '}
                    {t(
                      source.isEnabled
                        ? 'value-monitor.configuration.sourceEnabled'
                        : 'value-monitor.configuration.sourceDisabled',
                    )}
                  </span>
                </Chip>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mt-20 mb-10 text-small-strong text-text-body">
        {t('value-monitor.configuration.includedKVIs')}
      </h3>
      <ChipGroup
        mode="multi"
        value={included}
        onChange={setIncluded}
        aria-label={t('value-monitor.configuration.includedKVIs')}
        testIds={{ scope: 'value-monitor-config', component: 'indicator' }}
        items={indicators.map((indicator) => ({ id: indicator.id, label: indicator.label }))}
      />
      <div className="mt-10">
        <Button variant="dashed" onClick={onAddIndicator} testId={testIds.addIndicatorButton}>
          {t('value-monitor.kviTable.addIndicator')}
        </Button>
      </div>
      <p className="mt-6 text-label text-text-muted">
        {t('value-monitor.configuration.tableNote')}
      </p>

      <div className="mt-16 grid grid-cols-1 gap-14 tablet:grid-cols-3">
        <NumberInput
          label={t('value-monitor.configuration.thresholdAlert')}
          value={alert}
          onValueChange={setAlert}
          min={0}
          max={100}
          suffix="%"
          size="sm"
          testId={testIds.thresholdAlertInput}
        />
        <NumberInput
          label={t('value-monitor.configuration.thresholdWarning')}
          value={warning}
          onValueChange={setWarning}
          min={0}
          max={100}
          suffix="%"
          size="sm"
          testId={testIds.thresholdWarningInput}
        />
        <Select
          label={t('value-monitor.configuration.period')}
          value={editedPeriod}
          onValueChange={(value) => {
            setEditedPeriod(value === 'year' ? 'year' : 'quarter');
          }}
          options={[
            { value: 'quarter', label: t('value-monitor.configuration.periodQuarter') },
            { value: 'year', label: t('value-monitor.configuration.periodYear') },
          ]}
          size="sm"
          testId={testIds.periodSelect}
        />
      </div>

      <h3 className="mt-20 mb-10 text-small-strong text-text-body">
        {t('value-monitor.configuration.exceptions')}
      </h3>
      <div className="grid gap-12">
        <Textarea
          label={t('value-monitor.configuration.exceptions')}
          hideLabel
          value={exceptionsText}
          placeholder={t('value-monitor.configuration.exceptionsPlaceholder')}
          readOnly
          testId={testIds.exceptionsInput}
        />
        <Textarea
          label={t('value-monitor.configuration.assistantContext')}
          value={assistantContext}
          placeholder={t('value-monitor.configuration.assistantContextPlaceholder')}
          readOnly
          testId={testIds.assistantContextInput}
        />
      </div>

      <div className="mt-16 flex justify-end">
        <Button
          variant="primary"
          onClick={handleApply}
          loading={applying}
          disabled={applying}
          testId={testIds.applyButton}
        >
          {t('value-monitor.configuration.apply')}
        </Button>
      </div>
    </SectionCard>
  );
}
