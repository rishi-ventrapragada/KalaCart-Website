import { Loader2 } from 'lucide-react'

import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface SpinnerProps {
  size?: number
  className?: string
}

/**
 * Never a bare spinner on a blank page (PRD 5.4) - this is for inline use
 * inside a control. Full-page waits use Skeleton instead.
 */
export function Spinner({ size = 16, className }: SpinnerProps) {
  const t = useT()

  return (
    <span role="status" aria-label={t('common.loading')} className="inline-flex">
      <Loader2 size={size} aria-hidden className={cn('motion-safe:animate-spin', className)} />
    </span>
  )
}
