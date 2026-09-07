import Lenis from 'lenis'
import { useEffect } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Initializes Lenis once for the app shell and drives it from a single
 * requestAnimationFrame loop. Increment 6 hangs the Home scroll engine off this
 * same instance rather than starting a second loop (PRD 10.1).
 *
 * Under prefers-reduced-motion the instance is never created, leaving native
 * scrolling in place (PRD 10.7).
 */
export function useLenis(): void {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    const lenis = new Lenis({ duration: 1.1 })
    let frame = 0

    const raf = (time: number): void => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
