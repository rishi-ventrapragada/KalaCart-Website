import { createContext } from 'react'

import type { RenderFn } from '@/components/motion/useScrollEngine'

/** What `useScrollEngine().register` returns: an unsubscribe. */
export type RegisterFn = (element: HTMLElement | null, render: RenderFn) => () => void

/**
 * The seam between the one engine and everything it drives (PRD 10.1).
 *
 * Home mounts `useScrollEngine` once and publishes its `register` here. The
 * parallax layers, the progress bar and the nav state then all fan out of that
 * single render pass instead of each opening a subscription of its own, which
 * is the arrangement CLAUDE.md's motion discipline requires.
 *
 * `null` is the off-Home value, and it is meaningful rather than an error:
 * consumers that also render on other routes (the navbar) read it, find no
 * engine, and stay in their static state.
 */
export const ScrollEngineContext = createContext<RegisterFn | null>(null)
