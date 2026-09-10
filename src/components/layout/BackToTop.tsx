import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { getLenis, prefersReducedMotion } from '@/app/lenis'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/**
 * "Back to top", in flow at the foot of the page (above the footer).
 *
 * NOT a fixed floating button. It sits at the end of the content, which is
 * where someone who has finished reading actually is - a pinned circle in the
 * corner would hover over every surface on the site, compete with the navbar
 * and cover content on a 360px screen.
 *
 * It reveals itself only once the reader is genuinely near the bottom. Placement
 * alone very nearly does this, but not quite: on a short route (an empty Browse
 * result, the 404) the whole document fits the viewport, the button would be
 * on-screen from the start, and an invitation to scroll up when nothing has been
 * scrolled reads as noise. So the button is present in the layout at all times -
 * it never shifts anything - and only its visibility is driven.
 *
 * WHY ITS OWN LISTENER RATHER THAN THE ENGINE. `useScrollRegister` reads the
 * Home scroll engine, which mounts on Home only, and this renders on every
 * route including the admin desk, where PRD 10.8 mounts no motion system at all.
 * A `passive` scroll listener is the honest way to read position on a surface
 * that has no engine. It writes a boolean, not a per-frame transform, so it does
 * no layout work while scrolling.
 */

/** How near the bottom counts as "at the bottom". */
const THRESHOLD_PX = 240

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const t = useT()
  // Only re-render when the answer actually flips, not on every scroll event.
  const shown = useRef(false)

  useEffect(() => {
    const update = (): void => {
      const doc = document.documentElement
      const remaining = doc.scrollHeight - window.scrollY - window.innerHeight
      /*
       * A document no taller than its viewport has nothing to return from, so
       * the button stays hidden rather than appearing on a page that never
       * scrolled. Without this it would show permanently on every short route.
       */
      const scrollable = doc.scrollHeight - window.innerHeight > THRESHOLD_PX
      const next = scrollable && remaining <= THRESHOLD_PX

      if (next !== shown.current) {
        shown.current = next
        setVisible(next)
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    // The page can get shorter or taller without a scroll - images landing, a
    // filter emptying a grid - and either changes the answer.
    window.addEventListener('resize', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(document.body)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer.disconnect()
    }
  }, [])

  const handleClick = (): void => {
    /*
     * Through Lenis where it exists, exactly as useScrollReset documents:
     * Lenis owns the scroll position on the buyer shell and keeps its own
     * animated value, so setting the native position underneath it leaves it
     * holding the old number and the next frame springs the page back.
     *
     * Unlike the route reset this one ANIMATES - it is a movement within a page
     * the reader has actually seen, so gliding up shows them where they are
     * going. Under reduced motion, and on the admin desk, no instance exists and
     * the native call is the correct path rather than a fallback.
     */
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 })
      return
    }

    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <div className="flex justify-center pb-10">
      <button
        type="button"
        onClick={handleClick}
        // Hidden from the tab order and from screen readers while it is not
        // offered, so a keyboard user cannot land on an invisible control.
        {...(visible ? {} : { tabIndex: -1, 'aria-hidden': true })}
        className={cn(
          'inline-flex items-center gap-2 rounded-control border border-line-strong bg-card',
          'px-5 py-2.5 text-sm font-medium text-ink',
          // Colour only on hover, never geometry. buttonStyles.ts calls a
          // capsule that lifts or grows a shadow a template tell, and an arrow
          // button is the most tempting place on a site to break that rule.
          'transition-[background-color,border-color,color,opacity] duration-200 ease-site',
          'hover:border-accent hover:text-accent',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ArrowUp aria-hidden className="size-4" />
        {t('backToTop.label')}
      </button>
    </div>
  )
}
