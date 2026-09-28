import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { CheckIcon } from '@/shared/ui/icons';

import { stepperTestIds } from './test-ids';

import type { ReactNode } from 'react';

/** done: completed · current: the step on screen · pending: not reached yet · invalid: visited with errors. */
export type StepStatus = 'done' | 'current' | 'pending' | 'invalid';

export interface StepperStep {
  /** 1-based step number, shown in the circle. */
  id: number;
  /** Step name, already translated (e.g. "Información general"). */
  label: ReactNode;
  status: StepStatus;
  /** An unreachable step: not clickable even when the stepper has `onStepClick`. */
  disabled?: boolean;
}

export interface StepperProps {
  steps: readonly StepperStep[];
  /** Makes every enabled step a button that reports its id (SCR-07: steps are clickable in any order). */
  onStepClick?: (id: number) => void;
  /** Accessible name of the list; default "Pasos". */
  'aria-label'?: string;
  /** Test-id owner: steps `{scope}-{component}-step-{id}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

const CIRCLE_CLASS: Record<StepStatus, string> = {
  done: 'border-status-success-base bg-status-success-base text-text-inverse',
  current: 'border-brand-primary bg-brand-primary text-text-inverse',
  pending: 'border-border-default bg-surface-card text-text-secondary',
  invalid: 'border-status-danger-base bg-status-danger-bg text-status-danger-text',
};

/**
 * Wizard step indicator (catalogue "Stepper"; aliases WizardStepper, WizardStep; SCR-07 5 steps). An ordered list
 * named "Pasos"; the current step carries `aria-current="step"`, done / invalid steps add a visually hidden status.
 * With `onStepClick` every enabled step is a native button (Tab / Enter / Space); without it the steps are static.
 */
export function Stepper({
  steps,
  onStepClick,
  'aria-label': ariaLabel,
  testIds,
  className,
}: StepperProps) {
  const t = useT();
  const statusText: Partial<Record<StepStatus, string>> = {
    done: t('common.a11y.stepDone'),
    invalid: t('common.a11y.stepInvalid'),
  };

  return (
    <ol
      aria-label={ariaLabel ?? t('common.a11y.steps')}
      className={cn('flex items-center gap-6', className)}
    >
      {steps.map((step, index) => {
        const current = step.status === 'current';
        const hidden = statusText[step.status];
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'flex size-28 shrink-0 items-center justify-center rounded-pill border text-small-strong',
                CIRCLE_CLASS[step.status],
              )}
            >
              {step.status === 'done' ? <CheckIcon size={12} /> : step.id}
            </span>
            <span
              className={cn(
                'text-small-medium whitespace-nowrap',
                current ? 'text-text-heading' : 'text-text-body',
              )}
            >
              {step.label}
            </span>
            {hidden ? <span className="sr-only">{`(${hidden})`}</span> : null}
          </>
        );
        const stepProps = {
          ...(current ? { 'aria-current': 'step' as const } : {}),
          'data-status': step.status,
          ...(testIds
            ? { 'data-testid': stepperTestIds.step(testIds.scope, testIds.component, step.id) }
            : {}),
        };
        return (
          <li key={step.id} className="flex flex-1 items-center gap-6">
            {onStepClick ? (
              <button
                type="button"
                {...stepProps}
                disabled={step.disabled}
                onClick={() => {
                  onStepClick(step.id);
                }}
                className="flex cursor-pointer items-center gap-6 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-60"
              >
                {content}
              </button>
            ) : (
              <span {...stepProps} className="flex items-center gap-6">
                {content}
              </span>
            )}
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="h-2 min-w-8 flex-1 bg-border-default" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
