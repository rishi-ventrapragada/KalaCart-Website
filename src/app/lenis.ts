import Lenis from 'lenis'

/**
 * The single Lenis instance and the single requestAnimationFrame loop that
 * drives it (PRD 10.1).
 *
 * This is a module singleton rather than React state on purpose. The scroll
 * engine on Home has to read the same smoothed value the shell is already
 * producing; starting a second loop, or a second Lenis, is exactly what
 * CLAUDE.md's motion discipline forbids. One value, one loop, fanned out.
 */

export type ScrollListener = (scroll: number) => void

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

let instance: Lenis | null = null
let frame = 0
let mounts = 0
const listeners = new Set<ScrollListener>()

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches

/**
 * Starts Lenis if it is not already running and returns a teardown. Nested
 * callers are reference counted, so the shell and the engine can both hold it
 * without either tearing the other down.
 *
 * Under reduced motion no instance is created at all: native scrolling stands,
 * and listeners still receive the real scroll position.
 */
export function mountLenis(): () => void {
  mounts += 1

  if (mounts === 1) {
    if (prefersReducedMotion()) {
      const onScroll = (): void => {
        emit(window.scrollY)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        mounts -= 1
        if (mounts === 0) window.removeEventListener('scroll', onScroll)
      }
    }

    instance = new Lenis({ duration: 1.1 })
    instance.on('scroll', ({ scroll }: { scroll: number }) => {
      emit(scroll)
    })

    const raf = (time: number): void => {
      instance?.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
  }

  return () => {
    mounts -= 1
    if (mounts > 0) return
    cancelAnimationFrame(frame)
    instance?.destroy()
    instance = null
    listeners.clear()
  }
}

function emit(scroll: number): void {
  for (const listener of listeners) listener(scroll)
}

/** Subscribe to the one scroll value. Never attach your own scroll listener. */
export function onScroll(listener: ScrollListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getLenis = (): Lenis | null => instance
