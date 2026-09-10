import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

import { prefersReducedMotion } from '@/app/lenis'

/**
 * THE SITE EASING CURVE, registered with GSAP under a name.
 *
 * The same registration `useBounceFan` documents at length, and for the same
 * reason: GSAP does not parse CSS easing syntax, so `power3.out` - the adopted
 * source's ease - would have to be replaced by something, and handing a tween an
 * unrecognised string like `cubic-bezier(0.22, 1, 0.36, 1)` makes it fall back
 * to `power1.out` SILENTLY. Registering the curve by name is what makes the
 * single-easing law actually hold at runtime rather than just in the source.
 *
 * `CustomEase.create` is idempotent for a given name, so both this hook and
 * `useBounceFan` registering `kalacart-site` at module scope is safe: whichever
 * module loads first defines it, and the second overwrites it with an identical
 * curve. Not extracted to a shared module only because that is a two-line
 * indirection; if a third caller appears, it should be.
 */
const SITE_EASE = 'kalacart-site'
gsap.registerPlugin(CustomEase)
CustomEase.create(SITE_EASE, '0.22, 1, 0.36, 1')

/** How far a card rises into place. A short travel, not a fly-in from offscreen. */
const RISE_PX = 24

/** The blur the card resolves from, per the adopted source's blur-to-focus. */
const BLUR_PX = 10

interface GridRevealOptions {
  /** How many cards are mounted. Zero while the seam read is still loading. */
  count: number
  /** Seconds between one card's entrance and the next (PRD 10.3 cascade). */
  stagger: number
  /** Media query at which the grid widens, e.g. Tailwind's `lg`. */
  query: string
  /** Cards per row when `query` matches. */
  columns: number
  /** Cards per row below it. */
  columnsBelow: number
}

/**
 * Drives the staggered entrance for the "Recently listed" grid.
 *
 * Adopted from an external Masonry component under CLAUDE.md §I. What survived
 * is the entrance gesture - cards arriving in a stagger, resolving from blur -
 * and nothing else. What did not: the absolute-positioned masonry layout (the
 * shared schema carries no image height, so every tile would be identical and a
 * masonry of equal tiles is a grid), the `power3.out`/`power2.out` easings (one
 * site curve), the `scaleOnHover` shrink (ProductCard moves colour only on
 * hover, never geometry), and `window.open` on a div (the cards are real
 * `<Link>`s, which the sweep's focus-ring and accessible-name checks require).
 *
 * NOT SCROLL-LINKED, which is what permits it outside the Lenis singleton
 * (§I step 2). An IntersectionObserver starts the entrance when the grid
 * arrives, exactly as `useReveal` does for the rest of the site, and GSAP's own
 * ticker runs it from there. It never reads scroll position, so it cannot drift
 * out of phase with the engine the way a second scroll listener would.
 *
 * IT DOES NOT USE `[data-reveal]`, and that is load-bearing rather than a
 * stylistic choice. The acceptance sweep's reduced-motion pass counts every
 * `[data-reveal]` element sitting below 0.9 opacity and fails the build if it
 * finds any (`audit/motion.mjs`). Two mechanisms owning opacity on one node is
 * how that check starts reporting phantom failures, so these cards opt out of
 * the CSS reveal entirely and this hook owns their entrance alone.
 *
 * UNDER REDUCED MOTION NOTHING ANIMATES. Not a faster tween, not a zero
 * duration: `gsap.set` writes the resolved state once, no observer is created,
 * and the hook returns before constructing a single tween (§I step 3). The blur
 * is cleared rather than merely ended, so a card can never be left soft.
 */
export function useGridReveal({
  count,
  stagger,
  query,
  columns,
  columnsBelow,
}: GridRevealOptions) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLElement | null>>([])
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || count === 0) return

    const cards = cardsRef.current.slice(0, count).filter((c): c is HTMLElement => c !== null)
    if (cards.length === 0) return

    if (reduced) {
      // The resolved state, written once. No observer, no tween, no blur left
      // behind on a card that will never be animated out of it.
      gsap.set(cards, { opacity: 1, y: 0, filter: 'none' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: RISE_PX, filter: `blur(${String(BLUR_PX)}px)` })
    }, rootRef)

    /*
     * The observer is deliberately OUTSIDE the gsap context.
     *
     * `gsap.context(fn)` ignores whatever `fn` returns - only `ctx.revert()`
     * undoes what it recorded, and it records GSAP animations, not DOM
     * subscriptions. An observer created and "cleaned up" by a returned function
     * in there would simply leak. So the context owns the tweens and this effect
     * owns the observer, and each is torn down by the thing that can.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)

          /*
           * The row width is read HERE, not at mount, because it is the width
           * when the grid is actually reached that decides what a row is. The
           * grid renders two columns below `lg` and four above it (measured: 2
           * at 360 and 768, 4 at 1280), so wrapping the stagger at a fixed 4
           * would cascade against a row that does not exist at the narrow
           * widths - the first four cards would stagger across two visual rows
           * and the next four would repeat the pattern out of step with them.
           */
          const perRow = window.matchMedia(query).matches ? columns : columnsBelow

          ctx.add(() => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.62,
              ease: SITE_EASE,
              // Runs across the row, not the whole grid: eight cards each
              // trailing the last would take most of a second to finish, and the
              // tail would still be arriving after the reader has started
              // reading. Mirrors the stagger the CSS reveal used here before.
              stagger: (index: number) => (index % perRow) * stagger,
              // The filter is the expensive property here, so the compositor
              // hint is dropped the moment it stops changing.
              onComplete: () => {
                gsap.set(cards, { clearProps: 'filter,willChange' })
              },
            })
          })
        }
      },
      // Matches `useReveal`, so this section keeps the same beat as every other
      // reveal on the site rather than arriving on its own schedule.
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(root)

    return () => {
      observer.disconnect()
      ctx.revert()
    }
  }, [count, stagger, query, columns, columnsBelow, reduced])

  /** Collects the card elements the tweens write to. */
  const setCardRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      cardsRef.current[index] = node
    },
    [],
  )

  return { rootRef, setCardRef }
}
