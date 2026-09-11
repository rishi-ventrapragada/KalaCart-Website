import { SearchField } from '@/components/browse/SearchField'
import { Select } from '@/components/ui/Select'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { ArtisanFilterState } from '@/lib/artisans/useArtisanFilters'
import type { SelectOption } from '@/components/ui/Select'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ArtisanFilterBarProps {
  state: ArtisanFilterState
  crafts: SelectOption[]
  regions: SelectOption[]
}

/**
 * The directory's filters: one inline row, not Browse's sidebar and drawer.
 *
 * Three controls over a flat list of people do not need a column of their own,
 * and a drawer below `lg` would hide the only way to narrow the page behind a
 * button. The row simply wraps to one control per line at 360px.
 */
export function ArtisanFilterBar({ state, crafts, regions }: ArtisanFilterBarProps) {
  const t = useT()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="sm:w-56">
        <SearchField
          value={state.raw.query}
          label={t('artisans.filters.search')}
          placeholder={t('artisans.filters.searchPlaceholder')}
          onCommit={(value) => {
            // Replaces, so typing does not push a history entry per keystroke.
            state.setFilter('query', value, { replace: true })
          }}
        />
      </div>

      <div className="sm:w-48">
        <Select
          label={t('artisans.filters.craft')}
          placeholder={t('artisans.filters.allCrafts')}
          options={crafts}
          value={state.raw.craft}
          onChange={(event) => {
            state.setFilter('craft', event.target.value)
          }}
        />
      </div>

      <div className="sm:w-48">
        <Select
          label={t('artisans.filters.region')}
          placeholder={t('artisans.filters.allRegions')}
          options={regions}
          value={state.raw.region}
          onChange={(event) => {
            state.setFilter('region', event.target.value)
          }}
        />
      </div>

      {/*
        Only when something is applied. A permanently visible Clear over an
        unfiltered page is a control that does nothing, and its absence is how
        a reader can tell at a glance that they are seeing everyone.
      */}
      {state.active ? (
        <button
          type="button"
          onClick={state.clearAll}
          className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
        >
          {t('artisans.filters.clear')}
        </button>
      ) : null}
    </div>
  )
}
