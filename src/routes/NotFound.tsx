import { Link } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/**
 * The 404 (PRD 11: a designed page that routes back to Home or Browse).
 *
 * Built properly in Increment 16, replacing the Increment 0 placeholder that
 * showed a bare heading over two text links.
 *
 * Two routes out, not one, and they are weighted: Browse is the primary action
 * because someone who hit a dead product or artisan link almost certainly wants
 * the catalogue rather than the marketing page. Both are `Link`s wearing the
 * button styles - they navigate, so they must stay real anchors that
 * middle-click and open in a new tab.
 *
 * No illustration. CLAUDE.md section D settled that a drawn motif reads as
 * decoration laid over the page, and an error state is the last place to spend
 * a reader's attention on ornament.
 */
export default function NotFound() {
  const t = useT()

  return (
    <Container className="flex flex-col items-center gap-5 py-24 text-center sm:py-32">
      {/*
        The status is stated in small type above the headline rather than as a
        giant "404". The number means nothing to most readers; the sentence
        under it is what tells them what happened.
      */}
      <p className="font-body text-xs tracking-[0.14em] text-muted uppercase">404</p>

      <h1 className="max-w-lg text-3xl">{t('notFound.title')}</h1>

      <p className="max-w-md text-sm leading-relaxed text-muted">{t('notFound.body')}</p>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/browse"
          className={cn(buttonBase, buttonVariants.primary, buttonSizes.md)}
        >
          {t('notFound.browse')}
        </Link>
        <Link
          to="/"
          className={cn(buttonBase, buttonVariants.secondary, buttonSizes.md)}
        >
          {t('notFound.home')}
        </Link>
      </div>
    </Container>
  )
}
