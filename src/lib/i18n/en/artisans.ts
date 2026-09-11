/** The artisans directory (PRD 11.2): every approved maker, in one place. */
export const artisans = {
  artisans: {
    title: 'Meet the artisans',
    subtitle:
      'Every maker verified and listing their own work. Open a profile to see what they have made and get in touch directly.',

    filters: {
      /** sr-only region heading; keeps the page's heading order unbroken. */
      heading: 'Filters',
      search: 'Search artisans',
      searchPlaceholder: 'Name or region',
      craft: 'Craft',
      allCrafts: 'All crafts',
      region: 'Region',
      allRegions: 'All regions',
      clear: 'Clear filters',
    },

    results: {
      /** sr-only region heading, for the same reason as the filters one. */
      heading: 'Artisans',
      /** {count} is the number of matching artisans. */
      count: '{count} artisans',
      countOne: '1 artisan',
      /** {count} is how many crafts this artisan has listed. */
      listings: '{count} listings',
      listingsOne: '1 listing',
      emptyTitle: 'No artisans match these filters',
      emptyBody: 'Try clearing a filter or searching a different name.',
      /* The unfiltered empty case is a different sentence: nothing is wrong
         with the reader's filters, the catalogue simply has no one in it yet. */
      noneTitle: 'No artisans are listed yet',
      noneBody: 'Verified makers appear here as they join the programme.',
      error: 'Could not load artisans.',
    },
  },
} as const
