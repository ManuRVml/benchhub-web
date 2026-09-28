import type { IconProps } from '@/shared/ui/icons';

// The prototype's feedback buttons are the 👍 / 👎 emoji (HTML L3189–3190) and the P5-10 icon set has no thumbs, so
// the IconButton icons render the same glyphs, decorative like every icon (the button carries the name).
const THUMBS_UP = '👍';
const THUMBS_DOWN = '👎';

/** The glyph at the sm IconButton icon size (14px, `size.icon.info`). */
function glyph(text: string) {
  return function Glyph(_props: IconProps) {
    return (
      <span aria-hidden="true" className="text-14 leading-none">
        {text}
      </span>
    );
  };
}

export const ThumbsUpGlyph = glyph(THUMBS_UP);
export const ThumbsDownGlyph = glyph(THUMBS_DOWN);
