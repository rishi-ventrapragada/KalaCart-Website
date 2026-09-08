import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArtisanMiniCard } from '@/components/product/ArtisanMiniCard'
import { ImageGallery } from '@/components/product/ImageGallery'
import { InquiryModal } from '@/components/product/InquiryModal'
import { ProductCard } from '@/components/product/ProductCard'
import { WhatsappButton } from '@/components/product/WhatsappButton'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { getArtisanById, getCategories, getProductById, getProducts } from '@/lib/data'
import type { Category } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'

/** How many of the artisan's other pieces to show. One clean row. */
const MORE_COUNT = 3

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

export default function ProductDetail() {
  const { id = '' } = useParams()
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const t = useT()

  // One read for everything this page needs. The artisan and the sibling
  // products both depend on the product, so a single fetcher keeps the page
  // out of a waterfall of dependent effects and gives it one loading state.
  const fetchPage = useCallback(async () => {
    const product = await getProductById(id)
    if (!product) return { product: null }

    const [artisan, categories, siblings] = await Promise.all([
      getArtisanById(product.artisanId),
      getCategories(),
      getProducts(),
    ])

    return {
      product,
      artisan,
      categories,
      more: siblings.filter((p) => p.artisanId === product.artisanId && p.id !== product.id),
    }
  }, [id])

  const page = useAsyncData(fetchPage)

  if (page.state === 'error') {
    return (
      <Container className="py-20">
        <ErrorState message={t('product.error')} onRetry={page.retry} />
      </Container>
    )
  }

  if (page.state === 'loading') {
    return (
      <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-card" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-48 rounded-control" />
        </div>
      </Container>
    )
  }

  const { product, artisan, categories, more } = page.data ?? { product: null }

  // Not found is a designed state, not an error: the id is simply not a
  // product, which is a normal thing for a stale link to be (PRD 11.4).
  if (!product) {
    return (
      <Container className="py-24">
        <EmptyState
          title={t('product.notFoundTitle')}
          body={t('product.notFoundBody')}
          action={
            <Link
              to="/browse"
              className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
            >
              {t('product.backToBrowse')}
            </Link>
          }
        />
      </Container>
    )
  }

  const category = (categories ?? []).find((c) => c.id === product.categoryId)

  return (
    <Container className="flex flex-col gap-16 py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ImageGallery images={product.imageUrls} title={product.title} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {category && (
              // Dye-coded chip (PRD 11.4). The tone lives in the border and the
              // dot, never the label: both themes' dyes fail AA as a text
              // colour (Increment 5).
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
            <h1 className="text-3xl sm:text-4xl">{product.title}</h1>
            <p className="text-xl text-ink">{formatPrice(product.priceInr)}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-ink">{t('product.description')}</h2>
            <p className="max-w-prose leading-relaxed text-muted">{product.description}</p>
          </div>

          {artisan && <ArtisanMiniCard artisan={artisan} category={category} />}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              size="lg"
              onClick={() => {
                setInquiryOpen(true)
              }}
            >
              {t('product.contact')}
            </Button>
            {artisan && <WhatsappButton phone={artisan.phone} productTitle={product.title} />}
          </div>
        </div>
      </div>

      {more && more.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl">{t('product.moreFrom')}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {more.slice(0, MORE_COUNT).map((sibling, i) => (
              <Reveal key={sibling.id} delay={i * 80}>
                <ProductCard
                  product={sibling}
                  category={(categories ?? []).find((c) => c.id === sibling.categoryId)}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <InquiryModal
        open={inquiryOpen}
        onClose={() => {
          setInquiryOpen(false)
        }}
        productId={product.id}
      />
    </Container>
  )
}
