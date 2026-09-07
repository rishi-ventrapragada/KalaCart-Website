import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

export type BadgeTone = 'neutral' | 'positive' | 'pending' | 'negative'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

/**
 * Capsule per the PRD 9.5 shape binary.
 *
 * The tone lives in the border, not the label. Marigold and the secondary tone
 * are mid-tone and fail AA as text on both themes' surfaces (Increment 5), so
 * only `accent`, which clears AA in both, is allowed to colour a word.
 */
const tones: Record<BadgeTone, string> = {
  neutral: 'border-line text-muted',
  positive: 'border-accent text-accent',
  pending: 'border-marigold text-ink',
  negative: 'border-secondary text-ink',
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control border px-2.5 py-1 text-2xs font-medium tracking-[0.01em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
