import { Link } from 'react-router-dom'

import { RemoteImage } from '@/components/ui/RemoteImage'
import type { Artisan, Category } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ArtisanCardProps {
  artisan: Artisan
  /** Undefined while categories load, or if one is missing. */
  category?: Category | undefined
  /**
   * Tighter padding and a smaller portrait, for the fan (Increment 18).
   *
   * The fan deals 132px cards, and the default card's `p-5` with a `size-20`
   * portrait and three lines of text simply does not fit in one: the region
   * line wraps and pushes the name out of the card. Region is dropped rather
   * than truncated - a half-shown place name reads as a bug, and the profile
   * the card links to carries it in full.
   */
  compact?: boolean
  /**
   * Show how many crafts this artisan has listed, for the directory.
   *
   * Off by default. `productCount` is already on the type and already returned
   * by `getAllArtisans`, but Home's five cards are a taste of the makers rather
   * than an inventory, and a count there invites comparing them. On the
   * directory it is the one fact that helps a buyer choose whose profile to
   * open, so it is opt-in per surface rather than always on.
   */
  showCount?: boolean
}

/**
 * One artisan, minimal by design (PRD 8: name, craft, region, no bio - the
 * story lives in the mobile app).
 *
 * The portrait is a circle rather than the card radius, which is the one place
 * the shape binary bends: a face in a rounded rectangle reads as a product
 * shot, and these are people. PRD 9.5 governs controls and containers; a
 * portrait is neither.
 */
export function ArtisanCard({
  artisan,
  category,
  compact = false,
  showCount = false,
}: ArtisanCardProps) {
  const t = useT()
  const count = artisan.productCount

  return (
    <Link
      to={`/artisan/${artisan.id}`}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-card border border-line bg-card text-center',
        'transition-colors duration-200 ease-site hover:border-accent',
        // `h-full` on the default variant so a directory row's cards match
        // height whatever their names wrap to; the fan already sizes its own.
        compact ? 'size-full justify-center gap-2.5 p-4' : 'h-full justify-center p-5',
      )}
    >
      <RemoteImage
        src={artisan.photoUrl}
        alt=""
        // Both variants land on `size-20` now. The compact portrait was 64px
        // when the fan card was 132px; at 198px that left the face floating in
        // its own padding, and the fan card is no longer the smaller of the two.
        wrapperClassName="size-20 rounded-full"
      />

      <div className="flex flex-col gap-0.5">
        {/*
          One size for both variants, and names wrap rather than being made to
          fit. Measured against the fan's 148px of inner width, the longest
          maker in the pool ("Mohammed Yusuf Chhipa") runs 200px at `text-base`
          and still 151px at 12px - so no type scale short of unreadable puts
          every name on one line, and shrinking type to chase that is the wrong
          trade. Two lines of legible type beats one line of small type; the
          fan's geometry is what guarantees the wrapped block is never covered.
        */}
        <h3 className="font-display text-base leading-snug text-balance text-ink">
          {artisan.name}
        </h3>
        {category && <p className="text-2xs text-muted">{category.name}</p>}
        {!compact && <p className="text-2xs text-muted">{artisan.region}</p>}
        {/*
          `productCount` is optional on the type, so an undefined count renders
          nothing rather than "undefined listings" - a provider that does not
          compute it must not put a broken line on the card.
        */}
        {showCount && count !== undefined && (
          <p className="mt-1 text-2xs text-muted">
            {count === 1
              ? t('artisans.results.listingsOne')
              : t('artisans.results.listings', { count })}
          </p>
        )}
      </div>
    </Link>
  )
}
