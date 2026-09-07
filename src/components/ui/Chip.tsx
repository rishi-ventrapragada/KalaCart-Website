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

/** The dot is the one place category colour appears (PRD 9.3, 9.6). */
const dyeDots: Record<DyeName, string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

/** Capsule per the PRD 9.5 shape binary. */
export function Chip({ dye, selected = false, onClick, children, className }: ChipProps) {
  const classes = cn(
    'inline-flex items-center gap-2 rounded-control border px-3 py-1 text-sm',
    'transition-colors duration-200 ease-site',
    selected ? 'border-accent text-ink' : 'border-line text-muted',
    onClick && 'hover:border-line-strong hover:text-ink',
    className,
  )

  const content = (
    <>
      {dye ? <span aria-hidden className={cn('size-1.5 rounded-control', dyeDots[dye])} /> : null}
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
