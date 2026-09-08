/** Site-level surfaces that belong to no product area: currently the 404. */
export const system = {
  /*
   * PRD 11 asks for a designed 404 that routes back to Home or Browse.
   *
   * The copy stays in the site's voice rather than reaching for an apology or a
   * joke: someone who mistyped a URL or followed a dead link wants to know what
   * happened and where to go, in that order. "Page not found" alone was the
   * Increment 0 placeholder and said only the first half.
   */
  notFound: {
    title: 'This page is not here',
    body: 'The link may be out of date, or the page may have moved. The catalogue and the rest of the site are still where you left them.',
    home: 'Go to the home page',
    browse: 'Browse the catalogue',
  },
} as const
