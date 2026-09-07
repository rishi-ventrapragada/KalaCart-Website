import { Link } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. Designed properly in Increment 16. */
export default function NotFound() {
  const t = useT()

  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-3xl">{t('notFound.title')}</h1>
      <div className="flex gap-4 text-sm text-accent">
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/browse">{t('nav.browse')}</Link>
      </div>
    </Container>
  )
}
