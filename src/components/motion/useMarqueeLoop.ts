import { useEffect, useRef, useState } from 'react'

import { prefersReducedMotion } from '@/app/lenis'

/**
 * A continuous lateral loop, on its own clock.
 *
 * This is the one animation on the site that is NOT scroll-linked. The craft
 * rail used to be Home's scroll-driven lateral move (`useRailDrift`); it now
 * runs constantly so the row reads as a browsable band rather than as something
 * that only lives while the reader happens to be scrolling past it. See the
 * 2026-09-11 entry in CLAUDE.md D.
 *
 * The travel is a CSS animation rather than a per-frame transform, deliberately:
 * a marquee needs no scroll value, so handing it to the compositor keeps it off
 * the main thread and out of the Lenis engine entirely. Nothing here competes
 * with the scroll singleton (PRD 10.1) because nothing here reads scroll.
 *
 * The duration is DERIVED from the measured width of one copy of the track, not
 * fixed, so speed stays constant in px/sec whatever the rail holds. A fixed
 * duration would make a six-card rail crawl and a twelve-card rail sprint.
 *
 * Under reduced motion this returns a duration of `null` and the caller renders
 * a single, static, hand-scrollable copy: the loop must STOP, not slow down
 * (CLAUDE.md motion discipline, adoption protocol step 3). No rAF is ever
 * scheduled here in any branch.
 */

/** Pixels per second. Slow enough to read a label as it passes. */
const SPEED = 42

interface MarqueeLoop<T extends HTMLElement> {
  /** Attach to the element wrapping ONE copy of the cards. */
  ref: React.RefObject<T | null>
  /** Seconds for one full cycle, or null when motion is switched off. */
  duration: number | null
}

/**
 * `itemCount` is deliberately a NUMBER rather than a caller-supplied dependency
 * array. The cycle length only ever changes when the card set changes, and a
 * primitive cannot re-trigger the effect by identity the way an inline array or
 * object would - which is the failure mode that turns a measure-then-setState
 * effect into an update loop.
 */
export function useMarqueeLoop<T extends HTMLElement>(itemCount: number): MarqueeLoop<T> {
  const ref = useRef<T>(null)
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    const track = ref.current
    if (!track || itemCount === 0 || prefersReducedMotion()) {
      setDuration(null)
      return
    }

    const measure = (): void => {
      const width = track.scrollWidth
      // A rail that has not laid out yet would divide to zero and produce an
      // infinitely fast animation, so it simply stays still until it has width.
      const next = width > 0 ? width / SPEED : null
      // Only ever written when it actually changed. The ResizeObserver fires on
      // every layout pass, and setting an equal value would re-render for
      // nothing - and, with a caller-side dependency, could chain.
      setDuration((current) => (current === next ? current : next))
    }

    measure()

    // The cycle length is a function of layout, so it is re-derived whenever the
    // track is re-measured - a font landing late or a resize both change it.
    const observer = new ResizeObserver(measure)
    observer.observe(track)

    return () => {
      observer.disconnect()
    }
  }, [itemCount])

  return { ref, duration }
}
