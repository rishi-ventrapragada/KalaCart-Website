import { SearchField } from '@/components/browse/SearchField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { SelectOption } from '@/components/ui/Select'
import type { FilterState } from '@/lib/browse/useProductFilters'
import { useT } from '@/lib/i18n'

interface FilterPanelProps {
  state: FilterState
  categories: SelectOption[]
  regions: SelectOption[]
}

/**
 * The filter controls (PRD 11.3). Every one writes straight to the URL.
 *
 * Native selects rather than custom listboxes: they are keyboard and
 * screen-reader correct for free, they use the platform's own picker on a
 * phone, and nothing here needs behaviour a custom control would add.
 *
 * Price is two number fields, not a dual-thumb slider. A range slider is a real
 * accessibility problem - two thumbs on one track are hard to separate by
 * keyboard and hard to hit at 360px - and two labelled fields say exactly the
 * same thing while staying reachable.
 */
export function FilterPanel({ state, categories, regions }: FilterPanelProps) {
  const { raw, invalidRange, setFilter } = state
  const t = useT()

  const sorts: SelectOption[] = [
    { value: 'newest', label: t('browse.sort.newest') },
    { value: 'price-asc', label: t('browse.sort.priceAsc') },
    { value: 'price-desc', label: t('browse.sort.priceDesc') },
  ]

  return (
    <div className="flex flex-col gap-5">
      <SearchField
        value={raw.query}
        onCommit={(value) => {
          // Replace, not push: typing must not leave one history entry per
          // keystroke between the reader and the page they came from.
          setFilter('query', value, { replace: true })
        }}
      />

      <Select
        label={t('browse.filters.category')}
        placeholder={t('browse.filters.allCategories')}
        options={categories}
        value={raw.category}
        onChange={(event) => {
          setFilter('category', event.target.value)
        }}
      />

      <Select
        label={t('browse.filters.region')}
        placeholder={t('browse.filters.allRegions')}
        options={regions}
        value={raw.region}
        onChange={(event) => {
          setFilter('region', event.target.value)
        }}
      />

      <Select
        label={t('browse.filters.sort')}
        options={sorts}
        value={raw.sort || 'newest'}
        onChange={(event) => {
          setFilter('sort', event.target.value)
        }}
      />

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="pb-1 text-xs font-medium tracking-[0.01em] text-ink">
          {t('browse.filters.price')}
        </legend>
        <div className="flex items-start gap-3">
          <Input
            label={t('browse.filters.minPrice')}
            type="number"
            inputMode="numeric"
            min={0}
            value={raw.min}
            className="w-full"
            onChange={(event) => {
              setFilter('min', event.target.value)
            }}
          />
          <Input
            label={t('browse.filters.maxPrice')}
            type="number"
            inputMode="numeric"
            min={0}
            value={raw.max}
            className="w-full"
            onChange={(event) => {
              setFilter('max', event.target.value)
            }}
          />
        </div>
        {invalidRange && (
          // `ink`, not `secondary`: both themes' secondary tones fail AA as a
          // text colour (Increment 5), and this is text that must be read.
          <p role="alert" className="text-xs text-ink">
            {t('browse.filters.invalidRange')}
          </p>
        )}
      </fieldset>
    </div>
  )
}
