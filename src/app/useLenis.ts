import { useEffect } from 'react'

import { mountLenis } from '@/app/lenis'

/**
 * Mounts the single Lenis instance for the app shell (PRD 10.1).
 *
 * The instance and its requestAnimationFrame loop live in `@/app/lenis` as a
 * reference-counted singleton, so the Home scroll engine in Increment 7 reads
 * the same smoothed value rather than starting a second loop.
 *
 * Under prefers-reduced-motion no Lenis is created and native scrolling stands
 * (PRD 10.7).
 */
export function useLenis(): void {
  useEffect(() => mountLenis(), [])
}
