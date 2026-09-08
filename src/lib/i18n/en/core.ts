/**
 * Shared copy: the brand name, strings reused across surfaces, and labels the
 * ui/ primitives need. Anything referenced from more than one route belongs
 * here rather than being duplicated into two segments.
 */
export const core = {
  brand: {
    /** A proper name, not translated copy. Present so no component hardcodes it. */
    name: 'KalaCart',
    tagline: 'Market linkage for Indian artisans',
  },

  common: {
    retry: 'Try again',
    loading: 'Loading',
    clearFilters: 'Clear filters',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    dismiss: 'Dismiss',
    search: 'Search',
  },

  ui: {
    modalLabel: 'Dialog',
    notifications: 'Notifications',
    selectPlaceholder: 'Choose an option',
    required: 'Required',
    optional: 'Optional',
  },
} as const
