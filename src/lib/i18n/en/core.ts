/**
 * Shared copy: the brand name, strings reused across surfaces, and labels the
 * ui/ primitives need. Anything referenced from more than one route belongs
 * here rather than being duplicated into two segments.
 */
export const core = {
  brand: {
    /** A proper name, not translated copy. Present so no component hardcodes it. */
    name: 'KalaCart',
    /**
     * The accessible name for the logo link in the navbar, footer and admin
     * header. The mark is `aria-hidden` and the wordmark beside it is not a
     * label, so without this a screen reader announces the bare name with no
     * hint that it navigates.
     */
    home: 'KalaCart, home',
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
