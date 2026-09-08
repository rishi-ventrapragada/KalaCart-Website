import { X } from 'lucide-react'

import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { FilterKey, FilterState } from '@/lib/browse/useProductFilters'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ActiveFiltersProps {
  state: FilterState
  /** Resolves a raw param value to something a reader recognises. */
  labelFor: (key: FilterKey, value: string) => string
}

/** Sort is excluded: an ordering is not a filter and removing it means nothing. */
const CHIP_KEYS: FilterKey[] = ['query', 'category', 'region', 'min', 'max']

/**
 * The applied filters, each removable, plus Clear all.
 *
 * Worth the space because the filters live in the URL: a reader arriving from a
 * shared link has constraints they never set, and with the panel closed on
 * mobile there would otherwise be nothing on screen explaining why the results
 * look thin.
 */
export function ActiveFilters({ state, labelFor }: ActiveFiltersProps) {
  const { raw, active, setFilter, clearAll } = state
  const t = useT()

  if (!active) return null

  const chips = CHIP_KEYS.filter((key) => raw[key] !== '').map((key) => ({
    key,
    label: labelFor(key, raw[key]),
  }))

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-control border border-line-strong py-1 pl-3 pr-1.5 text-xs text-ink"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => {
              setFilter(chip.key, '')
            }}
            aria-label={t('browse.filters.remove', { label: chip.label })}
            className="rounded-control p-0.5 text-muted transition-colors duration-200 ease-site hover:text-ink"
          >
            <X size={13} aria-hidden />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className={cn(buttonBase, buttonVariants.ghost, buttonSizes.sm)}
      >
        {t('browse.filters.clear')}
      </button>
    </div>
  )
}
