import { Link } from 'react-router-dom'

import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. Designed properly in Increment 16. */
export default function NotFound() {
  const t = useT()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <div className="flex gap-4 text-sm text-accent">
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/browse">{t('nav.browse')}</Link>
      </div>
    </main>
  )
}
