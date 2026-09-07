import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  body?: string
  /** An action that resolves the emptiness, e.g. Clear filters. */
  action?: ReactNode
  className?: string
}

/**
 * Purposeful empty state (PRD 5.4): says what is missing and invites the next
 * action, rather than just reporting nothing.
 */
export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-line bg-card px-8 py-12 text-center',
        className,
      )}
    >
      {Icon ? <Icon size={22} aria-hidden className="text-muted" /> : null}
      <h3 className="text-lg text-ink">{title}</h3>
      {body ? <p className="max-w-xs text-sm leading-relaxed text-muted">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
