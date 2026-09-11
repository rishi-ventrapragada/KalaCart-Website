import { ProductCard } from '@/components/product/ProductCard'
import { SectionHeader } from '@/components/home/SectionHeader'
import { Container } from '@/components/layout/Container'
import { useGridReveal } from '@/components/motion/useGridReveal'
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
 * Cards per row, which is NOT one number: the grid is `grid-cols-2` and becomes
 * `lg:grid-cols-4`, so measured, it renders 2 columns at 360 and 768 and 4 at
 * 1280. The entrance stagger wraps per row, so a hardcoded 4 would run the
 * cascade against a row that does not exist at the two narrow widths.
 *
 * Read from a media query matching Tailwind's `lg`, so it tracks the class
 * beside it. Both have to change together.
 */
const LG_QUERY = '(min-width: 1024px)'
const COLUMNS_BASE = 2
const COLUMNS_LG = 4

/** Seconds between one card's entrance and the next. ~80ms, the PRD 10.3 beat. */
const STAGGER = 0.08

/**
 * How many covers load eagerly rather than on scroll.
 *
 * COLUMNS_LG rather than COLUMNS_BASE, because this is the count that is
 * above the fold in the WORST case: at 1280 the first row is four cards, and
 * eager-loading four at 360 (where the first row is two) costs two extra
 * requests for images the reader reaches in one short scroll. Erring the other
 * way would leave two of the four desktop cards lazy and visibly late.
 *
 * The grid itself is below the hero on every width, so strictly none of these
 * are in the first viewport on load. They are the first thing the reader
 * scrolls to, and a lazy image cannot start loading until that scroll happens.
 */
const EAGER_COUNT = COLUMNS_LG

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

  // Keyed off the rendered card count, not off mount: the cards do not exist
  // until the seam read lands, so the entrance is armed when they appear.
  const { rootRef, setCardRef } = useGridReveal({
    count: featured.length,
    stagger: STAGGER,
    query: LG_QUERY,
    columns: COLUMNS_LG,
    columnsBelow: COLUMNS_BASE,
  })

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
          <div ref={rootRef} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product, i) => (
              // The entrance is written by GSAP from useGridReveal rather than
              // by the CSS reveal: the stagger, the rise and the blur-to-focus
              // all belong to one tween, and two mechanisms owning opacity on
              // one node is what makes the sweep's reduced-motion check report
              // phantom failures. Hence no `data-reveal` here.
              <div key={product.id} ref={setCardRef(i)} className="product-grid__card">
                <ProductCard
                  product={product}
                  category={(categories.data ?? []).find((c) => c.id === product.categoryId)}
                  priority={i < EAGER_COUNT}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
