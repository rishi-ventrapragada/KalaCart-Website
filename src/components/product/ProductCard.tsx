import { Link } from 'react-router-dom'

import { RemoteImage } from '@/components/ui/RemoteImage'
import type { Category, Product } from '@/lib/data'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'

/** Tailwind cannot see a class assembled at runtime, so the map is explicit. */
const DYE_DOT: Record<Category['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

interface ProductCardProps {
  product: Product
  /** Undefined while categories are still loading, or if one is missing. */
  category?: Category | undefined
  /**
   * Load the cover immediately instead of lazily. For the first row of a grid
   * that sits above the fold, and nothing else - see `RemoteImage`.
   *
   * It is the caller's call rather than the card's because only the caller
   * knows where in a grid a card landed, and the same card renders in Home's
   * featured row, Browse's results and two detail pages.
   */
  priority?: boolean
}

/**
 * One product. THE reusable card: Home's featured grid, Browse's results, and
 * later the artisan profile all render this, so it takes a Product and nothing
 * page-specific. It lives in `components/product/` rather than under `home/`
 * because it has more than one caller.
 *
 * Hover moves colour only, never geometry. Lifting a card on hover is one of
 * the generic-craft-page tells CLAUDE.md names, and a grid where every card
 * grows a shadow reads as a template.
 */
export function ProductCard({ product, category, priority = false }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-card border border-line bg-card',
        'transition-colors duration-200 ease-site hover:border-accent',
      )}
    >
      {/*
        The cover. `alt` is empty because the title sits directly beneath it in
        the same link: announcing the image as well would read the product name
        twice to a screen reader.
      */}
      <RemoteImage
        src={product.imageUrls[0] ?? ''}
        alt=""
        priority={priority}
        wrapperClassName="aspect-square w-full"
      />

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <span className="inline-flex items-center gap-1.5 text-2xs text-muted">
            {/* The dye tone lives in the dot, never in the label: both themes'
                mid-tone dyes fail AA as text (Increment 5). */}
            <span className={cn('size-1.5 rounded-full', DYE_DOT[category.dye])} />
            {category.name}
          </span>
        )}

        <h3 className="font-display text-base leading-snug text-ink">{product.title}</h3>

        <p className="mt-auto pt-2 text-sm text-ink">{formatPrice(product.priceInr)}</p>
      </div>
    </Link>
  )
}
