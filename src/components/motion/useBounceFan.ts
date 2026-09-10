import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

import { prefersReducedMotion } from '@/app/lenis'
import {
  type FanGeometry,
  fanFitScale,
  hoveredTransform,
  restingTransform,
} from '@/lib/home/fanTransform'

/**
 * THE SITE EASING CURVE, registered with GSAP under a name.
 *
 * This is not ceremony, it is the fix for a silent bug. GSAP does not parse CSS
 * easing syntax: `gsap.parseEase('cubic-bezier(0.22, 1, 0.36, 1)')` returns
 * `undefined`, and a tween handed an unrecognised ease falls back to its default
 * `power1.out` WITHOUT WARNING. Measured, that fallback runs 0.4375 / 0.7500 /
 * 0.9375 at quarter progress against the real curve's 0.7649 / 0.9614 / 0.9969 -
 * a visibly different, much lazier motion. Every tween here would have violated
 * the single-easing law while appearing to honour it, and nothing in the build,
 * the linter or the acceptance sweep would have caught it.
 *
 * `CustomEase` ships with the free GSAP and takes the control points directly,
 * reproducing `var(--ease)` to four decimal places. Registered at module scope
 * so it happens exactly once however many fans mount.
 */
const SITE_EASE = 'kalacart-site'
gsap.registerPlugin(CustomEase)
CustomEase.create(SITE_EASE, '0.22, 1, 0.36, 1')

interface BounceFanOptions {
  geometry: FanGeometry
  /** How many cards are mounted. Drives the layout and the entrance stagger. */
  count: number
  /** Seconds between one card's entrance and the next (PRD 10.3 cascade). */
  stagger: number
}

/**
 * Drives the maker fan: the dealt entrance, and the hover push.
 *
 * NOT SCROLL-LINKED, which is what permits it outside the Lenis singleton
 * (CLAUDE.md §I step 2). It runs on GSAP's own ticker in response to discrete
 * events - mount, pointer, focus - and never reads scroll position, so it
 * cannot drift out of phase with the engine the way a second scroll listener
 * would. The adopted source was the same shape in this respect, and that part
 * of it survives.
 *
 * THE EASINGS ARE NOT THE SOURCE'S. It used `elastic.out(1, 0.8)` for the
 * entrance and `back.out(1.4)` for the push, both overshoot curves. CLAUDE.md's
 * motion discipline mandates a single easing curve site-wide, exposed as
 * `--ease` / `--ease-site`, so both are replaced by that one cubic-bezier. The
 * fan settles firmly instead of wobbling: it is the one thing the component is
 * named for, and it is the one thing the house rules do not allow.
 *
 * UNDER REDUCED MOTION NOTHING ANIMATES. Not a faster tween, not a zero
 * duration: `gsap.set` writes the resting layout once and the hook returns
 * before creating a single tween or timeline. The hover push is inert too -
 * `push()` returns early - because a 72px lateral jump on hover is exactly the
 * vestibular trigger the preference is asking us to drop (§I step 3). The
 * source had no reduced-motion path at all.
 */
export function useBounceFan({ geometry, count, stagger }: BounceFanOptions) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLElement | null>>([])
  /** Set once the entrance has finished, so a hover mid-entrance cannot fight it. */
  const readyRef = useRef(false)
  const reduced = prefersReducedMotion()

  /** The fit is measured, so the fan can never overflow its column. */
  const measureFit = useCallback((): number => {
    const root = rootRef.current
    if (!root) return 1
    return fanFitScale(Math.max(root.getBoundingClientRect().width, 1), count, geometry)
  }, [count, geometry])

  useEffect(() => {
    const root = rootRef.current
    if (!root || count === 0) return

    readyRef.current = false

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.slice(0, count).filter((c): c is HTMLElement => c !== null)
      if (cards.length === 0) return

      const fit = measureFit()

      /** Where each card lives at rest. Written for every card either way. */
      const layout = cards.map((card, index) => ({
        card,
        to: restingTransform(index, count, fit, geometry),
      }))

      if (reduced) {
        // Resting layout, written once. No tween is ever created.
        for (const { card, to } of layout) {
          gsap.set(card, { x: to.x, y: to.y, rotation: to.rotation, scale: 1, zIndex: to.zIndex })
        }
        readyRef.current = true
        return
      }

      // The deal: cards arrive from the centre of the fan and settle outward,
      // so the gesture reads as a hand being spread rather than five cards
      // fading in where they already were.
      for (const [index, { card, to }] of layout.entries()) {
        gsap.set(card, { x: 0, y: 0, rotation: 0, scale: 0.92, zIndex: to.zIndex, opacity: 0 })
        gsap.to(card, {
          x: to.x,
          y: to.y,
          rotation: to.rotation,
          scale: 1,
          opacity: 1,
          duration: 0.62,
          ease: SITE_EASE,
          delay: index * stagger,
          ...(index === layout.length - 1
            ? {
                onComplete: () => {
                  readyRef.current = true
                },
              }
            : {}),
        })
      }
    }, rootRef)

    return () => {
      ctx.revert()
    }
  }, [count, geometry, stagger, reduced, measureFit])

  /**
   * Open the fan around one card. `null` closes it back to rest.
   *
   * Every card is written on every call rather than only the ones that moved:
   * with `overwrite: 'auto'` that is what makes a fast pointer sweep across the
   * row resolve to one consistent layout instead of leaving a card stranded
   * mid-push from an interrupted tween.
   */
  const push = useCallback(
    (hovered: number | null): void => {
      if (reduced || !readyRef.current) return

      const fit = measureFit()

      cardsRef.current.slice(0, count).forEach((card, index) => {
        if (!card) return
        const to =
          hovered === null
            ? restingTransform(index, count, fit, geometry)
            : hoveredTransform(index, count, hovered, fit, geometry)

        gsap.to(card, {
          x: to.x,
          y: to.y,
          rotation: to.rotation,
          scale: to.scale,
          zIndex: to.zIndex,
          duration: 0.4,
          ease: SITE_EASE,
          overwrite: 'auto',
        })
      })
    },
    [count, geometry, reduced, measureFit],
  )

  /** Collects the card elements the tweens write to. */
  const setCardRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      cardsRef.current[index] = node
    },
    [],
  )

  return { rootRef, setCardRef, push, reduced }
}
