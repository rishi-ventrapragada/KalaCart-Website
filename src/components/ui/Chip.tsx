import type { ReactNode } from 'react'

import type { DyeName } from '@/app/theme'
import { cn } from '@/lib/utils/cn'

interface ChipProps {
  /** Category dye tone (PRD 9.3). Renders as a small dot, never a fill. */
  dye?: DyeName
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

/** The mark is the one place category colour appears (PRD 9.3, 9.6). */
const dyeMarks: Record<DyeName, string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
  // Completes the map for the `sage` dye added by the 2026-09-10 palette
  // revision. `DyeName` is derived from `dyes`, so a new tone makes this
  // exhaustive record a build error until it is named here.
  sage: 'bg-sage',
}

/**
 * Capsule per the PRD 9.5 shape binary.
 *
 * THE SIGNATURE ELEMENT. The category mark is a short warp thread rather than a
 * dot: a 2px stroke the height of the cap, the way a woven selvedge reads. It
 * is the one place this component set is grounded in the craft rather than in
 * generic UI, so everything around it stays quiet.
 */
export function Chip({ dye, selected = false, onClick, children, className }: ChipProps) {
  const classes = cn(
    'inline-flex items-center gap-2.5 rounded-control border px-3.5 py-1.5 text-sm',
    'transition-[border-color,color] duration-200 ease-site',
    selected ? 'border-accent text-ink' : 'border-line text-muted',
    onClick && 'hover:border-line-strong hover:text-ink',
    className,
  )

  const content = (
    <>
      {dye ? (
        <span aria-hidden className={cn('h-3 w-0.5 rounded-full', dyeMarks[dye])} />
      ) : null}
      {children}
    </>
  )

  if (!onClick) return <span className={classes}>{content}</span>

  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={classes}>
      {content}
    </button>
  )
}
