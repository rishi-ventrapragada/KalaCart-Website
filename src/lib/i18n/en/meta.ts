/**
 * Document titles, one per route (PRD 7.4).
 *
 * These are the strings the browser tab and the screen-reader navigation
 * announcement carry, so they are written to be recognised out of context - a
 * reader looking at eight tabs sees only this. That is why they are not simply
 * the page's h1: "Artisans" alone is ambiguous between the buyer directory and
 * the admin records, so each says which desk it belongs to.
 *
 * The " · KalaCart" suffix is appended by `useDocumentTitle`, not written here,
 * so the brand cannot drift out of step between routes.
 */
export const meta = {
  meta: {
    /** The suffix appended to every title but Home's. */
    siteName: 'KalaCart',

    /* Home carries the positioning line rather than the word "Home": it is the
       page a shared link most often points at, and "Home · KalaCart" tells a
       reader who has never been here nothing at all. */
    home: 'KalaCart - handmade, direct from Indian artisans',

    browse: 'Browse crafts',
    artisans: 'Meet the artisans',
    notFound: 'Page not found',

    /* The generic titles the two dynamic routes show while their seam read is
       in flight, and keep if the id turns out not to exist. */
    product: 'Craft',
    artisan: 'Artisan',

    adminLogin: 'Admin sign-in',
    adminQueue: 'Verification queue - admin',
    adminArtisans: 'Artisan records - admin',
    adminAnalytics: 'Analytics - admin',
  },

  /**
   * The skip link (PRD 14, keyboard operability).
   *
   * Visible only on focus, so its wording has to work for someone who has just
   * pressed Tab once on a page they cannot see. "Skip to main content" is the
   * phrasing screen-reader users expect; a cleverer label would be worse.
   */
  skipLink: {
    label: 'Skip to main content',
  },
} as const
