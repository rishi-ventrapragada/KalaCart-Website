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
   * `madder`, not `secondary` - kept, but for a different reason than before.
   *
   * The original reason was a collision: light `secondary` was #B8862F against
   * `marigold` #C9922B, so pending and rejected read as the same amber in the
   * admin artisan table (Increment 14), whose whole job is telling them apart.
   * The 2026-09-10 palette revision made `secondary` a red, which retires that
   * collision - pending (marigold) and rejected are now plainly different.
   *
   * It stays `madder` anyway, because `madder` is a DYE: one fixed value in
   * both themes. `secondary` is theme-dependent (#A63A3A light, #C85C5C dark)
   * and, more to the point, is now the "something is wrong" token - it tracks
   * the destructive fill and will move with it. A status badge should not
   * inherit those shifts. The border carries the tone, never the label: the
   * dyes fail AA as text (Increment 5).
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
