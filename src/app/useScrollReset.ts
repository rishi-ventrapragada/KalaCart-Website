import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { getLenis } from '@/app/lenis'

/**
 * Puts every route change back at the top of the page.
 *
 * A single-page router replaces the view without touching the scroll position,
 * so opening a product from halfway down Browse lands the reader halfway down
 * the product page - usually somewhere in the middle of the description, with
 * the photography above them unseen.
 *
 * WHY NOT `window.scrollTo`. Lenis owns scrolling on the buyer shell (PRD 10.1):
 * it keeps its own animated scroll value and writes the document position from
 * it every frame. Setting the native position underneath it leaves Lenis still
 * holding the old number, so its next frame writes that stale value straight
 * back and the page springs to where it was. The reset has to go through the
 * instance, which updates the internal value and the document together.
 *
 * `immediate` because this is a new page, not a movement within one: animating
 * a 3000px glide up a document the reader has not seen would be motion for its
 * own sake, and would race the incoming route's own reveals.
 *
 * Under `prefers-reduced-motion` no Lenis instance exists at all - `mountLenis`
 * deliberately creates none and native scrolling stands - so `getLenis()`
 * returns null and the native call is the correct path rather than a fallback.
 * The admin desk mounts no Lenis either (PRD 10.8), and takes the same branch.
 *
 * A LAYOUT EFFECT, so the reset is requested before the browser paints rather
 * than after passive effects flush. (The usual SSR caveat does not apply: this
 * app is client-rendered under BrowserRouter with no hydration pass.)
 *
 * KNOWN AND MEASURED: exactly ONE frame of the incoming route paints at the
 * previous scroll offset, roughly 17-30ms, then every subsequent frame is at 0.
 *
 * That frame is React committing and painting the new route before any effect
 * of ours runs - it is not Lenis lagging. On the stale frame all three reads
 * agree: `window.scrollY`, `document.documentElement.scrollTop` AND Lenis's own
 * `animatedScroll` are all still at the old value, so nothing has been told to
 * move yet. Once the effect fires, all three land on 0 in the same frame.
 *
 * Adding a synchronous `document.documentElement.scrollTop = 0` beside the
 * `scrollTo` was measured against a control on the same instrumented bundle,
 * three runs each: one stale frame in five of the six runs regardless of the
 * write. It cannot help, because the frame in question is already painted
 * before the line would execute. It is deliberately NOT shipped.
 *
 * Closing this properly means acting before the commit rather than after -
 * React Router's own `ScrollRestoration`, or resetting in the navigation event
 * itself. That is a different design, not a tweak to this hook.
 */
export function useScrollReset(): void {
  const { pathname, hash } = useLocation()
  // Nothing has been navigated to yet on the very first render; without this the
  // hook would fire on mount and fight the initial paint for no benefit.
  const previous = useRef<string | null>(null)

  useLayoutEffect(() => {
    const isFirstRender = previous.current === null
    const samePage = previous.current === pathname
    previous.current = pathname

    // A hash link is a request to go to a specific place on the page. Forcing
    // the top would be the opposite of what was asked for.
    if (hash) return

    /*
     * Only when the PATH changes.
     *
     * Browse keeps its filters and its search term in the query string (PRD
     * 11.3), so `useLocation()` yields a new location on every facet toggle.
     * Resetting on those would drag the reader back to the top of the results
     * each time they refine a filter - the page would fight them while they
     * work. Same path, same page, no reset.
     */
    if (isFirstRender || samePage) return

    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
      return
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])
}
