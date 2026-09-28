import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/primitives/button';

export interface EmptyStateAction {
  /** Button label, e.g. "Limpiar filtros". Translated copy. */
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Main message, e.g. "Sin noticias recientes para los pares configurados.". Translated copy. */
  title: string;
  /** Optional second line under the title. */
  description?: string;
  /** Optional recovery action, rendered as an outline button. */
  action?: EmptyStateAction;
  /** `inline` (left-aligned muted text inside a section, default) or `block` (centred, padded). */
  variant?: 'inline' | 'block';
  /** `data-testid` of the container; defaults to `empty-state`. */
  testId?: string;
  className?: string;
}

/**
 * Message shown when a section has no data (component-catalog.md "EmptyState"). The catalog's `text.muted` fails WCAG AA
 * on white (2.6:1), so the text uses `text.secondary`.
 */
export function EmptyState({
  title,
  description,
  action,
  variant = 'inline',
  testId = 'empty-state',
  className,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-col gap-6 text-13 text-text-secondary',
        variant === 'block' ? 'items-center px-20 py-32 text-center' : 'items-start',
        className,
      )}
    >
      <p className="m-0 font-medium">{title}</p>
      {description === undefined ? null : <p className="m-0 text-12">{description}</p>}
      {action === undefined ? null : (
        <Button variant="outline" size="sm" onClick={action.onClick} testId={`${testId}-action`}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
