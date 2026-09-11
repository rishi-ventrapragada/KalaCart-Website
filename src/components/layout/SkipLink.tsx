import { useT } from '@/lib/i18n'

/** The id the link targets. Every shell puts this on its `main` element. */
export const MAIN_CONTENT_ID = 'main-content'

/**
 * Skip to main content (PRD 14, keyboard operability).
 *
 * A keyboard reader lands on the first focusable element of every page, which
 * on the buyer shell is the brand lockup followed by the whole navbar - the
 * same six or seven stops before the content, on every single route. This is
 * the standard escape: first in the DOM, invisible until focused, and gone
 * again as soon as focus moves on.
 *
 * NOT `sr-only` ALONE. A screen-reader-only link would serve someone using a
 * screen reader and nobody else, while a sighted keyboard user - the person who
 * actually has to watch focus crawl through the nav - would see focus vanish to
 * an invisible element. So it is positioned off-screen and comes back on focus,
 * which is what makes it visible to exactly the people who need it.
 *
 * `href` rather than a button: moving focus to a fragment is what the browser's
 * own skip behaviour does, and it keeps the back button meaningful. The target
 * carries `tabIndex={-1}` so it can receive focus without joining the tab order
 * - without that, clicking the link scrolls but leaves focus behind, and the
 * next Tab returns to the navbar the reader was trying to escape.
 */
export function SkipLink() {
  const t = useT()

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      /*
       * `top-20` clears the 64px header rather than sitting inside it. At
       * `top-3` the capsule landed on top of the brand lockup, leaving the
       * mark half-covered and the word "Cart" poking out beside the link -
       * which looks like a rendering fault at the exact moment a keyboard
       * reader is being shown the site's first affordance.
       */
      className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-100 focus:rounded-control focus:border focus:border-accent focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
    >
      {t('skipLink.label')}
    </a>
  )
}
