import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ProductFilters, ProductSort } from '@/lib/data'

/** The query-param names. PRD 11.3 fixes these, so they are not ours to rename. */
export const PARAM = {
  query: 'query',
  category: 'category',
  region: 'region',
  sort: 'sort',
  min: 'min',
  max: 'max',
} as const

export type FilterKey = keyof typeof PARAM

const SORTS: ProductSort[] = ['newest', 'price-asc', 'price-desc']

const isSort = (value: string): value is ProductSort =>
  (SORTS as string[]).includes(value)

/**
 * A price param, or undefined if it is absent or not a usable number.
 *
 * A junk value in a shared URL must not become `NaN` in a filter, which would
 * silently exclude every product. Anything unparseable is treated as absent.
 */
function readPrice(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

export interface FilterState {
  /** Parsed and ready for the seam. */
  filters: ProductFilters
  /** The raw param values, for populating the controls. */
  raw: Record<FilterKey, string>
  /** Whether any filter is applied, for the Clear affordance. */
  active: boolean
  /** min is greater than max: the controls show it, the read is not issued. */
  invalidRange: boolean
  /** Writes one param. Empty string removes it. */
  setFilter: (key: FilterKey, value: string, options?: { replace?: boolean }) => void
  clearAll: () => void
}

/**
 * THE URL IS THE STATE (PRD 11.3).
 *
 * Every filter lives in the query string and nothing holds a parallel copy in
 * React state, so a pasted URL reproduces a result set exactly, the back button
 * steps through filter changes, and a reload restores the view. The one piece
 * of local state anywhere in Browse is the search box's text, which needs it to
 * debounce before writing here.
 */
export function useProductFilters(): FilterState {
  const [params, setParams] = useSearchParams()

  const raw = useMemo(
    () => ({
      query: params.get(PARAM.query) ?? '',
      category: params.get(PARAM.category) ?? '',
      region: params.get(PARAM.region) ?? '',
      sort: params.get(PARAM.sort) ?? '',
      min: params.get(PARAM.min) ?? '',
      max: params.get(PARAM.max) ?? '',
    }),
    [params],
  )

  const minPrice = readPrice(raw.min)
  const maxPrice = readPrice(raw.max)
  const invalidRange = minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice

  const filters = useMemo<ProductFilters>(() => {
    // Exact-optional-property-safe: a key is present only when it has a value,
    // rather than being set to undefined.
    const next: ProductFilters = {}
    if (raw.query.trim()) next.query = raw.query.trim()
    if (raw.category) next.categoryId = raw.category
    if (raw.region) next.region = raw.region
    if (minPrice !== undefined) next.minPrice = minPrice
    if (maxPrice !== undefined) next.maxPrice = maxPrice
    if (isSort(raw.sort)) next.sort = raw.sort
    return next
  }, [raw, minPrice, maxPrice])

  const setFilter = useCallback<FilterState['setFilter']>(
    (key, value, options) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value === '') next.delete(PARAM[key])
          else next.set(PARAM[key], value)
          return next
        },
        // Typing replaces rather than pushes, so a search does not bury the
        // previous page under one history entry per keystroke. Deliberate
        // choices (a category, a sort) push, because those are steps a reader
        // would expect the back button to undo.
        { replace: options?.replace ?? false },
      )
    },
    [setParams],
  )

  const clearAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: false })
  }, [setParams])

  return {
    filters,
    raw,
    active: Object.keys(filters).length > 0,
    invalidRange,
    setFilter,
    clearAll,
  }
}
