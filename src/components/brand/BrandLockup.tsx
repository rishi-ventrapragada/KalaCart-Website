import { BrandMark } from '@/components/brand/BrandMark'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface BrandLockupProps {
  /** Mark size in pixels. The wordmark is sized by `textClassName`. */
  markSize?: number
  /** Type scale for the wordmark, so each surface can set its own weight. */
  textClassName?: string
  /** Drop the wordmark and show the glyph alone. */
  markOnly?: boolean
  className?: string
}

/**
 * Mark plus wordmark, the pairing every surface renders rather than assembling
 * its own.
 *
 * The wordmark stays live text in Fraunces, not a second SVG path. The supplied
 * horizontal artwork sets "KalaCart" in the same face the site already loads
 * (PRD 9.4), so drawing it as outlines would ship a duplicate of type the page
 * has downloaded anyway, and it would no longer be selectable, searchable, or
 * translatable through the i18n seam. The name still comes from `brand.name`,
 * so nothing here hardcodes it (CLAUDE.md law 4).
 *
 * The gap is 0.5rem against a 26px mark, matching the optical spacing in the
 * supplied lockup rather than being picked by eye.
 */
export function BrandLockup({
  markSize = 26,
  textClassName = 'text-xl',
  markOnly = false,
  className,
}: BrandLockupProps) {
  const t = useT()

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandMark size={markSize} />
      {!markOnly && (
        <span className={cn('font-display tracking-[-0.02em]', textClassName)}>
          {t('brand.name')}
        </span>
      )}
    </span>
  )
}
