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
  /*
   * `madder`, not `secondary`. In the light theme `secondary` is #B8862F and
   * `marigold` is #C9922B - both amber, so a pending badge and a rejected one
   * were the same colour at a glance. That is fine where the two never meet,
   * but the admin artisan table (Increment 14) puts them in one column whose
   * whole job is telling them apart.
   *
   * `madder` is a dye token with the same value in both themes, and it is
   * already what the dark theme's `secondary` resolves to for this badge, so
   * rejected now reads red on both. The border carries it, never the label:
   * the dyes fail AA as text (Increment 5).
   */
  negative: 'border-madder text-ink',
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
