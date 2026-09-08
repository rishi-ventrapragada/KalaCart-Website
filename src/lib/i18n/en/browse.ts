/** Browse and search (PRD 11.3): filters, sort options and result states. */
export const browse = {
  browse: {
    title: 'Browse crafts',
    subtitle: 'Every piece here is listed by the artisan who made it.',

    filters: {
      heading: 'Filters',
      open: 'Filters',
      close: 'Close filters',
      search: 'Search',
      searchPlaceholder: 'Search crafts',
      category: 'Craft',
      allCategories: 'All crafts',
      region: 'Region',
      allRegions: 'All regions',
      sort: 'Sort by',
      price: 'Price range',
      minPrice: 'Min',
      maxPrice: 'Max',
      /** Shown when min is above max, which would return nothing. */
      invalidRange: 'The lowest price is above the highest. Swap them to see results.',
      clear: 'Clear filters',
      /** Screen-reader label on each removable chip. */
      remove: 'Remove {label} filter',
    },

    sort: {
      newest: 'Newest first',
      priceAsc: 'Price: low to high',
      priceDesc: 'Price: high to low',
    },

    results: {
      /** {count} is the number of matching crafts. */
      count: '{count} crafts',
      countOne: '1 craft',
      emptyTitle: 'No crafts match these filters',
      emptyBody: 'Try widening the price range or clearing a filter.',
      error: 'Could not load crafts.',
    },
  },
} as const
