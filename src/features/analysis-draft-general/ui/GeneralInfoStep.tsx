import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useUpdateAnalysisDraft } from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { useToast } from '@/shared/ui/composites/toast';
import { ChipGroup } from '@/shared/ui/primitives/chip';
import {
  DateInput,
  FIELD_LABEL_CLASS,
  Select,
  TextField,
  Textarea,
} from '@/shared/ui/primitives/inputs';

import {
  fieldErrorCode,
  formFieldOf,
  generalInfoSchema,
  toDraftField,
  valuesFromDraft,
} from '../model/general-info-form';

import type {
  AnalysisScope,
  AnalysisType,
  DraftFieldValue,
  GeneralInfoField,
  GeneralInfoValues,
} from '../model/general-info-form';
import type { V05Response } from '@/shared/api';
import type { FieldError } from 'react-hook-form';

export interface GeneralInfoStepProps {
  draftId: string;
  draft: V05Response['draft'];
  /** Catalogs of the selects and chips (V-05 `options`). */
  options: V05Response['options'];
  /** `permissions.canEdit`: without it every field is read-only. */
  canEdit: boolean;
  /** Quiet time before a burst of edits is saved (C-02); default 500 ms. */
  autosaveDelayMs?: number;
}

const TYPE_LABEL_KEY = {
  estrategico_tbg: 'analysis-definition.step1.typeOptions.estrategicoTBG',
  estrategico_ilp: 'analysis-definition.step1.typeOptions.estrategicoILP',
  desempeno_pares: 'analysis-definition.step1.typeOptions.desempenoPares',
} as const satisfies Record<AnalysisType, string>;

const SCOPE_LABEL_KEY = {
  grupo_ecopetrol: 'analysis-definition.step1.scopes.grupoEcopetrol',
  isa: 'analysis-definition.step1.scopes.isa',
} as const satisfies Record<AnalysisScope, string>;

const QUARTER_LABEL_KEY = {
  1: 'analysis-definition.step1.quarters.q1',
  2: 'analysis-definition.step1.quarters.q2',
  3: 'analysis-definition.step1.quarters.q3',
  4: 'analysis-definition.step1.quarters.q4',
} as const;

// Every step 1 label is the uppercase muted eyebrow of the prototype (BencHUD.dc.html:469-539).
const labelClass = FIELD_LABEL_CLASS.eyebrow;

/**
 * SCR-07 step 1 "Información general": tipo, nombre, objetivo, pregunta, periodo actual / comparado, fecha de corte and
 * alcance, on react-hook-form with the client rules of `generalInfoSchema`. Every change autosaves: the fields changed in
 * a burst are merged into one C-02 PATCH, sent 500 ms after the last edit (P5-04b `useDebouncedAutosave`). The
 * `validationState.errors[]` of the answer ({ field, code }, CF-100) become field errors; C-02 failures show the
 * autosave error toast. "Guardando…" / "Guardado" report the save in the autosave toast.
 */
