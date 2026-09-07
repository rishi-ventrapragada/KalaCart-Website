import { Link } from 'react-router-dom'

import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. The full motion system lands in Increments 7-8. */
export default function Home() {
  const t = useT()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">{t('home.hero.title')}</h1>
      <p className="max-w-sm text-center text-sm text-muted">{t('home.hero.subtitle')}</p>
      <div className="rounded-card border border-line bg-card px-6 py-4 text-sm text-muted">
        {t('home.scaffoldNotice')}
      </div>
      <Link
        to="/browse"
        className="rounded-control border border-line-strong px-5 py-2 text-sm text-accent transition-colors duration-200 ease-site hover:border-accent"
      >
        {t('home.hero.cta')}
      </Link>
    </main>
  )
}
