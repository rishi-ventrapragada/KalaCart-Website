import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ArtisanFilters } from '@/lib/data'

/** The query-param names, shared with Browse so a region reads the same way. */
export const PARAM = {
  query: 'query',
  craft: 'craft',
  region: 'region',
} as const

export type ArtisanFilterKey = keyof typeof PARAM

export interface ArtisanFilterState {
  /** Parsed and ready for the seam. */
  filters: ArtisanFilters
  /** The raw param values, for populating the controls. */
  raw: Record<ArtisanFilterKey, string>
  /** Whether any filter is applied, for the Clear affordance. */
  active: boolean
  /** Writes one param. Empty string removes it. */
  setFilter: (key: ArtisanFilterKey, value: string, options?: { replace?: boolean }) => void
  clearAll: () => void
}

/**
 * THE URL IS THE STATE, for the artisans directory.
 *
 * A sibling of `useProductFilters` rather than a reuse of it: that hook parses
 * a price range and a sort, neither of which an artisan read accepts, and it
 * returns a `ProductFilters`. Widening it to serve both surfaces would mean a
 * mode flag and two shapes of return value - more coupling than the ~30 lines
 * it would save. What the two genuinely share is the pattern, not the code.
 *
 * `category` is spelled `craft` here because that is the reader-facing word on
 * this page (Browse's own param predates it and PRD 11.3 fixes that name, so
 * it is not ours to change there).
 *
 * Status is NOT a param. This is a buyer surface and only approved artisans
 * are ever listed; the route pins that, so no URL can ask for pending rows.
 */
export function useArtisanFilters(): ArtisanFilterState {
  const [params, setParams] = useSearchParams()

  const raw = useMemo(
    () => ({
      query: params.get(PARAM.query) ?? '',
      craft: params.get(PARAM.craft) ?? '',
      region: params.get(PARAM.region) ?? '',
    }),
    [params],
  )

  const filters = useMemo<ArtisanFilters>(() => {
    // Exact-optional-property-safe: a key is present only when it has a value,
    // rather than being set to undefined.
    const next: ArtisanFilters = { status: 'approved' }
    if (raw.query.trim()) next.query = raw.query.trim()
    if (raw.craft) next.categoryId = raw.craft
    if (raw.region) next.region = raw.region
    return next
  }, [raw])

  const setFilter = useCallback<ArtisanFilterState['setFilter']>(
    (key, value, options) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value === '') next.delete(PARAM[key])
          else next.set(PARAM[key], value)
          return next
        },
        // Same rule as Browse: typing replaces so a search does not push one
        // history entry per keystroke; picking a craft or region pushes.
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
    // `status` is always set, so it is not evidence of a reader's filter.
    active: Boolean(raw.query.trim() || raw.craft || raw.region),
    raw,
    setFilter,
    clearAll,
  }
}
