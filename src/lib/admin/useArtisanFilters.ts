import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ArtisanFilters, Status } from '@/lib/data'

/** The query-param names for the artisan table (PRD 11.7). */
export const PARAM = {
  query: 'query',
  status: 'status',
  category: 'category',
  region: 'region',
} as const

export type ArtisanFilterKey = keyof typeof PARAM

const STATUSES: Status[] = ['pending', 'approved', 'rejected']

const isStatus = (value: string): value is Status => (STATUSES as string[]).includes(value)

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
 * THE URL IS THE STATE, the same way Browse and the queue tab do it.
 *
 * An official can send a colleague "the pending Bihar artisans" as a link, the
 * back button steps through filter changes, and a reload restores the view.
 * Mirrors useProductFilters deliberately: two hooks that do the same job should
 * read the same way.
 */
export function useArtisanFilters(): ArtisanFilterState {
  const [params, setParams] = useSearchParams()

  const raw = useMemo(
    () => ({
      query: params.get(PARAM.query) ?? '',
      status: params.get(PARAM.status) ?? '',
      category: params.get(PARAM.category) ?? '',
      region: params.get(PARAM.region) ?? '',
    }),
    [params],
  )

  const filters = useMemo<ArtisanFilters>(() => {
    // Exact-optional-property-safe: a key is present only when it has a value,
    // rather than being set to undefined.
    const next: ArtisanFilters = {}
    if (raw.query.trim()) next.query = raw.query.trim()
    if (isStatus(raw.status)) next.status = raw.status
    if (raw.category) next.categoryId = raw.category
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
        // Typing replaces rather than pushes, so a search does not bury the
        // desk under one history entry per keystroke. Deliberate choices (a
        // status, a region) push, because those are steps someone would expect
        // the back button to undo.
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
    setFilter,
    clearAll,
  }
}
