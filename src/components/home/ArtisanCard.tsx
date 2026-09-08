import { Link } from 'react-router-dom'

import { RemoteImage } from '@/components/ui/RemoteImage'
import type { Artisan, Category } from '@/lib/data'
import { cn } from '@/lib/utils/cn'

interface ArtisanCardProps {
  artisan: Artisan
  /** Undefined while categories load, or if one is missing. */
  category?: Category | undefined
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
export function ArtisanCard({ artisan, category }: ArtisanCardProps) {
  return (
    <Link
      to={`/artisan/${artisan.id}`}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-card border border-line bg-card p-5 text-center',
        'transition-colors duration-200 ease-site hover:border-accent',
      )}
    >
      <RemoteImage
        src={artisan.photoUrl}
        alt=""
        wrapperClassName="size-20 rounded-full"
      />

      <div className="flex flex-col gap-0.5">
        <h3 className="font-display text-base leading-snug text-ink">{artisan.name}</h3>
        {category && <p className="text-2xs text-muted">{category.name}</p>}
        <p className="text-2xs text-muted">{artisan.region}</p>
      </div>
    </Link>
  )
}
