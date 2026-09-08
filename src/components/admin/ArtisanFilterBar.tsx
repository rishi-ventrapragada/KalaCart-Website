import { SearchField } from '@/components/browse/SearchField'
import { Select, type SelectOption } from '@/components/ui/Select'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { ArtisanFilterState } from '@/lib/admin/useArtisanFilters'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ArtisanFilterBarProps {
  state: ArtisanFilterState
  categories: SelectOption[]
  regions: SelectOption[]
}

/**
 * Search plus the three filters PRD 11.7 names: status, category, region.
 *
 * SearchField is reused from Browse rather than reimplemented. It already owns
 * the one hard part - debouncing keystrokes without writing a history entry per
 * character, while still adopting a value that arrives from the URL - and that
 * logic should exist once. It takes a value and a commit callback and knows
 * nothing about which surface it is on.
 */
export function ArtisanFilterBar({ state, categories, regions }: ArtisanFilterBarProps) {
  const { raw, active, setFilter, clearAll } = state
  const t = useT()

  const statuses: SelectOption[] = [
    { value: 'pending', label: t('admin.artisans.statusPending') },
    { value: 'approved', label: t('admin.artisans.statusApproved') },
    { value: 'rejected', label: t('admin.artisans.statusRejected') },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SearchField
          value={raw.query}
          label={t('admin.artisans.search')}
          placeholder={t('admin.artisans.searchPlaceholder')}
          onCommit={(value) => {
            // Typing replaces: a search must not bury the desk under one
            // history entry per keystroke.
            setFilter('query', value, { replace: true })
          }}
        />

        <Select
          label={t('admin.artisans.filterStatus')}
          placeholder={t('admin.artisans.allStatuses')}
          options={statuses}
          value={raw.status}
          onChange={(event) => {
            setFilter('status', event.target.value)
          }}
        />

        <Select
          label={t('admin.artisans.filterCategory')}
          placeholder={t('admin.artisans.allCategories')}
          options={categories}
          value={raw.category}
          onChange={(event) => {
            setFilter('category', event.target.value)
          }}
        />

        <Select
          label={t('admin.artisans.filterRegion')}
          placeholder={t('admin.artisans.allRegions')}
          options={regions}
          value={raw.region}
          onChange={(event) => {
            setFilter('region', event.target.value)
          }}
        />
      </div>

      {/* Only offered when there is something to clear, so the control does not
          sit there inert as decoration. */}
      {active && (
        <button
          type="button"
          onClick={clearAll}
          className={cn(buttonBase, buttonVariants.ghost, buttonSizes.sm, 'self-start')}
        >
          {t('admin.artisans.clear')}
        </button>
      )}
    </div>
  )
}
