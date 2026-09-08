import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/app/lenis'
import { useScrollRegister } from '@/components/motion/useScrollRegister'
import { cn } from '@/lib/utils/cn'

/**
 * THE MATERIAL FIELD: the hero's ground.
 *
 * A fine woven paper grain, and nothing else. The large soft dye blooms this
 * once carried were removed at the owner's request: at that scale a blurred
 * colour wash reads as a lighting effect sitting on top of the page rather than
 * as material, and it dirtied the canvas either side of the copy.
 *
 * The grain stays because it is texture at the paper's own scale: it gives the
 * canvas a surface without introducing a light source. `--field-p` is still
 * written per frame for anything downstream that wants scroll position, but
 * nothing in this component paints from it any more.
 */
export function MaterialField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const register = useScrollRegister()

  useEffect(() => {
    const host = ref.current
    if (!host || !register || prefersReducedMotion()) return

    return register(host, () => {
      const rect = host.getBoundingClientRect()
      const span = rect.height + window.innerHeight
      const travelled = window.innerHeight - rect.top
      const p = span > 0 ? Math.min(Math.max(travelled / span, 0), 1) : 0

      // Written as custom properties rather than as a rebuilt gradient string:
      // the browser interpolates them on the compositor, and the alternative
      // re-parses three gradients every frame.
      host.style.setProperty('--field-p', p.toFixed(4))
      host.style.setProperty('--field-drift', `${String((p * 40 - 20).toFixed(2))}px`)
    })
  }, [register])

  return (
    <div ref={ref} className={cn('material-field', className)} aria-hidden>
      <div className="material-field__grain" />
    </div>
  )
}
