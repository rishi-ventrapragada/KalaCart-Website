import { Link } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/lib/i18n'

/** Global chrome per PRD 11.0: program line, categories, an SIH 2026 credit. */
export function Footer() {
  const t = useT()

  return (
    <footer className="mt-auto border-t border-line bg-canvas py-14">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <Reveal className="max-w-sm">
            <p className="font-display text-lg text-ink">{t('brand.name')}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t('footer.programLine')}</p>
          </Reveal>

          <Reveal as="nav" delay={80} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-ink">
              {t('footer.exploreHeading')}
            </p>
            <Link to="/" className="text-sm text-muted transition-colors duration-200 ease-site hover:text-ink">
              {t('nav.home')}
            </Link>
            <Link to="/browse" className="text-sm text-muted transition-colors duration-200 ease-site hover:text-ink">
              {t('nav.browse')}
            </Link>
            <Link to="/artisans" className="text-sm text-muted transition-colors duration-200 ease-site hover:text-ink">
              {t('nav.artisans')}
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-xs text-muted">{t('footer.credit')}</p>
          <p className="mt-1.5 text-xs text-muted">{t('footer.ministry')}</p>
        </div>
      </Container>
    </footer>
  )
}
