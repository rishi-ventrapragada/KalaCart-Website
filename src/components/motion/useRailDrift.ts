import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/app/lenis'
import { useScrollRegister } from '@/components/motion/useScrollRegister'

/**
 * Lateral travel driven by vertical scroll.
 *
 * Vertical scroll reads as an argument being made; lateral travel reads as
 * range, as things to choose between. Running a rail sideways while the page
 * runs down is the cheapest way to make a page feel alive, because the motion
 * is in a direction the reader is not producing themselves.
 *
 * `rate` is the fraction of the rail's own overflow to travel across the
 * section, so a longer rail moves further and the speed stays even whatever is
 * in it.
 *
 * Under reduced motion nothing registers. The rail keeps its resting offset and
 * the CSS turns it into a normal horizontally scrollable region, so every item
 * stays reachable by hand rather than being parked off-screen (PRD 10.7).
 */
export function useRailDrift<T extends HTMLElement>(rate = 1) {
  const ref = useRef<T>(null)
  const register = useScrollRegister()

  useEffect(() => {
    const rail = ref.current
    if (!rail) return

    const section = rail.parentElement
    if (!section || !register || prefersReducedMotion()) return

    return register(section, () => {
      const rect = section.getBoundingClientRect()
      const span = rect.height + window.innerHeight
      const travelled = window.innerHeight - rect.top
      const p = span > 0 ? Math.min(Math.max(travelled / span, 0), 1) : 0

      // How far the rail can move before its tail is flush with the frame.
      //
      // Measured against the SECTION's width, not the rail's own. The rail is
      // sized to its content (w-max), so its scrollWidth and clientWidth are
      // always equal and an overflow computed from them is always zero: the
      // rail would sit still while the page scrolled past it.
      const overflow = Math.max(rail.scrollWidth - section.clientWidth, 0)
      // Travel maps the section's own progress onto the rail's real overflow,
      // so the first card is flush at the start and the last is flush at the
      // end whatever the widths are. A fixed fraction of the overflow cannot
      // do this: on a phone the rail is several viewports wide, and a centred
      // offset both starts the first card off-screen to the right and still
      // never reaches the last one.
      //
      // `rate` shortens the window the travel happens in, so the rail finishes
      // moving before the section leaves and the reader sees settled cards
      // rather than one still sliding out.
      const eased = Math.min(Math.max((p - (1 - rate) / 2) / rate, 0), 1)
      const offset = eased * overflow

      rail.style.transform = `translate3d(${String(-offset.toFixed(2))}px, 0, 0)`
    })
  }, [rate, register])

  return ref
}
