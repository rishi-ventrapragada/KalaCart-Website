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

/**
 * Chronological, one entry per month from the first signup to the last.
 *
 * Months nobody joined in are included with a count of zero, so the series is
 * a continuous timeline rather than a list of the months that happened to have
 * activity. A consumer plotting the array by index would otherwise space a
 * three-month gap the same as a one-month step and misdate every point after
 * it - and the mock store has two such gaps.
 *
 * The gap filling belongs here, not in the chart layer, because this is where
 * the real `Date` keys still exist. Reconstructing them from the formatted
 * label is a trap: `Intl` renders September as "Sept" in some ICU builds and
 * "Sep" in others, so a reverse-parser passes locally and fails in a browser.
 */
function signupsByMonth(artisans: Artisan[]): { month: string; count: number }[] {
  const counts = new Map<number, number>()

  for (const artisan of artisans) {
    const date = new Date(artisan.createdAt)
    // Months since 1970, so consecutive months are consecutive integers.
    const key = date.getUTCFullYear() * 12 + date.getUTCMonth()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const keys = [...counts.keys()].sort((a, b) => a - b)
  const first = keys[0]
  const last = keys[keys.length - 1]
  if (first === undefined || last === undefined) return []

  const series: { month: string; count: number }[] = []
  for (let key = first; key <= last; key += 1) {
    const date = new Date(Date.UTC(Math.floor(key / 12), key % 12))
    series.push({ month: MONTH_LABEL.format(date), count: counts.get(key) ?? 0 })
  }

  return series
}
