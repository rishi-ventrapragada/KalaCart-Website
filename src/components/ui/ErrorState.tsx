import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ErrorStateProps {
  /** What failed, in the reader's terms. Never a provider's message. */
  message: string
  onRetry: () => void
  className?: string
}

/**
 * The shared error state (PRD 5.4): explains what failed and offers a retry.
 *
 * Plain, not alarming. A section that could not load is an inconvenience, not
 * an emergency, so there is no icon, no colour and no border - those would give
 * a failed row more visual weight than the content it replaced.
 */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const t = useT()

  return (
    <div className={cn('flex flex-col items-center gap-4 py-10 text-center', className)}>
      {/*
        `ink`, not `secondary`. Both themes' secondary tones are mid-tone and
        fail AA as a text colour (Increment 5), and error copy is exactly the
        text a reader must be able to read.
      */}
      <p className="max-w-sm text-sm text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
      >
        {t('common.retry')}
      </button>
    </div>
  )
}
