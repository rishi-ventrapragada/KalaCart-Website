import { RemoteImage } from '@/components/ui/RemoteImage'
import type { Artisan, Category } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/** Tailwind cannot see a class assembled at runtime, so the maps are explicit. */
const DYE_BORDER: Record<Category['dye'], string> = {
  indigo: 'border-indigo/45',
  madder: 'border-madder/45',
  marigold: 'border-marigold/45',
  brass: 'border-brass/45',
}

const DYE_DOT: Record<Category['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

interface ArtisanHeaderProps {
  artisan: Artisan
  /** Undefined while categories load, or if one is missing. */
  category?: Category | undefined
  /** Counted from the products this page actually rendered, not from the seam. */
  productCount: number
}

/**
 * The compact header (PRD 11.5): photo, name, craft, region. No bio, by
 * design - the artisan's story lives in the mobile app, and a web page that
 * invents one would be putting words in a real person's mouth.
 *
 * The portrait is a circle, following ArtisanCard: a face in a rounded
 * rectangle reads as a product shot, and these are people.
 */
export function ArtisanHeader({ artisan, category, productCount }: ArtisanHeaderProps) {
  const t = useT()

  return (
    /*
     * The name leads, at the container's own left edge.
     *
     * The obvious arrangement - portrait on the left, name beside it - pushes
     * the name inward while the section heading and the product grid below
     * both start at the container edge, so the page reads as two competing
     * left edges with the artisan's name in neither. Stacking the portrait
     * under the name keeps one edge down the whole page. At 360px everything
     * centres instead, where a single column makes the question moot.
     */
    <header className="flex flex-col items-center gap-4 text-center sm:items-start sm:gap-5 sm:text-left">
      <h1 className="text-3xl sm:text-4xl">{artisan.name}</h1>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        <RemoteImage
          src={artisan.photoUrl}
          alt=""
          wrapperClassName="size-24 shrink-0 rounded-full sm:size-20"
        />

        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {category && (
              // The tone lives in the border and the dot, never the label: both
              // themes' dyes fail AA as a text colour (Increment 5).
              <span
                className={cn(
                  'inline-flex w-fit items-center gap-1.5 rounded-control border px-3 py-1 text-2xs text-ink',
                  DYE_BORDER[category.dye],
                )}
              >
                <span className={cn('size-1.5 rounded-full', DYE_DOT[category.dye])} />
                {category.name}
              </span>
            )}
            <span className="text-sm text-muted">{artisan.region}</span>
          </div>

          <p className="text-2xs text-muted">
            {productCount === 1
              ? t('artisan.productCountOne')
              : t('artisan.productCount', { count: productCount })}
          </p>
        </div>
      </div>
    </header>
  )
}
