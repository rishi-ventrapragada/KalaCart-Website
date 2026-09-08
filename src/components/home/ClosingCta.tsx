import { Link } from 'react-router-dom'

import { MaterialField } from '@/components/home/MaterialField'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/**
 * The closing CTA bookend (PRD 10.6).
 *
 * The same material field as the hero, so the page opens and closes on the
 * same ground. What makes it a bookend rather than a repeat is the copy: the
 * hero is centred left and argues, the close is centred and invites.
 *
 * Centred, where the hero is left-anchored. The hero is an argument being made
 * and the close is a single invitation, and giving them the same anchor would
 * make the second read as a repeat of the first.
 */
export function ClosingCta() {
  const t = useT()

  return (
    <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden py-24 sm:min-h-[30rem]">
      <MaterialField />

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center">
          <Reveal delay={0}>
            <h2 className="text-2xl sm:text-3xl">{t('home.closing.title')}</h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-base leading-relaxed text-muted">{t('home.closing.body')}</p>
          </Reveal>

          <Reveal delay={160} className="pt-1">
            <Link to="/browse" className={cn(buttonBase, buttonVariants.primary, buttonSizes.lg)}>
              {t('home.closing.cta')}
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
