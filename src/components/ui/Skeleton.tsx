import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Loading placeholder (PRD 5.4). The pulse is motion-safe, so it holds still
 * under prefers-reduced-motion (CLAUDE.md law 7).
 *
 * Soft rounded rect per the PRD 9.5 shape binary - a skeleton stands in for a
 * container, not a control.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('motion-safe:animate-pulse rounded-card bg-line', className)}
    />
  )
}
