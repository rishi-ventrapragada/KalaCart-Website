import { Container } from '@/components/layout/Container'
import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. Built in Increment 9. */
export default function Browse() {
  const t = useT()

  return (
    <Container className="py-20">
      <h1 className="text-3xl">{t('browse.title')}</h1>
    </Container>
  )
}
