import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { ActiveFilters } from '@/components/browse/ActiveFilters'
import { FilterDrawer } from '@/components/browse/FilterDrawer'
import { FilterPanel } from '@/components/browse/FilterPanel'
import { ResultsGrid } from '@/components/browse/ResultsGrid'
import { Container } from '@/components/layout/Container'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { getAllArtisans, getCategories, getProducts } from '@/lib/data'
import type { Product, ProductFilters } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useProductFilters } from '@/lib/browse/useProductFilters'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'

/**
 * Regions come from the artisans, because there is no getRegions() in the seam
 * and a product's region IS its artisan's. Worth a real seam function when the
 * catalogue grows - it belongs in PRD 16's questions for the teammate.
 */
const fetchFacets = async () => {
  const [categories, artisans] = await Promise.all([
    getCategories(),
    getAllArtisans({ status: 'approved' }),
  ])
  const regions = [...new Set(artisans.map((a) => a.region))].sort((a, b) => a.localeCompare(b))
  return { categories, regions }
}

/**
 * Browse and search (PRD 11.3). The core discovery surface.
 *
 * The URL is the state: every filter lives in the query string, so results are
 * shareable, the back button steps through filter changes, and a reload
 * restores the view. Motion is reveal-only (PRD 10.8) - no engine, no rail, no
 * progress bar.
 */
export default function Browse() {
  const state = useProductFilters()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useT()

  const facets = useAsyncData(fetchFacets)

  /*
   * The fetcher is re-created whenever the FILTERS change, and only then -
   * that identity change is what makes useAsyncData refetch.
   *
   * It is keyed on a serialization rather than on the filters object because
   * useProductFilters builds a fresh object each render: depending on the
   * object directly would re-create the fetcher every render and refetch in a
   * loop. The memo below re-parses from that same string, so the dependency
   * list is honest and nothing is suppressed.
   */
  const filterKey = JSON.stringify(state.filters)
  const invalid = state.invalidRange

  const fetchProducts = useMemo(() => {
    const filters = JSON.parse(filterKey) as ProductFilters
    // An impossible range returns nothing from the seam anyway; skipping the
    // read keeps the explanation on screen instead of a bare empty grid.
    return () => (invalid ? Promise.resolve<Product[]>([]) : getProducts(filters))
  }, [filterKey, invalid])

  const products = useAsyncData(fetchProducts)

  const categoryOptions = useMemo(
    () => (facets.data?.categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    [facets.data],
  )
  const regionOptions = useMemo(
    () => (facets.data?.regions ?? []).map((r) => ({ value: r, label: r })),
    [facets.data],
  )

  /** Turns a raw param value into something a reader recognises on a chip. */
  const labelFor = useCallback(
    (key: string, value: string): string => {
      if (key === 'category') {
        return facets.data?.categories.find((c) => c.id === value)?.name ?? value
      }
      if (key === 'min') return `${t('browse.filters.minPrice')} ${formatPrice(Number(value))}`
      if (key === 'max') return `${t('browse.filters.maxPrice')} ${formatPrice(Number(value))}`
      return value
    },
    [facets.data, t],
  )

  const panel = (
    <FilterPanel state={state} categories={categoryOptions} regions={regionOptions} />
  )

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl">{t('browse.title')}</h1>
        <p className="max-w-lg text-sm text-muted sm:text-base">{t('browse.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ActiveFilters state={state} labelFor={labelFor} />

        <button
          type="button"
          onClick={() => {
            setDrawerOpen(true)
          }}
          aria-expanded={drawerOpen}
          className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm, 'lg:hidden')}
        >
          <SlidersHorizontal size={15} aria-hidden />
          {t('browse.filters.open')}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
        {/*
          The panel is inline from lg up, and inside the drawer below it.

          The heading is sr-only rather than absent: the drawer version carries
          a visible "Filters" title, but inline the surrounding layout already
          makes the region obvious to a sighted reader, and a second visible
          title would be noise. Without it the page skipped h1 to h3 (the
          product cards), which the Increment 16 sweep caught.
        */}
        <aside className="hidden lg:block" aria-labelledby="filters-heading">
          <h2 id="filters-heading" className="sr-only">
            {t('browse.filters.heading')}
          </h2>
          {panel}
        </aside>

        <ResultsGrid
          state={products.state}
          products={products.data ?? []}
          categories={facets.data?.categories ?? []}
          onRetry={products.retry}
          onClear={state.clearAll}
        />
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
      >
        {panel}
      </FilterDrawer>
    </Container>
  )
}
