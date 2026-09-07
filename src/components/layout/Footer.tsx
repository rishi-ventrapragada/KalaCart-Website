import { Link } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { useT } from '@/lib/i18n'

/** Global chrome per PRD 11.0: program line, categories, an SIH 2026 credit. */
export function Footer() {
  const t = useT()

  return (
    <footer className="mt-auto border-t border-line bg-canvas py-10">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-ink">{t('brand.name')}</p>
            <p className="mt-2 text-sm text-muted">{t('footer.programLine')}</p>
          </div>

          <nav aria-label={t('footer.exploreHeading')} className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-wide text-ink">
              {t('footer.exploreHeading')}
            </p>
            <Link to="/" className="text-sm text-muted transition-colors duration-200 ease-site hover:text-ink">
              {t('nav.home')}
            </Link>
            <Link to="/browse" className="text-sm text-muted transition-colors duration-200 ease-site hover:text-ink">
              {t('nav.browse')}
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="text-xs text-muted">{t('footer.credit')}</p>
          <p className="mt-1 text-xs text-muted">{t('footer.ministry')}</p>
        </div>
      </Container>
    </footer>
  )
}
