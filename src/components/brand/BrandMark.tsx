import { cn } from '@/lib/utils/cn'

interface BrandMarkProps {
  /** Rendered size in pixels, square. Defaults to the navbar's 26px. */
  size?: number
  className?: string
}

/**
 * The KalaCart glyph: two warp threads crossed by two broken weft threads.
 *
 * Drawn with `stroke="currentColor"`, never a fixed hex (CLAUDE.md law 3). The
 * supplied artwork is inked at #1A1512, which is close enough to the dark
 * theme's #121212 canvas to disappear on it - a mark that vanishes in one of
 * two shipped themes is not a mark. Inheriting the colour means it resolves to
 * `ink` in both (#3C2A21 light, #EDEDED dark) and follows any future palette
 * revision for free. The literal #1A1512 artwork survives untouched as the
 * static favicon and social image, where no theme is in play to resolve
 * against.
 *
 * The gaps in the weft are the mark, not an accident of drawing: the horizontal
 * threads break where they pass behind the verticals, which is what reads as
 * woven cloth rather than a hash. They are preserved exactly as supplied.
 *
 * Geometry note: stroke-linecap="round" adds half the stroke width (1.8 units)
 * beyond each endpoint, so the drawn extents run to 3.2 and 28.8 inside the
 * 32-unit box rather than the 5 and 27 the path data names.
 *
 * Decorative by default - the accessible name belongs to the link or heading
 * that wraps it, so a screen reader hears "KalaCart, home" once rather than
 * twice.
 */
export function BrandMark({ size = 26, className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.6}
      strokeLinecap="round"
      aria-hidden
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {/* Warp: the two continuous verticals. */}
      <path d="M11 6 L11 26" />
      <path d="M21 6 L21 26" />
      {/* Weft: horizontals broken where they pass behind the warp. */}
      <path d="M5 11 L16.4 11" />
      <path d="M25.6 11 L27 11" />
      <path d="M5 21 L6.4 21" />
      <path d="M15.6 21 L27 21" />
    </svg>
  )
}
