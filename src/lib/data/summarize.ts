import type { AnalyticsSummary, Artisan, Category, Inquiry, Product } from '@/lib/data/types'

interface Store {
  categories: Category[]
  artisans: Artisan[]
  products: Product[]
  inquiries: Inquiry[]
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' })

/**
 * Every number is derived from the current store rather than hardcoded, so the
 * summary stays truthful after an approve or a new inquiry (PRD section 11.8
 * asks for real numbers, not zeros).
 */
export function summarize(store: Store): AnalyticsSummary {
  const artisansByCategory = store.categories.map((category) => ({
    category: category.name,
    count: store.artisans.filter((a) => a.categoryId === category.id).length,
  }))

  return {
    totalArtisans: store.artisans.length,
    approvedArtisans: store.artisans.filter((a) => a.status === 'approved').length,
    pendingArtisans: store.artisans.filter((a) => a.status === 'pending').length,
    totalProducts: store.products.length,
    totalInquiries: store.inquiries.length,
    artisansByCategory,
    signupsOverTime: signupsByMonth(store.artisans),
  }
}

/** Chronological, one entry per month an artisan actually signed up in. */
function signupsByMonth(artisans: Artisan[]): { month: string; count: number }[] {
  const counts = new Map<number, number>()

  for (const artisan of artisans) {
    const date = new Date(artisan.createdAt)
    const key = Date.UTC(date.getUTCFullYear(), date.getUTCMonth())
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, count]) => ({ month: MONTH_LABEL.format(new Date(key)), count }))
}
