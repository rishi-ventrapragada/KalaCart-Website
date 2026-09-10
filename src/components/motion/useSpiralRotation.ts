import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/app/lenis'
import {
  cardTransform,
  fitScale,
  fittedRadius,
  type SpiralGeometry,
} from '@/lib/home/spiralTransform'

interface SpiralRotationOptions {
  geometry: SpiralGeometry
  /** Rotation in cards per second. */
  speed: number
  cardWidth: number
  cardHeight: number
  /** How many cards are mounted. Drives the wrap and the resting layout. */
  count: number
}

/**
 * Drives the hero spiral's rotation.
 *
 * The one continuous animation on the site, and the only rAF loop outside the
 * Lenis singleton. It is allowed here because it is *not* scroll-linked
 * (CLAUDE.md §I step 2): it advances on its own clock, so it never reads scroll
 * position and cannot drift out of phase with the engine the way a second
 * scroll listener would. Home is also the one route with the motion budget for
 * it (§I step 1).
 *
 * The adopted source attached a `window` scroll listener unconditionally - the
 * mode check sat inside the handler, so the listener existed even in 'auto'
 * mode. That is the second scroll source the motion discipline forbids, and it
 * is gone rather than disabled.
 *
 * UNDER REDUCED MOTION THE LOOP NEVER STARTS. Not cancelled after a frame, not
 * run at zero speed: `requestAnimationFrame` is never called at all. The resting
 * layout is written once and the hook returns, matching `useScrollEngine`. The
 * source zeroed its speed and kept the loop alive forever, writing transform,
 * opacity, filter and zIndex to every card every frame to render a static
 * picture - an idling loop that looks handled (§I step 3).
 */
export function useSpiralRotation({
  geometry,
  speed,
  cardWidth,
  cardHeight,
  count,
}: SpiralRotationOptions) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root || count === 0) return

    /** Writes every card at one rotation value. The only DOM writer here. */
    const paint = (progress: number): void => {
      const bounds = root.getBoundingClientRect()
      const width = Math.max(bounds.width, 1)
      const height = Math.max(bounds.height, 1)
      const fit = fitScale(width, height, cardWidth, cardHeight)
      const radius = fittedRadius(geometry.radius, width, fit)

      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const next = cardTransform(index, count, progress, fit, radius, geometry)
        card.style.transform = next.transform
        card.style.opacity = next.opacity.toFixed(3)
        card.style.filter = next.blur > 0.01 ? `blur(${next.blur.toFixed(2)}px)` : 'none'
        card.style.zIndex = String(next.zIndex)
      })
    }

    if (prefersReducedMotion()) {
      // Resting layout, written once. No loop is ever created.
      paint(0)
      return
    }

    let frame = 0
    let previous = performance.now()
    let progress = 0
    let visible = true

    // Off-screen the loop stops entirely rather than idling: the hero leaves
    // view as soon as the reader scrolls, and a spiral nobody can see should
    // not be costing frames. This mirrors the engine's IntersectionObserver
    // gate, but it has to be its own because this loop is not the engine's.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const wasVisible = visible
        visible = entry.isIntersecting

        if (visible && !wasVisible) {
          // Reset the clock, or the time spent off-screen is applied as one
          // large delta and the spiral jumps on re-entry.
          previous = performance.now()
          frame = requestAnimationFrame(render)
        } else if (!visible && wasVisible) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '15% 0px 15% 0px' },
    )
    observer.observe(root)

    function render(time: number): void {
      // Capped so a backgrounded tab does not resume with a huge jump.
      const delta = Math.min((time - previous) / 1000, 0.05)
      previous = time
      progress += speed * delta
      paint(progress)
      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [geometry, speed, cardWidth, cardHeight, count])

  /** Collects the card elements the loop writes to. */
  const setCardRef = (index: number) => (node: HTMLElement | null) => {
    cardsRef.current[index] = node
  }

  return { rootRef, setCardRef }
}
