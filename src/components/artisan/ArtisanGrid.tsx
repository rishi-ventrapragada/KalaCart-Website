import { ArtisanCard } from '@/components/home/ArtisanCard'
import { Reveal } from '@/components/motion/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { Artisan, Category } from '@/lib/data'
import type { AsyncState } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ArtisanGridProps {
  state: AsyncState
  artisans: Artisan[]
  categories: Category[]
  /** Whether a filter is applied, which decides which empty copy is right. */
  filtered: boolean
  onRetry: () => void
  onClear: () => void
}

/** Enough to fill the fold without pretending to know the count. */
const SKELETON_COUNT = 8

/** One place, so the skeletons and the real cards cannot drift apart. */
const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'

/**
 * Every approved artisan, as a grid of profile links, with all three states.
 *
 * The card is Home's `ArtisanCard`, unchanged apart from opting into the
 * listing count it already carried on the type. Home shows five makers as a
 * taste; this is the full directory - same card, more of them.
 */
export function ArtisanGrid({
  state,
  artisans,
  categories,
  filtered,
  onRetry,
  onClear,
}: ArtisanGridProps) {
  const t = useT()

  if (state === 'error') {
    return <ErrorState message={t('artisans.results.error')} onRetry={onRetry} />
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24" />
        <div className={GRID}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            // Matches the card's height, so the grid does not reflow when the
            // real artisans land.
            <Skeleton key={i} className="h-[15rem] rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  if (artisans.length === 0) {
    /*
     * Two different sentences. With a filter applied, the reader narrowed too
     * far and Clear is the way out; with none, the catalogue is genuinely empty
     * and offering to clear nothing would be a control that does nothing.
     */
    return filtered ? (
      <EmptyState
        title={t('artisans.results.emptyTitle')}
        body={t('artisans.results.emptyBody')}
        action={
          <button
            type="button"
            onClick={onClear}
            className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
          >
            {t('artisans.filters.clear')}
          </button>
        }
      />
    ) : (
      <EmptyState
        title={t('artisans.results.noneTitle')}
        body={t('artisans.results.noneBody')}
      />
    )
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby="artisans-heading">
      {/*
        sr-only: the count below already tells a sighted reader what this region
        is, and this exists so the cards' h3 headings sit under an h2 rather
        than jumping straight from the page h1 - which the sweep checks.
      */}
      <h2 id="artisans-heading" className="sr-only">
        {t('artisans.results.heading')}
      </h2>

      {/* Announced politely, so a filter change reports its new count without
          stealing focus. Same contract as Browse's results count. */}
      <p aria-live="polite" className="text-sm text-muted">
        {artisans.length === 1
          ? t('artisans.results.countOne')
          : t('artisans.results.count', { count: artisans.length })}
      </p>

      <div className={GRID}>
        {artisans.map((artisan, i) => (
          // Reveal-only motion (PRD 10.8): this is not Home, so there is no
          // engine. Stagger runs across a row rather than the whole grid, so a
          // long directory does not take most of a second to finish arriving.
          <Reveal key={artisan.id} delay={(i % 4) * 80}>
            <ArtisanCard
              artisan={artisan}
              category={categories.find((c) => c.id === artisan.categoryId)}
              showCount
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
