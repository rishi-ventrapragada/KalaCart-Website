/**
 * Shared copy: the brand name, strings reused across surfaces, and labels the
 * ui/ primitives need. Anything referenced from more than one route belongs
 * here rather than being duplicated into two segments.
 */
export const core = {
  brand: {
    /** A proper name, not translated copy. Present so no component hardcodes it. */
    name: 'KalaCart',
  },

  common: {
    retry: 'Try again',
    loading: 'Loading',
    close: 'Close',
    cancel: 'Cancel',
    dismiss: 'Dismiss',
    search: 'Search',
  },

  ui: {
    notifications: 'Notifications',
  },
} as const
