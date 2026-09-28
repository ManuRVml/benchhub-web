import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib';

/**
 * Button variants (docs/design/component-catalog.md "Button"). `outline` is the catalog's `secondary` (white, bordered)
 * and `link` its text-only `ghost`. P5-11 adds `forward` ("Ver todos ›"), `dashed` ("+ Añadir compañía"), `gradient`
 * (login "Ingresar", `gradient.loginCta`) and `cyan` ("Generar análisis"). The icon-only button is `IconButton` and the
 * "✦" AI pill `AiPill`; success and danger come with their first screen.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-6 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
  {
    variants: {
      variant: {
        primary: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-dark',
        outline:
          'border border-border-default bg-surface-card text-text-secondary hover:border-text-secondary hover:bg-surface-page',
        link: 'bg-transparent text-text-link underline-offset-2 hover:text-text-link-hover hover:underline',
        // "Ver todos ›" / "Ver más ›" (HTML L278, L877): brand text, 500 weight, trailing "›" added by the component.
        forward:
          'bg-transparent text-text-link underline-offset-2 hover:text-text-link-hover hover:underline',
        // "+ Añadir compañía" (HTML L773): 2px dashed border, leading "+" added by the component. The prototype's
        // text.muted label fails WCAG AA on white (2.6:1), so the label uses text.secondary.
        dashed:
          'border-2 border-dashed border-border-default bg-transparent font-semibold text-text-secondary hover:border-brand-primary-border hover:text-brand-primary',
        // Login "Ingresar" (HTML L84): gradient.loginCta fill, hover opacity .9.
        gradient:
          'bg-(image:--gradient-login-cta) font-semibold text-text-inverse enabled:hover:opacity-90',
        // "Generar análisis" / "Publicar presentación" (HTML L711): ai.accent fill, hover ai.text + ai.bg. White text on
        // ai.accent is 2.2:1 (fails WCAG AA), so the resting label uses text.heading (7:1).
        cyan: 'bg-ai-accent text-text-heading hover:bg-ai-text hover:text-ai-bg',
      },
      size: {
        sm: 'px-12 py-8 text-12',
        md: 'px-16 py-10 text-13',
        lg: 'px-20 py-12 text-13',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [{ variant: ['link', 'forward'], className: 'px-0 py-0' }],
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * Visual style: `primary` (brand fill, default), `outline` (white, bordered), `link` (text only), `forward` (text link
   * with a trailing "›"), `dashed` (dashed "add" tile with a leading "+"), `gradient` (login CTA) or `cyan` (AI accent
   * fill). The "›" and "+" glyphs are decoration (`aria-hidden`): pass the label without them.
   */
  variant?: ButtonVariant;
  /** Padding and font size: `sm` 12px text, `md` 13px (default), `lg` 13px with more padding. */
  size?: ButtonSize;
  /** Stretches the button to the width of its container (footers, login card). */
  fullWidth?: boolean;
  /** Shows a spinner, sets `aria-busy` and ignores clicks while keeping focus and the label. */
  loading?: boolean;
  /** `data-testid` of the rendered `<button>`; defaults to `button`. */
  testId?: string;
}

/** Native `<button>` styled from the design tokens. Defaults to `type="button"` so it never submits a form by accident. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    fullWidth,
    loading = false,
    testId = 'button',
    className,
    type = 'button',
    onClick,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-testid={testId}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      onClick={loading ? undefined : onClick}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-12 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
      ) : null}
      {variant === 'dashed' ? <span aria-hidden="true">+</span> : null}
      {children}
      {variant === 'forward' ? <span aria-hidden="true">›</span> : null}
    </button>
  );
});
