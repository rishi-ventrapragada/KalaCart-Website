import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArtisanHeader } from '@/components/artisan/ArtisanHeader'
import { ArtisanProfileSkeleton } from '@/components/artisan/ArtisanProfileSkeleton'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { getArtisanById, getCategories, getProducts } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

export default function ArtisanProfile() {
  const { id = '' } = useParams()
  const t = useT()

  /*
   * One read for the whole page. The products and the craft chip both depend on
   * the artisan, so a single fetcher keeps this out of a waterfall of dependent
   * effects and gives the page one loading state.
   *
   * The status check is the load-bearing line. `getArtisanById` returns rows of
   * any status on purpose - the admin queue needs to preview a pending artisan
   * by id - so it is this buyer-facing route's job to refuse anything that is
   * not approved. Without it, /artisan/a9 would present a rejected artisan as
   * verified on a site whose whole claim to a ministry reviewer is that its
   * artisans are checked. Returning null here routes it to not-found, which
   * also avoids telling a stranger whether someone was rejected or is still
   * under review.
   */
  const fetchPage = useCallback(async () => {
    const artisan = await getArtisanById(id)
    if (!artisan || artisan.status !== 'approved') return { artisan: null }

    const [categories, products] = await Promise.all([
      getCategories(),
      // Approved-only filtering stays inside the seam (mockProvider.getProducts).
      getProducts({ artisanId: artisan.id }),
    ])

    return { artisan, categories, products }
  }, [id])

  const page = useAsyncData(fetchPage)

  if (page.state === 'error') {
    return (
      <Container className="py-20">
        <ErrorState message={t('artisan.error')} onRetry={page.retry} />
      </Container>
    )
  }

  if (page.state === 'loading') {
    return (
      <Container className="py-14 sm:py-20">
        <ArtisanProfileSkeleton />
      </Container>
    )
  }

  const { artisan, categories, products } = page.data ?? { artisan: null }

  // Not found is a designed state, not an error: an id that is not an approved
  // artisan is a normal thing for a stale or shared link to be (PRD 11.5).
  if (!artisan) {
    return (
      <Container className="py-24">
        <EmptyState
          title={t('artisan.notFoundTitle')}
          body={t('artisan.notFoundBody')}
          action={
            <Link
              to="/browse"
              className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
            >
              {t('artisan.backToBrowse')}
            </Link>
          }
        />
      </Container>
    )
  }

  const catalog = products ?? []
  const category = (categories ?? []).find((c) => c.id === artisan.categoryId)

  return (
    <Container className="flex flex-col gap-16 py-14 sm:py-20">
      <ArtisanHeader artisan={artisan} category={category} productCount={catalog.length} />

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl">{t('artisan.heading')}</h2>

        {catalog.length === 0 ? (
          <EmptyState title={t('artisan.emptyTitle')} body={t('artisan.emptyBody')} />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {catalog.map((product, i) => (
              // Reveal-only motion (PRD 10.8). The stagger runs across a row
              // rather than the whole grid, so a long catalog does not take
              // most of a second to finish arriving.
              <Reveal key={product.id} delay={(i % 3) * 80}>
                <ProductCard
                  product={product}
                  category={(categories ?? []).find((c) => c.id === product.categoryId)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </Container>
  )
}
