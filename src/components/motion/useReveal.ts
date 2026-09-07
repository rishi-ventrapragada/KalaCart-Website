import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/app/lenis'

interface RevealOptions {
  /** Milliseconds to hold before resolving, for the PRD 10.3 cascade. */
  delay?: number
  /** Reveal once and stop observing. Re-revealing on every pass reads as noise. */
  once?: boolean
}

/**
 * Reveal-on-scroll for everything outside Home (PRD 7.3, 10.8).
 *
 * IntersectionObserver, never a scroll listener. IO is independent of how the
 * page scrolls, so it works under Lenis without touching the scroll value and
 * without the per-component listeners CLAUDE.md's motion discipline forbids.
 *
 * Under prefers-reduced-motion the element is marked revealed on mount and no
 * observer is created: the reveal resolves instantly rather than quickly
 * (PRD 10.7).
 */
export function useReveal<T extends HTMLElement>({
  delay = 0,
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (prefersReducedMotion()) {
      element.dataset['revealed'] = 'true'
      return
    }

    let timer: number | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            timer = window.setTimeout(() => {
              element.dataset['revealed'] = 'true'
            }, delay)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            window.clearTimeout(timer)
            delete element.dataset['revealed']
          }
        }
      },
      // Fires a little before the element is fully in view, so the reveal is
      // already resolving as it arrives rather than starting once it lands.
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(element)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [delay, once])

  return ref
}
