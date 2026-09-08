import { MOCK_ADMIN_EMAIL, MOCK_ADMIN_PASSWORD } from '@/app/adminAuth'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface MockAuthNoticeProps {
  /**
   * `full` prints the credential for the login screen. `banner` is the one-line
   * reminder carried by every signed-in admin page.
   */
  variant?: 'full' | 'banner'
  className?: string
}

/**
 * Says on screen that the gate is a demonstration (PRD 11.1).
 *
 * This is the increment's load-bearing component. The credential ships in the
 * public bundle and the session flag can be set from the console, so a screen
 * that merely looked like a login would be claiming a protection the build does
 * not have - and PRD 11.1 ends by saying not to present it as real. A code
 * comment does not reach the person looking at the page; this does. It follows
 * the Increment 10 precedent, where the inquiry toast states what the mock
 * actually did rather than what a finished product would do.
 *
 * It is deliberately not styled as an error or a warning. Nothing has gone
 * wrong: this is a demo behaving correctly and saying so. Alarm colours would
 * read as a fault and, worse, as the kind of banner people learn to dismiss.
 */
export function MockAuthNotice({ variant = 'full', className }: MockAuthNoticeProps) {
  const t = useT()

  if (variant === 'banner') {
    return (
      <p
        className={cn(
          'rounded-card border border-line bg-card px-4 py-2.5 text-2xs text-muted',
          className,
        )}
      >
        {t('admin.mock.bannerShort')}
      </p>
    )
  }

  return (
    <section
      aria-labelledby="mock-auth-heading"
      className={cn('flex flex-col gap-2 rounded-card border border-line bg-card p-4', className)}
    >
      <h2 id="mock-auth-heading" className="text-sm font-medium text-ink">
        {t('admin.mock.heading')}
      </h2>
      <p className="text-2xs leading-relaxed text-muted">{t('admin.mock.body')}</p>

      {/*
        The credential, printed. A demo whose front door needs the repository
        open to get through is a worse demo, and hiding it would not make the
        bundle any less readable.
      */}
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xs text-muted">
        <span>{t('admin.mock.credentialLabel')}</span>
        <code className="rounded-sm bg-canvas px-1.5 py-0.5 font-mono text-ink">
          {MOCK_ADMIN_EMAIL}
        </code>
        <code className="rounded-sm bg-canvas px-1.5 py-0.5 font-mono text-ink">
          {MOCK_ADMIN_PASSWORD}
        </code>
      </p>
    </section>
  )
}
