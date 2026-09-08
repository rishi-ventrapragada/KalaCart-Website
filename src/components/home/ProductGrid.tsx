import { ProductCard } from '@/components/home/ProductCard'
import { SectionHeader } from '@/components/home/SectionHeader'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getCategories, getProducts } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/** PRD 11.2 asks for about eight. Two clean rows of four on desktop. */
const FEATURED_COUNT = 8

/**
 * Newest first. There is no `featured` flag in the shared schema (PRD 8), so
 * "featured" is recency rather than editorial choice - which is honest, and
 * keeps the section fresh as artisans list work. A real flag is worth raising
 * with the teammate; it belongs in PRD 16's open questions.
 */
const fetchNewest = () => getProducts({ sort: 'newest' })

/**
 * Featured products (PRD 11.2). The first surface carrying real photography,
 * so it sets the card pattern Browse reuses in Increment 9.
 */
export function ProductGrid() {
  const products = useAsyncData(fetchNewest)
  const categories = useAsyncData(getCategories)
  const t = useT()

  const failed = products.state === 'error' || categories.state === 'error'
  const loading = products.state === 'loading' || categories.state === 'loading'
  const featured = (products.data ?? []).slice(0, FEATURED_COUNT)

  const retry = (): void => {
    products.retry()
    categories.retry()
  }

  return (
    <section className="py-20 sm:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          heading={t('home.products.heading')}
          body={t('home.products.body')}
          linkTo="/browse"
          linkLabel={t('home.products.seeAll')}
        />

        {failed ? (
          <ErrorState message={t('home.products.error')} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: FEATURED_COUNT }, (_, i) => (
              // Matches the card: square cover plus its text block, so the grid
              // does not reflow when the real cards land.
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-card" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <EmptyState title={t('home.products.empty')} />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product, i) => (
              // Stagger runs across the row, not the whole grid: eight cards
              // each trailing the last by 80ms would take most of a second to
              // finish, and the tail would still be arriving after the reader
              // has started reading.
              <Reveal key={product.id} delay={(i % 4) * 80}>
                <ProductCard
                  product={product}
                  category={(categories.data ?? []).find((c) => c.id === product.categoryId)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
