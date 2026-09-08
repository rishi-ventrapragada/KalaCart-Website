import { useContext } from 'react'

import { ScrollEngineContext } from '@/components/motion/scrollEngineContext'
import type { RegisterFn } from '@/components/motion/scrollEngineContext'

/**
 * Reads the Home engine's `register`, or null when no engine is mounted.
 *
 * Kept in its own file so the context object and the hook that consumes it are
 * separate modules: a component importing the hook does not pull in anything
 * else, and fast refresh stays happy with a file that exports only components
 * or only hooks.
 */
export function useScrollRegister(): RegisterFn | null {
  return useContext(ScrollEngineContext)
}
