import { z } from 'zod';

import type { V05Response } from '@/shared/api';

// Step 1 "Información general" of the definition wizard (SCR-07): form values, client rules and the mapping to the
// C-02 `fields` patch. C-02 `fields` is a flat record of scalars and string lists, so the V-05 draft paths are used as
// keys ("currentPeriod.quarter") [inference: the contract names no keys]; the same keys come back in
// `validationState.errors[].field` (CF-100) and are mapped onto the form fields below.

type Draft = V05Response['draft'];
export type AnalysisType = Draft['type'];
export type AnalysisScope = Draft['scope'][number];

/** Field values of the form; selects hold strings, an empty cut-off date is "". */
export interface GeneralInfoValues {
  type: AnalysisType;
  name: string;
  objective: string;
  question: string;
  currentQuarter: string;
  currentYear: string;
  comparedQuarter: string;
  comparedYear: string;
  cutOffDate: string;
  scope: AnalysisScope[];
}

export type GeneralInfoField = keyof GeneralInfoValues;

/** Error codes the form shows; C-02 codes outside this set read as `invalid`. */
export const FIELD_ERROR_CODES = [
  'required',
  'tooShort',
  'tooLong',
  'invalid',
  'periodOrder',
  'atLeastOne',
  'futureDate',
] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** Client rules of SCR-07 step 1 ([inference] lengths); messages are error codes, translated by the form. */
export const generalInfoSchema = z
  .object({
    type: z.enum(['estrategico_tbg', 'estrategico_ilp', 'desempeno_pares']),
    name: z.string().trim().min(1, 'required').min(3, 'tooShort').max(120, 'tooLong'),
    objective: z.string().trim().min(1, 'required').max(500, 'tooLong'),
    question: z.string().max(300, 'tooLong'),
    currentQuarter: z.string().min(1, 'required'),
    currentYear: z.string().min(1, 'required'),
    comparedQuarter: z.string().min(1, 'required'),
    comparedYear: z.string().min(1, 'required'),
    cutOffDate: z.string(),
    scope: z.array(z.enum(['grupo_ecopetrol', 'isa'])).min(1, 'atLeastOne'),
  })
  .superRefine((values, ctx) => {
    const current = Number(values.currentYear) * 4 + Number(values.currentQuarter);
    const compared = Number(values.comparedYear) * 4 + Number(values.comparedQuarter);
    if (compared >= current) {
      ctx.addIssue({ code: 'custom', path: ['comparedQuarter'], message: 'periodOrder' });
    }
    if (values.cutOffDate !== '' && values.cutOffDate > new Date().toISOString().slice(0, 10)) {
      ctx.addIssue({ code: 'custom', path: ['cutOffDate'], message: 'futureDate' });
    }
  });

/** Form values of a V-05 draft. */
export function valuesFromDraft(draft: Draft): GeneralInfoValues {
  return {
    type: draft.type,
    name: draft.name,
    objective: draft.objective,
    question: draft.question,
    currentQuarter: String(draft.currentPeriod.quarter),
    currentYear: String(draft.currentPeriod.year),
    comparedQuarter: String(draft.comparedPeriod.quarter),
    comparedYear: String(draft.comparedPeriod.year),
    cutOffDate: draft.cutOffDate ?? '',
    scope: [...draft.scope],
  };
}

export type DraftFieldValue = string | number | boolean | null | string[];

/** C-02 key of each form field. */
const DRAFT_KEY: Readonly<Record<GeneralInfoField, string>> = {
  type: 'type',
  name: 'name',
  objective: 'objective',
  question: 'question',
  currentQuarter: 'currentPeriod.quarter',
  currentYear: 'currentPeriod.year',
  comparedQuarter: 'comparedPeriod.quarter',
  comparedYear: 'comparedPeriod.year',
  cutOffDate: 'cutOffDate',
  scope: 'scope',
};

const NUMERIC: ReadonlySet<GeneralInfoField> = new Set([
  'currentQuarter',
  'currentYear',
  'comparedQuarter',
  'comparedYear',
]);

/** One changed form field as its C-02 `fields` entry: periods as numbers, an empty cut-off date as `null`. */
export function toDraftField<F extends GeneralInfoField>(
  field: F,
  value: GeneralInfoValues[F],
): [string, DraftFieldValue] {
  const key = DRAFT_KEY[field];
  if (NUMERIC.has(field)) return [key, Number(value)];
  if (field === 'cutOffDate') return [key, value === '' ? null : value];
  if (Array.isArray(value)) return [key, [...(value as string[])]];
  return [key, value];
}

/** The form field a C-02 error key points at; unknown keys have none. */
export function formFieldOf(draftKey: string): GeneralInfoField | undefined {
  return (Object.keys(DRAFT_KEY) as GeneralInfoField[]).find(
    (field) => DRAFT_KEY[field] === draftKey,
  );
}

/** A C-02 or client error code as one of the codes the form can show. */
export function fieldErrorCode(code: string): FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(code)
    ? (code as FieldErrorCode)
    : 'invalid';
}
