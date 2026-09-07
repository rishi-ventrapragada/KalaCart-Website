import { useEffect, useRef } from 'react'

import { onScroll, prefersReducedMotion } from '@/app/lenis'

/** Called every frame with the smoothed scroll value and derived progress. */
export type RenderFn = (state: ScrollState) => void

export interface ScrollState {
  /** Smoothed scroll position in pixels, from the one Lenis instance. */
  y: number
  /** Document scroll progress, 0 to 1. Drives the progress bar in Increment 7. */
  progress: number
}

interface Subscriber {
  element: HTMLElement | null
  render: RenderFn
  /** Off-screen subscribers skip their per-frame math (PRD 10.1). */
  active: boolean
}

/**
 * THE HOME MOTION ENGINE (PRD 10.1). Built here, mounted on Home in Increment 7.
 *
 * One scroll value drives everything. This hook subscribes once to the shared
 * Lenis value, computes progress once per frame, and fans out to every
 * registered subscriber through a single render pass. Components never attach
 * their own scroll listeners, and nothing starts a second requestAnimationFrame
 * loop.
 *
 * Subscribers that pass an element are gated by an IntersectionObserver with a
 * generous rootMargin, so a section warms up just before it enters view and
 * goes quiet once it leaves.
 *
 * Under prefers-reduced-motion the engine renders exactly once, at the current
 * position, and then stops: parallax freezes rather than animating slowly
 * (PRD 10.7).
 */
export function useScrollEngine(enabled = true) {
  const subscribers = useRef(new Set<Subscriber>())
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!enabled) return

    const current = subscribers.current

    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          for (const subscriber of current) {
            if (subscriber.element === entry.target) subscriber.active = entry.isIntersecting
          }
        }
      },
      // Generous margin so state is warm before the section is visible.
      { rootMargin: '25% 0px 25% 0px' },
    )

    for (const subscriber of current) {
      if (subscriber.element) observer.current.observe(subscriber.element)
    }

    const render = (y: number): void => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1) : 0
      const state: ScrollState = { y, progress }

      for (const subscriber of current) {
        // A subscriber with no element is always live: the progress bar and the
        // nav state are not tied to one section.
        if (subscriber.element === null || subscriber.active) subscriber.render(state)
      }
    }

    if (prefersReducedMotion()) {
      render(window.scrollY)
      return () => {
        observer.current?.disconnect()
        observer.current = null
      }
    }

    const unsubscribe = onScroll(render)
    // Paint once on mount so nothing sits at its initial transform until the
    // first scroll event arrives.
    render(window.scrollY)

    return () => {
      unsubscribe()
      observer.current?.disconnect()
      observer.current = null
    }
  }, [enabled])

  /**
   * Register a scroll-reactive element. Pass `null` as the element for things
   * that are not tied to one section, such as the progress bar.
   */
  const register = (element: HTMLElement | null, render: RenderFn): (() => void) => {
    const subscriber: Subscriber = { element, render, active: element === null }
    subscribers.current.add(subscriber)
    if (element) observer.current?.observe(element)

    return () => {
      subscribers.current.delete(subscriber)
      if (element) observer.current?.unobserve(element)
    }
  }

  return { register }
}
