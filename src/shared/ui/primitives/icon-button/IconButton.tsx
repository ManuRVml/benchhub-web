import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ComponentPropsWithoutRef, type ComponentType } from 'react';

import { cn } from '@/shared/lib';

import type { IconProps } from '@/shared/ui/icons';

/**
 * Icon-only button (component-catalog.md "Button" `icon`, `Cmp:IconButton`): header bell / help (36px round
 * `surface.page`, SCR-04 HTML L222–228) and compact controls such as the carousel prev / next (26px). No size tokens
 * exist for 36 / 26px, so the diameters are literal; colours are tokens.
 */
export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-pill text-text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        surface: 'bg-surface-page hover:bg-border-default hover:text-text-heading',
        ghost: 'bg-transparent hover:bg-surface-page hover:text-text-heading',
      },
      size: {
        sm: 'size-(--size-control-icon-button-sm)',
        md: 'size-(--size-control-icon-button-md)',
      },
    },
    defaultVariants: { variant: 'surface', size: 'md' },
  },
);

export type IconButtonVariant = NonNullable<VariantProps<typeof iconButtonVariants>['variant']>;
export type IconButtonSize = NonNullable<VariantProps<typeof iconButtonVariants>['size']>;

/** Icon drawn inside the button: sm 14px (`size.icon.info`), md 20px (`size.icon.default`). */
const ICON_SIZE: Record<IconButtonSize, number> = { sm: 14, md: 20 };

export interface IconButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'aria-label' | 'children' | 'title'
> {
  /** Accessible name, required: the button has no visible text and no tooltip. Pass translated copy (`t(...)`). */
  'aria-label': string;
  /** Icon component from `@/shared/ui/icons` (P5-10), e.g. `BellIcon`; rendered decorative (`aria-hidden`). */
  icon: ComponentType<IconProps>;
  /** `surface` (filled `surface.page`, default: header bell / help) or `ghost` (transparent until hover). */
  variant?: IconButtonVariant;
  /** Diameter: `sm` 26px (carousel, inline controls) or `md` 36px (header, default). */
  size?: IconButtonSize;
  /** `data-testid` of the rendered `<button>`; defaults to `icon-button`. */
  testId?: string;
}

/** Round icon-only `<button>` named by its required `aria-label`. Defaults to `type="button"`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, variant, size, testId = 'icon-button', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-testid={testId}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      <Icon size={ICON_SIZE[size ?? 'md']} />
    </button>
  );
});
