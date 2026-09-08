import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { ProgressBar } from '@/components/home/ProgressBar'
import { ScrollEngineContext } from '@/components/motion/scrollEngineContext'
import { useScrollEngine } from '@/components/motion/useScrollEngine'

/**
 * Mounts the one scroll engine and publishes it to the whole shell (PRD 10.1).
 *
 * This sits in the shell rather than inside the Home route because the navbar
 * is chrome: it lives above the router outlet, and its PRD 10.5 glass flip is
 * driven by the same scroll value as the hero's layers. A provider inside Home
 * would be a descendant of the nav and invisible to it, and giving the nav its
 * own subscription would be the second listener the motion discipline forbids.
 *
 * The engine is still Home-only, which is the actual requirement (PRD 6, 10.8).
 * Off Home it is disabled and the context value is null, so every consumer
 * finds no engine and stays static: Browse and admin remain reveal-only.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const { register } = useScrollEngine(isHome)

  return (
    <ScrollEngineContext.Provider value={isHome ? register : null}>
      {isHome && <ProgressBar />}
      {children}
    </ScrollEngineContext.Provider>
  )
}