export function GeneralInfoStep({
  draftId,
  draft,
  options,
  canEdit,
  autosaveDelayMs = 500,
}: GeneralInfoStepProps) {
  const t = useT();
  const toast = useToast();
  const updateDraft = useUpdateAnalysisDraft();
  const form = useForm<GeneralInfoValues>({
    defaultValues: valuesFromDraft(draft),
    resolver: zodResolver(generalInfoSchema),
    mode: 'onChange',
  });
  const { control, setError, clearErrors, getFieldState } = form;

  // Fields changed since the last save, keyed as C-02 expects; one burst of edits is one PATCH.
  const pending = useRef<Record<string, DraftFieldValue>>({});

  const autosave = useDebouncedAutosave<Record<string, DraftFieldValue>>(
    async (fields) => {
      pending.current = {};
      toast.autosave(t('analysis-definition.autosave.saving'));
      const result = await updateDraft.mutateAsync({ draftId, body: { step: 1, fields } });
      const failed = new Set<GeneralInfoField>();
      for (const error of result.validationState.errors) {
        const field = formFieldOf(error.field);
        if (!field) continue;
        failed.add(field);
        setError(field, { type: 'server', message: fieldErrorCode(error.code) });
      }
      // A saved field without a server error drops the server error it had.
      for (const key of Object.keys(fields)) {
        const field = formFieldOf(key);
        if (field && !failed.has(field) && getFieldState(field).error?.type === 'server') {
          clearErrors(field);
        }
      }
      toast.autosave(t('analysis-definition.autosave.saved'));
    },
    {
      delayMs: autosaveDelayMs,
      onError: () => {
        toast.error(t('common.draftWizard.autosaveError'));
      },
    },
  );

  /** Applies an edit to the form and queues its field for the next autosave. */
  const edit = <F extends GeneralInfoField>(
    field: F,
    onChange: (value: GeneralInfoValues[F]) => void,
  ) => {
    return (value: GeneralInfoValues[F]) => {
      onChange(value);
      const [key, draftValue] = toDraftField(field, value);
      pending.current = { ...pending.current, [key]: draftValue };
      autosave.schedule(pending.current);
    };
  };

  const errorText = (error: FieldError | undefined) =>
    error?.message === undefined
      ? undefined
      : t(`common.draftWizard.fieldErrors.${fieldErrorCode(error.message)}`);

  const quarterOptions = options.quarters.map((quarter) => ({
    value: String(quarter),
    label: t(QUARTER_LABEL_KEY[quarter]),
  }));
  const yearOptions = options.years.map((year) => ({ value: String(year), label: String(year) }));

  const typeLabelId = useId();
  const scopeLabelId = useId();
  const comparedInfoId = useId();
  const comparedToggleId = useId();
  const [comparedInfoOpen, setComparedInfoOpen] = useState(false);

  const period = (prefix: 'current' | 'compared', label: string) => (
    <fieldset className="flex flex-col gap-6">
      <legend className={labelClass}>{label}</legend>
      <div className="flex gap-8">
        <Controller
          control={control}
          name={`${prefix}Quarter`}
          // The period-order error sits on "Periodo comparado": any period change revalidates it.
          rules={{ deps: ['comparedQuarter'] }}
          render={({ field, fieldState }) => (
            <Select
              label={`${label} · ${t('common.draftWizard.quarter')}`}
              hideLabel
              options={quarterOptions}
              value={field.value}
              disabled={!canEdit}
              error={errorText(fieldState.error)}
              onValueChange={edit(field.name, field.onChange)}
              onBlur={field.onBlur}
              testId={`definition-general-${prefix}-quarter`}
            />
          )}
        />
        <Controller
          control={control}
          name={`${prefix}Year`}
          rules={{ deps: ['comparedQuarter'] }}
          render={({ field }) => (
            <Select
              label={`${label} · ${t('common.draftWizard.year')}`}
              hideLabel
              options={yearOptions}
              value={field.value}
              disabled={!canEdit}
              onValueChange={edit(field.name, field.onChange)}
              onBlur={field.onBlur}
              testId={`definition-general-${prefix}-year`}
            />
          )}
        />
      </div>
    </fieldset>
  );

  return (
    <form
      className="grid gap-16"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex flex-col gap-6">
        <p id={typeLabelId} className={labelClass}>
          {t('analysis-definition.step1.typeLabel')}
        </p>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <ChipGroup
              mode="single"
              aria-label={t('analysis-definition.step1.typeLabel')}
              items={options.types.map((type) => ({
                id: type,
                label: t(TYPE_LABEL_KEY[type]),
                disabled: !canEdit,
              }))}
              value={[field.value]}
              onChange={(ids) => {
                // Single choice without "none": clicking the selected type keeps it.
                const [next] = ids;
                if (next) edit('type', field.onChange)(next as AnalysisType);
              }}
              appearance="option"
              size="option"
              testIds={{ scope: 'definition-general', component: 'type' }}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label={t('analysis-definition.step1.nameLabel')}
            labelVariant="eyebrow"
            placeholder={t('analysis-definition.step1.namePlaceholder')}
            value={field.value}
            disabled={!canEdit}
            error={errorText(fieldState.error)}
            onValueChange={edit(field.name, field.onChange)}
            onBlur={field.onBlur}
            testId="definition-general-name"
          />
        )}
      />
      <Controller
        control={control}
        name="objective"
        render={({ field, fieldState }) => (
          <Textarea
            label={t('analysis-definition.step1.objectiveLabel')}
            labelVariant="eyebrow"
            placeholder={t('analysis-definition.step1.objectivePlaceholder')}
            value={field.value}
            disabled={!canEdit}
            error={errorText(fieldState.error)}
            onValueChange={edit(field.name, field.onChange)}
            onBlur={field.onBlur}
            testId="definition-general-objective"
          />
        )}
      />
      <Controller
        control={control}
        name="question"
        render={({ field, fieldState }) => (
          <Textarea
            label={t('analysis-definition.step1.questionLabel')}
            labelVariant="eyebrow"
            placeholder={t('analysis-definition.step1.questionPlaceholder')}
            value={field.value}
            disabled={!canEdit}
            error={errorText(fieldState.error)}
            onValueChange={edit(field.name, field.onChange)}
            onBlur={field.onBlur}
            testId="definition-general-question"
          />
        )}
      />
      {/* Two halves as in the prototype (grid 1fr 1fr, gap 16): Periodo actual left, Periodo comparado right. */}
      <div
        className="grid grid-cols-1 gap-16 tablet:grid-cols-2"
        data-testid="definition-general-periods"
      >
        {period('current', t('analysis-definition.step1.currentPeriodLabel'))}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-6">
            {period('compared', t('analysis-definition.step1.comparedPeriodLabel'))}
            <InfoToggle
              id={comparedToggleId}
              expanded={comparedInfoOpen}
              controls={comparedInfoId}
              onToggle={() => {
                setComparedInfoOpen((open) => !open);
              }}
              testId="definition-general-compared-info-toggle"
            />
          </div>
          <InlineInfoPanel
            id={comparedInfoId}
            labelledBy={comparedToggleId}
            open={comparedInfoOpen}
          >
            {t('analysis-definition.step1.comparedPeriodInfo')}
          </InlineInfoPanel>
        </div>
      </div>
      <Controller
        control={control}
        name="cutOffDate"
        render={({ field, fieldState }) => (
          <DateInput
            label={t('analysis-definition.step1.cutOffDateLabel')}
            labelVariant="eyebrow"
            value={field.value}
            disabled={!canEdit}
            error={errorText(fieldState.error)}
            onValueChange={edit(field.name, field.onChange)}
            onBlur={field.onBlur}
            testId="definition-general-cut-off-date"
            // A narrow field: one column of the prototype's 3-column row (BencHUD.dc.html:523).
            className="w-full max-w-(--size-control-date-field)"
          />
        )}
      />
      <div className="flex flex-col gap-6">
        <p id={scopeLabelId} className={labelClass}>
          {t('analysis-definition.step1.scopeLabel')}
        </p>
        <Controller
          control={control}
          name="scope"
          render={({ field, fieldState }) => (
            <>
              <ChipGroup
                mode="multi"
                aria-label={t('analysis-definition.step1.scopeLabel')}
                items={options.scopes.map((scope) => ({
                  id: scope,
                  label: t(SCOPE_LABEL_KEY[scope]),
                  disabled: !canEdit,
                }))}
                value={field.value}
                onChange={(ids) => {
                  edit('scope', field.onChange)(ids as AnalysisScope[]);
                }}
                appearance="option"
                size="option"
                testIds={{ scope: 'definition-general', component: 'scope' }}
              />
              {fieldState.error ? (
                <p role="alert" className="text-small text-status-danger-text">
                  {errorText(fieldState.error)}
                </p>
              ) : null}
            </>
          )}
        />
      </div>
    </form>
  );
}
