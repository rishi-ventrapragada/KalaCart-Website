import { Link } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/** Increment 0 placeholder. The full motion system lands in Increments 7-8. */
export default function Home() {
  const t = useT()

  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center">
      <h1 className="text-4xl">{t('home.hero.title')}</h1>
      <p className="max-w-sm text-lg leading-relaxed text-muted">{t('home.hero.subtitle')}</p>
      <Link
        to="/browse"
        className={cn(buttonBase, buttonVariants.primary, buttonSizes.md)}
      >
        {t('home.hero.cta')}
      </Link>
    </Container>
  )
}
