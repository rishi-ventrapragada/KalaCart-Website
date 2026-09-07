import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

export type BadgeTone = 'neutral' | 'positive' | 'pending' | 'negative'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

/** Capsule per the PRD 9.5 shape binary. */
const tones: Record<BadgeTone, string> = {
  neutral: 'border-line text-muted',
  positive: 'border-accent text-accent',
  pending: 'border-marigold text-marigold',
  negative: 'border-secondary text-secondary',
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
