import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ErrorStateProps {
  /** What failed, in the reader's terms. Never a provider's message. */
  message: string
  onRetry: () => void
  className?: string
  /**
   * Which ground this sits on.
   *
   * `page` is the default and covers every call site on the canvas. `contrast`
   * is for the impact band, whose ground inverts in light: there `ink` copy
   * measures 1.20:1 and the secondary capsule's `bg-card` fill reads as a
   * near-white blob. Opt in per surface rather than restyling the nine
   * call sites that are already correct.
   */
  tone?: 'page' | 'contrast'
}

/**
 * The shared error state (PRD 5.4): explains what failed and offers a retry.
 *
 * Plain, not alarming. A section that could not load is an inconvenience, not
 * an emergency, so there is no icon, no colour and no border - those would give
 * a failed row more visual weight than the content it replaced.
 */
export function ErrorState({ message, onRetry, className, tone = 'page' }: ErrorStateProps) {
  const t = useT()
  const onContrast = tone === 'contrast'

  return (
    <div className={cn('flex flex-col items-center gap-4 py-10 text-center', className)}>
      {/*
        `ink`, not `secondary`. Both themes' secondary tones are mid-tone and
        fail AA as a text colour (Increment 5), and error copy is exactly the
        text a reader must be able to read.
      */}
      <p className={cn('max-w-sm text-sm', onContrast ? 'text-on-surface-contrast' : 'text-ink')}>
        {message}
      </p>
      {/*
        On the band the capsule is an outline in the band's own text colour
        rather than the `bg-card` fill: a near-white capsule on a dark ground
        pulls more weight than the message it belongs to, and the outline keeps
        the 999px control shape (PRD 9.5) and the label's contrast in both
        themes. Hover still moves colour only, never geometry.
      */}
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          buttonBase,
          buttonSizes.sm,
          onContrast
            ? 'border border-on-surface-contrast/40 text-on-surface-contrast ' +
                'hover:border-on-surface-contrast'
            : buttonVariants.secondary,
        )}
      >
        {t('common.retry')}
      </button>
    </div>
  )
}
