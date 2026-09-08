import { useEffect, useRef } from 'react'

import { useScrollRegister } from '@/components/motion/useScrollRegister'
import { useT } from '@/lib/i18n'

/**
 * Reading-progress bar (PRD 10.5, 11.0). Home only.
 *
 * 2px pinned to the very top, glowing in the theme accent, scaled by
 * `transform: scaleX(p)` from a left origin. Scaling rather than setting width
 * keeps it GPU-composited: width would force layout on every frame of every
 * scroll, which is the one thing a scroll-driven element must never do.
 *
 * It registers with `null` as its element, so the engine treats it as always
 * live rather than gating it behind an IntersectionObserver: a bar pinned to
 * the viewport is never the thing that scrolls out of view.
 *
 * The transform is written inline every frame and therefore carries no
 * transition, per PRD 10.2. It stays accurate under reduced motion, where the
 * engine renders once: the bar is information about position, not decoration,
 * so freezing it at the right value is correct rather than hiding it.
 */
export function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null)
  const register = useScrollRegister()
  const t = useT()

  useEffect(() => {
    const element = ref.current
    if (!element || !register) return

    return register(null, ({ progress }) => {
      element.style.transform = `scaleX(${String(progress.toFixed(4))})`
    })
  }, [register])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
      role="progressbar"
      aria-label={t('home.progressLabel')}
      // The value changes every frame; announcing it would flood a screen
      // reader with a number it cannot act on. Position is already conveyed by
      // the scroll itself, so the bar is labelled but not live.
      aria-hidden
    >
      <div
        ref={ref}
        className="h-full w-full origin-left bg-accent shadow-[0_0_10px_1px_var(--accent)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
