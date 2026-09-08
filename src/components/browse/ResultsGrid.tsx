import { ProductCard } from '@/components/product/ProductCard'
import { Reveal } from '@/components/motion/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { AsyncState } from '@/lib/data/useAsyncData'
import type { Category, Product } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ResultsGridProps {
  state: AsyncState
  products: Product[]
  categories: Category[]
  onRetry: () => void
  onClear: () => void
}

/** Enough skeletons to fill the fold without pretending to know the count. */
const SKELETON_COUNT = 8

/**
 * The results (PRD 11.3): a count, a grid of ProductCards, and all three
 * states.
 *
 * A wrapper of its own rather than a reuse of Home's ProductGrid: that
 * component fetches its own eight newest and carries its own heading, which is
 * Home's job. What the two genuinely share is the card, and that is what is
 * shared.
 */
export function ResultsGrid({
  state,
  products,
  categories,
  onRetry,
  onClear,
}: ResultsGridProps) {
  const t = useT()

  if (state === 'error') {
    return <ErrorState message={t('browse.results.error')} onRetry={onRetry} />
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            // Matches the card's geometry, so the grid does not reflow when
            // the real results land.
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-card" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={t('browse.results.emptyTitle')}
        body={t('browse.results.emptyBody')}
        action={
          <button
            type="button"
            onClick={onClear}
            className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
          >
            {t('browse.filters.clear')}
          </button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/*
        Announced politely: a reader who changes a filter with a screen reader
        gets the new count without the page stealing focus.
      */}
      <p aria-live="polite" className="text-sm text-muted">
        {products.length === 1
          ? t('browse.results.countOne')
          : t('browse.results.count', { count: products.length })}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {products.map((product, i) => (
          // Reveal-only motion (PRD 10.8). Stagger runs across a row rather
          // than the whole grid, so a long result set does not take most of a
          // second to finish arriving.
          <Reveal key={product.id} delay={(i % 3) * 80}>
            <ProductCard
              product={product}
              category={categories.find((c) => c.id === product.categoryId)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
