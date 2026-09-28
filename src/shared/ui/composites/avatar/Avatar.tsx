import { useState } from 'react';

import { cn } from '@/shared/lib';

import { initialsOf } from './initials';

/** Diameters of the catalog (component-catalog.md "Avatar"): 24 company / ranking, 36 header, 48, 52 settings profile. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/** Fill of the initials: `subtle` (lilac, default) or `brand` (white on brand.primary, SCR-16 profile card). */
export type AvatarTone = 'subtle' | 'brand';

const TONE_CLASS: Readonly<Record<AvatarTone, string>> = {
  subtle: 'bg-brand-primary-subtle text-brand-primary',
  brand: 'bg-brand-primary text-text-inverse',
};

// 24 and 48 are spacing tokens; the 36px header avatar shares the header control size of the bell / help buttons
// (SCR-04 header row, `size.control.iconButton.md`) until an avatar size token exists.
const SIZE_CLASS: Readonly<Record<AvatarSize, string>> = {
  sm: 'size-24 text-10',
  md: 'size-(--size-control-icon-button-md) text-12',
  lg: 'size-48 text-14',
  xl: 'size-(--size-avatar-xl) text-20',
};

export interface AvatarProps {
  /** Person name: the image `alt`, the accessible name of the initials, and the source of the initials. */
  name: string;
  /** Photo URL; when absent or when it fails to load, the initials are shown instead. */
  src?: string;
  /** `sm` 24px · `md` 36px (header, default) · `lg` 48px · `xl` 52px (settings profile). */
  size?: AvatarSize;
  /** Fill of the initials; default `subtle`. */
  tone?: AvatarTone;
  /**
   * The avatar sits next to the visible name (header user chip): hide it from assistive technology so the name is not
   * read twice. Default `false`: the avatar is an image named by `name`.
   */
  decorative?: boolean;
  /** `data-testid` of the avatar; defaults to `avatar`. */
  testId?: string;
  className?: string;
}

/** Round person avatar: the photo when it loads, else the initials of `name` on `brand.primarySubtle`. */
export function Avatar({
  name,
  src,
  size = 'md',
  tone = 'subtle',
  decorative = false,
  testId = 'avatar',
  className,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = src !== undefined && src !== '' && failedSrc !== src;
  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill',
    SIZE_CLASS[size],
    className,
  );

  if (showPhoto) {
    return (
      <img
        src={src}
        alt={decorative ? '' : name}
        data-testid={testId}
        className={cn(base, 'object-cover')}
        onError={() => {
          setFailedSrc(src);
        }}
      />
    );
  }
  return (
    <span
      data-testid={testId}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
      className={cn(base, 'font-bold', TONE_CLASS[tone])}
    >
      {initialsOf(name)}
    </span>
  );
}
