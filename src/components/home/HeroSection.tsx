import { Link } from 'react-router-dom'

import { HeroSpiral } from '@/components/home/HeroSpiral'
import { MaterialField } from '@/components/home/MaterialField'
import { LineMask } from '@/components/home/LineMask'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/**
 * The hero (PRD 11.2): line-mask headline, subhead and capsule CTA over the
 * material field.
 *
 * Type is the event here, not an illustration. The headline assembles from its
 * line masks, one word carries a dye underline that draws in behind it, and the
 * ground beneath shifts colour as the reader descends. Nothing slides under the
 * copy, so the headline is read against a changing field rather than a moving
 * one. The subhead and button cascade in about 80ms apart (PRD 10.3).
 */
export function HeroSection() {
  const t = useT()

  return (
    <section
      aria-label={t('home.hero.sceneLabel')}
      // Tall enough that the planes have room to separate before the section
      // ends. min-h rather than h, so long copy or a large text size grows the
      // section instead of overflowing it.
      className="relative isolate flex min-h-[38rem] items-center overflow-hidden py-24 sm:min-h-[44rem] sm:py-32"
    >
      {/*
        The hero ground is woven in the heavier yarn. Safe here and only here:
        the grain's mask clears the reading column, so the darker thread never
        sits under the copy. The closing bookend keeps the default weight.
      */}
      <MaterialField weight="deep" />

      <Container className="relative z-10">
        {/*
          Two columns from lg up, one below it. The spiral is a sibling of the
          copy rather than a layer behind it: the grain's legibility mask only
          clears the reading column, and anything overlapping the words would
          reopen the contrast question the mask settled.
        */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {/* Measure capped so the headline breaks where the copy wants it to. */}
          <div className="flex max-w-2xl flex-col items-start gap-5">
            <LineMask
              lines={[t('home.hero.titleLineOne'), t('home.hero.titleLineTwo')]}
              accentWord={t('home.hero.accentWord')}
              label={t('home.hero.titleLabel')}
              className="text-3xl sm:text-4xl"
            />

            <Reveal delay={80}>
              <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
                {t('home.hero.subtitle')}
              </p>
            </Reveal>

            <Reveal delay={160} className="pt-1">
              <Link
                to="/browse"
                className={cn(buttonBase, buttonVariants.primary, buttonSizes.lg)}
              >
                {t('home.hero.cta')}
              </Link>
            </Reveal>
          </div>

          <HeroSpiral />
        </div>
      </Container>
    </section>
  )
}
