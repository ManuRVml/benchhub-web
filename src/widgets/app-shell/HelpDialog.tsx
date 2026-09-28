import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { Button } from '@/shared/ui/primitives/button';

const QUESTIONS = ['newAnalysis', 'tiers', 'excluded', 'presentations'] as const;

export interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * OVL-12 "Ayuda y documentación" (component catalog "HelpDialog", HTML L3108-3127), opened by the header "?": four
 * static Q&A and the support box. "Contactar soporte" only closes the dialog, as in the prototype. Esc, the scrim and
 * "✕" close it too (Modal).
 */
export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const t = useT();
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      width={440}
      title={t('common.help.title')}
      description={t('common.a11y.helpDescription')}
      hideDescription
      testId="app-shell-help-dialog"
    >
      <dl className="grid gap-14">
        {QUESTIONS.map((id) => (
          <div key={id}>
            <dt className="mb-3 text-13 font-semibold text-text-heading">
              {t(`common.help.questions.${id}.question`)}
            </dt>
            <dd className="text-13 text-text-secondary">
              {t(`common.help.questions.${id}.answer`)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-18 flex items-center justify-between gap-10 rounded-md bg-surface-page p-14">
        <p className="text-12 text-text-secondary">{t('common.help.support')}</p>
        <Button
          size="sm"
          testId="app-shell-help-contact"
          className="whitespace-nowrap"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          {t('common.help.contactSupport')}
        </Button>
      </div>
    </Modal>
  );
}
