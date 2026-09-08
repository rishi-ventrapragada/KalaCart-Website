import type { AnalyticsSummary, Category, Dye } from '@/lib/data'

/**
 * Chart-ready shapes derived from the admin summary (PRD 11.8).
 *
 * Pure functions, no React and no data-seam access, so the chart components
 * stay dumb renderers and the shaping decisions sit in one testable place
 * rather than inside a component's JSX.
 *
 * Nothing here edits the summary. `getAnalyticsSummary()` stays the honest
 * admin view it is (CLAUDE.md section D, Increment 8); these are presentations
 * of it.
 */

export interface BarDatum {
  label: string
  value: number
  /** Decorative only - every bar is labelled in text (PRD 9 contrast rule). */
  dye: Dye
}

export interface LinePoint {
  month: string
  /** New artisans that month. Zero for a month nobody joined. */
  added: number
  /** Artisans on the platform by the end of that month. */
  total: number
}

/** Fallback tone for a category the summary names but the seam did not return. */
const DEFAULT_DYE: Dye = 'indigo'

/**
 * Artisans by category, largest first.
 *
 * Sorted rather than left in seam order because a bar chart's job is to make
 * the ranking readable at a glance; category id order carries no meaning to a
 * ministry official. Ties break alphabetically so the order is stable across
 * reloads instead of depending on the sort's implementation.
 */
export function toCategoryBars(
  summary: AnalyticsSummary,
  categories: Category[],
): BarDatum[] {
  const dyeByName = new Map(categories.map((c) => [c.name, c.dye]))

  return summary.artisansByCategory
    .map((row) => ({
      label: row.category,
      value: row.count,
      dye: dyeByName.get(row.category) ?? DEFAULT_DYE,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

/**
 * The signup series as a running platform total.
 *
 * The monthly figures are turned into a cumulative line because every artisan
 * in the mock store signed up in a different month: the raw series is a row of
 * 1s, a dead-flat line that reads as broken and tells a reviewer nothing. The
 * running total climbs, and "artisans on the platform" is the number the impact
 * story is actually about. Each point keeps its monthly figure, so nothing is
 * lost - the accessible table shows both columns.
 *
 * The timeline itself arrives gap-free from `summarize`, which fills months
 * nobody joined in while it still has the real dates. This function only
 * accumulates.
 */
export function toCumulativeSeries(summary: AnalyticsSummary): LinePoint[] {
  let total = 0
  return summary.signupsOverTime.map((row) => {
    total += row.count
    return { month: row.month, added: row.count, total }
  })
}
